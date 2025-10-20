## 🚀 Growzone Chat Backend - Guia de Deployment Completo

**Data:** 20 de Outubro, 2025
**Stack:** FastAPI (Python) + PostgreSQL + AWS Lambda WebSocket

---

## 📋 Pré-requisitos

### 1. **Acesso AWS**
- [ ] Credenciais AWS configuradas (`aws configure`)
- [ ] Permissões: RDS, Lambda, API Gateway, DynamoDB, S3
- [ ] Região: `us-east-1` (ou sua preferência)

### 2. **Ferramentas Instaladas**
```bash
# Serverless Framework
npm install -g serverless

# AWS CLI
pip install awscli

# PostgreSQL client
# macOS:
brew install postgresql

# Ubuntu:
sudo apt-get install postgresql-client
```

### 3. **Variáveis de Ambiente**
Crie arquivo `.env` na raiz do backend:
```bash
# JWT
JWT_SECRET=your-super-secret-key-here

# PostgreSQL RDS
POSTGRES_HOST=your-rds-endpoint.region.rds.amazonaws.com
POSTGRES_DB=growzone_db
POSTGRES_USER=admin
POSTGRES_PASSWORD=your-secure-password

# S3
CHAT_S3_BUCKET=growzone-chat-media
AWS_REGION=us-east-1
```

---

## 🗄️ Fase 1: Database Setup (Day 1)

### Passo 1.1: Pedir Acesso ao RDS

Você mencionou que precisa solicitar acesso ao RDS. Entre em contato com seu time de infra e peça:

1. **Endpoint do RDS PostgreSQL**
   - Exemplo: `growzone-prod.abc123.us-east-1.rds.amazonaws.com`

2. **Credenciais de Admin**
   - Username: `admin`
   - Password: `************`

3. **Security Group**
   - Liberar acesso da sua IP local (para rodar migrations)
   - Liberar acesso das Lambda functions (VPC ou Security Group)

4. **Nome do Database**
   - Provavelmente: `growzone_db` ou similar

### Passo 1.2: Testar Conexão

```bash
psql -h your-rds-endpoint.region.rds.amazonaws.com \
     -U admin \
     -d growzone_db \
     -c "SELECT version();"
```

### Passo 1.3: Executar Migrations

```bash
cd backend/migrations

# Executar migration
psql -h your-rds-endpoint.region.rds.amazonaws.com \
     -U admin \
     -d growzone_db \
     -f 001_chat_initial.sql

# Verificar tabelas criadas
psql -h your-rds-endpoint.region.rds.amazonaws.com \
     -U admin \
     -d growzone_db \
     -c "\dt"

# Você deve ver:
# - conversations
# - messages
# - typing_indicators
```

### Passo 1.4: Criar Índices (Já incluído na migration)

Os índices já são criados automaticamente pela migration. Verifique:

```sql
-- Ver índices
SELECT indexname, tablename FROM pg_indexes
WHERE tablename IN ('conversations', 'messages')
ORDER BY tablename, indexname;
```

---

## 🐍 Fase 2: FastAPI Backend (Day 2-3)

### Passo 2.1: Adicionar Chat Router ao seu Social API

No seu backend FastAPI existente (presumivelmente em `social.growzone.co`):

```python
# main.py ou app.py

from backend.api.routers import chat

# ... seu código existente ...

# Adicionar chat router
app.include_router(
    chat.router,
    prefix="/api/v1",
    tags=["chat"]
)
```

### Passo 2.2: Instalar Dependências

```bash
pip install boto3 PyJWT psycopg2-binary
```

### Passo 2.3: Configurar S3 Bucket para Media

```bash
# Criar bucket S3
aws s3 mb s3://growzone-chat-media --region us-east-1

# Configurar CORS
aws s3api put-bucket-cors --bucket growzone-chat-media --cors-configuration file://s3-cors.json
```

Crie `s3-cors.json`:
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### Passo 2.4: Testar Endpoints Localmente

```bash
# Rodar FastAPI local
uvicorn main:app --reload --port 8000

# Testar endpoints
curl -X GET http://localhost:8000/api/v1/chat/conversations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

curl -X POST http://localhost:8000/api/v1/chat/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_id": 123,
    "content_type": "text",
    "text_content": "Hello!"
  }'
```

### Passo 2.5: Deploy do FastAPI

**Se estiver usando Elastic Beanstalk:**
```bash
eb deploy
```

**Se estiver usando ECS/Fargate:**
```bash
# Build Docker image
docker build -t growzone-social-api .

# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_URL
docker tag growzone-social-api:latest YOUR_ECR_URL/growzone-social-api:latest
docker push YOUR_ECR_URL/growzone-social-api:latest

# Update ECS service
aws ecs update-service --cluster growzone-cluster --service social-api --force-new-deployment
```

### Passo 2.6: Verificar Deploy

```bash
# Testar em produção
curl -X GET https://dev.social.growzone.co/api/v1/chat/conversations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Deve retornar:
# {"data": [], "total": 0, "page": 1, "page_size": 20}
```

---

