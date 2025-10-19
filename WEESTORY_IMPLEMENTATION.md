# 📸 Weestory (Stories) - Implementação Completa

Documentação técnica da feature de Stories (Weestory) do Growzone Mobile.

**Última atualização:** 19 de Outubro, 2025

---

## 📋 Visão Geral

Weestory é a implementação de Stories estilo Instagram/Snapchat no Growzone, permitindo usuários compartilharem fotos e vídeos efêmeros que expiram em 24 horas.

### Status Atual

- ✅ **Captura mobile** - VisionCamera funcionando (iOS/Android)
- ✅ **Captura web** - HTML5 getUserMedia implementado
- ✅ **Visualização** - Modal com progress bars e swipe
- ✅ **Feed** - Slider horizontal de stories
- ✅ **Upload** - Integração com API e progresso visual
- ✅ **Expiração 24h** - Filtro automático no frontend
- ⏳ **Views counter** - Planejado
- ⏳ **Reactions/Replies** - Planejado

---

## 🗂️ Estrutura de Arquivos

```
src/
├── app/
│   └── weestory/
│       ├── index.tsx              # Tela de captura (mobile VisionCamera)
│       └── _layout.tsx            # Layout config
│
├── components/
│   └── weestory/
│       ├── Avatar/
│       │   └── index.tsx          # Avatar com borda de story
│       ├── ModalCamera/
│       │   ├── index.tsx          # Camera mobile (VisionCamera)
│       │   ├── index.web.tsx      # ✨ Camera web (getUserMedia)
│       │   └── styles.ts          # Estilos compartilhados
│       ├── ModalWeestory/
│       │   ├── Controls/          # Navegação prev/next
│       │   │   ├── index.tsx
│       │   │   └── styles.ts
│       │   ├── Header/            # Info do usuário
│       │   │   ├── index.tsx
│       │   │   └── styles.ts
│       │   ├── index.tsx          # Modal principal
│       │   └── styles.ts
│       └── Slider/
│           └── index.tsx          # Feed horizontal
│
├── api/
│   └── social/
│       └── weestory/
│           ├── create-weestory.tsx  # Upload de story
│           └── get-weestory.tsx     # Buscar stories (com filtro 24h)
│
└── context/
    └── camera-modal-context.tsx     # Estado do modal de câmera
```

---

## 🎥 Captura - ModalCamera

### Versão Mobile (`index.tsx`)

Usa **react-native-vision-camera** para captura nativa de alta qualidade.

#### Features

- ✅ Captura de foto (tap)
- ✅ Gravação de vídeo até 15s (long press)
- ✅ Troca de câmera (front/back)
- ✅ Preview em tempo real
- ✅ Indicador de gravação com animação
- ✅ Progress bar de upload
- ✅ Detecção de simulador iOS

#### Código Principal

```typescript
import { Camera, useCameraDevice } from "react-native-vision-camera";

export default function ModalCamera() {
  const cameraRef = useRef<Camera>(null);
  const [facing, setFacing] = useState<"front" | "back">("front");
  const currentDevice = useCameraDevice(facing);

  // Take photo
  const handleCapture = async () => {
    const photo = await cameraRef.current.takePhoto({ flash: "off" });
    const photoUri = normalizeFileUri(photo.path);
    setCapturedPhoto(photoUri);
  };

  // Start video recording
  const startRecording = async () => {
    cameraRef.current?.startRecording({
      onRecordingFinished: (video) => {
        const normalizedPath = normalizeFileUri(video.path);
        setCapturedVideo(normalizedPath);
      },
      onRecordingError: (error) => console.error(error),
      videoCodec: "h264",
    });

    // Auto stop after 15 seconds
    setTimeout(() => {
      cameraRef.current?.stopRecording();
    }, 15000);
  };

  return (
    <Camera
      ref={cameraRef}
      device={currentDevice}
      isActive={true}
      video={true}
      audio={true}
      photo={true}
    />
  );
}
```

#### Permissões

```typescript
import { useCameraPermission, useMicrophonePermission } from "react-native-vision-camera";

const { hasPermission: hasCameraPermission, requestPermission: requestCameraPermission } = useCameraPermission();
const { hasPermission: hasMicrophonePermission, requestPermission: requestMicrophonePermission } = useMicrophonePermission();

// Request on mount
useEffect(() => {
  if (!hasCameraPermission) requestCameraPermission();
  if (!hasMicrophonePermission) requestMicrophonePermission();
}, []);
```

