import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import AddWeestoryIcon from "@/assets/icons/add-weestory-icon.svg";
import { getInitials } from "@/lib/utils";

interface AvatarProps {
  addButton?: boolean;
  avatar?: {
    image: {
      image: string;
    };
  };
  name?: string;
  onPress: VoidFunction;
}

export default function Avatar({
  addButton,
  avatar,
  name,
  onPress,
}: AvatarProps) {
  if (addButton) {
    return (
      <TouchableOpacity className="items-center mx-2 gap-2" onPress={onPress}>
        <View className="w-20 h-20 rounded-full border-2 bg-black-80 p-1 items-center justify-center">
          <AddWeestoryIcon />
        </View>
        <Text className="text-white text-sm mt-1">Adicionar</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity className="items-center mx-2 gap-2" onPress={onPress}>
      <View className="w-20 h-20 rounded-full border-2 border-brand-green bg-muted p-1">
        {avatar?.image ? (
          <Image
            source={{ uri: avatar.image?.image }}
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
      <Text className="text-white text-sm mt-1">{name}</Text>
    </TouchableOpacity>
  );
}