## ⚡ Fase 3: WebSocket Setup (Day 4-5)

### Passo 3.1: Configurar Serverless Framework

```bash
cd backend/lambda

# Instalar Serverless plugins
npm init -y
npm install --save-dev serverless-python-requirements
```

### Passo 3.2: Configurar Variáveis de Ambiente

Crie `.env` em `backend/lambda/`:
```bash
JWT_SECRET=same-as-fastapi
POSTGRES_HOST=your-rds-endpoint.region.rds.amazonaws.com
POSTGRES_DB=growzone_db
POSTGRES_USER=admin
POSTGRES_PASSWORD=your-password
```

### Passo 3.3: Deploy WebSocket

```bash
cd backend/lambda

# Deploy para dev
serverless deploy --stage dev

# Deploy para production
serverless deploy --stage production
```

Você verá output com:
```
✔ Service deployed to stack growzone-chat-websocket-production

endpoints:
  wss://abc123xyz.execute-api.us-east-1.amazonaws.com/production

functions:
  connect: growzone-chat-websocket-production-connect
  disconnect: growzone-chat-websocket-production-disconnect
  sendMessage: growzone-chat-websocket-production-sendMessage
```

**IMPORTANTE:** Salve a URL WebSocket: `wss://abc123xyz.execute-api.us-east-1.amazonaws.com/production`

### Passo 3.4: Testar WebSocket

Use ferramenta como `wscat`:

```bash
npm install -g wscat

# Conectar (substitua YOUR_JWT_TOKEN)
wscat -c "wss://abc123xyz.execute-api.us-east-1.amazonaws.com/production?token=YOUR_JWT_TOKEN"

# Enviar mensagem
> {"action": "sendMessage", "data": {"recipientId": 123, "contentType": "text", "textContent": "Hello!"}}

# Enviar ping
> {"action": "ping"}
< {"type": "pong"}
```

### Passo 3.5: Verificar DynamoDB

```bash
# Ver tabela de conexões
aws dynamodb scan --table-name growzone-chat-websocket-connections-production

# Você verá conexões ativas (se houver)
```

---

## 📱 Fase 4: Frontend Integration (Day 6)

### Passo 4.1: Atualizar Configuração do App

Edite `app.json`:
```json
{
  "expo": {
    "extra": {
      "CHAT_ENABLED": true,
      "CHAT_API_URL": "https://dev.social.growzone.co/api/v1/chat",
      "CHAT_WS_URL": "wss://abc123xyz.execute-api.us-east-1.amazonaws.com/production"
    }
  }
}
```

### Passo 4.2: Atualizar .env.production

```bash
EXPO_PUBLIC_CHAT_API_URL=https://dev.social.growzone.co/api/v1/chat
EXPO_PUBLIC_CHAT_WS_URL=wss://abc123xyz.execute-api.us-east-1.amazonaws.com/production
```

### Passo 4.3: Modificar chat-api.ts

O arquivo `src/api/chat/chat-api.ts` já está criado, mas está usando mock data.

Substitua as URLs:
```typescript
// src/api/chat/chat-api.ts
import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? {};

export const CHAT_API_URL = extra.CHAT_API_URL || "https://dev.social.growzone.co/api/v1/chat";
export const CHAT_WS_URL = extra.CHAT_WS_URL || "wss://localhost:3000";

// Remover mock data e usar socialApi real:
import { socialApi } from "@/lib/axios";

export async function getConversations(): Promise<Conversation[]> {
  const response = await socialApi.get("/chat/conversations");
  return response.data.data;
}

// ... resto das funções
```

### Passo 4.4: Testar no App

```bash
# Rebuildar o app
npx expo start --clear

# Testar login e navegação para chat
# Deve ver conversas reais do banco de dados (ou lista vazia se não houver)
```

---

## 🧪 Fase 5: Testing (Day 7)

### Passo 5.1: Teste Manual End-to-End

**Cenário 1: Enviar mensagem de texto**
1. User A abre app e vai para chat
2. User A inicia conversa com User B
3. User A envia mensagem "Olá!"
4. Verificar no banco: `SELECT * FROM messages;`
5. User B abre app e vê mensagem

**Cenário 2: Upload de imagem**
1. User A clica em ícone de imagem
2. Seleciona foto da galeria
3. Upload acontece → URL retornado
4. Mensagem enviada com `media_url`
5. User B recebe e vê imagem

**Cenário 3: Real-time via WebSocket**
1. User A e User B ambos com app aberto
2. User A digita mensagem
3. User B vê "digitando..." (typing indicator)
4. User A envia mensagem
5. User B recebe instantaneamente (sem refresh)

### Passo 5.2: Testes Automatizados (Opcional)

```bash
# Instalar pytest
pip install pytest pytest-asyncio httpx

# Rodar testes
cd backend/api
pytest tests/test_chat_endpoints.py -v
```

---

## 📊 Fase 6: Monitoring (Day 8)

### Passo 6.1: CloudWatch Logs

