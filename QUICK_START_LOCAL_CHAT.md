# 🚀 Quick Start - Test Chat Locally

Guia rápido para testar o chat localmente sem AWS.

---

## ✅ Pré-requisitos

- ✅ Backend server rodando em `http://localhost:8000`
- ✅ Node.js instalado
- ✅ Dependências do projeto instaladas (`npm install`)

---

## 🎯 Opção 1: Modo Automático (Recomendado)

```bash
./test-chat-local.sh
```

Escolha a plataforma e pronto! 🎉

---

## 🎯 Opção 2: Modo Manual

### Passo 1: Verificar Backend

```bash
curl http://localhost:8000/health
```

**Output esperado:**
```json
{
  "status": "healthy",
  "database": "in-memory",
  "conversations": 1,
  "messages": 1
}
```

### Passo 2: Iniciar App

**Web (mais rápido):**
```bash
npm run web
```

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

### Passo 3: Testar Chat

1. **Login** - Use credenciais reais do `https://dev.auth.growzone.co`
2. **Navegar para Chat** - Ir para a aba de mensagens
3. **Enviar mensagem** - Testar envio de mensagem

---

## 🔍 Como Funciona

```
┌─────────────────┐          ┌─────────────────┐
│  Mobile App     │          │  Backend Server │
│  localhost:8081 │  ────►   │  localhost:8000 │
│                 │  HTTP    │                 │
│  React Native   │  ◄────   │  FastAPI        │
└─────────────────┘          └─────────────────┘
                                     │
                                     ▼
                              ┌─────────────┐
                              │  In-Memory  │
                              │  Database   │
                              └─────────────┘
```

**Authentication:**
- Auth API: `https://dev.auth.growzone.co` (produção - real)
- Chat API: `http://localhost:8000` (local - teste)

**Dados:**
- Mensagens armazenadas em memória (perdidas ao reiniciar servidor)
- Usuários vêm do backend de produção
- Mock user ID: sempre 1 (testuser1)

---

## 🧪 Testar Endpoints Diretamente

### Enviar Mensagem

```bash
curl -X POST http://localhost:8000/api/v1/chat/messages \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_id": 2,
    "text_content": "Olá do terminal!"
  }'
```

### Ver Conversas

```bash
curl http://localhost:8000/api/v1/chat/conversations | jq
```

### Ver Mensagens

```bash
# Pegue o conversation_id do comando acima
curl http://localhost:8000/api/v1/chat/conversations/{ID}/messages | jq
```

---

## 🔧 Troubleshooting

### Backend não responde

```bash
# Verificar se está rodando
lsof -i :8000

# Se não estiver, iniciar:
cd backend/local-test
source venv/bin/activate
python3 simple_server.py
```

### App não conecta ao backend

1. **Verificar configuração:**
   ```bash
   grep CHAT_API app.json
   # Deve mostrar: "CHAT_API_URL": "http://localhost:8000/api/v1/chat"
   ```

2. **Limpar cache do Expo:**
   ```bash
   npx expo start --clear
   ```

3. **Verificar console do app** - Abrir DevTools (F12 no web)

### CORS Error

O servidor local já tem CORS habilitado para `*`. Se mesmo assim der erro:

```bash
# Verificar no console do servidor (terminal onde rodou python3 simple_server.py)
# Deve mostrar as requisições
```

---

## 📊 Status Atual

### ✅ Funcionando

- ✅ Backend server local
- ✅ Enviar mensagens via API
- ✅ Criar conversas
- ✅ Listar mensagens
- ✅ In-memory database
- ✅ Mock authentication (sempre user 1)

### ⏳ Limitações Locais

- ❌ WebSocket real-time (precisa Lambda)
- ❌ Upload de mídia (precisa S3)
- ❌ Múltiplos usuários simultâneos
- ❌ Persistência de dados (tudo em memória)

### 🎯 Próximos Passos

1. **Testar localmente** - Use este setup
2. **Obter acesso AWS** - Para deploy real
3. **Deploy produção** - Seguir `DEPLOYMENT_AWS_COMPLETE.md`

---

## 🆘 Ajuda Rápida

**Backend:**
- URL: http://localhost:8000
- Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

**Frontend:**
- Web: http://localhost:8081
- iOS: Expo Go ou Simulator
- Android: Expo Go ou Emulator

**Resetar dados:**
```bash
curl -X DELETE http://localhost:8000/api/v1/reset
```

---

**Criado:** 2025-10-21
**Propósito:** Teste local de chat sem AWS
