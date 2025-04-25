import React from "react";
import { View, Image, TouchableOpacity, Text, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { styles } from "./styles";

interface ModalHeaderProps {
  avatar: string;
  name: string;
  onPress: VoidFunction;
  handlePressReport: VoidFunction;
}

export default function ModalHeader({
  avatar,
  name,
  onPress,
  handlePressReport,
}: ModalHeaderProps) {
  const insets = useSafeAreaInsets();
  const userTop = Platform.OS === "ios" ? insets.top + 30 : insets.top - 10;

  return (
    <View
      style={[
        styles.container,
        {
          top: userTop,
        },
      ]}
    >
      <View className="flex flex-row align-center">
        <Image source={{ uri: avatar }} style={styles.avatar} />
        <View>
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.subTitle}>ontem, 18:33</Text>
        </View>
      </View>

      <View className="flex flex-row align-center gap-2">
        <TouchableOpacity onPress={handlePressReport}>
          <Ionicons name="ellipsis-horizontal" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onPress}>
          <View style={styles.icon}>
            <Ionicons name="close" size={24} color="white" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
