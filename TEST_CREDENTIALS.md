# 🧪 Credenciais de Teste - Growzone Mobile

Credenciais mock para desenvolvimento e testes do app.

**✅ MOCK AUTHENTICATION ATIVADO!**

Agora você pode fazer login diretamente no app usando essas credenciais sem precisar de backend!

---

## 👤 **Usuário Padrão de Teste**

### **Usuário Mock (Você)**

**Credenciais de Login:**
```
Email: test@growzone.co
Password: Test123!
Username: testuser
```

**Dados do Usuário:**
```json
{
  "id": "currentUser",
  "username": "testuser",
  "name": "Você",
  "email": "test@growzone.co",
  "password": "Test123!",
  "avatar": "https://i.pravatar.cc/150?img=10",
  "bio": "Usuário de teste do Growzone",
  "verified": true
}
```

**Como usar no código:**
```typescript
import { MOCK_CURRENT_USER, getCurrentUser } from "@/api/chat/mock-data";

// Opção 1: Direto
const currentUser = MOCK_CURRENT_USER;

// Opção 2: Via função
const currentUser = getCurrentUser();

// Usar em componentes
<Text>{currentUser.name}</Text>
<Image source={{ uri: currentUser.avatar }} />
```

---

## 💬 **Usuários de Chat Mock**

### **Conversa 1: João Silva**
```json
{
  "userId": "user123",
  "userName": "João Silva",
  "userAvatar": "https://i.pravatar.cc/150?img=1",
  "online": true,
  "unreadCount": 2
}
```

### **Conversa 2: Maria Santos**
```json
{
  "userId": "user456",
  "userName": "Maria Santos",
  "userAvatar": "https://i.pravatar.cc/150?img=5",
  "online": false,
  "pinned": true
}
```

### **Conversa 3: Pedro Oliveira**
```json
{
  "userId": "user789",
  "userName": "Pedro Oliveira",
  "userAvatar": "https://i.pravatar.cc/150?img=3",
  "online": true
}
```

---

## 🔐 **Credenciais de API (Mock)**

### **Backend Development**
```
API Base URL: http://localhost:3000/api/v1
WebSocket URL: ws://localhost:3000

# Ou usar servidor de staging
API Base URL: https://api.growzone.co
WebSocket URL: wss://api.growzone.co
```

### **Headers Necessários**
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer mock-token-for-testing",
  "X-User-ID": "currentUser"
}
```

---

## 🧪 **Contas de Teste para Login**

**⚡ FUNCIONAM AGORA NO APP! Sem precisar de backend!**

### **Usuário 1: Admin/Developer** ✅
```
Email ou Username: dev@growzone.co  OU  devuser
Password: Test123!
```

### **Usuário 2: Regular User** ✅
```
Email ou Username: user@growzone.co  OU  regularuser
Password: Test123!
```

### **Usuário 3: Premium User** ✅
```
Email ou Username: premium@growzone.co  OU  premiumuser
Password: Test123!
```

### **Como Funciona:**
1. Vá para http://localhost:8081
2. Digite qualquer uma das credenciais acima
3. O sistema detecta automaticamente e faz login mock
4. Se usar outras credenciais, tenta autenticar com backend real

---

## 🔑 **Tokens de Teste**

### **JWT Mock Token**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjdXJyZW50VXNlciIsIm5hbWUiOiJWb2PDqiIsImlhdCI6MTUxNjIzOTAyMn0.mock-signature
```

### **Refresh Token**
```
refresh-token-mock-123456789
```

### **Push Notification Token (Expo)**
```
ExponentPushToken[mock-token-xxxxxxxxxxxxxx]
```

---

## 🌐 **URLs de Teste**

### **Web (Development)**
```
http://localhost:8081
http://localhost:8081/test-chat
http://localhost:8081/test-weestory
```

### **ngrok (Public - quando ativo)**
```
https://3b052a6cc8e1.ngrok-free.app
https://3b052a6cc8e1.ngrok-free.app/test-chat
https://3b052a6cc8e1.ngrok-free.app/test-weestory
```

---

## 📱 **App Scheme**
```
growzone://
growzone://chat/1
growzone://chat/2
growzone://profile/user123
growzone://weestory
```

---

## 🔧 **Environment Variables (Mock)**

### **.env.development**
```bash
EXPO_PUBLIC_API=http://localhost:3000
EXPO_PUBLIC_RT=ws://localhost:3000
AUTH_API_URL=http://localhost:3000/auth
EXPO_PUBLIC_ENV=development
```

### **.env.test**
```bash
EXPO_PUBLIC_API=https://api.growzone.co
EXPO_PUBLIC_RT=wss://api.growzone.co
AUTH_API_URL=https://auth.growzone.co
EXPO_PUBLIC_ENV=test
```

