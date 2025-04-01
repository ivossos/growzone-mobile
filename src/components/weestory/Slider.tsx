import React, { useEffect, useState } from "react";
import { View, Image, Text, FlatList, TouchableOpacity } from "react-native";
import WeestoryIcon from "@/assets/icons/weestory-icon.svg";
import AddWeestoryIcon from "@/assets/icons/add-weestory-icon.svg";
import { getReels } from "@/api/social/post/get-reels";

import { getInitials } from "@/lib/utils";

interface StoryItemProps {
  name?: string;
  username?: string;
  avatar?: { image: string };
  isAddButton?: boolean;
}

const StoryItem = ({ isAddButton, username, avatar, name }: StoryItemProps) => {
  if (isAddButton) {
    return (
      <TouchableOpacity
        className="items-center mx-2 gap-2"
        onPress={() => console.log("adiciona um novo weestory")}
      >
        <View className="w-20 h-20 rounded-full border-2 bg-black-80 p-1 items-center justify-center">
          <AddWeestoryIcon />
        </View>
        <Text className="text-white text-xs mt-1">Adicionar</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      className="items-center mx-2 gap-2"
      onPress={() => console.log("ver um weestory do", username)}
    >
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
};

export default function WeestoriesList() {
  const [weestory, setWeestory] = useState<any>([]);

  const fetchStoriesData = async ({ pageParam = 0 }: any) => {
    const weedz = await getReels({ skip: pageParam, limit: 10 });
    setWeestory(weedz);
  };

  useEffect(() => {
    fetchStoriesData({ pageParam: 0 });
  }, []);

  const weestories = [{ id: "add-story", isAddButton: true }, ...weestory];

  return (
    <View className="py-4 p-4">
      <View className="flex-row gap-2">
        <WeestoryIcon />
        <Text className="text-lg text-white font-semibold pb-5">Weestory</Text>
      </View>
      <FlatList
        data={weestories}
        horizontal
        renderItem={({ item }) =>
          item.isAddButton ? (
            <StoryItem isAddButton />
          ) : (
            <StoryItem
              name={item.user.name}
              username={item.user.username}
              avatar={item.user.image}
            />
          )
        }
        keyExtractor={(item) => String(item.id)}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}
