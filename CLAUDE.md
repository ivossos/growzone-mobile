# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Growzone is a React Native mobile application built with Expo that serves as a social platform for plant cultivation enthusiasts. The app includes social media features (posts, stories, reels), real-time chat, and AI-powered plant assistance.

**Tech Stack:**
- React Native 0.76.9 with Expo SDK 54
- Expo Router (file-based routing with typed routes)
- TypeScript
- NativeWind v4 (TailwindCSS for React Native)
- TanStack Query (React Query)
- Axios for API calls
- Socket.IO for real-time features
- React Native Reanimated v3

## Development Commands

### Local Development
```bash
# Start development server
npm start

# Start with cache cleared
npm run start:clear

# Run on specific platform
npm run android
npm run ios
npm run web
```

### Building
```bash
# Clean prebuild
npm run prebuild

# Development builds
npm run build:dev:ios
npm run build:dev:android

# Production builds
npm run build:ios
npm run build:android
```

### Testing & Quality
```bash
# Run tests
npm test

# Lint code
npm run lint
```

## Project Architecture

### Directory Structure

```
src/
├── app/                    # Expo Router screens (file-based routing)
│   ├── (auth)/            # Authentication flow (login, signup)
│   ├── (drawer)/          # Main drawer navigation
│   │   ├── (tabs)/        # Tab navigation (home, feed, profile)
│   │   └── chat/          # Chat screens
│   ├── notifications/     # Notifications screens
│   ├── post/             # Post creation/viewing
│   ├── profile/          # Profile screens
│   └── weestory/         # Stories feature
├── api/                   # API layer (organized by domain)
│   ├── auth/             # Authentication API
│   ├── chat/             # Chat API
│   ├── social/           # Social features API
│   └── @types/           # API type definitions
├── components/            # Reusable UI components
│   ├── chat/             # Chat-specific components
│   ├── form/             # Form components
│   ├── ui/               # Generic UI components
│   └── weestory/         # Story components
├── context/              # React Context providers
├── hooks/                # Custom React hooks
│   └── chat/             # Chat-specific hooks
├── lib/                  # Library configurations
├── services/             # Business logic services
├── storage/              # Local storage utilities
├── styles/               # Global styles and theme
└── utils/                # Utility functions

backend/                  # FastAPI + Lambda backend
├── api/                 # FastAPI REST endpoints
│   ├── models/          # Pydantic schemas
│   └── routers/         # API routes
├── lambda/              # AWS Lambda WebSocket handlers
└── migrations/          # Database migrations

app/                     # Expo Router entry point (deprecated, use src/app/)
```

### Routing System

The app uses **Expo Router with typed routes**. Routes are file-based in `src/app/`:

- `(auth)` - Auth flow group (stack navigation)
- `(drawer)` - Main app with drawer navigation
  - `(tabs)` - Tab navigation within drawer
- Files at root level become routes
- `_layout.tsx` files define layout/navigation structure
- Groups in parentheses `(name)` don't appear in URL

### API Architecture

The app connects to multiple backend services:

1. **Auth API** (`authApi`): User authentication and authorization
   - Base URL: `https://dev.auth.growzone.co/api/v1`

2. **Social API** (`socialApi`): Social features, posts, profiles
   - Base URL: `https://dev.social.growzone.co/api/v1`

3. **Chat API**: Real-time messaging
   - REST: `http://localhost:8000/api/v1/chat`
   - WebSocket: AWS Lambda WebSocket (configured in deployment)

Both `authApi` and `socialApi` are Axios instances (defined in `src/lib/axios.ts`) with:
- Automatic token injection from secure storage
- Token refresh interceptor (401 handling)
- Request/response logging in dev mode

### Authentication Flow

1. User credentials stored in Expo SecureStore (`src/storage/`)
2. Tokens managed by `AuthContext` (`src/context/auth-context.tsx`)
3. Axios interceptors handle token refresh automatically
4. On 401 "Invalid token", refresh token is used to get new access token
5. On refresh failure or specific errors, user is signed out

### State Management

- **React Context**: Auth state (`AuthContext`), notifications, etc.
- **TanStack Query**: API data caching, mutations, invalidation
- **Local State**: Component-level state with hooks

### Styling System

Uses **NativeWind v4** (TailwindCSS for React Native):
- Configuration: `tailwind.config.js`
- Global styles: `src/styles/global.css`
- Custom theme: `src/styles/colors.ts`
- Custom fonts: Inter (Regular, Medium, SemiBold, Bold)
- Apply styles with `className` prop

### Path Aliases

TypeScript path alias `@/*` maps to `./src/*`:
```typescript
import { useAuth } from '@/hooks/use-auth';
import { colors } from '@/styles/colors';
```

## Environment Configuration

The app uses different environment configurations:

- **Development**: `.env.development` (not tracked)
- **Staging**: `.env.staging` (not tracked)
- **Production**: `.env.production`

