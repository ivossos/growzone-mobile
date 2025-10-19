import React, { useEffect, useRef } from "react";
import { View, Animated, Image } from "react-native";

interface TypingIndicatorProps {
  avatar?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ avatar }) => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    Animated.parallel([
      animateDot(dot1, 0),
      animateDot(dot2, 200),
      animateDot(dot3, 400),
    ]).start();
  }, []);

  const dotStyle = (animatedValue: Animated.Value) => ({
    opacity: animatedValue,
    transform: [
      {
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -4],
        }),
      },
    ],
  });

  return (
    <View className="flex-row mb-2">
      {avatar && (
        <Image
          source={{ uri: avatar }}
          className="w-5 h-5 rounded-full mr-2"
        />
      )}
      <View className="bg-black-90 rounded px-4 py-3 flex-row items-center">
        <Animated.View
          style={[dotStyle(dot1)]}
          className="w-2 h-2 rounded-full bg-black-30 mr-1"
        />
        <Animated.View
          style={[dotStyle(dot2)]}
          className="w-2 h-2 rounded-full bg-black-30 mr-1"
        />
        <Animated.View
          style={[dotStyle(dot3)]}
          className="w-2 h-2 rounded-full bg-black-30"
        />
      </View>
    </View>
  );
};
