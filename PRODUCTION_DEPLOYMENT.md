# 🚀 Growzone Mobile - Production Deployment Guide

**Repositório Novo:** `growzone-mobile-new`
**CI/CD:** GitHub Actions + EAS Build
**Deploy:** App Store + Google Play
**Ambientes:** Development, Staging, Beta, Production

---

## 📋 Índice

1. [Setup do Novo Repositório](#setup-do-novo-repositório)
2. [Estrutura de Ambientes](#estrutura-de-ambientes)
3. [CI/CD com GitHub Actions](#cicd-com-github-actions)
4. [Deploy para App Store](#deploy-para-app-store)
5. [Deploy para Google Play](#deploy-para-google-play)
6. [Backend em Paralelo (AWS)](#backend-em-paralelo-aws)
7. [Monitoramento e Rollback](#monitoramento-e-rollback)
8. [Workflows de Desenvolvimento](#workflows-de-desenvolvimento)

---

## 1. Setup do Novo Repositório

### 1.1 Criar Repositório no GitHub

```bash
# No GitHub.com
# Criar novo repo: growzone-mobile-new
# Visibility: Private
# Initialize: NO (vamos migrar código existente)
```

### 1.2 Migrar Código Atual

```bash
# No diretório atual (growzone-mobile)
cd /Users/ioannisvossos/Downloads/growzone-mobile

# Criar novo remote
git remote add new-origin git@github.com:YOUR_ORG/growzone-mobile-new.git

# Limpar histórico sensível (opcional)
# Remover secrets, tokens, etc do histórico Git

# Push para novo repo
git push new-origin feature/chat-stories-ai:main

# Ou se preferir começar limpo:
cd ..
mkdir growzone-mobile-new
cd growzone-mobile-new
git init
git remote add origin git@github.com:YOUR_ORG/growzone-mobile-new.git

# Copiar código (exceto node_modules, .git)
rsync -av --exclude='node_modules' \
          --exclude='.git' \
          --exclude='ios/build' \
          --exclude='android/build' \
          ../growzone-mobile/ ./

git add .
git commit -m "feat: initial commit - production ready app with chat"
git branch -M main
git push -u origin main
```

### 1.3 Criar Branches de Ambiente

```bash
# Branch structure:
# main (production) ← Deploy para App Store/Google Play
# ├── staging      ← QA testing
# └── develop      ← Development

# Criar branches
git checkout -b develop
git push -u origin develop

git checkout -b staging
git push -u origin staging

git checkout main
```

### 1.4 Configurar Branch Protection

**No GitHub:** Settings → Branches → Add rule

**Para `main` (Production):**
- ✅ Require pull request reviews (2 reviewers)
- ✅ Require status checks (CI must pass)
- ✅ Require branches to be up to date
- ✅ Include administrators
- ✅ Restrict pushes (only via PR)

**Para `staging`:**
- ✅ Require pull request reviews (1 reviewer)
- ✅ Require status checks

---

## 2. Estrutura de Ambientes

### 2.1 Ambientes e Propósitos

| Ambiente | Branch | Backend | App Distribution | Propósito |
|----------|--------|---------|------------------|-----------|
| **Development** | `develop` | `dev.backend.growzone.co` | Expo Go | Desenvolvimento local |
| **Staging** | `staging` | `staging.backend.growzone.co` | Internal Build | QA Testing |
| **Beta** | `main` | `api.growzone.co` | TestFlight / Internal Testing | Beta testers |
| **Production** | `main` (tag) | `api.growzone.co` | App Store / Google Play | Usuários finais |

### 2.2 Variáveis de Ambiente

**Estrutura de arquivos:**
```
.env.development   # Dev local
.env.staging       # Staging
.env.production    # Production
```

**Exemplo `.env.development`:**
```bash
EXPO_PUBLIC_ENV=development
EXPO_PUBLIC_AUTH_API_URL=https://dev.auth.growzone.co/api/v1
EXPO_PUBLIC_SOCIAL_API_URL=https://dev.social.growzone.co/api/v1
EXPO_PUBLIC_CHAT_API_URL=http://localhost:8000/api/v1/chat
EXPO_PUBLIC_CHAT_WS_URL=ws://localhost:8000/ws
EXPO_PUBLIC_CHAT_ENABLED=true
EXPO_PUBLIC_SENTRY_DSN=https://dev@sentry.io/123
```

**Exemplo `.env.production`:**
```bash
EXPO_PUBLIC_ENV=production
EXPO_PUBLIC_AUTH_API_URL=https://auth.growzone.co/api/v1
EXPO_PUBLIC_SOCIAL_API_URL=https://api.growzone.co/api/v1
EXPO_PUBLIC_CHAT_API_URL=https://api.growzone.co/api/v1/chat
EXPO_PUBLIC_CHAT_WS_URL=wss://ws.growzone.co
EXPO_PUBLIC_CHAT_ENABLED=true
EXPO_PUBLIC_SENTRY_DSN=https://prod@sentry.io/456
```

### 2.3 Configurar `eas.json`

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "APP_ENV": "development"
      }
    },
    "staging": {
      "distribution": "internal",
      "channel": "staging",
      "env": {
        "APP_ENV": "staging"
      },
      "ios": {
        "buildConfiguration": "Release"
      },
      "android": {
        "buildType": "apk"
      }
    },
    "beta": {
      "distribution": "internal",
      "channel": "beta",
      "env": {
        "APP_ENV": "production"
      },
      "ios": {
        "buildConfiguration": "Release"
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "channel": "production",
      "env": {
        "APP_ENV": "production"
      },
      "ios": {
        "buildConfiguration": "Release"
      },
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your.email@growzone.co",
        "ascAppId": "123456789",
        "appleTeamId": "TEAM_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./google-play-key.json",
        "track": "production"
      }
    }
  }
}
```

---

## 3. CI/CD com GitHub Actions

### 3.1 Workflow: Continuous Integration

**Arquivo:** `.github/workflows/ci.yml`

```yaml
name: CI - Test & Build

on:
  push:
    branches: [develop, staging, main]
  pull_request:
    branches: [develop, staging, main]

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm test

      - name: Type check
        run: npx tsc --noEmit

  build-preview:
    name: Build Preview (Expo Go)
    runs-on: ubuntu-latest
    needs: test
    if: github.event_name == 'pull_request'

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: npm ci

      - name: Publish to Expo (Preview)
        run: npx expo publish --non-interactive
```

### 3.2 Workflow: Deploy to Staging

**Arquivo:** `.github/workflows/deploy-staging.yml`

```yaml
name: Deploy to Staging

on:
  push:
    branches: [staging]

jobs:
  build-staging:
    name: Build Staging Version
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Setup Expo and EAS
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: npm ci

      - name: Build iOS (Staging)
        run: eas build --platform ios --profile staging --non-interactive

      - name: Build Android (Staging)
        run: eas build --platform android --profile staging --non-interactive

      - name: Notify Slack
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Staging build completed! iOS: ${{ steps.ios.outputs.url }}, Android: ${{ steps.android.outputs.url }}"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### 3.3 Workflow: Deploy to Beta (TestFlight)

**Arquivo:** `.github/workflows/deploy-beta.yml`

```yaml
name: Deploy to Beta (TestFlight & Internal Testing)

on:
  push:
    tags:
      - 'v*-beta*'  # Ex: v1.0.0-beta1

jobs:
  build-beta:
    name: Build & Submit Beta
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Get version from tag
        id: version
        run: echo "VERSION=${GITHUB_REF#refs/tags/v}" >> $GITHUB_OUTPUT

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Setup Expo and EAS
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: npm ci

      - name: Build iOS for TestFlight
        run: eas build --platform ios --profile beta --non-interactive
        env:
          EXPO_APPLE_ID: ${{ secrets.EXPO_APPLE_ID }}
          EXPO_APPLE_PASSWORD: ${{ secrets.EXPO_APPLE_PASSWORD }}

      - name: Submit to TestFlight
        run: eas submit --platform ios --latest --profile beta

      - name: Build Android for Internal Testing
        run: eas build --platform android --profile beta --non-interactive

      - name: Submit to Google Play Internal Testing
        run: eas submit --platform android --latest --track internal
        env:
          GOOGLE_SERVICE_ACCOUNT_KEY: ${{ secrets.GOOGLE_SERVICE_ACCOUNT_KEY }}

      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Beta ${{ steps.version.outputs.VERSION }}
          body: |
            ## Beta Release ${{ steps.version.outputs.VERSION }}

            ### TestFlight (iOS)
            Build submitted to TestFlight. Beta testers will receive notification.

            ### Internal Testing (Android)
            Build available in Google Play Console → Internal Testing

            ### Changes
            See commit history for detailed changes.
          draft: false
          prerelease: true
```

### 3.4 Workflow: Deploy to Production

**Arquivo:** `.github/workflows/deploy-production.yml`

```yaml
name: Deploy to Production (App Store & Google Play)

on:
  push:
    tags:
      - 'v*'  # Ex: v1.0.0 (sem -beta)
      - '!v*-beta*'  # Excluir tags beta

jobs:
  build-production:
    name: Build & Submit Production
    runs-on: ubuntu-latest
    environment: production  # GitHub environment with approvals

    steps:
      - uses: actions/checkout@v3

      - name: Get version from tag
        id: version
        run: echo "VERSION=${GITHUB_REF#refs/tags/v}" >> $GITHUB_OUTPUT

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Setup Expo and EAS
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: npm ci

      - name: Run production checks
        run: |
          npm run lint
          npm test
          npx tsc --noEmit

      - name: Build iOS for App Store
        id: ios-build
        run: eas build --platform ios --profile production --non-interactive

      - name: Submit to App Store
        run: eas submit --platform ios --latest --profile production

      - name: Build Android for Google Play
        id: android-build
        run: eas build --platform android --profile production --non-interactive

      - name: Submit to Google Play
        run: eas submit --platform android --latest --track production

      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ steps.version.outputs.VERSION }}
          body: |
            ## Production Release ${{ steps.version.outputs.VERSION }}

            ### App Store (iOS)
            ✅ Submitted for review

            ### Google Play (Android)
            ✅ Submitted for review

            ### Release Notes
            [Add release notes here]
          draft: false
          prerelease: false

      - name: Notify team
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "🚀 Production deploy initiated! Version: ${{ steps.version.outputs.VERSION }}"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 4. Deploy para App Store

### 4.1 Pré-requisitos

**Apple Developer Account:**
- Account criado em https://developer.apple.com
- App Store Connect access
- Apple ID com 2FA habilitado

**Certificados e Provisioning:**
```bash
# EAS gerencia automaticamente!
# Apenas configurar credenciais:

eas credentials configure
# Escolher: iOS
# Escolher: Production
# Seguir wizard
```

### 4.2 Configurar App Store Connect

1. **Criar App:**
   - Login em https://appstoreconnect.apple.com
   - My Apps → + → New App
   - Platform: iOS
   - Name: Growzone
   - Bundle ID: com.ivossos.growzone
   - SKU: growzone-mobile
   - Access: Full Access

2. **Configurar App Information:**
   - Category: Social Networking
   - Subcategory: Photo & Video Sharing
   - Age Rating: 12+ (ou conforme conteúdo)

3. **Screenshots & Metadata:**
   ```
   screenshots/
   ├── iphone-6.7/  # iPhone 14 Pro Max
   ├── iphone-6.5/  # iPhone 11 Pro Max
   └── ipad-12.9/   # iPad Pro
   ```

### 4.3 TestFlight (Beta)

**Criar Beta Tag:**
```bash
# Após PR merged para main
git tag v1.0.0-beta1
git push origin v1.0.0-beta1

# GitHub Action irá:
# 1. Build iOS
# 2. Submit para TestFlight
# 3. Notificar beta testers
```

**Adicionar Beta Testers:**
- App Store Connect → TestFlight
- Internal Testing → Add Testers
- Ou criar Public Link

### 4.4 Production Release

**Criar Production Tag:**
```bash
# Após beta testing completo
git tag v1.0.0
git push origin v1.0.0

# GitHub Action irá:
# 1. Build iOS (production)
# 2. Submit para App Store Review
```

**Submit for Review:**
- App Store Connect → My Apps → Growzone
- Version → 1.0.0
- Add build from TestFlight
- Fill metadata:
  - Screenshots
  - Description
  - Keywords
  - Support URL
  - Marketing URL
  - Privacy Policy URL
- Submit for Review

**Review Process:**
- Apple review: 24-48 horas
- Se aprovado: App vai live automaticamente
- Se rejeitado: Fix issues e resubmit

---

## 5. Deploy para Google Play

### 5.1 Pré-requisitos

**Google Play Console:**
- Account criado em https://play.google.com/console
- One-time fee: $25
- Developer account verified

**Service Account:**
```bash
# Criar service account para CI/CD
# Google Play Console → Settings → API Access
# Create service account
# Grant permissions: Release Manager

# Download JSON key
# Adicionar ao GitHub Secrets:
# GOOGLE_SERVICE_ACCOUNT_KEY
```

### 5.2 Configurar Google Play Console

1. **Criar App:**
   - Create App
   - App name: Growzone
   - Default language: Portuguese (Brazil)
   - App type: App
   - Free: Yes

2. **Setup:**
   - App Access: All features available
   - Ads: No ads (ou Yes if applicable)
   - Content Rating: Everyone / Teen
   - Target Audience: 13+
   - Data Safety: Fill questionnaire

3. **Store Listing:**
   ```
   Short description: (80 chars)
   "Rede social para cultivadores de plantas 🌱"

   Full description: (4000 chars)
   [Descrição completa do app]

   Screenshots:
   - Phone: 2-8 screenshots (16:9)
   - 7-inch tablet: 1-8 screenshots
   - 10-inch tablet: 1-8 screenshots

   Feature graphic: 1024x500
   Icon: 512x512
   ```

### 5.3 Internal Testing

**Deploy to Internal Testing:**
```bash
# Criar tag beta
git tag v1.0.0-beta1
git push origin v1.0.0-beta1

# GitHub Action irá:
# 1. Build Android (AAB)
# 2. Submit para Internal Testing track
```

**Adicionar Testers:**
- Google Play Console → Testing → Internal Testing
- Create email list
- Add testers
- Testers receberão link para instalar

### 5.4 Production Release

**Criar Production Release:**
```bash
# Após testing
git tag v1.0.0
git push origin v1.0.0

# GitHub Action irá:
# 1. Build Android (AAB signed)
# 2. Submit para Production track
# 3. Criar release notes
```

**Release Process:**
- Google Play Console → Production
- Review release
- Rollout to production:
  - 20% (Staged rollout - recomendado)
  - ou 100% (Full rollout)
- Monitor crash rate
- Increase rollout if stable

**Review Process:**
- Google review: Poucas horas a 7 dias
- Mais rápido que Apple
- Se aprovado: Live em 1-3 horas

---

## 6. Backend em Paralelo (AWS)

### 6.1 Estratégia: Feature Flag + Blue/Green

**Arquitetura:**
```
                    ┌─────────────────┐
                    │  CloudFront     │
                    │  (CDN)          │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  ALB            │
                    │  (Load Balancer)│
                    └────┬────────┬───┘
                         │        │
                    ┌────▼────┐  ┌────▼────┐
                    │  Blue   │  │  Green  │
                    │ (atual) │  │ (novo)  │
                    │         │  │ + Chat  │
                    └─────────┘  └─────────┘

Feature Flag: CHAT_ENABLED = true/false
```

### 6.2 Infrastructure as Code (Terraform)

**Arquivo:** `infrastructure/main.tf`

```hcl
# ECS Service for API
resource "aws_ecs_service" "api_blue" {
  name            = "growzone-api-blue"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = 2

  load_balancer {
    target_group_arn = aws_lb_target_group.blue.arn
    container_name   = "api"
    container_port   = 8000
  }
}

resource "aws_ecs_service" "api_green" {
  name            = "growzone-api-green"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api_chat.arn
  desired_count   = 0  # Start with 0, scale up for testing

  load_balancer {
    target_group_arn = aws_lb_target_group.green.arn
    container_name   = "api"
    container_port   = 8000
  }
}

# Lambda WebSocket
resource "aws_lambda_function" "chat_websocket" {
  function_name = "growzone-chat-websocket"
  filename      = "lambda.zip"
  handler       = "index.handler"
  runtime       = "python3.11"
  role          = aws_iam_role.lambda_exec.arn

  environment {
    variables = {
      CHAT_ENABLED = "true"
      RDS_ENDPOINT = aws_db_instance.main.endpoint
    }
  }
}

# Feature Flag (SSM Parameter)
resource "aws_ssm_parameter" "chat_enabled" {
  name  = "/growzone/CHAT_ENABLED"
  type  = "String"
  value = "false"  # Start disabled
}
```

### 6.3 Deploy Backend

```bash
# Deploy infrastructure
cd infrastructure
terraform init
terraform plan
terraform apply

# Deploy API (Blue - atual)
# Não mexe

# Deploy API (Green - com chat)
cd ../backend
docker build -t growzone-api:green .
docker push $ECR_REPO/growzone-api:green

aws ecs update-service \
  --cluster growzone \
  --service growzone-api-green \
  --task-definition growzone-api-chat:latest

# Testar Green com 5% do tráfego
aws elbv2 modify-listener \
  --listener-arn $LISTENER_ARN \
  --default-actions \
    Type=forward,TargetGroupArn=$BLUE_TG,Weight=95 \
    Type=forward,TargetGroupArn=$GREEN_TG,Weight=5
```

### 6.4 Habilitar Chat (Feature Flag)

```bash
# Habilitar para beta testers
aws ssm put-parameter \
  --name /growzone/CHAT_ENABLED \
  --value "beta" \  # beta | true | false
  --overwrite

# App busca essa variável a cada 5 min
# Ou ao abrir app
```

### 6.5 Rollback Strategy

**Se algo der errado:**

```bash
# Opção 1: Desligar chat
aws ssm put-parameter \
  --name /growzone/CHAT_ENABLED \
  --value "false" \
  --overwrite

# Opção 2: Voltar 100% tráfego para Blue
aws elbv2 modify-listener \
  --listener-arn $LISTENER_ARN \
  --default-actions Type=forward,TargetGroupArn=$BLUE_TG,Weight=100

# Opção 3: Rollback ECS task
aws ecs update-service \
  --cluster growzone \
  --service growzone-api-green \
  --task-definition growzone-api:previous
```

---

## 7. Monitoramento e Rollback

### 7.1 Sentry (Error Tracking)

**Setup:**
```bash
npm install --save @sentry/react-native

# app.json
{
  "expo": {
    "plugins": [
      [
        "@sentry/react-native/expo",
        {
          "project": "growzone-mobile",
          "organization": "your-org"
        }
      ]
    ]
  }
}
```

**Configurar:**
```typescript
// app/_layout.tsx
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: process.env.EXPO_PUBLIC_ENV,
  enableAutoSessionTracking: true,
  tracesSampleRate: 1.0,
});
```

### 7.2 Analytics

**Expo Analytics:**
```typescript
import { Analytics } from 'expo-firebase-analytics';

// Track events
Analytics.logEvent('chat_message_sent', {
  type: 'text',
  conversation_id: 'xxx'
});

Analytics.logEvent('screen_view', {
  screen_name: 'Chat',
  screen_class: 'ChatScreen'
});
```

### 7.3 CloudWatch Dashboards

```yaml
# cloudwatch-dashboard.json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/ECS", "CPUUtilization", {"stat": "Average"}],
          [".", "MemoryUtilization"]
        ],
        "title": "API Resources"
      }
    },
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["Custom/Chat", "MessagesPerMinute"],
          [".", "WebSocketConnections"],
          [".", "UploadSuccessRate"]
        ],
        "title": "Chat Metrics"
      }
    }
  ]
}
```

### 7.4 Alertas

```yaml
# cloudwatch-alarms.yaml
ErrorRateHigh:
  Type: AWS::CloudWatch::Alarm
  Properties:
    AlarmName: chat-error-rate-high
    MetricName: Errors
    Threshold: 5  # 5% error rate
    ComparisonOperator: GreaterThanThreshold
    EvaluationPeriods: 2
    AlarmActions:
      - !Ref SNSTopic  # Notifica equipe
      - !Ref LambdaRollback  # Auto-rollback

