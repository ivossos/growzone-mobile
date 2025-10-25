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
# Start development server with automatic platform selection
npm start

# Start with cache cleared (recommended when changing native configs)
npm run start:clear

# Run on specific platform
npm run android    # Requires Android emulator or device
npm run ios        # Requires Xcode and iOS simulator (macOS only)
npm run web        # Runs in browser at http://localhost:19006

# Preview builds (APK/IPA for internal testing)
npm run build:preview:android  # Creates APK for easy sharing
npm run build:preview:ios      # Creates IPA for TestFlight
```

### Building
```bash
# Clean prebuild (removes android/ios folders and regenerates)
npm run prebuild

# Development builds (internal distribution with dev client)
npm run build:dev:ios
npm run build:dev:android

# Production builds (store distribution)
npm run build:android  # Creates AAB for Google Play
npm run build:ios      # Creates IPA for App Store
```

### Testing & Quality
```bash
# Run tests in watch mode
npm test

# Lint code with ESLint
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

The app uses **Expo Router with typed routes** (enabled via `experiments.typedRoutes` in app.json). Routes are file-based in `src/app/`:

**Navigation Structure:**
- `(auth)` - Auth flow group (stack navigation) - Login, signup screens
- `(drawer)` - Main app with drawer navigation
  - `(tabs)` - Tab navigation within drawer (home, feed, profile)
  - `chat/` - Chat screens (conversation list, individual chats)
- `notifications/` - Notifications screens
- `post/` - Post creation and viewing
- `profile/` - User profile screens
- `weestory/` - Stories feature (create, view, camera)

**Key Concepts:**
- `_layout.tsx` files define layout/navigation structure for their directory
- Groups in parentheses `(name)` don't appear in URL
- Typed routes generate autocomplete for `router.push()` and `href` props
- Use `useLocalSearchParams()` to access route parameters
- Root `_layout.tsx` (`src/app/_layout.tsx`) sets up providers, fonts, and splash screen

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

**Critical Implementation Details:**
- Token injection happens in `src/lib/axios.ts` on initial load (line 174-186)
- Both `authApi` and `socialApi` instances share the same token management
- Token refresh uses a queue system to prevent multiple simultaneous refresh attempts
- `registerInterceptTokenManager` must be called for each API instance (see `src/context/auth-context.tsx:268-269`)
- SignOut is passed to interceptors to handle auth failures globally

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
  - `APP_ENV=development`
  - iOS: Simulator builds enabled
  - Android: Internal APK with auto version increment

- **staging**: Internal testing, uses staging environment
  - `APP_ENV=staging`
  - Release build configuration
  - APK format for easy distribution

- **beta**: Internal beta testing, uses production environment
  - `APP_ENV=production`
  - Increased memory: `NODE_OPTIONS=--max-old-space-size=4096`
  - APK for Android, TestFlight for iOS
  - Node modules cached for faster builds

- **production**: Store distribution (AAB for Android, IPA for iOS)
  - `APP_ENV=production`
  - Android: AAB bundle via `:app:bundleRelease`
  - iOS: Latest image with auto build number increment
  - Cached builds for performance

All profiles use auto-increment for versioning. Android increments `versionCode`, iOS increments `buildNumber`.

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
- **Architecture**: New architecture enabled (`newArchEnabled: true` in app.json)
- **SDK**: Target SDK 35, Compile SDK 35, Build Tools 35.0.0
- **Kotlin**: Version 2.1.20 (critical for build compatibility)
- **Memory**: Large heap enabled, custom optimizations in `withAndroidMemoryOptimizations.js`
- **Metro Config**: Minifier settings optimized for memory (`metro.config.js:13-29`)
- **Permissions**: Camera, microphone, storage, notifications pre-configured

**Common Android Issues:**
- If build fails with KSP errors, verify Kotlin version matches gradle plugin (2.1.20)
- Memory issues during build: Increase heap in `withAndroidMemoryOptimizations.js`

### iOS
- **Deployment Target**: iOS 15.1
- **Apple Sign In**: Enabled via `expo-apple-authentication`
- **Encryption**: Uses non-exempt encryption: false
- **Background Modes**: fetch, remote-notification
- **Permissions**: Camera, photo library, microphone usage descriptions in app.json

**Common iOS Issues:**
- Simulator builds require `eas build --profile development`
- TestFlight requires `--profile beta` or `--profile production`

