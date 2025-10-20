# 🏗️ Growzone Mobile - Revisão de Arquitetura

**Data:** 20 de Outubro, 2025
**Branch:** feature/chat-stories-ai

---

## 📊 Visão Geral

**Stack Tecnológico:**
- Framework: React Native + Expo SDK 52
- Linguagem: TypeScript
- Navegação: Expo Router (file-based routing)
- Estado: React Context API + React Query
- Estilização: NativeWind (Tailwind CSS)
- Backend: REST API (auth.growzone.co + social.growzone.co)

---

## 📁 Estrutura de Diretórios

```
src/
├── @types/               # TypeScript type definitions
│   ├── navigation.d.ts   # Navigation types
│   └── media types       # PNG, JPEG, SVG types
│
├── api/                  # Backend API integrations
│   ├── @types/          # API types (models, enums, errors)
│   ├── auth/            # Authentication endpoints
│   ├── social/          # Social features (posts, profile, etc)
│   ├── chat/            # Chat API (NEW - not connected)
│   ├── user/            # User management
│   ├── mux/             # Video upload/streaming
│   └── storage/         # File storage
│
├── app/                  # Expo Router screens (file-based)
│   ├── (auth)/          # Auth flow (login, signup, etc)
│   ├── (drawer)/        # Main app with drawer navigation
│   │   └── (tabs)/      # Bottom tab navigation
│   ├── notifications/   # Notifications screen
│   ├── post/            # Post details
│   ├── profile/         # User profiles
│   ├── search/          # Global search
│   └── weestory/        # Stories feature
│
├── components/          # Reusable components
│   ├── ui/             # UI components (buttons, cards, etc)
│   ├── chat/           # Chat UI components
│   ├── weestory/       # Story components
│   ├── player/         # Video player
│   ├── profile/        # Profile components
│   └── form/           # Form inputs
│
├── context/            # React Context providers
│   ├── auth-context.tsx           # Authentication state
│   ├── bottom-sheet-context.tsx   # Bottom sheet manager
│   ├── notification-context.tsx   # Notifications
│   ├── player-context.tsx         # Video player state
│   ├── video-player-context.tsx   # Another video player?
│   ├── scroll-top-context.tsx     # Scroll to top
│   └── create-post-context.tsx    # Post creation
│
├── hooks/              # Custom React hooks
│   ├── use-auth.ts    # Authentication hook
│   ├── useHome.ts     # Home screen logic
│   └── chat/          # Chat-related hooks
│
├── lib/               # Libraries & utilities
│   ├── axios.ts       # API client configuration
│   └── utils.ts       # Utility functions
│
├── storage/           # Local storage
│   ├── storage-auth-token.ts  # Token storage
│   └── storage-user.ts        # User data storage
│
├── styles/            # Styling
│   ├── global.css     # Global CSS
│   └── colors.ts      # Color palette
│
└── assets/            # Static assets
    ├── icons/         # SVG icons
    ├── images/        # Images
    └── fonts/         # Custom fonts
```

---

## 🔐 Autenticação

### Estado Atual: ✅ Funcional (com mock para dev)

**Providers:**
- `auth.growzone.co/api/v1`
- Apple Sign In
- Email/Password

**Fluxo:**
1. Welcome screen → Sign In/Sign Up
2. Login → JWT token storage
3. Token refresh automático (axios interceptor)
4. Mock auth para desenvolvimento (test@growzone.co)

**Arquivos principais:**
- `src/context/auth-context.tsx` - Estado de autenticação + mock users
- `src/lib/axios.ts` - Cliente HTTP + interceptors
- `src/api/auth/` - Endpoints de auth

**Mock Users (DEV apenas):**
```typescript
test@growzone.co / Test123!
dev@growzone.co / Test123!
user@growzone.co / Test123!
premium@growzone.co / Test123!
```

---

## 🏠 Feed / Home

### Estado Atual: ✅ Funcional (com mock data)

**Features:**
- Feed de posts (Social, Grow, Weedz)
- Infinite scroll com paginação
- Like/comentários
- Vídeo player inline
- Pull to refresh
- Mock data para desenvolvimento

**Arquivos principais:**
- `src/app/(drawer)/(tabs)/home.tsx` - Tela principal
- `src/api/social/post/get-posts.ts` - API de posts + mock data
- `src/components/ui/post-card.tsx` - Card de post social
- `src/components/ui/grow-post-card.tsx` - Card de grow post
- `src/components/ui/post-weedz-card.tsx` - Card de weedz post

**API Endpoints:**
- `GET /feed-post/` - Lista posts do feed
- `POST /social-post/like` - Like em post
- `POST /social-post/comment` - Comentário

---

## 💬 Chat

### Estado Atual: ⚠️ Parcialmente Implementado

**O que existe:**
- ✅ UI components (lista de conversas, mensagens, input)
- ✅ TypeScript interfaces completas
- ✅ Hooks para gerenciamento de estado
- ✅ Mock data para testes
- ❌ **Não conectado ao backend**
- ❌ **Sem persistência de dados**
- ❌ **Sem WebSocket (real-time)**

