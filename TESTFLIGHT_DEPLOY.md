# 📱 Deploy para TestFlight - Guia Completo

Guia passo a passo para fazer build e deploy do Growzone no TestFlight.

---

## 📋 **Pré-requisitos**

### ✅ **Já Configurado no Projeto:**
- [x] EAS configurado (`eas.json`)
- [x] Bundle ID: `com.growzone.growzonesocial`
- [x] Project ID: `4d859901-20e9-4392-abbf-6b712137f7a7`
- [x] Versão atual: `1.0.20`
- [x] Permissões configuradas (câmera, microfone, galeria)

### ⚠️ **Você Precisa Ter:**
1. **Conta Apple Developer** (paga - $99/ano)
2. **EAS CLI instalado** globalmente
3. **Conta Expo** configurada
4. **Certificados iOS** (EAS pode gerar automaticamente)

---

## 🚀 **Opção 1: Build Automático com EAS (Recomendado)**

### **Passo 1: Verificar EAS CLI**

```bash
# Verificar se EAS está instalado
eas --version

# Se não estiver instalado:
npm install -g eas-cli

# Login na conta Expo
eas login
```

### **Passo 2: Configurar Credenciais Apple**

```bash
# EAS vai pedir suas credenciais Apple Developer
eas build:configure
```

### **Passo 3: Build para TestFlight**

```bash
# Build de produção para iOS
eas build --platform ios --profile production

# Ou build de preview (mais rápido para testes internos)
eas build --platform ios --profile preview
```

**O que vai acontecer:**
1. ✅ EAS faz upload do código
2. ✅ Gera build na nuvem (não precisa de Mac!)
3. ✅ Cria IPA assinado
4. ✅ Você recebe link para download

### **Passo 4: Upload para TestFlight**

#### **Opção A - Automático (Recomendado):**
```bash
# EAS faz upload direto para TestFlight
eas submit --platform ios --latest
```

#### **Opção B - Manual:**
1. Baixe o arquivo `.ipa` do link do EAS
2. Abra **Transporter** (app da Apple)
3. Arraste o `.ipa` para o Transporter
4. Clique em "Deliver"

---

## 🎯 **Opção 2: Build Local (Precisa de Mac)**

Se você tem um Mac e quer fazer build local:

```bash
# 1. Pre-build
npx expo prebuild --platform ios

# 2. Abrir no Xcode
open ios/growzone.xcworkspace

# 3. No Xcode:
#    - Selecione "Any iOS Device"
#    - Product > Archive
#    - Window > Organizer
#    - Distribute App > TestFlight
```

---

## 📝 **Configurações Importantes**

### **Atualizar Versão (Opcional)**

Se quiser mudar a versão antes do build:

```json
// app.json
{
  "expo": {
    "version": "1.0.21",  // ← Atualizar aqui
    "ios": {
      "buildNumber": "21"  // ← Auto-incrementado pelo EAS
    }
  }
}
```

### **Atualizar APIs para Produção**

```json
// app.json
{
  "extra": {
    "EXPO_PUBLIC_API": "https://api.growzone.co",  // ← Produção
    "EXPO_PUBLIC_RT": "wss://api.growzone.co",
    "AUTH_API_URL": "https://auth.growzone.co"
  }
}
```

---

## 🔐 **Certificados e Provisioning**

### **Opção 1: Deixar EAS Gerenciar (Fácil)**

```bash
# EAS cria e gerencia tudo automaticamente
eas build --platform ios
# Escolha: "Let EAS handle credentials"
```

### **Opção 2: Usar Certificados Existentes**

Se já tem certificados Apple:

```bash
# Configurar manualmente
eas credentials

# Escolher:
# - iOS Distribution Certificate
# - Provisioning Profile (App Store/Ad Hoc)
```

---

## 🧪 **TestFlight - Após Upload**

### **1. Processar no App Store Connect**

