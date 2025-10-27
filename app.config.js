require("dotenv").config();

const AUTH_API_URL = process.env.EXPO_PUBLIC_AUTH_API_URL || "https://dev.auth.growzone.co/api/v1";
const SOCIAL_API_URL = process.env.EXPO_PUBLIC_SOCIAL_API_URL || "https://dev.social.growzone.co/api/v1";

const config = {
  expo: {
    "owner": "jvoz00001",
    "name": "Growzone",
    "slug": "growzone",
    "version": "1.0.20",
    "orientation": "portrait",
    "icon": "./src/assets/images/icon.png",
    "scheme": "growzone",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "splash": {
      "image": "./src/assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#000000"
    },
    "ios": {
      "usesAppleSignIn": true,
      "supportsTablet": true,
      "bundleIdentifier": "com.ivossos.growzone",
      "infoPlist": {
        "NSCameraUsageDescription": "Precisamos utilizar a câmera do aparelho para que você possa tirar fotos e gravar vídeos dentro do app, como em postagens ou registros de cultivo.",
        "NSPhotoLibraryUsageDescription": "Utilizamos sua galeria para que você possa selecionar imagens e vídeos para postar ou compartilhar no app.",
        "NSPhotoLibraryAddUsageDescription": "Utilizamos sua galeria para que você possa selecionar imagens e vídeos para postar ou compartilhar no app.",
        "NSMicrophoneUsageDescription": "O microfone é necessário para gravar áudio nos vídeos que você cria e publica na plataforma.",
        "NSLocationWhenInUseUsageDescription": "Este app não usa localização, mas algumas bibliotecas podem referenciar essas APIs.",
        "NSUserNotificationUsageDescription": "Enviamos notificações para avisar sobre curtidas, comentários, seguidores e outras atualizações importantes.",
        "UIBackgroundModes": [
          "fetch",
          "remote-notification"
        ]
      },
      "config": {
        "usesNonExemptEncryption": false
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./src/assets/images/adaptive-icon.png",
        "backgroundColor": "#000000"
      },
      "permissions": [
        "CAMERA",
        "RECORD_AUDIO",
        "READ_EXTERNAL_STORAGE",
        "MEDIA_LIBRARY",
        "NOTIFICATIONS"
      ],
      "softwareKeyboardLayoutMode": "pan",
      "package": "com.ivossos.growzone"
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./src/assets/images/favicon.png"
    },
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 35,
            "targetSdkVersion": 35,
            "buildToolsVersion": "35.0.0",
            "kotlinVersion": "2.1.20"
          },
          "ios": {
            "deploymentTarget": "15.1"
          }
        }
      ],
      "expo-apple-authentication",
      ["expo-router", { "root": "src/app" }],
      [
        "expo-video",
        {
          "supportsBackgroundPlayback": false,
          "supportsPictureInPicture": false
        }
      ],
      [
        "expo-font",
        {
          "fonts": [
            "./src/assets/fonts/Inter-Bold.ttf",
            "./src/assets/fonts/Inter-Medium.ttf",
            "./src/assets/fonts/Inter-Regular.ttf",
            "./src/assets/fonts/Inter-SemiBold.ttf"
          ]
        }
      ],
      [
        "expo-splash-screen",
        {
          "image": "./src/assets/images/splash.png",
          "resizeMode": "contain",
          "backgroundColor": "#000000"
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./src/assets/images/icon.png",
          "color": "#ffffff",
          "defaultChannel": "default",
          "enableBackgroundRemoteNotifications": true
        }
      ],
      [
        "react-native-vision-camera",
        {
          "cameraPermissionText": "Precisamos utilizar a câmera do aparelho para que você possa tirar fotos e gravar vídeos dentro do app",
          "enableMicrophonePermission": true,
          "microphonePermissionText": "O microfone é necessário para gravar áudio",
          "enableLocationPermission": false
        }
      ],
      [
        "expo-camera",
        {
          "cameraPermission": "Precisamos utilizar a câmera do aparelho...",
          "microphonePermission": "O microfone é necessário para gravar áudio nos vídeos",
          "recordAudioAndroid": true
        }
      ],
      "./withAndroidMemoryOptimizations"
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "router": {
        "origin": false
      },
      "CHAT_ENABLED": true,
      "CHAT_API_URL": "http://localhost:8000/api/v1/chat",
      "EXPO_PUBLIC_API": "http://localhost:3333",
      "EXPO_PUBLIC_RT": "ws://localhost:3333",
      "AUTH_API_URL": AUTH_API_URL,
      "SOCIAL_API_URL": SOCIAL_API_URL,
      "eas": {
        "projectId": "46e780e3-332c-484a-b3e2-bc3f935c6d6c"
      }
    }
  }
};

module.exports = config;