import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import WeestoryIcon from "@/assets/icons/weestory-icon.svg";
import AddWeestoryIcon from "@/assets/icons/add-weestory-icon.svg";
import { getReels } from "@/api/social/post/get-reels";
import { router } from "expo-router";

import WeestoryModal from "./WeestoryModal";

export default function WeestoriesList() {
  const [weestory, setWeestory] = useState<any>([]);
  const [content, setContent] = useState([
    {
      content:
        "https://s3-alpha-sig.figma.com/img/981b/fd78/ee8012bd4542b108adc36f48335c5f2a?Expires=1744588800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=oDy-lRU3Pqy9MeUzMKDQa9DayglE1AEwBxnrqpCbJQFtIP79gOCQ2L9JkD0FEe7N7H2D7SIJbGJmbawHp5EJ2FLhoA-IfW25R0MZAmdEvKbJJpKCwmBUN0Fpo39RL1YvKRfe5bxLNqtL7ePdSx0vfpFo5-bbJ3-xBZ~FFf~Nw6S3DpPp8xaszgXiAnvU1N5c5-sDttV6lw0~u3BJAsY-iOf86Qsfj~JoZzknEJi0jBTxugK6WSz~o2BZfeIx0pBwlgY6585RTAs6MczHPaPxCzI9oLc8y2v7zPNSZo5CPRb2eZss6A-5duH-Jlu7fam2EVJBeBCzwEUi7s6qC~vs4A__",
      type: "image",
      finish: 0,
    },
    {
      content:
        "https://stream.mux.com/xno9Qw2Z6W8eA8d4JOz62E5RM01ZqjLOC01IdWZDh6TTs.m3u8",
      type: "video",
      finish: 0,
    },
    {
      content:
        "https://s3-alpha-sig.figma.com/img/981b/fd78/ee8012bd4542b108adc36f48335c5f2a?Expires=1744588800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=oDy-lRU3Pqy9MeUzMKDQa9DayglE1AEwBxnrqpCbJQFtIP79gOCQ2L9JkD0FEe7N7H2D7SIJbGJmbawHp5EJ2FLhoA-IfW25R0MZAmdEvKbJJpKCwmBUN0Fpo39RL1YvKRfe5bxLNqtL7ePdSx0vfpFo5-bbJ3-xBZ~FFf~Nw6S3DpPp8xaszgXiAnvU1N5c5-sDttV6lw0~u3BJAsY-iOf86Qsfj~JoZzknEJi0jBTxugK6WSz~o2BZfeIx0pBwlgY6585RTAs6MczHPaPxCzI9oLc8y2v7zPNSZo5CPRb2eZss6A-5duH-Jlu7fam2EVJBeBCzwEUi7s6qC~vs4A__",
      type: "image",
      finish: 0,
    },
    {
      content:
        "https://stream.mux.com/cIcgMxM7s526fkOQISJhfl9eEO4hgpP43600P28umfM00.m3u8",
      type: "video",
      finish: 0,
    },
    {
      content:
        "https://s3-alpha-sig.figma.com/img/981b/fd78/ee8012bd4542b108adc36f48335c5f2a?Expires=1744588800&Key-Pair-Id=APKAQ4GOSFWCW27IBOMQ&Signature=oDy-lRU3Pqy9MeUzMKDQa9DayglE1AEwBxnrqpCbJQFtIP79gOCQ2L9JkD0FEe7N7H2D7SIJbGJmbawHp5EJ2FLhoA-IfW25R0MZAmdEvKbJJpKCwmBUN0Fpo39RL1YvKRfe5bxLNqtL7ePdSx0vfpFo5-bbJ3-xBZ~FFf~Nw6S3DpPp8xaszgXiAnvU1N5c5-sDttV6lw0~u3BJAsY-iOf86Qsfj~JoZzknEJi0jBTxugK6WSz~o2BZfeIx0pBwlgY6585RTAs6MczHPaPxCzI9oLc8y2v7zPNSZo5CPRb2eZss6A-5duH-Jlu7fam2EVJBeBCzwEUi7s6qC~vs4A__",
      type: "image",
      finish: 0,
    },
    {
      content:
        "https://stream.mux.com/v97ADCGxFoNGbKOAuYY8u6JQNmSqXgmiLC4RgFzvB4k.m3u8",
      type: "video",
      finish: 0,
    },
  ]);

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
            <TouchableOpacity
              className="items-center mx-2 gap-2"
              onPress={() => router.push("/weestory")}
            >
              <View className="w-20 h-20 rounded-full border-2 bg-black-80 p-1 items-center justify-center">
                <AddWeestoryIcon />
              </View>
              <Text className="text-white text-xs mt-1">Adicionar</Text>
            </TouchableOpacity>
          ) : (
            <WeestoryModal
              name={item.user.name}
              username={item.user.username}
              avatar={item.user.image}
              content={content}
              setContent={setContent}
            />
          )
        }
        keyExtractor={(item) => String(item.id)}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}
