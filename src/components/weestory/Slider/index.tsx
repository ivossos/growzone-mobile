import React, { useEffect, useState } from "react";
import { View, FlatList } from "react-native";
import { router } from "expo-router";

import { getWeestory } from "@/api/social/weestory/get-weestory";

import ModalWeestory from "../ModalWeestory";
import Avatar from "../Avatar";

export default function WeeStorySlider({
  refreshPage,
}: {
  refreshPage: boolean;
}) {
  const [weestories, setWeestories] = useState<any>([]);
  const [selectedUserIndex, setSelectedUserIndex] = useState<number | null>(
    null
  );

  async function listWeestories() {
    try {
      const response = await getWeestory({});
      setWeestories(response);
    } catch (error) {
      setWeestories([]);
    }
  }

  const handleClose = () => {
    setSelectedUserIndex(null);
  };

  useEffect(() => {
    if (refreshPage) {
      listWeestories();
    }
  }, [refreshPage]);

  useEffect(() => {
    listWeestories();
  }, []);

  const weestory = [{ id: "0", isAddButton: true }, ...weestories];

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
              name={item.name || item.username}
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
          users={weestories}
          initialUserIndex={selectedUserIndex}
          onClose={handleClose}
        />
      )}
    </View>
  );
}