LatencyHigh:
  Type: AWS::CloudWatch::Alarm
  Properties:
    AlarmName: api-latency-high
    MetricName: TargetResponseTime
    Threshold: 1000  # 1 segundo
    ComparisonOperator: GreaterThanThreshold
```

---

## 8. Workflows de Desenvolvimento

### 8.1 Development Workflow

```bash
# Dia a dia do desenvolvedor

# 1. Criar feature branch
git checkout develop
git pull
git checkout -b feature/nova-feature

# 2. Desenvolver localmente
npm run start
# Backend em localhost:8000
# Testar no Expo Go

# 3. Commit e push
git add .
git commit -m "feat: adiciona nova feature"
git push origin feature/nova-feature

# 4. Criar PR para develop
# GitHub → New Pull Request
# Base: develop ← Compare: feature/nova-feature

# 5. CI roda automaticamente
# - Tests
# - Lint
# - Build preview

# 6. Review e merge
# 2 approvals necessários
# Merge para develop

# 7. Deploy automático para Staging
# GitHub Action triggered
```

### 8.2 Release Workflow

```bash
# Release para produção

# 1. Merge develop → staging
git checkout staging
git merge develop
git push

# GitHub Action:
# - Build staging
# - Deploy para QA testing

# 2. QA aprova
# Testes manuais em staging build

