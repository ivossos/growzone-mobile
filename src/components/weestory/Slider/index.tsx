import React, { useState } from "react";
import { View, FlatList } from "react-native";
import { router } from "expo-router";

import ModalWeestory from "../ModalWeestory";
import Avatar from "../Avatar";

const users = [
  {
    id: "1",
    name: "Diego",
    username: "diego",
    backgroundColor: "tomato",
    avatar:
      "https://dev.img.growzone.co/media/user_images/90f0d201-e509-4134-9ecb-8ac0976fd50a.webp",
    stories: [
      {
        type: "image",
        uri: "https://dev.img.growzone.co/media/social_post_files/48a51456-9f77-44c6-9846-8eb325dfa76e.webp",
      },
      {
        type: "video",
        uri: "https://stream.mux.com/xno9Qw2Z6W8eA8d4JOz62E5RM01ZqjLOC01IdWZDh6TTs.m3u8",
      },
    ],
  },
  {
    id: "2",
    name: "Pedro",
    username: "pedro",
    backgroundColor: "skyblue",
    avatar:
      "https://dev.img.growzone.co/media/user_images/c3a4b411-c2d9-41bf-b65b-b01202364d29.webp",
    stories: [
      {
        type: "image",
        uri: "https://dev.img.growzone.co/media/social_post_files/264da6c8-7b02-4565-8f14-592dacbee80e.webp",
      },
      {
        type: "video",
        uri: "https://stream.mux.com/NM00bwHHE4O6JpVLhpr28RTYMhj8vccE5KW9EWtKB02Ro.m3u8",
      },
    ],
  },
];

export default function WeeStorySlider() {
  const [selectedUserIndex, setSelectedUserIndex] = useState<number | null>(
    null
  );

  const handleClose = () => {
    setSelectedUserIndex(null);
  };

  const weestory = [{ id: "0", isAddButton: true }, ...users];

  return (
    <View className="flex-row p-5">
      <FlatList
        horizontal
        data={weestory}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }: any) =>
          item.isAddButton ? (
            <Avatar addButton onPress={() => router.push("/weestory")} />
          ) : (
            <Avatar
              name={item.name}
              avatar={{
                image: item.avatar,
              }}
              onPress={() => setSelectedUserIndex(index - 1)}
            />
          )
        }
      />

      {selectedUserIndex !== null && (
        <ModalWeestory
          users={users}
          initialUserIndex={selectedUserIndex}
          onClose={handleClose}
        />
      )}
    </View>
  );
}