Environment variables are accessed via `expo-constants`:
```typescript
import Constants from 'expo-constants';
const extra = Constants.expoConfig?.extra;
```

Key environment variables:
- `EXPO_PUBLIC_AUTH_API_URL`: Auth service URL
- `EXPO_PUBLIC_SOCIAL_API_URL`: Social service URL
- `EXPO_PUBLIC_CHAT_API_URL`: Chat REST API URL
- `CHAT_ENABLED`: Feature flag for chat

## Build Profiles (EAS)

Configured in `eas.json`:

- **development**: Dev client with simulator support, internal distribution
- **staging**: Internal testing, uses staging environment
- **beta**: Internal beta testing, uses production environment
- **production**: Store distribution (AAB for Android, IPA for iOS)

All profiles use auto-increment for versioning.

## Chat System

The chat feature includes:

1. **REST API** (FastAPI backend):
   - Conversations CRUD
   - Message sending/reading
   - Unread counts
   - Located in `backend/api/`

2. **WebSocket** (AWS Lambda):
   - Real-time message delivery
   - Connection management
   - Located in `backend/lambda/`

3. **Frontend**:
   - Components: `src/components/chat/`
   - Hooks: `src/hooks/chat/` and `src/hooks/useChat.ts`, `src/hooks/useWebSocket.ts`
   - Screens: `src/app/(drawer)/chat/`
   - API client: `src/api/chat/`

4. **AI Assistant** (@growbot):
   - AI-powered chatbot for plant cultivation assistance
   - Triggers on `@growbot` mentions
   - Uses OpenAI/Anthropic/Google APIs via Lambda
   - See `CHATBOT_AI_PLAN.md` for implementation details

## Common Patterns

### Creating a New Screen

1. Add file in `src/app/` following route structure
2. Export default component
3. Use `Stack.Screen` in parent `_layout.tsx` if needed

### Making API Calls

Use TanStack Query hooks:
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/react-query';

// Query
const { data, isLoading } = useQuery({
  queryKey: ['key'],
  queryFn: apiFunction,
});

// Mutation
const mutation = useMutation({
  mutationFn: apiFunction,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['key'] });
  },
});
```

### Using Authentication

```typescript
import { useAuth } from '@/hooks/use-auth';

const { user, token, signIn, signOut } = useAuth();
```

### Styling Components

```typescript
import { View, Text } from 'react-native';

export function Component() {
  return (
    <View className="flex-1 bg-black-100 p-4">
      <Text className="font-semibold text-green-500 text-lg">
        Hello World
      </Text>
    </View>
  );
}
```

## Platform-Specific Considerations

### Android
- Uses new architecture (`newArchEnabled: true`)
- Target SDK 35
- Request large heap enabled for memory-intensive operations
- Memory optimizations in `metro.config.js`
- Custom memory optimizations plugin: `withAndroidMemoryOptimizations.js`

### iOS
- Deployment target: iOS 15.1
- Apple Sign In enabled
- Uses non-exempt encryption: false
- Background modes: fetch, remote-notification

### Web
- Metro bundler with static output
- SVG support via `react-native-svg-transformer`
- Vision camera mocked for web platform (see `metro.config.js`)
- Some native features may not work (camera, notifications)

## Important Notes

### Mock Data for Development
The app supports mock tokens for local development:
- Tokens starting with `mock-token-` skip refresh logic
- Useful for testing without backend
- See `src/lib/axios.ts` line 81

### SSR Compatibility
Some code checks for browser environment:
```typescript
if (typeof window !== 'undefined') {
  // Client-side only code
}
```

### Notifications
- Background task: `BACKGROUND-NOTIFICATION-TASK`
- Setup in `src/app/_layout.tsx`
- Provider: `NotificationPushProvider`

### Font Loading
Custom Inter fonts must load before app renders. Splash screen hides once fonts are loaded (see `src/app/_layout.tsx`).

## Backend Deployment

For chat backend deployment to AWS:
1. See `backend/DEPLOYMENT_GUIDE.md` for step-by-step guide
2. Use `backend/README.md` for quick reference
3. WebSocket requires AWS Lambda + API Gateway
4. REST API integrates with existing FastAPI Social API

## Debugging Tips

1. Check environment variables are loaded correctly via Constants
2. Use axios interceptor logs for API debugging (uncomment in `src/lib/axios.ts`)
3. For WebSocket issues, check connection in Network tab
4. Test chat locally with `backend/local-test/` scripts
5. Use React Query DevTools (can be added as dev dependency)

## Key Dependencies to Know

- `expo-router`: File-based routing with typed routes
- `@gorhom/bottom-sheet`: Bottom sheet modals
- `react-native-gifted-chat`: Chat UI components
- `socket.io-client`: WebSocket real-time connections
- `react-hook-form` + `zod`: Form handling and validation
- `react-native-reanimated`: Animations (must be last plugin in babel.config.js)
- `@shopify/flash-list`: Performant lists (use instead of FlatList)
- `lucide-react-native`: Icon library