### Versão Web (`index.web.tsx`) ✨

Usa **HTML5 getUserMedia API** como fallback para navegadores.

#### Features

- ✅ Acesso à câmera do navegador
- ✅ Captura de foto via Canvas
- ✅ Gravação de vídeo via MediaRecorder
- ✅ Troca de câmera (user/environment)
- ✅ Preview espelhado para câmera frontal
- ✅ Suporte a múltiplos formatos (WebM, VP9, VP8)
- ✅ Auto-stop aos 15 segundos
- ✅ Mesma UI do mobile

#### Código Principal

```typescript
export default function ModalCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Initialize camera
  const initializeCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: facing, // "user" or "environment"
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30 },
      },
      audio: true,
    });

    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
  };

  // Take photo
  const handleCapture = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      setCapturedPhoto(url);
    }, "image/jpeg", 0.95);
  };

  // Start video recording
  const startRecording = async () => {
    const mimeType = "video/webm;codecs=vp9"; // Auto-detect best format
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType,
      videoBitsPerSecond: 2500000, // 2.5 Mbps
    });

    mediaRecorderRef.current = mediaRecorder;
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setCapturedVideo(url);
    };

    mediaRecorder.start();

    // Auto stop after 15 seconds
    setTimeout(() => mediaRecorder.stop(), 15000);
  };

  return (
    <>
      {/* Video preview */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: facing === "user" ? "scaleX(-1)" : "none", // Mirror front camera
        }}
      />

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </>
  );
}
```

#### Browser Support

| Browser | Photo | Video | Camera Switch |
|---------|-------|-------|---------------|
| Chrome | ✅ | ✅ | ✅ |
| Firefox | ✅ | ✅ | ✅ |
| Safari | ✅ | ✅ | ⚠️ Limited |
| Edge | ✅ | ✅ | ✅ |

**Nota:** Safari em iOS pode ter limitações com `facingMode: "environment"`.

### UI Compartilhada

Ambas versões usam a mesma interface:

```typescript
// Capture button com long press
<TouchableWithoutFeedback
  onPressIn={handlePressIn}  // Start timer
  onPressOut={handlePressOut} // Photo or stop recording
>
  <Animated.View
    style={[
      styles.outerCircle,
      {
        borderColor: isRecording ? colors.primary : colors.brand.white,
        transform: [{ scale: isRecording ? pulseAnim : scaleAnim }],
      },
    ]}
  >
    <View style={styles.innerCircle}>
      <View style={styles.centerCircle} />
    </View>
  </Animated.View>
</TouchableWithoutFeedback>
```

Estilos:

```typescript
// src/components/weestory/ModalCamera/styles.ts
export const styles = StyleSheet.create({
  outerCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  innerCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  centerCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.brand.white,
  },
});
```

---

## 👁️ Visualização - ModalWeestory

Modal para visualizar stories com navegação, progress bars e controles.

### Estrutura

```
ModalWeestory/
├── index.tsx      # Modal principal com state e lógica
├── Header/        # Usuário, tempo decorrido, botão fechar
├── Controls/      # Navegação prev/next (touch zones)
└── styles.ts      # Estilos
```

### Features

- ✅ Progress bars por story
- ✅ Auto-advance após 5 segundos (foto) ou duração do vídeo
- ✅ Tap esquerda/direita para navegar
- ✅ Long press para pausar
- ✅ Swipe vertical para fechar
- ✅ Exibição de imagem ou vídeo
- ✅ Header com info do usuário
- ⏳ Views counter (planejado)
- ⏳ Reactions (planejado)

### Código Principal