# 3. Merge staging → main
git checkout main
git merge staging
git push

# 4. Criar tag beta
git tag v1.0.0-beta1 -m "Beta release 1.0.0"
git push origin v1.0.0-beta1

# GitHub Action:
# - Build production
# - Submit para TestFlight
# - Submit para Internal Testing

# 5. Beta testing (1 semana)
# Coletar feedback
# Fix bugs se necessário

# 6. Criar tag production
git tag v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0

# GitHub Action:
# - Build production
# - Submit para App Store
# - Submit para Google Play

# 7. Aguardar review (1-7 dias)
# 8. App live! 🎉
```

### 8.3 Hotfix Workflow

```bash
# Correção urgente em produção

# 1. Criar branch de hotfix a partir de main
git checkout main
git pull
git checkout -b hotfix/critical-bug

# 2. Fix o bug
# Testar localmente

# 3. Commit
git add .
git commit -m "fix: corrige bug crítico"

# 4. PR direto para main (bypass staging)
# Merge com aprovação de 1 reviewer

# 5. Tag imediato
git tag v1.0.1 -m "Hotfix: critical bug"
git push origin v1.0.1

# 6. Deploy fast-track
# Pode usar expedited review da Apple ($)

# 7. Merge de volta para develop e staging
git checkout develop
git merge hotfix/critical-bug
git push

