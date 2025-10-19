# 🚀 Development Builds - Instruções Completas

Para testar **TODAS** as features (incluindo a câmera do Stories) você precisa criar development builds.

---

## 🎯 O Que São Development Builds?

Development builds são versões do app que:
- ✅ Incluem **todas** as libraries nativas (VisionCamera, etc.)
- ✅ Podem ser instaladas diretamente no seu celular
- ✅ Funcionam como o app final
- ✅ Permitem testar TUDO antes de enviar para TestFlight

**Diferença do Expo Go:**
- ❌ Expo Go: Não suporta libraries nativas customizadas
- ✅ Dev Build: Suporta TUDO

---

## 📋 Passo a Passo

### **1. Login no EAS**

Abra um terminal e execute:

```bash
cd /Users/ioannisvossos/Downloads/growzone-mobile
eas login
```

**Credenciais:**
- Email/Username: `growzone.inc` (ou crie nova conta em expo.dev)
- Password: [sua senha]

---

### **2. Criar Development Build - iOS**

```bash
eas build --platform ios --profile development
```

**O que vai acontecer:**
1. ✅ EAS pergunta se pode gerenciar credenciais → Digite **Y** (Yes)
2. ✅ Build acontece na nuvem (20-30 minutos)
3. ✅ Você recebe um link para download do `.tar.gz`
4. ✅ Instale no iPhone via EAS CLI ou TestFlight

**Tempo estimado:** 25-35 minutos

---

### **3. Criar Development Build - Android**

```bash
eas build --platform android --profile development
```

**O que vai acontecer:**
1. ✅ EAS cria um arquivo `.apk`
2. ✅ Build na nuvem (20-30 minutos)
3. ✅ Você recebe link para download
4. ✅ Instale direto no Android

**Tempo estimado:** 25-35 minutos

---

### **4. Instalar no iOS**

**Opção A - Via EAS Install (Mais Fácil):**

```bash
# Aguarde o build terminar, depois:
eas build:run --platform ios --latest
```

Siga as instruções na tela para conectar seu iPhone.

**Opção B - Download Manual:**

1. Acesse o link do build que o EAS enviou
2. Baixe o arquivo `.tar.gz`
3. Use **Transporter** ou **Apple Configurator** para instalar

**Opção C - Via TestFlight Interno:**

O development build pode ser distribuído via TestFlight também.

---

### **5. Instalar no Android**

**Mais fácil que iOS!**

1. Acesse o link do build que o EAS enviou
2. Baixe o arquivo `.apk` no seu Android
3. Abra o arquivo `.apk`
4. Android vai pedir para permitir "Instalar de fontes desconhecidas"
5. Aceite e instale!

**Ou via ADB (se tiver cabo USB):**

```bash
# Baixe o .apk primeiro, depois:
adb install caminho/para/arquivo.apk
```

---

## 🎮 Como Testar Depois de Instalar

### **No iOS:**

1. Abra o app **Expo Go** (ou o app custom se instalou via Transporter)
2. O app vai carregar automaticamente
3. Teste todas as features!

### **No Android:**

1. Abra o app instalado
2. Teste todas as features!

---

## 🧪 O Que Testar

### **✅ Stories (Weestory) - Completo**

1. **Abrir câmera:**
   - Toque no botão "+" de Stories
   - Câmera deve abrir (VisionCamera)

2. **Capturar foto:**
   - Toque no botão de captura
   - Foto deve ser tirada instantaneamente

3. **Gravar vídeo:**
   - Pressione e segure o botão
   - Deve gravar até 15 segundos
   - Timer deve aparecer

4. **Trocar câmera:**
   - Botão de flip camera
   - Deve alternar entre frontal/traseira

5. **Visualizar Stories:**
   - Abra story de alguém
   - Progress bar deve avançar suavemente
   - Toque para pausar/resumir
   - Swipe para próximo/anterior

6. **Interações:**
   - Toque no ícone de olho (ver visualizações)
   - Toque no emoji para reações rápidas
   - Digite uma resposta no input
   - Envie uma mensagem

### **✅ Chat**

1. **Lista de conversas:**
   - Status online/offline (indicador verde)
   - Badges de mensagens não lidas
   - Preview da última mensagem

2. **Conversa aberta:**
   - Enviar mensagem de texto
   - Ver "digitando..." quando alguém digita
   - Read receipts (✓✓)
   - Scroll suave

