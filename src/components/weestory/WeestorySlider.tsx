import React, { useState } from "react";
import { View, FlatList } from "react-native";
import { router } from "expo-router";

import WeestoryModal from "./WeestoryModal";
import WeestoryAvatar from "./WeestoryAvatar";

const users = [
  {
    id: "1",
    name: "Diego",
    username: "diego",
    avatar:
      "https://dev.img.growzone.co/media/user_images/90f0d201-e509-4134-9ecb-8ac0976fd50a.webp",
    stories: [
      {
        type: "image",
        uri: "https://s3-alpha-sig.figma.com/img/981b/fd78/ee8012bd4542b108adc36f48335c5f2a?Expires=1744588800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=oDy-lRU3Pqy9MeUzMKDQa9DayglE1AEwBxnrqpCbJQFtIP79gOCQ2L9JkD0FEe7N7H2D7SIJbGJmbawHp5EJ2FLhoA-IfW25R0MZAmdEvKbJJpKCwmBUN0Fpo39RL1YvKRfe5bxLNqtL7ePdSx0vfpFo5-bbJ3-xBZ~FFf~Nw6S3DpPp8xaszgXiAnvU1N5c5-sDttV6lw0~u3BJAsY-iOf86Qsfj~JoZzknEJi0jBTxugK6WSz~o2BZfeIx0pBwlgY6585RTAs6MczHPaPxCzI9oLc8y2v7zPNSZo5CPRb2eZss6A-5duH-Jlu7fam2EVJBeBCzwEUi7s6qC~vs4A__",
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
    avatar:
      "https://dev.img.growzone.co/media/user_images/c3a4b411-c2d9-41bf-b65b-b01202364d29.webp",
    stories: [
      {
        type: "image",
        uri: "https://s3-alpha-sig.figma.com/img/981b/fd78/ee8012bd4542b108adc36f48335c5f2a?Expires=1744588800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=oDy-lRU3Pqy9MeUzMKDQa9DayglE1AEwBxnrqpCbJQFtIP79gOCQ2L9JkD0FEe7N7H2D7SIJbGJmbawHp5EJ2FLhoA-IfW25R0MZAmdEvKbJJpKCwmBUN0Fpo39RL1YvKRfe5bxLNqtL7ePdSx0vfpFo5-bbJ3-xBZ~FFf~Nw6S3DpPp8xaszgXiAnvU1N5c5-sDttV6lw0~u3BJAsY-iOf86Qsfj~JoZzknEJi0jBTxugK6WSz~o2BZfeIx0pBwlgY6585RTAs6MczHPaPxCzI9oLc8y2v7zPNSZo5CPRb2eZss6A-5duH-Jlu7fam2EVJBeBCzwEUi7s6qC~vs4A__",
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

  return (
    <View style={{ padding: 10, flexDirection: "row" }}>
      <WeestoryAvatar addButton onPress={() => router.push("/weestory")} />
      <FlatList
        horizontal
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }: any) => (
          <WeestoryAvatar
            name={item.name}
            username={item.username}
            avatar={{
              image: item.avatar,
            }}
            onPress={() => setSelectedUserIndex(index)}
          />
        )}
      />

      {selectedUserIndex !== null && (
        <WeestoryModal
          users={users}
          initialUserIndex={selectedUserIndex}
          onClose={handleClose}
        />
      )}
    </View>
  );
}
