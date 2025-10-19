import { View, Text } from "react-native";
import { router } from "expo-router";
import Button from "@/components/ui/button";
import { colors } from "@/styles/colors";
import { useEffect } from "react";

/**
 * Web fallback for Weestory camera screen
 * VisionCamera is not supported on Web platform
 */
export default function WeestoryWebFallback() {
  // Auto-redirect to home after 2 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push("/(drawer)/(tabs)/home");
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-black px-6">
      <Text className="text-2xl font-bold text-white text-center mb-4">
        📸 Câmera não disponível
      </Text>
      <Text className="text-base font-medium text-neutral-400 text-center mb-8">
        A funcionalidade de Weestory com câmera está disponível apenas nos apps
        mobile (iOS/Android).
      </Text>
      <Text className="text-sm font-regular text-neutral-500 text-center mb-8">
        Redirecionando para a página inicial...
      </Text>
      <Button
        handlePress={() => router.push("/(drawer)/(tabs)/home")}
        containerStyles="w-64"
        title="Voltar para Home"
      />
    </View>
  );
}
