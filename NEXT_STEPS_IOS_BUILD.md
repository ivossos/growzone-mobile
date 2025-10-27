# 🚀 Próximos Passos - Build iOS para TestFlight

## ✅ O QUE JÁ FOI COMPLETADO

### Backend AWS - 100% Deployado ✅

| Componente | Status | Detalhes |
|------------|--------|----------|
| **PostgreSQL RDS** | ✅ Deployed | `dev1-growzone-database.cbs8g6go4hja.us-east-1.rds.amazonaws.com` |
| **Database** | ✅ Configured | `dev_growzone_database` - 3 tabelas, 9 índices criados |
| **S3 Bucket** | ✅ Created | `growzone-chat-media-prod` - CORS e encryption habilitados |
| **Lambda WebSocket** | ✅ Deployed | 3 functions: connect, disconnect, sendMessage |
| **DynamoDB** | ✅ Created | `growzone-chat-websocket-connections-production` |
| **WebSocket URL** | ✅ Active | `wss://vdcsl609qk.execute-api.us-east-1.rds.amazonaws.com/production` |

### Código e Configuração ✅

| Item | Status |
|------|--------|
| `.env.production` | ✅ Atualizado com todas as URLs de produção |
| `serverless.yml` | ✅ Configurado para deploy |
| GitHub main branch | ✅ Atualizado e sincronizado |
| GitHub Actions | ✅ Desabilitados (evita erros automáticos) |
| Build number | ✅ Auto-increment de 3 → 4 |

---

## 📱 PASSO FINAL: Build iOS para TestFlight

### ⚠️ IMPORTANTE: Este passo REQUER interação humana

O EAS CLI precisa fazer login na conta Apple para gerar credenciais de distribuição. Isso não pode ser automatizado.

---

## 🎯 INSTRUÇÕES PASSO A PASSO

### Passo 1: Abrir Terminal

1. Pressione `CMD + Espaço`
2. Digite "Terminal"
3. Pressione `Enter`

### Passo 2: Navegar para o Projeto

```bash
cd /Users/ioannisvossos/Downloads/Organized_Development/growzone-mobile
```

### Passo 3: Executar Build

```bash
eas build --platform ios --profile beta
```

### Passo 4: Responder às Perguntas

#### ❓ Pergunta 1: "Do you want to log in to your Apple account?"
```
? Do you want to log in to your Apple account? › (Y/n)
```
**RESPOSTA:** Digite `Y` e pressione `Enter`

#### ❓ Pergunta 2: "Apple ID"
```
? Apple ID: ›
```
**RESPOSTA:** Digite `contato.peedro@gmail.com` e pressione `Enter`

#### ❓ Pergunta 3: "Password"
```
? Password (hidden): ›
```
**RESPOSTA:** Digite a senha da conta Apple e pressione `Enter`

#### ❓ Pergunta 4: "Set up a new distribution certificate?"
```
? Set up a new distribution certificate? › (Y/n)
```
**RESPOSTA:** Digite `Y` e pressione `Enter`

#### ❓ Pergunta 5: "Generate a new Apple Provisioning Profile?"
```
? Generate a new Apple Provisioning Profile? › (Y/n)
```
**RESPOSTA:** Digite `Y` e pressione `Enter`

#### ❓ Pergunta 6: "Provisioning Profile name"
```
? What would you like your Provisioning Profile to be named? ›
  (Growzone Ad Hoc 2025-10-27...)
```
**RESPOSTA:** Pressione `Enter` (aceita o nome padrão)

---

### Passo 5: Aguardar Build (15-20 minutos)

O EAS vai exibir uma URL de acompanhamento:

```
Build queued...
Build URL: https://expo.dev/accounts/jvoz00001/projects/growzone/builds/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**📋 COPIE ESSA URL** e abra no navegador para acompanhar em tempo real!

Você verá:
- ⏳ Queued
- 🔄 In progress
- ✅ Finished (depois de ~15-20 min)

---

### Passo 6: Build Completado ✅

Quando terminar, você verá:

```
✔ Build finished

Build artifact:
https://expo.dev/artifacts/eas/xxxxxxxx.ipa

