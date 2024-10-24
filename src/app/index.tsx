import { Image, ScrollView, View, useWindowDimensions } from "react-native";

import Animated, {
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

import { router } from "expo-router";
import { useEffect } from "react";

export default function Splash() {
  const logoScale = useSharedValue(1);
  const logoPositionY = useSharedValue(0);
  const contentDisplay = useSharedValue(0);

  const dimensions = useWindowDimensions();

  const logoAnimatedStyles = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { translateY: logoPositionY.value },
    ],
  }));

  const contentAnimatedStyles = useAnimatedStyle(() => ({
    display: contentDisplay.value === 1 ? "flex" : "none",
  }));

  function logoAnimation() {
    logoScale.value = withSequence(
      withTiming(0.7),
      withTiming(1.3),
      withTiming(1, undefined, (finished) => {
        if (finished) {
          logoPositionY.value = withSequence(
            withTiming(50, undefined, () => (contentDisplay.value = 1)),
            withTiming(-dimensions.height, { duration: 400 })
          );

          runOnJS(onEndSplash)();
        }
      })
    );
  }

  function onEndSplash() {
    setTimeout(() => {
      router.replace("/age-decision");
    }, 1000);
  }

  useEffect(() => {
    logoAnimation();
  }, []);
  return (
    <View className="flex justify-center items-center bg-brand-black h-full">
      <Animated.Image
          className="w-[214px] h-[30px]"
          resizeMode="contain"
          source={require("@/assets/images/logo-green.png")}
          style={[logoAnimatedStyles]}
        />
    </View>
  );
}