**Arquivos principais:**
```
src/api/chat/
├── @types/chat.ts          # TypeScript interfaces
├── chat-api.ts             # API client (endpoints definidos)
└── mock-data.ts            # Dados mock

src/components/chat/
├── ConversationsList.tsx   # Lista de conversas
├── ChatHeader.tsx          # Header do chat
├── MessageBubble.tsx       # Bolha de mensagem
├── ChatInput.tsx           # Input de mensagem
└── ... (mais componentes)

src/hooks/chat/
├── useChat.ts              # Hook principal do chat
└── ... (outros hooks)
```

**Endpoints definidos (não implementados no backend):**
```typescript
GET    /chat/conversations              # Listar conversas
GET    /chat/conversations/:id/messages # Mensagens
POST   /chat/messages                   # Enviar mensagem
POST   /chat/conversations/:id/read     # Marcar como lido
POST   /chat/upload                     # Upload de mídia
```

**Próximos passos:**
1. Criar tabelas no PostgreSQL
2. Implementar endpoints no backend
3. Adicionar WebSocket para real-time
4. Conectar frontend ao backend

---

## 📖 Stories (Weestory)

### Estado Atual: ✅ Parcialmente Funcional

**Features:**
- Visualização de stories
- Slider horizontal
- Progress bars
- Reações
- ❌ **Upload de stories precisa de testes**

**Arquivos principais:**
```
src/app/weestory/
├── _layout.tsx             # Layout do weestory
└── [id].tsx                # Story viewer

src/components/weestory/
├── Slider.tsx              # Slider de stories
└── ... (outros componentes)
```

---

## 🎨 UI Components

### Biblioteca de Componentes

**Bottom Sheets:**
- Comment bottom sheet
- Report bottom sheet
- Profile bottom sheet
- Create post bottom sheet
- Global search bottom sheet

**Cards:**
- Post card (social, grow, weedz)
- Contributor card
- Profile card

**Inputs:**
- Text input
- Media picker (foto/vídeo)
- Emoji picker
- Voice recorder

**Players:**
- Video player (inline feed)
- Audio player (voice messages)

---

## 🔌 APIs & Backend

### Serviços Existentes

**1. Auth API** (`auth.growzone.co/api/v1`)
```
POST   /login/access-token       # Login
POST   /login/refresh-token      # Refresh token
POST   /users/                   # Criar usuário
GET    /users/me                 # Usuário atual
```

**2. Social API** (`social.growzone.co/api/v1`)
```
# Posts
GET    /feed-post/                    # Feed
POST   /social-post/                  # Criar post
GET    /social-post/:id               # Ver post
POST   /social-post/:id/like          # Like
POST   /social-post/:id/comment       # Comentar

# Perfil
GET    /profile/:id                   # Ver perfil
POST   /profile/follow                # Seguir
GET    /profile/followers             # Seguidores

# Search
GET    /search/global                 # Busca global
```

**3. Chat API** (🚧 NÃO EXISTE AINDA)
```
# Endpoints planejados:
GET    /chat/conversations
POST   /chat/messages
GET    /chat/conversations/:id/messages
POST   /chat/upload
WebSocket endpoint para real-time
```

---

## 📦 Dependências Principais

```json
{
  "expo": "~52.0.0",
  "react-native": "0.76.0",
  "expo-router": "~4.0.0",
  "react-native-reanimated": "~3.16.0",
  "@tanstack/react-query": "^5.0.0",
  "axios": "^1.6.0",
  "@gorhom/bottom-sheet": "^4",
  "nativewind": "^4.0.0",
  "@react-native-async-storage/async-storage": "^2.0.0"
}
```

---

## 🔄 Contextos & Estado Global

```typescript
// Hierarquia de Providers
<AuthContextProvider>           // Autenticação
  <QueryClientProvider>         // React Query
    <NotificationPushProvider>  // Push notifications
      <CreatePostProvider>      // Criação de posts
        <NotificationProvider>  // Notificações in-app
          <VideoPlayerProvider> // Player de vídeo
            <PlayerProvider>    // Outro player?
              <BottomSheetProvider> // Bottom sheets
                <ScrollToTopProvider> // Scroll to top
                  {/* App */}
                </ScrollToTopProvider>
              </BottomSheetProvider>
            </PlayerProvider>
          </VideoPlayerProvider>
        </NotificationProvider>
      </CreatePostProvider>
    </NotificationPushProvider>
  </QueryClientProvider>
</AuthContextProvider>
```

**Observação:** Muitos providers! Considerar simplificar.

---

## 🚨 Problemas Identificados

### 1. **Chat não funcional**
- ❌ Sem backend
- ❌ Sem persistência
- ❌ Sem real-time

### 2. **Múltiplos players?**
- PlayerContext + VideoPlayerContext - Redundância?
- Precisa revisão