git checkout staging
git merge hotfix/critical-bug
git push
```

---

## 9. Secrets e Credenciais

### 9.1 GitHub Secrets

**Configurar:** Settings → Secrets and variables → Actions

**Secrets necessários:**
```
EXPO_TOKEN                    # Expo access token
EXPO_APPLE_ID                 # Apple ID
EXPO_APPLE_PASSWORD           # App-specific password
GOOGLE_SERVICE_ACCOUNT_KEY    # Google Play service account JSON
SLACK_WEBHOOK_URL             # Notificações Slack
AWS_ACCESS_KEY_ID             # AWS deploy
AWS_SECRET_ACCESS_KEY         # AWS deploy
SENTRY_AUTH_TOKEN             # Sentry upload
```

### 9.2 Obter Credenciais

**Expo Token:**
```bash
npx expo login
npx expo whoami
# Copiar token de: https://expo.dev/settings/access-tokens
```

**Apple App-Specific Password:**
```
1. https://appleid.apple.com
2. Sign In
3. Security → App-Specific Passwords
4. Generate password
5. Copiar (aparece só 1 vez!)
```

**Google Service Account:**
```
1. Google Play Console → Settings → API Access
2. Create service account
3. Grant "Release Manager" role
4. Download JSON key
5. Copiar conteúdo como secret
```

---

## 10. Checklist Final

### Antes do Deploy

**Código:**
- [ ] Todos tests passando
- [ ] Lint sem erros
- [ ] TypeScript sem erros
- [ ] Build local funciona
- [ ] Sem console.logs em produção
- [ ] Sem TODO/FIXME críticos

**Configuração:**
- [ ] .env.production configurado
- [ ] eas.json atualizado
- [ ] app.json versão correta
- [ ] Bundle ID correto (iOS)
- [ ] Package name correto (Android)

**Assets:**
- [ ] Icon 1024x1024
- [ ] Splash screen
- [ ] Screenshots (iPhone + iPad + Android)
- [ ] Feature graphic (1024x500)

**Legal:**
- [ ] Privacy Policy URL
- [ ] Terms of Service URL
- [ ] Support email configurado
- [ ] Copyright correto

**Backend:**
- [ ] APIs em produção funcionando
- [ ] RDS com migrations aplicadas
- [ ] S3 bucket criado
- [ ] Lambda WebSocket deployed
- [ ] Feature flags configuradas

**Monitoramento:**
- [ ] Sentry configurado
- [ ] Analytics configurado
- [ ] CloudWatch dashboards
- [ ] Alertas configurados

### Deploy Checklist

**TestFlight/Internal:**
- [ ] Tag beta criada
- [ ] CI/CD passou
- [ ] Build disponível em TestFlight
- [ ] Build disponível em Internal Testing
- [ ] Beta testers notificados
- [ ] Feedback coletado (1 semana)

**Production:**
- [ ] Tag production criada
- [ ] CI/CD passou
- [ ] Metadata completa (App Store + Google Play)
- [ ] Screenshots enviadas
- [ ] Submitted for review
- [ ] Review aprovado
- [ ] App LIVE! 🚀

---

## 11. Custos Estimados

### Desenvolvimento

| Serviço | Custo/mês |
|---------|-----------|
| EAS Build (Expo) | $0 (30 builds grátis) → $99 |
| GitHub Actions | $0 (2000 min grátis) → $4/mês |
| Apple Developer | $99/ano |
| Google Play | $25 (one-time) |
| **Total Dev** | **~$10-15/mês** |

### Produção

| Serviço | 1K usuários | 10K usuários |
|---------|-------------|--------------|
| AWS RDS (PostgreSQL) | $30/mês | $50/mês |
| AWS Lambda (WebSocket) | $5/mês | $20/mês |
| AWS S3 (mídia) | $1/mês | $10/mês |
| AWS CloudFront (CDN) | $5/mês | $20/mês |
| AWS ECS (API) | $40/mês | $100/mês |
| Sentry | $0 (free tier) → $26/mês |
| **Total Prod** | **~$81/mês** | **~$226/mês** |

---

## 12. Timeline

### Semana 1: Setup
- [ ] Criar repo `growzone-mobile-new`
- [ ] Configurar branches
- [ ] Setup GitHub Actions
- [ ] Configurar EAS

### Semana 2: Infraestrutura
- [ ] Deploy backend staging
- [ ] Deploy backend production
- [ ] Lambda WebSocket
- [ ] Testes de integração

### Semana 3: Beta
- [ ] Build beta
- [ ] Submit TestFlight
- [ ] Submit Internal Testing
- [ ] Beta testing

### Semana 4: Production
- [ ] Fix bugs do beta
- [ ] Build production
- [ ] Submit App Store
- [ ] Submit Google Play
- [ ] Aguardar review

### Semana 5: Launch! 🚀
- [ ] App aprovado
- [ ] Marketing
- [ ] Monitorar métricas
- [ ] Support inicial

---

**Total:** ~5 semanas do código até App Store/Google Play

**Próximo passo:** Criar novo repositório e começar setup! 🎉