```bash
# Ver logs do WebSocket
serverless logs -f connect --tail
serverless logs -f sendMessage --tail

# Ver logs do RDS
aws rds describe-db-log-files --db-instance-identifier growzone-prod
```

### Passo 6.2: Métricas no CloudWatch

- **Lambda Invocations:** Quantas conexões/mensagens
- **Lambda Errors:** Erros nas funções
- **DynamoDB Read/Write Units:** Uso da tabela de conexões
- **RDS CPU/Connections:** Performance do banco

### Passo 6.3: Alarmes

```bash
# Criar alarme para erros
aws cloudwatch put-metric-alarm \
  --alarm-name chat-websocket-errors \
  --alarm-description "Alert on Lambda errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --alarm-actions arn:aws:sns:us-east-1:YOUR_ACCOUNT:alerts
```

---

## 🔒 Segurança

### Checklist de Segurança

- [ ] JWT_SECRET é forte (mínimo 32 caracteres aleatórios)
- [ ] RDS não é público (acessível apenas via Security Group)
- [ ] Lambda functions com mínimo de permissões (IAM policies)
- [ ] S3 bucket com CORS configurado corretamente
- [ ] Rate limiting nas APIs (via API Gateway ou WAF)
- [ ] Logs de auditoria habilitados (CloudTrail)

---

## 💰 Estimativa de Custos (Production)

**Para 1000 usuários ativos/dia:**

| Serviço | Uso | Custo/mês |
|---------|-----|-----------|
| RDS PostgreSQL (db.t4g.micro) | 24/7 | $30 |
| Lambda (WebSocket) | 100K invocations | $5 |
| API Gateway (WebSocket) | 1M messages | $3.50 |
| DynamoDB | On-demand | $2 |
| S3 (Media Storage) | 10GB | $0.25 |
| Data Transfer | 50GB | $4.50 |
| **Total** | | **~$45/mês** |

---

## 🚨 Troubleshooting

### Problema: Migration falha

**Erro:** `relation "users" does not exist`

**Solução:** Verificar que a tabela `users` existe no banco. Se não, criar primeiro:
```sql
-- Exemplo (ajuste conforme seu schema)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    -- ... outros campos
);
```

### Problema: Lambda não consegue conectar ao RDS

**Erro:** `timeout connecting to database`

**Solução:**
1. Lambda precisa estar na mesma VPC que o RDS
2. Security Group do RDS precisa permitir conexões da Lambda
3. Adicionar configuração de VPC no `serverless.yml`:

```yaml
provider:
  vpc:
    securityGroupIds:
      - sg-xxxxxxxxx
    subnetIds:
      - subnet-xxxxxxxxx
      - subnet-yyyyyyyyy
```

### Problema: CORS error no upload S3

**Erro:** `Access to fetch at '...' has been blocked by CORS policy`

**Solução:** Aplicar configuração CORS no bucket:
```bash
aws s3api put-bucket-cors --bucket growzone-chat-media --cors-configuration file://s3-cors.json
```

### Problema: WebSocket disconnect imediato

**Erro:** `Connection closed immediately after connect`

**Solução:** Verificar JWT token:
```javascript
// Token deve ser válido e não expirado
// Verificar no connect.py se JWT_SECRET está correto
```

---

## ✅ Checklist Final

### Backend
- [ ] Migrations executadas com sucesso
- [ ] Tabelas `conversations` e `messages` existem
- [ ] FastAPI rodando em `dev.social.growzone.co`
- [ ] Endpoints REST testados (GET /conversations, POST /messages)
- [ ] Lambda WebSocket deployada
- [ ] DynamoDB tabela de conexões criada
- [ ] S3 bucket configurado

### Frontend
- [ ] URLs atualizadas em `app.json`
- [ ] `chat-api.ts` usando backend real (não mock)
- [ ] WebSocket conectando com sucesso
- [ ] Mensagens sendo enviadas e recebidas
- [ ] Upload de imagem funcionando

### Testes
- [ ] Enviar mensagem de texto funciona
- [ ] Upload de imagem/áudio funciona
- [ ] Real-time messaging funciona (WebSocket)
- [ ] Typing indicator funciona
- [ ] Mark as read funciona
- [ ] Push notifications funcionam (se configurado)

---

## 🎓 Próximos Passos (Melhorias Futuras)

1. **Message Reactions** - Permitir reações nas mensagens
2. **Message Search** - Buscar mensagens antigas
3. **Voice/Video Calls** - Integrar Agora.io ou AWS Chime
4. **Group Chat** - Conversas em grupo
5. **Message Encryption** - End-to-end encryption com Signal Protocol
6. **Read Receipts** - Ver quem leu suas mensagens
7. **Message Editing** - Editar mensagens enviadas
8. **Auto-delete Messages** - Mensagens temporárias

---

## 📞 Suporte

Se encontrar problemas durante o deployment:

1. Verificar logs do CloudWatch
2. Testar endpoints individualmente com `curl`
3. Verificar variáveis de ambiente
4. Consultar documentação AWS

---

**Última atualização:** 20 de Outubro, 2025
**Autor:** Claude Code Assistant
**Versão:** 1.0
