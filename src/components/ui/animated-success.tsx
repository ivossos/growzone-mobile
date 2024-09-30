import { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Rect, Path, Defs,  Stop, LinearGradient } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function AnimatedSuccess() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(100, {
      duration: 1200,
      easing: Easing.linear,
    });
  }, []);

  const animatedProps = useAnimatedProps(() => {
    const circumference = 2 * Math.PI * 38;

    return {
      strokeDashoffset: circumference - (circumference * progress.value) / 100,
    };
  });

  return (
    <View className="p-1">
      <Svg width="81" height="81" viewBox="0 0 84 80" fill="none">
        <Rect x="8.5" y="8" width="66" height="64" rx="32" fill="#161616" />
        
        <Path
          d="M51.1663 32.6666L36.4997 47.3333L29.833 40.6666"
          stroke="#565656"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        <AnimatedPath
          animatedProps={animatedProps}
          d="M42 2 a 38 38 0 1 1 0 76 a 38 38 0 1 1 0 -76"
          stroke="url(#linearGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={2 * Math.PI * 38}
        />

        <Defs>
          <LinearGradient
              id="linearGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <Stop offset="0%" stopColor="#0B2F08" />
              <Stop offset="90%" stopColor="#4BEF3F" />
              <Stop offset="100%" stopColor="#4BEF3F" /> 
          </LinearGradient>
        </Defs>
      </Svg>
    </View>
  );
}