```typescript
export default function ModalWeestory() {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentStory = stories[currentStoryIndex];

  // Auto-advance progress
  useEffect(() => {
    if (isPaused) return;

    const duration = currentStory.type === "video"
      ? currentStory.duration * 1000
      : 5000; // 5s for images

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 1) {
          goToNextStory();
          return 0;
        }
        return prev + 0.01;
      });
    }, duration / 100);

    return () => clearInterval(interval);
  }, [currentStoryIndex, isPaused]);

  const goToNextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      closeModal();
    }
  };

  const goToPrevStory = () => {
    if (progress > 0.05) {
      // Restart current story
      setProgress(0);
    } else if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
      setProgress(0);
    }
  };

  return (
    <Modal visible={isVisible} animationType="fade">
      {/* Progress bars */}
      <View style={styles.progressContainer}>
        {stories.map((_, index) => (
          <View key={index} style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: index === currentStoryIndex
                    ? `${progress * 100}%`
                    : index < currentStoryIndex
                    ? "100%"
                    : "0%",
                },
              ]}
            />
          </View>
        ))}
      </View>

      {/* Header */}
      <Header
        user={currentStory.user}
        timestamp={currentStory.createdAt}
        onClose={closeModal}
      />

      {/* Story content */}
      {currentStory.type === "image" ? (
        <Image source={{ uri: currentStory.url }} style={styles.media} />
      ) : (
        <VideoView
          player={videoPlayer}
          style={styles.media}
          contentFit="cover"
        />
      )}

      {/* Touch controls */}
      <Controls
        onPressLeft={goToPrevStory}
        onPressRight={goToNextStory}
        onLongPress={() => setIsPaused(true)}
        onPressOut={() => setIsPaused(false)}
      />
    </Modal>
  );
}
```

### Header Component

```typescript
export function Header({ user, timestamp, onClose }: HeaderProps) {
  const timeAgo = useMemo(() => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return hours > 0 ? `${hours}h atrás` : "Agora";
  }, [timestamp]);

  return (
    <View style={styles.header}>
      <View style={styles.userInfo}>
        <Avatar uri={user.avatar} size={32} />
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.timeAgo}>{timeAgo}</Text>
      </View>
      <TouchableOpacity onPress={onClose}>
        <Ionicons name="close" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}
```

### Controls Component

```typescript
export function Controls({ onPressLeft, onPressRight, onLongPress, onPressOut }: ControlsProps) {
  return (
    <View style={styles.controlsContainer}>
      {/* Left side - previous story */}
      <TouchableWithoutFeedback
        onPress={onPressLeft}
        onLongPress={onLongPress}
        onPressOut={onPressOut}
      >
        <View style={styles.controlZone} />
      </TouchableWithoutFeedback>

      {/* Right side - next story */}
      <TouchableWithoutFeedback
        onPress={onPressRight}
        onLongPress={onLongPress}
        onPressOut={onPressOut}
      >
        <View style={styles.controlZone} />
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
  },
  controlZone: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
```

---

## 📱 Feed - Slider

Slider horizontal de stories estilo Instagram.

### Features

- ✅ Scroll horizontal de avatares
- ✅ Indicador visual (borda verde) para stories não vistos
- ✅ "Seu story" no início (adicionar novo)
- ✅ Grid responsivo
- ✅ Navegação para ModalWeestory ao clicar

### Código

```typescript
export function Slider() {
  const [stories, setStories] = useState<WeestoryUser[]>([]);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    const data = await getWeestory();
    setStories(data);
  };

  const openStory = (userId: string) => {
    // Open ModalWeestory with user's stories
    navigation.navigate("WeestoryModal", { userId });
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {/* Add new story */}
      <TouchableOpacity
        style={styles.addStory}
        onPress={() => navigation.navigate("Weestory")}
      >
        <View style={styles.addButton}>
          <Ionicons name="add" size={24} color={colors.brand.white} />
        </View>
        <Text style={styles.userName}>Seu story</Text>
      </TouchableOpacity>

      {/* Stories from other users */}
      {stories.map((user) => (
        <TouchableOpacity
          key={user.id}
          style={styles.storyItem}
          onPress={() => openStory(user.id)}
        >
          <Avatar
            uri={user.avatar}
            size={56}
            hasBorder={!user.viewed} // Green border if not viewed
          />
          <Text style={styles.userName} numberOfLines={1}>
            {user.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
```

### Avatar com Borda

