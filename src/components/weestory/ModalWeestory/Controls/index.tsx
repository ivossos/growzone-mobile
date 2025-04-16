import React from "react";
import { View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { styles } from "./styles";

interface ModalControlsProps {
  handlePrevious: VoidFunction;
  handleNext: VoidFunction;
}

export default function ModalControls({
  handlePrevious,
  handleNext,
}: ModalControlsProps) {
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