### Web
- **Bundler**: Metro with static output
- **SVG Support**: Via `react-native-svg-transformer` (metro.config.js:11, 33-34)
- **Vision Camera**: Mocked for web platform (metro.config.js:36-45)
- **Limitations**: Some native features unavailable (camera, notifications, native modules)
- **URL**: Runs at http://localhost:19006 by default

## Important Notes

### Mock Data for Development
The app supports mock authentication for local development:
- Mock users defined in `src/context/auth-context.tsx:84-89`
- Tokens starting with `mock-token-` skip refresh logic
- Mock tokens bypass backend calls in token refresh (`src/lib/axios.ts:81`)
- Mock users skip backend user updates (`src/context/auth-context.tsx:162`)
- Only enabled in development mode (`__DEV__` or `NODE_ENV === 'development'`)

**Mock credentials:**
```typescript
{ email: "test@growzone.co", password: "Test123!", username: "testuser" }
{ email: "dev@growzone.co", password: "Test123!", username: "devuser" }
```

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

### API Issues
1. **Check environment variables**: Verify they're loaded via `Constants.expoConfig?.extra` (see `src/lib/axios.ts:21`)
2. **Enable axios logging**: Uncomment interceptor logs in `src/lib/axios.ts:34` and `src/lib/axios.ts:161`
3. **Token issues**: Check SecureStore has valid tokens - look for "Loading user data from storage" logs
4. **401 errors**: Verify token refresh queue is working - check `isRefreshing` flag in axios interceptor

### Chat/WebSocket Issues
1. **WebSocket connection**: Check browser Network tab for WebSocket connection
2. **Local testing**: Use scripts in `backend/local-test/` to test backend locally
3. **Socket.IO debugging**: Enable Socket.IO debug logs in client

### Build Issues
1. **Kotlin/KSP errors**: Ensure Kotlin version is 2.1.20 (check `app.json` expo-build-properties)
2. **Metro bundler cache**: Run `npm run start:clear` to clear cache
3. **Native module issues**: Run `npm run prebuild` to regenerate native folders
4. **Memory issues**: Check heap size in gradle.properties and metro config

### General Debugging
1. **React Query DevTools**: Can be added as dev dependency for data fetching insights
2. **Expo logs**: Use `npx expo start` and press `j` to open debugger
3. **Native logs**: `adb logcat` (Android) or Xcode Console (iOS)

## Critical Patterns & Gotchas

### API Client Architecture
- **Two separate Axios instances**: `authApi` and `socialApi` (both in `src/lib/axios.ts`)
- Both instances share token management but point to different base URLs
- Token injection happens on app load via IIFE (line 174-186)
- Each instance must register the token manager interceptor (done in `AuthContext`)

### Route Protection
- Route protection handled by checking `user` and `isLoadingUserStorage` in layouts
- Auth flow: If not authenticated → redirect to `(auth)` group
- After login: Check `has_username` → redirect to username setup if needed
- Category check: Redirect to category selection if `category_id` is null

### Performance Considerations
- **Always use `@shopify/flash-list`** instead of `FlatList` for lists
- Images should be optimized before upload (use `expo-image-manipulator`)
- Large media should use S3 pre-signed URLs (chat media, post images)
- Metro bundler configured with memory optimizations for Android builds

### State Persistence
- Auth state persists via `SecureStore` (tokens) and `AsyncStorage` (user data)
- App loads user/token on mount before rendering (see `src/app/_layout.tsx`)
- Always wait for `isLoadingUserStorage` before showing main UI

### WebSocket Connections
- Socket.IO client connects to WebSocket URL from env config
- Connection authenticated via JWT token in query params
- Must handle reconnection logic and offline states
- Chat messages cached locally and synced on reconnect

## Key Dependencies to Know

- `expo-router`: File-based routing with typed routes
- `@gorhom/bottom-sheet`: Bottom sheet modals
- `react-native-gifted-chat`: Chat UI components
- `socket.io-client`: WebSocket real-time connections
- `react-hook-form` + `zod`: Form handling and validation
- `react-native-reanimated`: Animations (must be last plugin in babel.config.js)
- `@shopify/flash-list`: Performant lists (use instead of FlatList)
- `lucide-react-native`: Icon library
- `nativewind`: TailwindCSS for React Native (v4)
- `@tanstack/react-query`: Data fetching and caching
