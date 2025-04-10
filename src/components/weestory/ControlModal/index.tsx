import React from "react";
import { View, Image, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { styles } from "./styles";

interface ControlModalProps {
  handlePrevious: VoidFunction;
  handleNext: VoidFunction;
}

export default function ControlModal({
  handlePrevious,
  handleNext,
}: ControlModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          top: insets.top,
          bottom: insets.bottom + 80,
        },
      ]}
    >
      <Pressable
        style={styles.pressable}
        onPress={handlePrevious}
        hitSlop={10}
      />
      <Pressable style={styles.pressable} onPress={handleNext} hitSlop={10} />
    </View>
  );
}