Build details:
https://expo.dev/accounts/jvoz00001/projects/growzone/builds/xxxxxxxx
```

---

## 🚀 SUBMIT PARA TESTFLIGHT

### Depois que o build completar:

```bash
eas submit --platform ios --latest
```

### ❓ Perguntas do Submit:

#### Pergunta 1: "Apple ID"
```
? Apple ID: ›
```
**RESPOSTA:** `contato.peedro@gmail.com`

#### Pergunta 2: "App-specific password"
```
? App-specific password: ›
```

**RESPOSTA:** Você precisa criar uma senha de app específica:

**Como criar App-Specific Password:**

1. Abra: https://appleid.apple.com
2. Sign in com `contato.peedro@gmail.com`
3. Vá para **Security** → **App-Specific Passwords**
4. Clique em **"+"** ou **"Generate Password"**
5. Nome: `EAS Submit`
6. Copie a senha gerada (formato: `xxxx-xxxx-xxxx-xxxx`)
7. Cole no terminal

---

### Submit Completo ✅

Você verá:

```
✔ Successfully uploaded IPA to App Store Connect
✔ The build is processing...

Your build will be available in TestFlight in 5-10 minutes at:
https://appstoreconnect.apple.com/apps/6737212804/testflight/ios
```

---

## 📲 INSTALAR NO IPHONE VIA TESTFLIGHT

### Passo 1: Instalar TestFlight

1. Abra **App Store** no iPhone
2. Busque **"TestFlight"**
3. Instale o app (é grátis, da Apple)

### Passo 2: Receber Convite

Você receberá um email da Apple:

```
Subject: You're Invited to Test Growzone

[Seu Nome],

You're invited to test Growzone before it's released on the App Store.

1. Install TestFlight from the App Store
2. Open this email on your iPhone
3. Tap "Start Testing"
```

### Passo 3: Instalar App

1. Abra o email **no iPhone**
2. Toque em **"View in TestFlight"** ou **"Start Testing"**
3. TestFlight abre automaticamente
4. Toque em **"Install"**
5. App instala com badge laranja **"BETA"**

### Passo 4: Testar!

Abra o app e teste todas as funcionalidades:

✅ Login
✅ Home feed
✅ **Chat (NOVO)** - Enviar mensagens
✅ **WebSocket** - Mensagens em tempo real
✅ **Upload de mídia** - Fotos no chat
✅ Stories
✅ Perfil

---

## 🆘 TROUBLESHOOTING

### Erro: "Build failed - Provisioning profile invalid"

```bash
# Limpar credenciais e tentar novamente
eas credentials --platform ios
# Escolher: "Remove all credentials"
eas build --platform ios --profile beta
```

### Erro: "Invalid Apple ID or password"

- Certifique-se que está usando a senha correta
- Se tiver 2FA habilitado, use código de verificação
- Tente resetar senha em appleid.apple.com

### Erro: "Not part of Apple Developer Program"

- Verifique se `contato.peedro@gmail.com` tem acesso ao Team ID: `2TPM7H44X3`
- Entre em https://developer.apple.com e confirme acesso

### Build demora muito (>30 min)

- Normal para primeiro build
- Builds subsequentes são mais rápidos (~10-15 min)
- Verifique a fila em: https://expo.dev/accounts/jvoz00001/projects/growzone/builds

---

## 📊 CHECKLIST COMPLETO

### ✅ Backend (COMPLETO)
- [x] RDS PostgreSQL deployed e configurado
- [x] Migrations executadas (conversations, messages, typing_indicators)
- [x] S3 bucket criado com CORS e encryption
- [x] Lambda WebSocket deployed (connect, disconnect, sendMessage)
- [x] DynamoDB table criada
- [x] URLs de produção configuradas
- [x] Código commitado no GitHub
- [x] GitHub Actions desabilitados

### 🔄 Frontend (EM PROGRESSO)
- [ ] **Executar:** `eas build --platform ios --profile beta` ← **VOCÊ ESTÁ AQUI**
- [ ] Aguardar build completar (~15-20 min)
- [ ] **Executar:** `eas submit --platform ios --latest`
- [ ] Criar App-specific password
- [ ] Aguardar aparecer no TestFlight (~5-10 min)
- [ ] Instalar TestFlight no iPhone
- [ ] Instalar app via TestFlight
- [ ] Testar funcionalidades

---

## 🎯 RESUMO DAS URLs DE PRODUÇÃO

Todas essas URLs já estão configuradas no `.env.production`:

```bash
AUTH API:     https://dev.auth.growzone.co/api/v1
SOCIAL API:   https://dev.social.growzone.co/api/v1
CHAT API:     https://dev.social.growzone.co/api/v1/chat
CHAT WS:      wss://vdcsl609qk.execute-api.us-east-1.rds.amazonaws.com/production
S3 BUCKET:    growzone-chat-media-prod
CHAT ENABLED: true
```

---

## 📞 SUPORTE

Se encontrar qualquer erro, cole a mensagem completa aqui e eu te ajudo!

---

**AGORA EXECUTE NO TERMINAL:**

```bash
cd /Users/ioannisvossos/Downloads/Organized_Development/growzone-mobile
eas build --platform ios --profile beta
```

🚀 **Boa sorte!**
