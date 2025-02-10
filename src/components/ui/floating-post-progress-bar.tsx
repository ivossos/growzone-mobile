import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Progress } from '../Progress';
import { useCreatePostProgress } from '@/hooks/use-create-post-progress';

const FloatingPostProgressBar = () => {
  const { isProcessing, progress, shouldVibrate, resetProgress } = useCreatePostProgress();
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (shouldVibrate && isProcessing) {
      startVibration();
    } else {
      shakeAnimation.setValue(0);
    }
  }, [shouldVibrate, isProcessing]);

  const startVibration = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnimation, {
          toValue: 1,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: -1,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnimation, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const shakeStyle = {
    transform: [
      {
        translateX: shakeAnimation.interpolate({
          inputRange: [-1, 1],
          outputRange: [-5, 5],
        }),
      },
    ],
  };

  if (!isProcessing && progress === 0) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, shakeStyle]}>
      {isProcessing && progress < 100 && 
        <View className="flex flex-col gap-4 px-6 bg-brand-black" style={styles.content}>
          <Text className="text-brand-white text-base font-medium">Publicando...</Text>
          <Text className="text-brand-white text-xs font-regular">Mantenha o app aberto para terminar de publicar.</Text>
          <Progress value={progress} className="max-h-1 h-1" />
        </View>
      }
      {!isProcessing && progress === 100 && <View className="flex flex-row items-center justify-between gap-4 px-6 bg-brand-black" style={styles.content}>
        <Text className="text-brand-white text-base font-medium">Seu post foi concluido com sucesso</Text>
        <TouchableOpacity className="flex justify-center items-center min-h-[32px] px-4  bg-brand-green rounded-lg " onPress={() => resetProgress()}>
          <Text className="text-brand-black text-base font-medium">Ok</Text>
        </TouchableOpacity>
      </View>}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 84,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  content: {
    borderRadius: 10,
    padding: 12,
    width: "80%",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default FloatingPostProgressBar;
