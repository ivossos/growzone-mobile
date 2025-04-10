import React from "react";
import { View, Image, TouchableOpacity, Text, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { styles } from "./styles";

interface HeaderModalProps {
  avatar: string;
  name: string;
  onPress: VoidFunction;
}

export default function HeaderModal({
  avatar,
  name,
  onPress,
}: HeaderModalProps) {
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
      <TouchableOpacity onPress={onPress}>
        <View style={styles.icon}>
          <Ionicons name="chevron-back-outline" size={20} color="white" />
        </View>
      </TouchableOpacity>
      <Image source={{ uri: avatar }} style={styles.avatar} />
      <View>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.subTitle}>ontem, 18:33</Text>
      </View>
    </View>
  );
}