```typescript
export function Avatar({ uri, size = 56, hasBorder = false }: AvatarProps) {
  return (
    <View
      style={[
        styles.container,
        {
          width: size + (hasBorder ? 6 : 0),
          height: size + (hasBorder ? 6 : 0),
        },
      ]}
    >
      {hasBorder && (
        <View style={[styles.border, { borderRadius: size / 2 + 3 }]} />
      )}
      <Image
        source={{ uri }}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  border: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderWidth: 3,
    borderColor: colors.primary, // #2CC420
  },
  avatar: {
    backgroundColor: colors.black[70],
  },
});
```

---

## 🔌 Integração com API

### Upload de Story

```typescript
// src/api/social/weestory/create-weestory.tsx
interface CreateWeestoryParams {
  image?: string; // URI local
  video?: string; // URI local
  onProgress?: (progress: number) => void;
}

export async function createWeestory({ image, video, onProgress }: CreateWeestoryParams) {
  const formData = new FormData();

  if (image) {
    const response = await fetch(image);
    const blob = await response.blob();
    formData.append("image", blob, "weestory.jpg");
  }

  if (video) {
    const response = await fetch(video);
    const blob = await response.blob();
    formData.append("video", blob, "weestory.mp4");
  }

  const response = await socialApi.post("/weestory", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });

  return response.data;
}
```

### Buscar Stories

```typescript
// src/api/social/weestory/get-weestory.tsx
export async function getWeestory(): Promise<WeestoryUser[]> {
  const response = await socialApi.get<ApiResponse<WeestoryUser[]>>("/weestory");

  // Filter stories older than 24 hours
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  return response.data.data
    .map((user) => ({
      ...user,
      stories: user.stories.filter((story) => {
        const storyDate = new Date(story.createdAt);
        return storyDate > twentyFourHoursAgo;
      }),
    }))
    .filter((user) => user.stories.length > 0); // Remove users with no stories
}
```

### Types

```typescript
// src/api/@types/weestory.ts
export interface Weestory {
  id: string;
  userId: string;
  type: "image" | "video";
  url: string;
  duration?: number; // For videos
  createdAt: string;
  expiresAt: string; // 24h after createdAt
  views: number;
  viewers?: WeestoryViewer[];
}

export interface WeestoryUser {
  id: string;
  name: string;
  avatar: string;
  stories: Weestory[];
  viewed: boolean; // Has current user viewed?
}

export interface WeestoryViewer {
  userId: string;
  userName: string;
  userAvatar: string;
  viewedAt: string;
}
```

---

## 🎨 Design System

### Cores

```typescript
const colors = {
  primary: "#2CC420",           // Verde Growzone
  background: "#0D0D0D",        // Preto principal
  cardBackground: "#161616",    // Cinza escuro
  text: "#FFFFFF",              // Branco
  textSecondary: "#B6B6B6",     // Cinza claro
};
```

### Tipografia

| Elemento | Font | Size | Weight |
|----------|------|------|--------|
| User name | Inter | 14px | 600 |
| Time ago | Inter | 12px | 400 |
| Button text | Inter | 14px | 600 |

### Dimensões

```typescript
const DIMENSIONS = {
  avatarSize: 56,
  avatarBorderWidth: 3,
  progressBarHeight: 2,
  headerHeight: 56,
  captureButtonSize: 74,
};
```

---

## ⚡ Performance

### Otimizações Implementadas

1. **Lazy Loading de Vídeos**
   ```typescript
   const player = useVideoPlayer(videoUri, (player) => {
     player.muted = false;
     player.loop = false;
   });
   ```

2. **Cleanup de Resources**
   ```typescript
   useEffect(() => {
     return () => {
       // Stop camera
       if (streamRef.current) {
         streamRef.current.getTracks().forEach(track => track.stop());
       }

       // Revoke blob URLs
       if (capturedPhoto) URL.revokeObjectURL(capturedPhoto);
       if (capturedVideo) URL.revokeObjectURL(capturedVideo);
     };
   }, []);
   ```

3. **Progress Animation**
   ```typescript
   // Use requestAnimationFrame for smooth progress
   const animateProgress = () => {
     const now = Date.now();
     const elapsed = now - startTime;
     const progress = Math.min(elapsed / duration, 1);

     setProgress(progress);

     if (progress < 1) {
       requestAnimationFrame(animateProgress);
     }
   };
   ```