3. **Mensagens:**
   - Texto
   - Áudio (se implementado)
   - Imagens
   - Replies

### **✅ Navegação e UI**

1. **Menu lateral (drawer)**
2. **Tabs de navegação**
3. **Transições entre telas**
4. **Animações**
5. **Tema dark**
6. **Safe areas (notch, etc.)**

### **✅ Performance**

1. **Scroll suave** nas listas
2. **Sem travamentos** ao abrir câmera
3. **Transições fluidas** entre stories
4. **Carregamento rápido** de imagens

---

## 🐛 Problemas Comuns

### **iOS: "Untrusted Developer"**

Se ao abrir o app aparecer erro de desenvolvedor não confiável:

1. Vá em **Ajustes** > **Geral** > **VPN e Gerenciamento de Dispositivo**
2. Toque no perfil do desenvolvedor
3. Toque em **Confiar em [Nome]**
4. Confirme

### **Android: "App não instalado"**

1. Vá em **Configurações** > **Segurança**
2. Ative **Fontes desconhecidas** ou **Instalar apps desconhecidos**
3. Permita para o navegador/app que você usou para baixar
4. Tente instalar novamente

### **Build falhou**

```bash
# Limpar cache e tentar novamente:
eas build --clear-cache --platform ios --profile development
```

### **Erro de credenciais**

```bash
# Ver/gerenciar credenciais:
eas credentials

# Remover e deixar EAS recriar:
# Selecione a opção para remover e EAS vai criar novas
```

---

## ⏱️ Timeline Estimado

| Etapa | Tempo |
|-------|-------|
| Login EAS | 2 min |
| Build iOS (nuvem) | 25-35 min |
| Build Android (nuvem) | 25-35 min |
| Download + Instalação | 5-10 min |
| **Total (ambos)** | **60-80 min** |

**Dica:** Você pode rodar os dois builds em paralelo (iOS e Android ao mesmo tempo)!

---

## 🚀 Comandos Rápidos

### **Fazer ambos os builds de uma vez:**

```bash
# Em um terminal:
eas build --platform ios --profile development

# Em outro terminal (ao mesmo tempo):
eas build --platform android --profile development
```

### **Verificar status dos builds:**

```bash
eas build:list
```

### **Ver detalhes de um build específico:**

```bash
eas build:view [BUILD_ID]
```

### **Instalar automaticamente após build:**

```bash
# iOS
eas build:run --platform ios --latest

# Android (via adb)
eas build:run --platform android --latest
```

---

## 📱 Depois de Testar

### **Se tudo funcionar:**

1. ✅ Documentar bugs encontrados (se houver)
2. ✅ Fazer ajustes necessários
3. ✅ Criar **production builds** para TestFlight/Play Store
4. ✅ Enviar para seu amigo fazer deploy

### **Se encontrar bugs:**

1. 📝 Anotar exatamente o que não funcionou
2. 📸 Tirar screenshots se possível
3. 🐛 Corrigir os problemas
4. 🔄 Fazer novo development build para testar a correção

---

## 💡 Dicas Pro

### **Hot Reload em Development Builds:**

Depois de instalar o dev build, você pode:

```bash
# Rodar o servidor de desenvolvimento:
npx expo start --dev-client

# Escanear o QR code no app instalado
# Mudanças no código vão recarregar automaticamente!
```

Isso é MUITO útil para desenvolvimento iterativo.

### **Builds Incrementais:**

Depois do primeiro build, os próximos são mais rápidos (EAS usa cache).

### **Testar antes de Production:**

**Sempre** teste com development build antes de fazer production build. Isso economiza tempo e evita surpresas.

---

## 🎯 Próximos Passos

Após testar com development builds:

1. **Corrigir bugs** encontrados
2. **Atualizar versão** em app.json
3. **Criar production builds**:
   ```bash
   eas build --platform ios --profile production
   eas build --platform android --profile production
   ```
4. **Submit para TestFlight/Play Store**:
   ```bash
   eas submit --platform ios --latest
   eas submit --platform android --latest
   ```

---

## 📞 Suporte

**Docs EAS:**
- https://docs.expo.dev/develop/development-builds/introduction/
- https://docs.expo.dev/build/introduction/

**Expo Discord:**
- https://chat.expo.dev

---

**Boa sorte com os testes! 🚀**

*Arquivo criado: 19 de Outubro, 2025*
