import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import AddWeestoryIcon from "@/assets/icons/add-weestory-icon.svg";
import { getInitials } from "@/lib/utils";

interface WeestoryAvatarProps {
  addButton?: boolean;
  avatar?: {
    image: string;
  };
  name?: string;
  username?: string;
  onPress: VoidFunction;
}

export default function WeestoryAvatar({
  addButton,
  avatar,
  name,
  username,
  onPress,
}: WeestoryAvatarProps) {
  if (addButton) {
    return (
      <TouchableOpacity className="items-center mx-2 gap-2" onPress={onPress}>
        <View className="w-20 h-20 rounded-full border-2 bg-black-80 p-1 items-center justify-center">
          <AddWeestoryIcon />
        </View>
        <Text className="text-white text-xs mt-1">Adicionar</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity className="items-center mx-2 gap-2" onPress={onPress}>
      <View className="w-20 h-20 rounded-full border-2 border-brand-green bg-muted p-1">
        {avatar ? (
          <Image
            source={{ uri: avatar.image }}
            className="w-full h-full rounded-full"
          />
        ) : (
          <View className="w-full bg-black-80 h-full rounded-full justify-center items-center">
            <Text
              className="text-brand-green text-primary"
              style={{ fontSize: 22 }}
            >
              {getInitials(name)}
            </Text>
          </View>
        )}
      </View>
      <Text className="text-white text-xs mt-1">{username}</Text>
    </TouchableOpacity>
  );
}
