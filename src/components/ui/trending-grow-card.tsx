import { GrowPost, VideoPlayerHandle } from "@/api/@types/models";
import { colors } from "@/styles/colors";
import { Link, router } from "expo-router";
import { CalendarDaysIcon, Video } from "lucide-react-native";
import { Fragment, useCallback, useRef } from "react";
import { Image, Pressable, Text, useWindowDimensions, View } from "react-native";
import VideoPlayer from "../VideoPlayer";
import { replaceMediaUrl } from "@/lib/utils";

export function TrendingGrowCard({ item }: { item: GrowPost }) {

  
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = screenWidth * 0.42;
  const handlerPress = useCallback(() => {
    router.push({
      pathname: "/post/[id]/grow",
      params: { id: item.post_id },
    });
  }, [item]);

  return (
    <Pressable
      onPress={handlerPress}
      style={{ width: cardWidth }}
      className="bg-black-100 border border-black-90 rounded-lg shadow-lg gap-4"
    >
      <Fragment>
        <View className="relative">
          <Image
            source={{
              uri:
                item.file.type === "image"
                  ? item.file.file
                  : replaceMediaUrl(item.file.file),
            }}
            className="w-full h-64 rounded-lg"
            resizeMode="cover"
          />

          <View className="absolute bottom-4 w-full flex flex-row justify-between items-center px-4">
            <View className="border border-black-80 bg-white px-2 py-1 rounded-full">
              <Text className="text-black text-xs ">{item.phase.name}</Text>
            </View>

            {item.file.type === "video" && (
              <View
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  padding: 4,
                  borderRadius: 9999,
                }}
              >
                <Video size={18} color={colors.brand.white} />
              </View>
            )}
          </View>
        </View>

        <View className="p-2 flex-row justify-between items-center gap-2">
          {item.strain && (
            <Text
              className="text-xs text-brand-grey font-normal"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ maxWidth: 70 }}
            >
              {item.strain.name}
            </Text>
          )}

          <View className="flex flex-row item-center gap-1 border border-black-80 bg-black-100 px-2 py-1 rounded-full">
            <CalendarDaysIcon size={12} color={colors.brand.green} />
            <Text className="text-brand-green text-xs ">
              {item.day === 1 ? `${item.day} dia` : `${item.day} dias`}
            </Text>
          </View>
        </View>
      </Fragment>
    </Pressable>
  );
}