---

## 🧪 **Dados de Teste para Chat**

### **Mensagem de Texto**
```json
{
  "text": "Olá! Como vai?",
  "conversationId": "1",
  "recipientId": "user123"
}
```

### **Mensagem com Imagem**
```json
{
  "image": "https://picsum.photos/400/300",
  "conversationId": "1",
  "recipientId": "user123"
}
```

### **Mensagem de Áudio**
```json
{
  "audio": {
    "uri": "https://example.com/audio.m4a",
    "duration": 15
  },
  "conversationId": "1",
  "recipientId": "user123"
}
```

---

## 📸 **URLs de Imagens Mock**

### **Avatares (pravatar.cc)**
```
https://i.pravatar.cc/150?img=1  // Homem 1
https://i.pravatar.cc/150?img=5  // Mulher 1
https://i.pravatar.cc/150?img=3  // Homem 2
https://i.pravatar.cc/150?img=10 // Seu avatar
```

### **Imagens Aleatórias (Picsum)**
```
https://picsum.photos/400/300    // Imagem aleatória
https://picsum.photos/800/600    // Imagem maior
https://picsum.photos/200/200    // Quadrada
```

### **Placeholders**
```
https://via.placeholder.com/150  // Placeholder simples
https://via.placeholder.com/150/2CC420/FFFFFF?text=GZ // Com cor
```

---

## 🎮 **Comandos de Teste Rápido**

### **Simular Nova Mensagem (Console)**
```javascript
// No console do navegador ou app
const mockMessage = {
  _id: Date.now(),
  text: "Mensagem de teste!",
  createdAt: new Date(),
  user: {
    _id: "user123",
    name: "João Silva",
    avatar: "https://i.pravatar.cc/150?img=1"
  }
};

// Adicionar à lista
setMessages(prev => [mockMessage, ...prev]);
```

### **Simular Notificação**
```javascript
import { sendTestNotification } from "@/services/notifications";

// Enviar notificação de teste
await sendTestNotification();
```

### **Simular Typing Indicator**
```javascript
setIsTyping(true);
setTimeout(() => setIsTyping(false), 3000);
```

---

## 🔍 **Debug URLs**

### **Expo Dev Tools**
```
http://localhost:19002  // Expo DevTools (legacy)
http://localhost:8081   // Metro Bundler
```

### **React Native Debugger**
```
debugger-ui://devtools/bundler?ws=localhost:8081
```

---

## 💾 **Storage Keys (AsyncStorage/localStorage)**

### **Auth**
```
@growzone:auth_token
@growzone:refresh_token
@growzone:user_data
@growzone:last_login
```

### **Chat**
```
@growzone:conversations
@growzone:draft_messages
@growzone:muted_conversations
@growzone:pinned_conversations
```

### **Notifications**
```
@growzone:push_token
@growzone:notification_settings
@growzone:badge_count
```

---

## 🧪 **Como Usar em Testes**

### **1. Login Automático**
```typescript
import { MOCK_CURRENT_USER } from "@/api/chat/mock-data";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Simular login
await AsyncStorage.setItem(
  "@growzone:user_data",
  JSON.stringify(MOCK_CURRENT_USER)
);
```

### **2. Popular Chat com Mensagens**
```typescript
import { mockMessages } from "@/api/chat/mock-data";

// Usar mensagens mock
setMessages(mockMessages["1"]); // Conversa 1
```

### **3. Testar Upload**
```typescript
// Mock upload response
const mockUploadResponse = {
  url: "https://picsum.photos/400/300",
  size: 1024000,
  type: "image/jpeg"
};
```

---

## 📊 **Analytics Events (Mock)**

### **Eventos de Teste**
```javascript
// Chat
trackEvent("chat_message_sent", { type: "text" });
trackEvent("chat_message_sent", { type: "image" });
trackEvent("chat_message_sent", { type: "audio" });

// Stories
trackEvent("story_created", { type: "photo" });
trackEvent("story_viewed", { storyId: "123" });

// Notificações
trackEvent("notification_received", { type: "new_message" });
trackEvent("notification_tapped", { conversationId: "1" });
```

---

## 🎯 **Quick Copy-Paste**

### **Importar Usuário Mock**
```typescript
import { MOCK_CURRENT_USER, getCurrentUser } from "@/api/chat/mock-data";
const user = getCurrentUser();
```

### **Importar Conversas Mock**
```typescript
import { mockConversations, mockMessages } from "@/api/chat/mock-data";
```

### **Bearer Token para APIs**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token
```

---

**📝 Nota:** Todas essas credenciais são **apenas para desenvolvimento/teste**.

**Nunca use em produção!**

*Última atualização: 19 de Outubro, 2025*
