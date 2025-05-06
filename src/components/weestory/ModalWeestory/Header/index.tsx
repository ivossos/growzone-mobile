import React from "react";
import { View, Image, TouchableOpacity, Text, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getInitials } from "@/lib/utils";

import { styles } from "./styles";

interface ModalHeaderProps {
  avatar: string;
  name: string;
  createdAt: string;
  onPress: VoidFunction;
  handlePressReport: VoidFunction;
}

export default function ModalHeader({
  avatar,
  name,
  onPress,
  createdAt,
  handlePressReport,
}: ModalHeaderProps) {
  const insets = useSafeAreaInsets();
  const userTop = Platform.OS === "ios" ? insets.top + 30 : insets.top - 10;

  function formatTimeAgo(isoDateString: string | number | Date) {
    const postDate = new Date(isoDateString);
    const now = new Date();

    const diffMs = Number(now) - Number(postDate);
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) {
      return "agora";
    } else if (diffMinutes < 60) {
      return `${diffMinutes} min`;
    } else if (diffHours < 24) {
      return `${diffHours} h`;
    } else if (diffDays === 1) {
      return "ontem";
    } else {
      return `${diffDays} d`;
    }
  }

  return (
    <View
      style={[
        styles.container,
        {
          top: userTop,
        },
      ]}
    >
      <View className="flex flex-row align-center gap-2">
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View
            style={{ width: 40, height: 40 }}
            className="bg-black-80 h-full rounded-full justify-center items-center"
          >
            <Text
              className="text-brand-green text-primary"
              style={{ fontSize: 22 }}
            >
              {getInitials(name)}
            </Text>
          </View>
        )}

        <View>
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.subTitle}>{formatTimeAgo(createdAt)}</Text>
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