4. **Image Compression**
   ```typescript
   canvas.toBlob((blob) => {
     // ...
   }, "image/jpeg", 0.95); // 95% quality
   ```

---

## 🧪 Como Testar

### Mobile (iOS/Android)

```bash
# iOS
npm run ios

# Android
npm run android

# Navegar para: (drawer) → (tabs) → home
# Clicar no botão de câmera ou avatar de story
```

### Web

```bash
npm run web

# Navegar para: http://localhost:8081
# Sign in → Home → Clicar em story ou criar novo
```

**Nota:** No navegador, você precisará permitir acesso à câmera quando solicitado.

---

## 🐛 Troubleshooting

### Problema: "VisionCamera não funciona no iOS Simulator"

**Causa:** iOS Simulator não tem acesso à câmera física.

**Solução:** Teste em dispositivo físico ou use o fallback web.

### Problema: "getUserMedia not supported"

**Causa:** Navegador antigo ou HTTPS não configurado.

**Solução:**
1. Use HTTPS (getUserMedia requer HTTPS exceto em localhost)
2. Atualize o navegador
3. Verifique se está em localhost para desenvolvimento

### Problema: "MediaRecorder codecs not supported"

**Causa:** Navegador não suporta VP9/VP8.

**Solução:** O código já faz fallback automático:
```typescript
const mimeTypes = [
  "video/webm;codecs=vp9",
  "video/webm;codecs=vp8",
  "video/webm",
  "video/mp4",
];

let mimeType = "video/webm";
for (const type of mimeTypes) {
  if (MediaRecorder.isTypeSupported(type)) {
    mimeType = type;
    break;
  }
}
```

### Problema: "Stories não aparecem no feed"

**Causa:** Stories expirados (>24h) ou filtro no frontend.

**Solução:** Verificar `get-weestory.tsx` e timestamp dos stories no backend.

---

## 📋 Próximas Features

### Views Counter ⏳

**Objetivo:** Mostrar quantas pessoas visualizaram cada story.

**Implementação planejada:**
```typescript
// Add to ModalWeestory/Header
<TouchableOpacity onPress={openViewersList}>
  <View style={styles.viewsCounter}>
    <EyeIcon size={16} color="white" />
    <Text style={styles.viewsText}>{story.views} visualizações</Text>
  </View>
</TouchableOpacity>

// Track view on story open
useEffect(() => {
  trackStoryView(storyId, userId);
}, [storyId]);
```

### Reactions/Replies ⏳

**Objetivo:** Permitir reagir aos stories com emoji ou responder via DM.

**Implementação planejada:**
```typescript
// Add to ModalWeestory footer
<View style={styles.reactionsBar}>
  <TextInput
    placeholder="Responder..."
    style={styles.replyInput}
    onSubmitEditing={handleReply}
  />
  <TouchableOpacity onPress={openEmojiPicker}>
    <SmileIcon />
  </TouchableOpacity>
</View>
```

### Progress Bars Melhorados ⏳

**Objetivo:** Transições mais suaves e precisas.

**Implementação planejada:**
- Usar `Animated.timing()` para progress bars
- Sincronizar melhor com duração de vídeo
- Pausar automaticamente quando app vai ao background

---

## 📚 Referências

- [react-native-vision-camera Docs](https://react-native-vision-camera.com/)
- [MDN: getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [MDN: MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [expo-video Docs](https://docs.expo.dev/versions/latest/sdk/video/)
- [Instagram Stories UX Patterns](https://uxdesign.cc/instagram-stories-ux-breakdown-7c8f8c7b3c5a)

---

## 🎯 Summary

**Status:** ✅ Funcional em todas plataformas (iOS, Android, Web)

**Key Features:**
- ✅ Captura nativa de alta qualidade (mobile)
- ✅ Fallback web completo com HTML5
- ✅ Visualização com progress bars e navegação
- ✅ Feed horizontal com indicadores
- ✅ Upload com progresso visual
- ✅ Expiração automática 24h

**Próximos passos:**
1. Views counter
2. Reactions/Replies
3. Standalone test page `/test-weestory`
4. Analytics de visualizações

---

**🚀 Mantido pela equipe Growzone Tech**

*Versão: 2.0 - Com Web Support*