Após o upload:
1. Acesse [App Store Connect](https://appstoreconnect.apple.com)
2. Vá em **My Apps** > **Growzone**
3. Aba **TestFlight**
4. Aguarde processamento (5-15 minutos)
5. Build aparecerá em "iOS builds"

### **2. Adicionar Testadores**

#### **Testes Internos:**
- Até 100 testadores
- Acesso imediato após processamento
- Ideal para equipe interna

```
TestFlight > Internal Testing > Add Testers
```

#### **Testes Externos:**
- Até 10.000 testadores
- Precisa de revisão da Apple (24-48h)
- Ideal para beta público

```
TestFlight > External Testing > Add Testers
```

### **3. Distribuir Link de Teste**

Testadores vão receber:
- Email com link do TestFlight
- Instruções para instalar o app TestFlight
- Link para instalar o Growzone

**Link público de teste:**
```
https://testflight.apple.com/join/[CÓDIGO-ÚNICO]
```

---

## 📱 **Comandos Rápidos**

### **Build Completo (Produção):**
```bash
# 1. Build iOS
eas build --platform ios --profile production

# 2. Aguardar build terminar (15-30 minutos)

# 3. Upload para TestFlight
eas submit --platform ios --latest
```

### **Build Rápido (Preview/Interno):**
```bash
# Build de preview (mais rápido)
eas build --platform ios --profile preview --non-interactive
```

### **Ver Status dos Builds:**
```bash
# Listar builds recentes
eas build:list --platform ios

# Ver detalhes de um build
eas build:view [BUILD_ID]
```

---

## ✨ **Novas Features para Destacar no TestFlight**

### **O Que Testar:**

#### **1. Chat (Fase B Completa)**
- ✅ Lista de conversas
- ✅ Mensagens em tempo real
- ✅ Indicadores de digitação
- ✅ Status online/offline
- ✅ Read receipts

#### **2. Stories (Weestory) - NOVO! ✨**
- ✅ Captura de fotos/vídeos
- ✅ Stories de 24h
- ✅ Progress bars melhorados
- ✅ Views counter
- ✅ Reações rápidas (❤️🔥👏😂😮😍)
- ✅ Sistema de replies
- ✅ Transições suaves

#### **3. Melhorias Gerais**
- ✅ Performance otimizada
- ✅ UI/UX polido
- ✅ Animações suaves
- ✅ Design system atualizado

---

## 📝 **Notas de Versão (Release Notes)**

### **Para TestFlight - Versão 1.0.21**

```
🎉 Novidades:

📸 Stories (Weestory)
• Captura fotos e vídeos direto do app
• Stories expiram em 24h automaticamente
• Contador de visualizações
• Reações rápidas com emojis
• Sistema de replies integrado ao chat
• Progress bars melhorados
• Transições suaves entre stories

💬 Chat Melhorado
• Nova interface seguindo design Figma
• Mensagens em tempo real via WebSocket
• Indicadores de digitação
• Status online/offline
• Read receipts (✓✓)
• Suporte para áudio, imagens, replies

🎨 UI/UX
• Animações mais suaves
• Progress bars com efeitos visuais
• Cores e espaçamentos refinados
• Performance otimizada

🐛 Correções
• VisionCamera funcionando em todas plataformas
• Melhor gestão de memória
• Correções de navegação
• Otimizações gerais

📱 Testado em:
• iPhone 12 Pro e superior
• iOS 15.1+
• iPad (modo compatibilidade)
```

---

## 🔍 **Checklist Antes do Build**

### **Código:**
- [ ] Todas features testadas localmente
- [ ] Sem console.log desnecessários
- [ ] Variáveis de ambiente apontando para produção
- [ ] Versão atualizada em app.json

### **Assets:**
- [ ] Ícone do app (1024x1024)
- [ ] Splash screen
- [ ] App Store screenshots preparados

### **Configurações:**
- [ ] Bundle ID correto
- [ ] Permissões configuradas
- [ ] Certificados válidos
- [ ] Revisão das notas de versão

---

## 🆘 **Troubleshooting**

### **Erro: "Invalid Bundle Identifier"**
```bash
# Verificar em app.json:
"bundleIdentifier": "com.growzone.growzonesocial"

# Deve corresponder ao Apple Developer Portal
```

### **Erro: "Provisioning Profile não encontrado"**
```bash
# Deixar EAS gerenciar:
eas build --clear-cache --platform ios
```

### **Build muito lento?**
```bash
# Usar build local se tiver Mac:
eas build --platform ios --local
```

### **TestFlight não aparece após upload?**
- Aguarde 10-15 minutos
- Verifique em App Store Connect > Activity
- Pode estar em "Processing"

---

## 📊 **Timeline Estimado**

| Etapa | Tempo |
|-------|-------|
| Build EAS (cloud) | 15-30 min |
| Upload para TestFlight | 5 min |
| Processamento Apple | 10-15 min |
| **Total** | **30-50 min** |

---

## 🎯 **Quick Start**

**Para fazer deploy AGORA:**

```bash
# 1. Login
eas login

# 2. Build + Submit em um comando
eas build --platform ios --profile production --auto-submit

# 3. Aguardar email de confirmação

# 4. Adicionar testadores no App Store Connect

# 5. Compartilhar link do TestFlight
```

---

## 📱 **Depois do Deploy**

### **Coletar Feedback:**
- Use TestFlight Feedback (integrado)
- Crie canal no Slack/Discord
- Formulário Google Forms

### **Monitorar Crashes:**
- App Store Connect > TestFlight > Crashes
- Sentry/Bugsnag se configurado

### **Preparar Screenshots:**
Para quando for para App Store:
- iPhone 6.7" (Pro Max)
- iPhone 6.5" (Plus)
- iPad Pro 12.9"

---

## 🔗 **Links Úteis**

- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [EAS Submit Docs](https://docs.expo.dev/submit/introduction/)
- [App Store Connect](https://appstoreconnect.apple.com)
- [TestFlight](https://developer.apple.com/testflight/)
- [Expo Dashboard](https://expo.dev/accounts/growzone.inc/projects/growzone)

---

## 💡 **Dicas Pro**

### **Build Mais Rápido:**
```bash
# Skip TypeScript check
eas build --platform ios --no-wait

# Build local (se tiver Mac)
eas build --platform ios --local
```

### **Testar Antes do Build:**
```bash
# Simular em iOS (se tiver Mac)
npm run ios

# Testar em web
npm run web
```

### **Automatizar Deploys:**
```bash
# GitHub Actions / CI/CD
# Criar workflow para auto-deploy em merge to main
```

---

## 🎉 **Próximos Passos**

Após TestFlight bem-sucedido:

1. **Coletar feedback** dos testadores
2. **Corrigir bugs** encontrados
3. **Preparar screenshots** profissionais
4. **Escrever descrição** da App Store
5. **Submeter para revisão** da Apple
6. **Lançamento público** na App Store! 🚀

---

**🍀 Boa sorte com o deploy!**

*Última atualização: 19 de Outubro, 2025*