### 3. **Mock data misturado com código real**
- Mock auth em `auth-context.tsx`
- Mock posts em `get-posts.ts`
- **Bom para dev, mas precisa garantir que não vai para produção**

### 4. **Navegação complexa**
- Drawer + Tabs + Stack
- Muitos bottom sheets
- Pode confundir usuário

### 5. **Falta de testes**
- Sem testes unitários
- Sem testes de integração
- Sem testes E2E

---

## ✅ Pontos Fortes

1. **TypeScript** - Tipagem forte em todo projeto
2. **Expo Router** - Navegação file-based moderna
3. **NativeWind** - Estilização rápida com Tailwind
4. **React Query** - Gerenciamento de cache e API
5. **Mock system** - Permite desenvolvimento sem backend
6. **Componentização** - Código bem organizado em componentes

---

## 🎯 Próximos Passos Recomendados

### Curto Prazo (1-2 semanas)
1. ✅ **Finalizar mock authentication** - Feito!
2. ✅ **Documentação do mock system** - Feito!
3. ⏳ **Implementar chat backend**
   - Criar tabelas PostgreSQL
   - Endpoints REST na social API
   - WebSocket para real-time

### Médio Prazo (3-4 semanas)
4. **Stories completas**
   - Upload de stories
   - Testes de câmera
   - Otimização de vídeo

5. **Refatorar providers**
   - Consolidar PlayerContext
   - Simplificar hierarquia

6. **Adicionar testes**
   - Unit tests para utils
   - Integration tests para API
   - E2E tests com Detox

### Longo Prazo (1-2 meses)
7. **Performance**
   - Lazy loading de componentes
   - Otimização de imagens
   - Code splitting

8. **Features avançadas**
   - Notificações push
   - Deep linking
   - Share functionality

9. **CI/CD**
   - GitHub Actions
   - Automated tests
   - App distribution (TestFlight/Play Store Beta)

---

## 📊 Métricas do Projeto

**Linhas de código:**
```bash
Frontend: ~15,000 linhas (TypeScript/TSX)
Backend: ? (não temos acesso)
```

**Componentes:** ~80 componentes React
**Telas:** ~25 telas
**APIs:** 2 serviços (auth + social)
**Features:**
- ✅ Autenticação (100%)
- ✅ Feed/Posts (90%)
- ⚠️ Chat (40% - UI only)
- ⚠️ Stories (70%)
- ✅ Perfil (90%)
- ✅ Search (90%)

---

## 🔐 Segurança

**Implementado:**
- ✅ JWT token authentication
- ✅ Token refresh automático
- ✅ Secure storage (AsyncStorage)
- ✅ HTTPS endpoints

**Pendente:**
- ⏳ Rate limiting
- ⏳ Input validation
- ⏳ E2E encryption (chat)
- ⏳ Biometric authentication

---

## 🌍 Internacionalização

**Status:** ❌ Não implementado
**Idiomas:** Apenas Português (BR)
**Próximo passo:** Adicionar i18n (react-i18next)

---

## 📱 Plataformas

**Suportadas:**
- ✅ iOS (com Expo Go)
- ✅ Android (com Expo Go)
- ✅ Web (expo-web)

**Builds nativas:**
- ⏳ iOS (pending Apple account)
- ⏳ Android (pending)

---

## 💾 Storage & Cache

**Local Storage:**
- AsyncStorage para tokens
- AsyncStorage para user data
- ❌ Sem offline-first strategy

**Cache:**
- React Query cache (API data)
- Image caching (expo-image)
- ❌ Sem service worker (web)

---

## 🎨 Design System

**Cores:** `src/styles/colors.ts`
```typescript
primary: #00FF00 (verde)
black: #000000
white: #FFFFFF
gray: várias tonalidades
```

**Componentes:**
- NativeWind classes
- Custom components
- ❌ Sem design tokens formalizados
- ❌ Sem Storybook

---

## 📈 Performance

**Otimizações:**
- ✅ FlashList (ao invés de FlatList)
- ✅ Lazy loading de imagens
- ✅ Video player optimization
- ⏳ Code splitting pendente
- ⏳ Bundle size analysis pendente

---

## 🐛 Bugs Conhecidos

1. ~~Redirect loops após login~~ - **Corrigido!**
2. ~~"Erro ao carregar dados" no feed~~ - **Corrigido!**
3. ~~MediaSlider crash com items undefined~~ - **Corrigido!**
4. ⏳ Stories upload não testado
5. ⏳ Chat completamente não funcional (sem backend)

---

## 📝 Conclusão

**Projeto está em bom estado:**
- ✅ Fundação sólida (TypeScript, Expo, Arquitetura limpa)
- ✅ Autenticação e Feed funcionais
- ✅ UI components bem desenvolvidos
- ⚠️ Chat precisa de backend URGENTE
- ⚠️ Stories precisa de testes

**Próxima prioridade:**
**Implementar backend do Chat** seguindo o `CHAT_IMPLEMENTATION_PLAN.md`

---

**Última atualização:** 20 de Outubro, 2025
**Revisado por:** Claude Code
