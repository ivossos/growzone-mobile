# 📘 Documentação Completa - Deployment Chat Growzone na AWS

**Última atualização:** 20 de Outubro, 2025
**Versão:** 1.0
**Autor:** Time de Desenvolvimento Growzone
**Tech Stack:** FastAPI + PostgreSQL RDS + AWS Lambda WebSocket + API Gateway + S3

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Arquitetura AWS](#arquitetura-aws)
4. [Fase 1: Database Setup](#fase-1-database-setup)
5. [Fase 2: S3 Bucket](#fase-2-s3-bucket)
6. [Fase 3: WebSocket Lambda](#fase-3-websocket-lambda)
7. [Fase 4: FastAPI Backend](#fase-4-fastapi-backend)
8. [Fase 5: Frontend Mobile](#fase-5-frontend-mobile)
9. [Testes End-to-End](#testes-end-to-end)
10. [Monitoring e Logs](#monitoring-e-logs)
11. [Troubleshooting](#troubleshooting)
12. [Rollback](#rollback)
13. [Segurança](#segurança)
14. [Custos](#custos)
15. [Manutenção](#manutenção)

---

## 🎯 Visão Geral

### O que será deployado?

Este guia cobre o deployment completo do sistema de chat em tempo real do Growzone na AWS, incluindo:

- ✅ **PostgreSQL RDS** - Banco de dados para conversas e mensagens
- ✅ **AWS Lambda** - 3 functions para WebSocket real-time
- ✅ **API Gateway WebSocket** - Conexões real-time com clientes
- ✅ **DynamoDB** - Armazenamento de conexões WebSocket ativas
- ✅ **S3** - Upload e storage de mídia (imagens/vídeos/áudio)
- ✅ **FastAPI Endpoints** - REST API para operações CRUD
- ✅ **ECS/Fargate** - Container do FastAPI Social API

### Tempo estimado

- **Setup inicial:** 15 minutos
- **Deployment:** 45 minutos
- **Testes:** 30 minutos
- **Total:** ~1.5 horas

### Nível de dificuldade

🟢 **Iniciante/Intermediário** - Conhecimento básico de AWS, Git e terminal necessário

---

## 🛠️ Pré-requisitos

### 1. Acesso AWS

**Você precisará de:**

```bash
# Credenciais AWS com permissões para:
- RDS (leitura/escrita)
- Lambda (create/update/invoke)
- API Gateway (create/manage)
- DynamoDB (create/read/write)
- S3 (create/read/write)
- IAM (create roles)
- CloudWatch Logs (read)
- ECR (push images) - se usar Docker
- ECS (update services) - se usar Fargate
```

**Como obter:**
1. Acesse AWS Console: https://console.aws.amazon.com
2. IAM → Users → Seu usuário → Security credentials
3. Create access key
4. Salve `Access Key ID` e `Secret Access Key`

### 2. Ferramentas Instaladas

#### AWS CLI
```bash
# macOS (Homebrew)
brew install awscli

# Verificar instalação
aws --version
# Output esperado: aws-cli/2.x.x Python/3.x.x Darwin/xx.x.x

# Configurar
aws configure
# AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
# AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCY
# Default region name [None]: us-east-1
# Default output format [None]: json

# Testar
aws sts get-caller-identity
```

#### Serverless Framework
```bash
# Instalar globalmente
npm install -g serverless

# Verificar
serverless --version
# Output: Framework Core: 3.x.x

# Instalar plugins
npm install -g serverless-python-requirements
```

#### PostgreSQL Client
```bash
# macOS
brew install postgresql@14

# Verificar
psql --version
# Output: psql (PostgreSQL) 14.x
```

#### wscat (para testes WebSocket)
```bash
npm install -g wscat

# Verificar
wscat --version
```

#### Docker (opcional, se usar ECS)
```bash
# macOS: Instalar Docker Desktop
# https://www.docker.com/products/docker-desktop

docker --version
# Output: Docker version 24.x.x
```

### 3. Informações Necessárias

Antes de começar, tenha em mãos:

```bash
# RDS PostgreSQL
RDS_ENDPOINT=growzone-xxx.yyy.us-east-1.rds.amazonaws.com
RDS_USERNAME=admin
RDS_PASSWORD=********
RDS_DATABASE=growzone_db

# JWT (mesmo usado no backend atual)
JWT_SECRET=your-super-secret-jwt-key-here

# AWS
AWS_ACCOUNT_ID=123456789012
AWS_REGION=us-east-1

# ECR (se usar Docker)
ECR_REPOSITORY=growzone-social-api
ECR_URL=123456789012.dkr.ecr.us-east-1.amazonaws.com

# ECS (se usar Fargate)
ECS_CLUSTER=growzone-cluster
ECS_SERVICE=social-api
```

---

## 🏗️ Arquitetura AWS

### Diagrama Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    MOBILE APP (React Native)                    │
│                 iOS + Android + Web (Expo)                      │
│                                                                 │
└────────┬──────────────────────────────────┬─────────────────────┘
         │                                  │
         │ HTTPS REST                       │ WebSocket (wss://)
         │ /api/v1/chat/*                   │
         │                                  │
┌────────▼──────────────────────┐  ┌────────▼──────────────────────┐
│  Application Load Balancer    │  │  API Gateway (WebSocket)      │
│  dev.social.growzone.co       │  │  wss://xxx.execute-api...     │
│  - SSL/TLS termination        │  │  - Connection management      │
│  - Health checks              │  │  - Route selection            │
│  - Auto scaling               │  │  - Throttling                 │
└────────┬──────────────────────┘  └────────┬──────────────────────┘
         │                                  │
         │                         ┌────────┴────────┐
         │                         │   $connect      │
┌────────▼─────────────────────┐  │   $disconnect   │
│   ECS Fargate (2+ tasks)     │  │   $default      │
│   - FastAPI app              │  │                 │
│   - Auto scaling             │  └────────┬────────┘
│   - Health checks            │           │
│                              │  ┌────────▼──────────────────────┐
│   Endpoints:                 │  │   Lambda Functions            │
│   POST /chat/messages        │  │   - connect.py                │
│   GET  /chat/conversations   │  │   - disconnect.py             │
│   GET  /chat/messages        │  │   - send_message.py           │
│   POST /chat/upload          │  │                               │
└────────┬─────────────────────┘  │   Runtime: Python 3.11        │
         │                         │   Memory: 256MB               │
         │                         │   Timeout: 30s                │
         │                         └────────┬──────────────────────┘
         │                                  │
         │                    ┌─────────────┴──────────────┐
         │                    │                            │
┌────────▼────────────────────▼──────────────┐  ┌─────────▼──────────┐
│   Amazon RDS PostgreSQL (Multi-AZ)         │  │  DynamoDB          │
│   Instance: db.t4g.micro                   │  │  On-Demand         │
│   Storage: 20GB SSD                        │  │                    │
│   Backup: 7 days                           │  │  Table:            │
│                                            │  │  ws_connections    │
│   Tables:                                  │  │  - connectionId    │
│   - users (existing)                       │  │  - userId (GSI)    │
│   - conversations (new)                    │  │  - connectedAt     │
│     - id (UUID, PK)                        │  │  - expiresAt (TTL) │
│     - participant1_id, participant2_id     │  │                    │
│     - created_at, updated_at               │  │  Auto-scaling      │
│     - Settings: pinned, muted, archived    │  │  enabled           │
│                                            │  └────────────────────┘
│   - messages (new)                         │
│     - id (UUID, PK)                        │
│     - conversation_id (FK)                 │
│     - sender_id, recipient_id (FK users)   │
│     - content_type (text/image/video)      │
│     - text_content, media_url              │
│     - Status: sent_at, read_at             │
│                                            │
│   - typing_indicators (new)                │
│     - conversation_id, user_id (PK)        │
│     - expires_at                           │
│                                            │
│   Indexes: 8+ optimized indexes            │
│   Connections: Max 100 concurrent          │
└────────────────┬───────────────────────────┘
                 │
        ┌────────▼───────────┐
        │   Amazon S3        │
        │   Bucket:          │
        │   growzone-chat-   │
        │   media            │
        │                    │
        │   Structure:       │
        │   /chat/           │
        │     /{userId}/     │
        │       /2025/       │
        │         /10/       │
        │           /uuid.*  │
        │                    │
        │   CORS enabled     │
        │   Lifecycle: 1yr   │
        │   Encryption: AES  │
        └────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                      MONITORING & LOGS                         │
│                                                                │
│   CloudWatch Logs:                                            │
│   - /aws/lambda/connect                                       │
│   - /aws/lambda/disconnect                                    │
│   - /aws/lambda/sendMessage                                   │
│   - /ecs/growzone-social-api                                  │
│                                                                │
│   CloudWatch Metrics:                                         │
│   - Lambda invocations, errors, duration                      │
│   - API Gateway connections, messages                         │
│   - RDS CPU, connections, IOPS                                │
│   - DynamoDB read/write units                                 │
│                                                                │
│   Alarms:                                                     │
│   - Lambda errors > 10/5min → SNS alert                       │
│   - RDS CPU > 80% → SNS alert                                 │
│   - WebSocket errors > 5% → SNS alert                         │
└────────────────────────────────────────────────────────────────┘
```

### Fluxo de Dados

**1. Enviar Mensagem (REST):**
```
Mobile App
  ↓ HTTPS POST /api/v1/chat/messages
ALB
  ↓
ECS Fargate (FastAPI)
  ↓ INSERT INTO messages
PostgreSQL RDS
  ↓ Trigger: update_conversation_timestamp
PostgreSQL RDS (update conversations)
  ↓ Query: get recipient connections
DynamoDB (ws_connections)
  ↓ Send via WebSocket
API Gateway → Lambda → Mobile App (recipient)
```

**2. Mensagem Real-Time (WebSocket):**
```
Mobile App
  ↓ WebSocket: {"action": "sendMessage", "data": {...}}
API Gateway WebSocket
  ↓ Invoke Lambda
Lambda (send_message.py)
  ↓ INSERT INTO messages (optional)
PostgreSQL RDS
  ↓ Query recipient connections
DynamoDB (ws_connections)
  ↓ Send to all recipient connections
API Gateway → Mobile App (recipient)
```

---

## 📊 Fase 1: Database Setup

### Passo 1.1: Solicitar Acesso ao RDS

**A. Entre em contato com o time de infra:**

```
Subject: Acesso ao RDS PostgreSQL - Deployment Chat Feature

Olá Time de Infra,

Preciso de acesso ao RDS PostgreSQL para deployment da feature de chat.

Informações necessárias:
1. Endpoint do RDS (ex: growzone-prod.xxx.us-east-1.rds.amazonaws.com)
2. Username com permissões de DDL (CREATE TABLE, INDEX)
3. Password
4. Database name (ex: growzone_db)
5. Liberar meu IP no Security Group: [SEU_IP_PÚBLICO]

Também vou precisar que as Lambda functions tenham acesso:
- Security Group do RDS precisa permitir conexões do Lambda Security Group
- Ou adicionar Lambdas na mesma VPC que o RDS

Obrigado!
```

**B. Como obter seu IP público:**
```bash
curl -s https://checkip.amazonaws.com
# Output: 203.0.113.45
```

**C. Informações que você receberá:**
```
RDS_ENDPOINT=growzone-prod-abc123.us-east-1.rds.amazonaws.com
RDS_PORT=5432
RDS_DATABASE=growzone_db
RDS_USERNAME=admin
RDS_PASSWORD=SuperSecureP@ssw0rd123
RDS_SECURITY_GROUP=sg-0123456789abcdef0
```

### Passo 1.2: Testar Conexão ao RDS

```bash
# Testar conectividade
psql -h growzone-prod-abc123.us-east-1.rds.amazonaws.com \
     -p 5432 \
     -U admin \
     -d growzone_db \
     -c "SELECT version();"

# Output esperado:
#                                                 version
# --------------------------------------------------------------------------------------------------------
#  PostgreSQL 14.x on x86_64-pc-linux-gnu, compiled by gcc (GCC) 7.3.1 20180712 (Red Hat 7.3.1-12), 64-bit
# (1 row)
```

**Se der erro de timeout:**
```bash
# Verificar se seu IP está no Security Group
aws ec2 describe-security-groups \
  --group-ids sg-0123456789abcdef0 \
  --query 'SecurityGroups[0].IpPermissions'

# Adicionar seu IP (peça ao time de infra)
aws ec2 authorize-security-group-ingress \
  --group-id sg-0123456789abcdef0 \
  --protocol tcp \
  --port 5432 \
  --cidr 203.0.113.45/32
```

### Passo 1.3: Verificar Schema Existente

```bash
# Conectar ao banco
psql -h growzone-prod-abc123.us-east-1.rds.amazonaws.com \
     -p 5432 \
     -U admin \
     -d growzone_db

# Verificar tabelas existentes
\dt

# Output esperado (algo como):
#              List of relations
#  Schema |       Name        | Type  | Owner
# --------+-------------------+-------+-------
#  public | users             | table | admin
#  public | posts             | table | admin
#  public | comments          | table | admin
#  ...
```

**Verificar estrutura da tabela users:**
```sql
\d users

-- Output esperado deve ter algo como:
--  id           | integer               | not null
--  username     | character varying(255)| not null
--  email        | character varying(255)|
--  created_at   | timestamp             |
```

### Passo 1.4: Backup Antes de Modificar

```bash
# Criar backup completo
pg_dump -h growzone-prod-abc123.us-east-1.rds.amazonaws.com \
        -U admin \
        -d growzone_db \
        -F c \
        -f growzone_backup_$(date +%Y%m%d_%H%M%S).dump

# Verificar tamanho do backup
ls -lh growzone_backup_*.dump

# Fazer upload para S3 (opcional mas recomendado)
aws s3 cp growzone_backup_*.dump \
  s3://growzone-backups/database/
```

### Passo 1.5: Executar Migration

```bash
# Navegar para a pasta do projeto
cd /Users/ioannisvossos/Downloads/growzone-mobile

# Executar migration
psql -h growzone-prod-abc123.us-east-1.rds.amazonaws.com \
     -p 5432 \
     -U admin \
     -d growzone_db \
     -f backend/migrations/001_chat_initial.sql

# Output esperado:
# CREATE TABLE
# CREATE TABLE
# CREATE TABLE
# CREATE INDEX
# CREATE INDEX
# CREATE INDEX
# CREATE INDEX
# CREATE INDEX
# CREATE INDEX
# CREATE INDEX
# CREATE INDEX
# CREATE FUNCTION
# CREATE TRIGGER
# CREATE FUNCTION
# COMMENT
# COMMENT
# ... (múltiplas linhas)
```

**Se der erro:**
```sql
-- Erro comum: "relation users does not exist"
-- Solução: Verificar o nome da tabela de usuários
\dt

-- Se a tabela for "user" ao invés de "users":
-- Editar o arquivo 001_chat_initial.sql
-- Substituir todas as referências:
-- sed -i 's/REFERENCES users/REFERENCES user/g' backend/migrations/001_chat_initial.sql
```

### Passo 1.6: Verificar Instalação

```sql
-- Conectar ao banco
psql -h growzone-prod-abc123.us-east-1.rds.amazonaws.com \
     -p 5432 \
     -U admin \
     -d growzone_db

-- Verificar tabelas criadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('conversations', 'messages', 'typing_indicators')
ORDER BY table_name;

-- Output esperado:
--    table_name
-- ------------------
--  conversations
--  messages
--  typing_indicators
-- (3 rows)

-- Verificar índices
SELECT indexname, tablename
FROM pg_indexes
WHERE tablename IN ('conversations', 'messages')
ORDER BY tablename, indexname;

-- Output esperado: 8+ índices

-- Verificar funções
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('update_conversation_timestamp', 'get_or_create_conversation');

-- Output esperado:
--         routine_name
-- ---------------------------------
--  get_or_create_conversation
--  update_conversation_timestamp
-- (2 rows)

-- Testar função helper
SELECT get_or_create_conversation(1, 2);

-- Output esperado (um UUID):
--        get_or_create_conversation
-- --------------------------------------
--  550e8400-e29b-41d4-a716-446655440000
-- (1 row)

-- Verificar que a conversa foi criada
SELECT * FROM conversations;

-- Output esperado (1 row com participant1_id=1, participant2_id=2)
```

### Passo 1.7: Inserir Dados de Teste (Opcional)

```sql
-- Inserir conversa de teste
INSERT INTO conversations (id, participant1_id, participant2_id, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', 1, 2, NOW() - INTERVAL '2 days');

-- Inserir mensagens de teste
INSERT INTO messages (
  conversation_id,
  sender_id,
  recipient_id,
  content_type,
  text_content,
  created_at
)
VALUES
  ('00000000-0000-0000-0000-000000000001', 1, 2, 'text', 'Olá! Como vai?', NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000001', 2, 1, 'text', 'Tudo bem! E você?', NOW() - INTERVAL '2 days' + INTERVAL '1 hour'),
  ('00000000-0000-0000-0000-000000000001', 1, 2, 'text', 'Tudo ótimo! 🌱', NOW() - INTERVAL '1 day');

-- Verificar
SELECT
  m.id,
  m.sender_id,
  m.text_content,
  m.created_at,
  m.read_at
FROM messages m
ORDER BY m.created_at DESC
LIMIT 5;
```

### ✅ Checklist Fase 1

- [ ] Acesso ao RDS obtido
- [ ] Conexão testada com sucesso
- [ ] Backup criado
- [ ] Migration executada
- [ ] 3 tabelas criadas (conversations, messages, typing_indicators)
- [ ] 8+ índices criados
- [ ] 2 funções criadas
- [ ] Função get_or_create_conversation testada
- [ ] Dados de teste inseridos (opcional)

**Tempo estimado:** 15-20 minutos

---

## 📦 Fase 2: S3 Bucket

### Passo 2.1: Criar Bucket S3

```bash
# Definir nome do bucket (deve ser único globalmente)
BUCKET_NAME=growzone-chat-media-prod

# Criar bucket
aws s3 mb s3://${BUCKET_NAME} --region us-east-1

# Output esperado:
# make_bucket: growzone-chat-media-prod

# Verificar
aws s3 ls | grep chat

# Output esperado:
# 2025-10-20 10:30:45 growzone-chat-media-prod
```

**Se der erro "Bucket already exists":**
```bash
# Tentar com sufixo único
BUCKET_NAME=growzone-chat-media-$(date +%s)
aws s3 mb s3://${BUCKET_NAME} --region us-east-1
```

### Passo 2.2: Configurar CORS

```bash
# Criar arquivo de configuração CORS
cat > /tmp/s3-cors.json <<'EOF'
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

# Aplicar CORS
aws s3api put-bucket-cors \
  --bucket ${BUCKET_NAME} \
  --cors-configuration file:///tmp/s3-cors.json

# Verificar CORS
aws s3api get-bucket-cors --bucket ${BUCKET_NAME}

# Output esperado: JSON com a configuração acima
```

### Passo 2.3: Configurar Lifecycle Policy

```bash
# Criar policy para deletar arquivos antigos
cat > /tmp/s3-lifecycle.json <<'EOF'
{
  "Rules": [
    {
      "Id": "DeleteOldMedia",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "chat/"
      },
      "Expiration": {
        "Days": 365
      },
      "NoncurrentVersionExpiration": {
        "NoncurrentDays": 30
      }
    }
  ]
}
EOF

# Aplicar lifecycle
aws s3api put-bucket-lifecycle-configuration \
  --bucket ${BUCKET_NAME} \
  --lifecycle-configuration file:///tmp/s3-lifecycle.json

# Verificar
aws s3api get-bucket-lifecycle-configuration --bucket ${BUCKET_NAME}
```

### Passo 2.4: Configurar Encryption

```bash
# Habilitar encryption at rest (AES-256)
aws s3api put-bucket-encryption \
  --bucket ${BUCKET_NAME} \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      },
      "BucketKeyEnabled": true
    }]
  }'

# Verificar
aws s3api get-bucket-encryption --bucket ${BUCKET_NAME}
```

### Passo 2.5: Configurar Versioning (Opcional)

```bash
# Habilitar versioning (para recovery)
aws s3api put-bucket-versioning \
  --bucket ${BUCKET_NAME} \
  --versioning-configuration Status=Enabled

# Verificar
aws s3api get-bucket-versioning --bucket ${BUCKET_NAME}

# Output esperado:
# {
#     "Status": "Enabled"
# }
```

### Passo 2.6: Testar Upload

```bash
# Criar arquivo de teste
echo "Test file for S3" > /tmp/test-upload.txt

# Upload
aws s3 cp /tmp/test-upload.txt \
  s3://${BUCKET_NAME}/chat/test/test-upload.txt

# Output esperado:
# upload: /tmp/test-upload.txt to s3://growzone-chat-media-prod/chat/test/test-upload.txt

# Listar
aws s3 ls s3://${BUCKET_NAME}/chat/test/

# Output esperado:
# 2025-10-20 10:35:12         18 test-upload.txt

# Gerar URL pré-assinada (válida por 1 hora)
aws s3 presign \
  s3://${BUCKET_NAME}/chat/test/test-upload.txt \
  --expires-in 3600

# Output esperado: URL longa
# https://growzone-chat-media-prod.s3.amazonaws.com/chat/test/test-upload.txt?X-Amz-Algorithm=...

# Testar URL no browser ou curl
curl -I "URL_GERADA_ACIMA"

# Output esperado: HTTP/1.1 200 OK

# Limpar teste
aws s3 rm s3://${BUCKET_NAME}/chat/test/test-upload.txt
```

### Passo 2.7: Configurar IAM Policy para Lambda

```bash
# Criar policy JSON
cat > /tmp/s3-lambda-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::${BUCKET_NAME}/chat/*"
    },
    {
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::${BUCKET_NAME}",
      "Condition": {
        "StringLike": {
          "s3:prefix": "chat/*"
        }
      }
    }
  ]
}
EOF

# Criar policy (será anexada ao role do Lambda depois)
aws iam create-policy \
  --policy-name GrowzoneChatS3Access \
  --policy-document file:///tmp/s3-lambda-policy.json

# Output esperado:
# {
#     "Policy": {
#         "PolicyName": "GrowzoneChatS3Access",
#         "PolicyId": "ANPAI...",
#         "Arn": "arn:aws:iam::123456789:policy/GrowzoneChatS3Access",
#         ...
#     }
# }

# Salvar o ARN da policy
S3_POLICY_ARN=$(aws iam list-policies \
  --query 'Policies[?PolicyName==`GrowzoneChatS3Access`].Arn' \
  --output text)

echo "S3 Policy ARN: ${S3_POLICY_ARN}"
# Salvar isso, vamos usar na Fase 3
```

### ✅ Checklist Fase 2

- [ ] Bucket S3 criado
- [ ] CORS configurado
- [ ] Lifecycle policy aplicada (365 dias)
- [ ] Encryption at rest habilitada
- [ ] Versioning habilitado (opcional)
- [ ] Upload de teste bem-sucedido
- [ ] URL pré-assinada funcionando
- [ ] IAM policy criada

**Tempo estimado:** 10 minutos

---

## ⚡ Fase 3: WebSocket Lambda

Esta é a fase mais importante e automatizada. Vamos usar Serverless Framework.

### Passo 3.1: Preparar Ambiente

```bash
# Navegar para pasta lambda
cd /Users/ioannisvossos/Downloads/growzone-mobile/backend/lambda

# Verificar arquivos
ls -la

# Output esperado:
# connect.py
# disconnect.py
# send_message.py
# serverless.yml
# requirements.txt

# Instalar Serverless Framework (se ainda não instalou)
npm install -g serverless

# Verificar versão
serverless --version

# Instalar plugin Python
npm init -y  # Criar package.json se não existir
npm install --save-dev serverless-python-requirements
```

### Passo 3.2: Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env (NÃO commitar no git!)
cat > .env <<EOF
# JWT Secret (MESMO usado no FastAPI)
JWT_SECRET=your-super-secret-jwt-key-123456

# PostgreSQL RDS
POSTGRES_HOST=growzone-prod-abc123.us-east-1.rds.amazonaws.com
POSTGRES_DB=growzone_db
POSTGRES_USER=admin
POSTGRES_PASSWORD=SuperSecureP@ssw0rd123

# AWS
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=123456789012

# S3 (opcional, para enviar mídia via WebSocket)
CHAT_S3_BUCKET=growzone-chat-media-prod
EOF

# IMPORTANTE: Adicionar .env ao .gitignore
echo ".env" >> .gitignore

# Verificar
cat .env
```

### Passo 3.3: Revisar serverless.yml

```bash
# Abrir e revisar
cat serverless.yml

# Verificar configurações importantes:
# - service name
# - region
# - stage
# - environment variables
# - IAM permissions
```

**Ajustes necessários no serverless.yml:**

```yaml
# Se precisar adicionar Lambda na VPC (para acessar RDS):
provider:
  vpc:
    securityGroupIds:
      - sg-xxxxxxxxx  # Security Group que tem acesso ao RDS
    subnetIds:
      - subnet-xxxxxxxx  # Subnet privada 1
      - subnet-yyyyyyyy  # Subnet privada 2
```

### Passo 3.4: Deploy Serverless

```bash
# Deploy para staging (teste)
serverless deploy --stage dev --verbose

# Output esperado (várias linhas de log):
# Deploying growzone-chat-websocket to stage dev (us-east-1)
#
# ✔ Service deployed to stack growzone-chat-websocket-dev (152s)
#
# endpoints:
#   wss://abc123def.execute-api.us-east-1.amazonaws.com/dev
#
# functions:
#   connect: growzone-chat-websocket-dev-connect (5.2 MB)
#   disconnect: growzone-chat-websocket-dev-disconnect (5.2 MB)
#   sendMessage: growzone-chat-websocket-dev-sendMessage (5.2 MB)
#
# Stack Outputs:
#   WebSocketURL: wss://abc123def.execute-api.us-east-1.amazonaws.com/dev
#   ConnectionsTableName: growzone-chat-websocket-connections-dev
```

**⚠️ IMPORTANTE: Salvar a URL WebSocket!**

```bash
# Salvar em arquivo
WS_URL=$(serverless info --stage dev | grep "wss://" | awk '{print $2}')
echo "WebSocket URL: ${WS_URL}"
echo "${WS_URL}" > websocket-url-dev.txt

# Exemplo:
# wss://abc123def.execute-api.us-east-1.amazonaws.com/dev
```

### Passo 3.5: Verificar Deploy

```bash
# Listar funções criadas
aws lambda list-functions \
  --query 'Functions[?starts_with(FunctionName, `growzone-chat`)].FunctionName'

# Output esperado:
# [
#     "growzone-chat-websocket-dev-connect",
#     "growzone-chat-websocket-dev-disconnect",
#     "growzone-chat-websocket-dev-sendMessage"
# ]

# Verificar API Gateway
aws apigatewayv2 get-apis \
  --query 'Items[?Name==`growzone-chat-websocket-dev`]'

# Verificar DynamoDB table
aws dynamodb describe-table \
  --table-name growzone-chat-websocket-connections-dev \
  --query 'Table.{Name:TableName,Status:TableStatus,ItemCount:ItemCount}'

# Output esperado:
# {
#     "Name": "growzone-chat-websocket-connections-dev",
#     "Status": "ACTIVE",
#     "ItemCount": 0
# }
```

### Passo 3.6: Testar WebSocket - Connect

```bash
# Primeiro, gerar um JWT token de teste
# (assumindo que você tem um endpoint /login no auth API)

# Opção 1: Usar token real
AUTH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Opção 2: Gerar token fake para teste (não funciona em prod!)
# (use apenas se JWT_SECRET do .env for de desenvolvimento)

# Testar conexão com wscat
wscat -c "${WS_URL}?token=${AUTH_TOKEN}"

# Output esperado:
# Connected (press CTRL+C to quit)
# < {"type":"connected","message":"WebSocket connection established"}

# Em outra janela de terminal, verificar conexão no DynamoDB
aws dynamodb scan \
  --table-name growzone-chat-websocket-connections-dev \
  --max-items 5

# Output esperado (1 item se conectou):
# {
#     "Items": [
#         {
#             "connectionId": {"S": "abc123..."},
#             "userId": {"N": "1"},
#             "connectedAt": {"S": "2025-10-20T..."},
#             ...
#         }
#     ],
#     "Count": 1,
#     ...
# }
```

### Passo 3.7: Testar WebSocket - Send Message

```bash
# Na sessão wscat aberta, enviar mensagem:
> {"action":"sendMessage","data":{"recipientId":2,"contentType":"text","textContent":"Hello from WebSocket!"}}

# Output esperado:
# < {"type":"acknowledgment","messageId":"uuid-here"}

# Verificar logs do Lambda
serverless logs -f sendMessage --stage dev --tail

# Ou via AWS CLI
aws logs tail /aws/lambda/growzone-chat-websocket-dev-sendMessage --follow
```

### Passo 3.8: Testar WebSocket - Ping/Pong

```bash
# Enviar ping
> {"action":"ping"}

# Output esperado:
# < {"type":"pong"}

# Verificar que connectionupdate foi atualizado no DynamoDB
aws dynamodb get-item \
  --table-name growzone-chat-websocket-connections-dev \
  --key '{"connectionId": {"S": "SEU_CONNECTION_ID"}}' \
  --query 'Item.lastPingAt.S'

# Output esperado: timestamp recente
```

### Passo 3.9: Deploy Production

**Depois de testar tudo em dev:**

```bash
# Deploy para production
serverless deploy --stage production --verbose

# Output esperado:
# endpoints:
#   wss://xyz789abc.execute-api.us-east-1.amazonaws.com/production
#
# functions:
#   connect: growzone-chat-websocket-production-connect
#   ...

# Salvar URL de production
WS_URL_PROD=$(serverless info --stage production | grep "wss://" | awk '{print $2}')
echo "Production WebSocket URL: ${WS_URL_PROD}"
echo "${WS_URL_PROD}" > websocket-url-production.txt

# Exemplo:
# wss://xyz789abc.execute-api.us-east-1.amazonaws.com/production
```

### Passo 3.10: Configurar CloudWatch Alarms

```bash
# Criar alarme para erros no Lambda
aws cloudwatch put-metric-alarm \
  --alarm-name chat-websocket-errors-prod \
  --alarm-description "Alert when Lambda errors exceed threshold" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --dimensions Name=FunctionName,Value=growzone-chat-websocket-production-sendMessage \
  --alarm-actions arn:aws:sns:us-east-1:123456789:alerts

# Criar alarme para alta latência
aws cloudwatch put-metric-alarm \
  --alarm-name chat-websocket-latency-prod \
  --metric-name Duration \
  --namespace AWS/Lambda \
  --statistic Average \
  --period 300 \
  --threshold 5000 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --dimensions Name=FunctionName,Value=growzone-chat-websocket-production-sendMessage \
  --alarm-actions arn:aws:sns:us-east-1:123456789:alerts
```

### ✅ Checklist Fase 3

- [ ] Serverless Framework instalado
- [ ] .env criado com todas as variáveis
- [ ] Deploy dev bem-sucedido
- [ ] 3 Lambda functions criadas
- [ ] API Gateway WebSocket criado
- [ ] DynamoDB table criada com GSI
- [ ] Teste de conexão (wscat) bem-sucedido
- [ ] Teste de envio de mensagem bem-sucedido
- [ ] Teste de ping/pong bem-sucedido
- [ ] Deploy production bem-sucedido
- [ ] URLs salvas (dev e production)
- [ ] CloudWatch alarms configurados

**Tempo estimado:** 15-20 minutos

---

## 🐍 Fase 4: FastAPI Backend

Agora vamos adicionar os endpoints REST do chat ao Social API existente.

### Passo 4.1: Localizar Repositório do Backend

```bash
# Assumindo que você tem um repositório separado para o backend
cd /path/to/seu-backend-fastapi

# Ou se está no mesmo repo:
cd backend-api/

# Verificar estrutura
ls -la

# Output esperado algo como:
# app/
#   main.py
#   routers/
#     auth.py
#     social.py
#     posts.py
#   models/
#   ...
# requirements.txt
# Dockerfile
# ...
```

### Passo 4.2: Copiar Arquivos do Chat

```bash
# Copiar models
cp /Users/ioannisvossos/Downloads/growzone-mobile/backend/api/models/chat.py \
   app/models/

# Copiar router
cp /Users/ioannisvossos/Downloads/growzone-mobile/backend/api/routers/chat.py \
   app/routers/

# Verificar
ls -la app/models/chat.py
ls -la app/routers/chat.py
```

### Passo 4.3: Atualizar main.py

```python
# Editar app/main.py

from fastapi import FastAPI
from app.routers import auth, social, posts, chat  # Adicionar chat

app = FastAPI(title="Growzone Social API")

# ... outros middlewares ...

# Incluir routers existentes
app.include_router(auth.router, prefix="/api/v1")
app.include_router(social.router, prefix="/api/v1")
app.include_router(posts.router, prefix="/api/v1")

# Adicionar chat router
app.include_router(chat.router, prefix="/api/v1")  # ← NOVO

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

### Passo 4.4: Atualizar requirements.txt

```bash
# Adicionar dependências do chat
cat >> requirements.txt <<EOF

# Chat dependencies
boto3==1.34.0
PyJWT==2.8.0
psycopg2-binary==2.9.9
EOF

# Verificar
tail requirements.txt
```

### Passo 4.5: Ajustar Imports no chat.py

```python
# Editar app/routers/chat.py

# Ajustar imports para seu projeto
# De:
# from ..models.chat import (...)
# Para:
from app.models.chat import (...)

# De:
# from ..dependencies import get_db, get_current_user
# Para:
from app.dependencies import get_db, get_current_user

# De:
# from ..models import User, Conversation, Message
# Para:
from app.models.database import User  # Ajustar conforme seu schema
```

### Passo 4.6: Adicionar Models ao SQLAlchemy (se necessário)

Se você usa SQLAlchemy, adicione os models:

```python
# app/models/database.py (ou models/__init__.py)

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    participant1_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    participant2_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_message_at = Column(DateTime)

    participant1_pinned = Column(Boolean, default=False)
    participant1_muted = Column(Boolean, default=False)
    participant1_archived = Column(Boolean, default=False)
    participant1_deleted_at = Column(DateTime)

    participant2_pinned = Column(Boolean, default=False)
    participant2_muted = Column(Boolean, default=False)
    participant2_archived = Column(Boolean, default=False)
    participant2_deleted_at = Column(DateTime)

    messages = relationship("Message", back_populates="conversation")


class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    content_type = Column(String(20), nullable=False)
    text_content = Column(Text)
    media_url = Column(Text)
    media_thumbnail_url = Column(Text)
    audio_duration = Column(Integer)

    reply_to_id = Column(UUID(as_uuid=True), ForeignKey("messages.id"))

    created_at = Column(DateTime, default=datetime.utcnow)
    sent_at = Column(DateTime)
    delivered_at = Column(DateTime)
    read_at = Column(DateTime)

    sender_deleted_at = Column(DateTime)
    recipient_deleted_at = Column(DateTime)

    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id])
    recipient = relationship("User", foreign_keys=[recipient_id])
```

### Passo 4.7: Testar Localmente

```bash
# Instalar dependências
pip install -r requirements.txt

# Rodar servidor local
uvicorn app.main:app --reload --port 8000

# Output esperado:
# INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
# INFO:     Started reloader process...
# INFO:     Started server process
# INFO:     Waiting for application startup.
# INFO:     Application startup complete.

# Em outra janela, testar endpoints
# 1. Health check
curl http://localhost:8000/health

# Output esperado:
# {"status":"healthy"}

# 2. Chat conversations (precisa de token)
curl -X GET http://localhost:8000/api/v1/chat/conversations \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# Output esperado:
# {"data":[],"total":0,"page":1,"page_size":20}

# 3. Testar envio de mensagem
curl -X POST http://localhost:8000/api/v1/chat/messages \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_id": 2,
    "content_type": "text",
    "text_content": "Test message from API"
  }'

# Output esperado:
# {
#   "id": "uuid-here",
#   "conversation_id": "uuid-here",
#   "sender_id": 1,
#   "recipient_id": 2,
#   "content_type": "text",
#   "text_content": "Test message from API",
#   ...
# }

# Verificar no banco
psql -h growzone-prod-abc123.us-east-1.rds.amazonaws.com \
     -U admin -d growzone_db \
     -c "SELECT * FROM messages ORDER BY created_at DESC LIMIT 1;"
```

### Passo 4.8: Build Docker Image

**Se seu backend usa Docker (ECS/Fargate):**

```bash
# Verificar Dockerfile existente
cat Dockerfile

# Build image
docker build -t growzone-social-api:chat-v1 .

# Output esperado:
# [+] Building 45.3s (12/12) FINISHED
# ...
# => => naming to docker.io/library/growzone-social-api:chat-v1

# Testar container localmente
docker run -p 8000:8000 \
  -e POSTGRES_HOST=growzone-prod-abc123.us-east-1.rds.amazonaws.com \
  -e POSTGRES_DB=growzone_db \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=password \
  -e JWT_SECRET=your-secret \
  growzone-social-api:chat-v1

# Testar
curl http://localhost:8000/health
```

### Passo 4.9: Push para ECR

```bash
# Login no ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  123456789.dkr.ecr.us-east-1.amazonaws.com

# Output esperado:
# Login Succeeded

# Tag image
docker tag growzone-social-api:chat-v1 \
  123456789.dkr.ecr.us-east-1.amazonaws.com/growzone-social-api:chat-v1

# Push
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/growzone-social-api:chat-v1

# Output esperado:
# The push refers to repository [123456789.dkr.ecr.us-east-1.amazonaws.com/growzone-social-api]
# ...
# chat-v1: digest: sha256:abc123... size: 1234
```

### Passo 4.10: Update ECS Service

```bash
# Atualizar ECS service para usar nova image
aws ecs update-service \
  --cluster growzone-cluster \
  --service social-api \
  --force-new-deployment

# Output esperado:
# {
#     "service": {
#         "serviceName": "social-api",
#         "status": "ACTIVE",
#         "desiredCount": 2,
#         ...
#     }
# }

# Acompanhar deployment
watch -n 5 'aws ecs describe-services \
  --cluster growzone-cluster \
  --services social-api \
  --query "services[0].deployments"'

# Aguardar até deployments[0].runningCount == desiredCount
```

### Passo 4.11: Verificar em Produção

```bash
# Testar health check
curl https://dev.social.growzone.co/health

# Output esperado:
# {"status":"healthy"}

# Testar chat endpoint (com token válido)
curl -X GET https://dev.social.growzone.co/api/v1/chat/conversations \
  -H "Authorization: Bearer TOKEN_VALIDO"

# Output esperado:
# {"data":[...],"total":X,"page":1,"page_size":20}

# Verificar logs no CloudWatch
aws logs tail /ecs/growzone-social-api --follow
```

### ✅ Checklist Fase 4

- [ ] Arquivos copiados (models/chat.py, routers/chat.py)
- [ ] main.py atualizado com chat router
- [ ] requirements.txt atualizado
- [ ] Imports ajustados
- [ ] SQLAlchemy models adicionados (se aplicável)
- [ ] Testes locais bem-sucedidos
- [ ] Docker image buildada
- [ ] Image pushed para ECR
- [ ] ECS service atualizado
- [ ] Deployment completo (runningCount == desiredCount)
- [ ] Endpoints em produção funcionando

**Tempo estimado:** 20-30 minutos

---

## 📱 Fase 5: Frontend Mobile

Agora vamos configurar o app mobile para usar o backend real.

### Passo 5.1: Atualizar app.json

```bash
# Navegar para o projeto mobile
cd /Users/ioannisvossos/Downloads/growzone-mobile

# Editar app.json
nano app.json
# ou
code app.json
```

```json
{
  "expo": {
    "extra": {
      "CHAT_ENABLED": true,
      "CHAT_API_URL": "https://dev.social.growzone.co/api/v1/chat",
      "CHAT_WS_URL": "wss://xyz789abc.execute-api.us-east-1.amazonaws.com/production",
      "CHAT_S3_BUCKET": "growzone-chat-media-prod"
    }
  }
}
```

### Passo 5.2: Atualizar .env.production

```bash
# Criar/editar .env.production
cat > .env.production <<EOF
EXPO_PUBLIC_AUTH_API_URL=https://dev.auth.growzone.co/api/v1
EXPO_PUBLIC_SOCIAL_API_URL=https://dev.social.growzone.co/api/v1
EXPO_PUBLIC_CHAT_API_URL=https://dev.social.growzone.co/api/v1/chat
EXPO_PUBLIC_CHAT_WS_URL=wss://xyz789abc.execute-api.us-east-1.amazonaws.com/production
EXPO_PUBLIC_CHAT_S3_BUCKET=growzone-chat-media-prod
EOF
```

### Passo 5.3: Atualizar chat-api.ts

```typescript
// src/api/chat/chat-api.ts

import Constants from "expo-constants";
import { socialApi } from "@/lib/axios";
import type {
  Conversation,
  Message,
  SendMessagePayload,
} from "@/api/@types/chat";

const extra = Constants.expoConfig?.extra ?? {};

export const CHAT_API_URL =
  extra.CHAT_API_URL || "https://dev.social.growzone.co/api/v1/chat";
export const CHAT_WS_URL =
  extra.CHAT_WS_URL || "wss://localhost:3000";

// ============================================================================
// REST API Functions (substituir mock data)
// ============================================================================

export async function getConversations(
  page = 1,
  pageSize = 20
): Promise<Conversation[]> {
  const response = await socialApi.get("/chat/conversations", {
    params: { page, page_size: pageSize },
  });
  return response.data.data;
}

export async function getMessages(
  conversationId: string,
  page = 1,
  pageSize = 50
): Promise<Message[]> {
  const response = await socialApi.get(
    `/chat/conversations/${conversationId}/messages`,
    { params: { page, page_size: pageSize } }
  );
  return response.data.data;
}

export async function sendMessage(
  payload: SendMessagePayload
): Promise<Message> {
  const response = await socialApi.post("/chat/messages", payload);
  return response.data;
}

export async function markAsRead(
  conversationId: string,
  messageIds: string[]
): Promise<void> {
  await socialApi.post("/chat/messages/read", { message_ids: messageIds });
}

export async function uploadMedia(file: FormData): Promise<{ url: string }> {
  const response = await socialApi.post("/chat/upload", file, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

// ... outras funções
```

### Passo 5.4: Criar WebSocket Hook

```typescript
// src/hooks/useWebSocket.ts

import { useEffect, useRef, useState, useCallback } from "react";
import { storageGetAuthToken } from "@/storage/storage-auth-token";
import { CHAT_WS_URL } from "@/api/chat/chat-api";

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  const connect = useCallback(async () => {
    try {
      const { access_token } = await storageGetAuthToken();
      if (!access_token) {
        console.warn("No access token, cannot connect to WebSocket");
        return;
      }

      const wsUrl = `${CHAT_WS_URL}?token=${access_token}`;
      console.log("Connecting to WebSocket:", wsUrl);

      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log("✅ WebSocket connected");
        setIsConnected(true);
      };

      ws.current.onmessage = (event) => {
        console.log("📩 WebSocket message:", event.data);
        const message = JSON.parse(event.data);
        setLastMessage(message);
      };

      ws.current.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        setIsConnected(false);
      };

      ws.current.onclose = (event) => {
        console.log("🔌 WebSocket closed:", event.code, event.reason);
        setIsConnected(false);

        // Reconnect after 3 seconds
        setTimeout(() => {
          console.log("🔄 Reconnecting WebSocket...");
          connect();
        }, 3000);
      };
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((action: string, data: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const payload = JSON.stringify({ action, data });
      console.log("📤 Sending WebSocket message:", payload);
      ws.current.send(payload);
    } else {
      console.warn("WebSocket not connected, cannot send message");
    }
  }, []);

  return { isConnected, sendMessage, lastMessage };
}
```

### Passo 5.5: Integrar WebSocket no Chat Screen

```typescript
// src/app/(drawer)/chat/[id].tsx

import { useWebSocket } from "@/hooks/useWebSocket";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isConnected, sendMessage, lastMessage } = useWebSocket();

  // Escutar novas mensagens via WebSocket
  useEffect(() => {
    if (lastMessage?.type === "newMessage") {
      const message = lastMessage.data;
      if (message.conversationId === id) {
        // Adicionar mensagem à lista
        setMessages((prev) => [...prev, message]);
      }
    }
  }, [lastMessage, id]);

  // Enviar mensagem via REST (mais confiável)
  const handleSendMessage = async (text: string) => {
    await sendMessage({
      recipient_id: recipientId,
      content_type: "text",
      text_content: text,
    });
    loadMessages(); // Reload
  };

  // Indicador de digitação via WebSocket
  const handleTyping = (isTyping: boolean) => {
    sendMessage("typing", {
      conversationId: id,
      recipientId: recipientId,
      isTyping,
    });
  };

  // ... resto do componente
}
```

### Passo 5.6: Testar Localmente

```bash
# Limpar cache
npx expo start --clear

# Testar no web
npx expo start --web

# Abrir no browser: http://localhost:8081

# Testar fluxo completo:
# 1. Login com usuário de teste
# 2. Navegar para chat
# 3. Verificar lista de conversas carrega (pode estar vazia)
# 4. Criar nova conversa
# 5. Enviar mensagem
# 6. Verificar no banco se mensagem foi salva

# Abrir console do browser (F12) e verificar logs:
# ✅ WebSocket connected
# 📩 WebSocket message: ...
```

### Passo 5.7: Build para Produção

```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production

# Aguardar build completar (~15-20 minutos)
```

### Passo 5.8: Submit para Stores

```bash
# iOS (TestFlight primeiro)
eas submit --platform ios --latest

# Android (Internal testing)
eas submit --platform android --latest
```

### ✅ Checklist Fase 5

- [ ] app.json atualizado com URLs
- [ ] .env.production criado
- [ ] chat-api.ts usando backend real (não mock)
- [ ] WebSocket hook criado
- [ ] Chat screen integrado com WebSocket
- [ ] Testes locais bem-sucedidos
- [ ] Build iOS iniciado
- [ ] Build Android iniciado
- [ ] Submissão para stores

**Tempo estimado:** 30-40 minutos (+ tempo de build)

---

## 🧪 Testes End-to-End

Após deploy completo, execute estes testes:

### Teste 1: REST API

```bash
# 1. Login e obter token
TOKEN=$(curl -X POST https://dev.auth.growzone.co/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test@growzone.co","password":"Test123!"}' \
  | jq -r '.access_token')

echo "Token: ${TOKEN}"

# 2. Listar conversas
curl -X GET https://dev.social.growzone.co/api/v1/chat/conversations \
  -H "Authorization: Bearer ${TOKEN}" \
  | jq

# 3. Enviar mensagem
curl -X POST https://dev.social.growzone.co/api/v1/chat/messages \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_id": 2,
    "content_type": "text",
    "text_content": "Test message E2E"
  }' | jq

# 4. Buscar mensagens
CONVERSATION_ID=$(curl -X GET https://dev.social.growzone.co/api/v1/chat/conversations \
  -H "Authorization: Bearer ${TOKEN}" \
  | jq -r '.data[0].id')

curl -X GET "https://dev.social.growzone.co/api/v1/chat/conversations/${CONVERSATION_ID}/messages" \
  -H "Authorization: Bearer ${TOKEN}" \
  | jq
```

### Teste 2: WebSocket

```bash
# 1. Conectar
wscat -c "wss://xyz789abc.execute-api.us-east-1.amazonaws.com/production?token=${TOKEN}"

# 2. Enviar mensagem
> {"action":"sendMessage","data":{"recipientId":2,"contentType":"text","textContent":"WS test"}}

# 3. Ping
> {"action":"ping"}
< {"type":"pong"}
```

### Teste 3: Upload S3

```bash
# Criar imagem de teste
convert -size 100x100 xc:blue test-image.jpg

# Upload
curl -X POST https://dev.social.growzone.co/api/v1/chat/upload \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "file=@test-image.jpg" \
  | jq

# Output esperado:
# {
#   "url": "https://growzone-chat-media-prod.s3.amazonaws.com/chat/1/2025/10/uuid.jpg",
#   "file_size": 1234,
#   "mime_type": "image/jpeg"
# }
```

### Teste 4: Mobile App

**Checklist no app:**
- [ ] Login funciona
- [ ] Lista de conversas carrega
- [ ] Criar nova conversa funciona
- [ ] Enviar mensagem de texto funciona
- [ ] Mensagem aparece instantaneamente (WebSocket)
- [ ] Upload de imagem funciona
- [ ] Gravar áudio funciona
- [ ] Typing indicator funciona
- [ ] Mark as read funciona
- [ ] Notificações funcionam (se configurado)

---

## 📊 Monitoring e Logs

### CloudWatch Logs

```bash
# Lambda logs
aws logs tail /aws/lambda/growzone-chat-websocket-production-connect --follow
aws logs tail /aws/lambda/growzone-chat-websocket-production-sendMessage --follow

# ECS logs
aws logs tail /ecs/growzone-social-api --follow

# Filtrar por erro
aws logs filter-log-events \
  --log-group-name /aws/lambda/growzone-chat-websocket-production-sendMessage \
  --filter-pattern "ERROR" \
  --start-time $(date -u -d '5 minutes ago' +%s)000
```

### CloudWatch Metrics

```bash
# Lambda invocations (últimas 24h)
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=growzone-chat-websocket-production-sendMessage \
  --statistics Sum \
  --start-time $(date -u -d '24 hours ago' --iso-8601) \
  --end-time $(date -u --iso-8601) \
  --period 3600

# Lambda errors
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Errors \
  --dimensions Name=FunctionName,Value=growzone-chat-websocket-production-sendMessage \
  --statistics Sum \
  --start-time $(date -u -d '24 hours ago' --iso-8601) \
  --end-time $(date -u --iso-8601) \
  --period 3600

# RDS connections
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name DatabaseConnections \
  --dimensions Name=DBInstanceIdentifier,Value=growzone-prod \
  --statistics Average \
  --start-time $(date -u -d '1 hour ago' --iso-8601) \
  --end-time $(date -u --iso-8601) \
  --period 300
```

---

## 🔧 Troubleshooting

### Problema 1: Lambda timeout connecting to RDS

**Erro:**
```
Task timed out after 30.00 seconds
```

**Causa:** Lambda não está na VPC ou Security Group não permite.

**Solução:**
```yaml
# serverless.yml
provider:
  vpc:
    securityGroupIds:
      - sg-xxxxxxxxx
    subnetIds:
      - subnet-aaaa
      - subnet-bbbb
```

### Problema 2: WebSocket disconnect imediato

**Erro:** Connection closes right after connect

**Causa:** JWT token inválido ou expirado

**Solução:**
```bash
# Gerar novo token
TOKEN=$(curl -X POST https://dev.auth.growzone.co/api/v1/login ...)

# Testar novamente
wscat -c "wss://...?token=${TOKEN}"
```

### Problema 3: CORS error no S3

**Erro:** Access blocked by CORS policy

**Solução:**
```bash
# Reaplicar CORS
aws s3api put-bucket-cors --bucket growzone-chat-media-prod \
  --cors-configuration file://s3-cors.json
```

---

## ⏮️ Rollback

Se algo der errado:

### Rollback Lambda

```bash
# Listar versões
serverless deploy list --stage production

# Rollback para versão anterior
serverless rollback --timestamp XXXXXX --stage production
```

### Rollback ECS

```bash
# Atualizar para image anterior
aws ecs update-service \
  --cluster growzone-cluster \
  --service social-api \
  --task-definition growzone-social-api:PREVIOUS_REVISION
```

### Rollback Database

```bash
# Restaurar backup
pg_restore -h growzone-prod-abc123.us-east-1.rds.amazonaws.com \
           -U admin \
           -d growzone_db \
           -c growzone_backup_20251020_100000.dump
```

---

## 🔒 Segurança

### Checklist de Segurança

- [ ] JWT_SECRET é forte (32+ caracteres)
- [ ] RDS não é público
- [ ] Lambda functions com mínimo de permissões
- [ ] S3 bucket com encryption at rest
- [ ] CloudWatch Logs habilitados
- [ ] Rate limiting configurado
- [ ] Secrets no AWS Secrets Manager

### Rotacionar JWT Secret

```bash
# Gerar novo secret
NEW_SECRET=$(openssl rand -base64 32)

# Atualizar no Secrets Manager
aws secretsmanager update-secret \
  --secret-id growzone/jwt-secret \
  --secret-string "${NEW_SECRET}"

# Atualizar .env e redeploy
```

---

## 💰 Custos

### Estimativa Mensal (1000 usuários ativos)

| Serviço | Custo |
|---------|-------|
| RDS (compartilhado) | $0 |
| Lambda | $5 |
| API Gateway | $3.50 |
| DynamoDB | $2 |
| S3 | $5 |
| Data Transfer | $5 |
| **Total** | **~$20/mês** |

---

## 🛠️ Manutenção

### Tarefas Mensais

- [ ] Verificar logs de erro
- [ ] Revisar custos AWS
- [ ] Backup manual do RDS
- [ ] Atualizar dependências
- [ ] Revisar métricas de performance

---

## 📞 Suporte

**Em caso de problemas:**

1. Verificar CloudWatch Logs
2. Testar endpoints individualmente
3. Verificar variáveis de ambiente
4. Consultar esta documentação

---

**Documentação criada em:** 20 de Outubro, 2025
**Versão:** 1.0
**Última revisão:** 20 de Outubro, 2025
