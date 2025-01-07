import { GrowPost, VideoPlayerHandle } from "@/api/@types/models";
import { colors } from "@/styles/colors";
import { Link } from "expo-router";
import { CalendarDaysIcon, Video } from "lucide-react-native";
import { useRef } from "react";
import { Image, Text, View } from "react-native";
import VideoPlayer from "../VideoPlayer";
import { replaceMediaUrl } from "@/lib/utils";

export function TrendingGrowCard({ item }: { item: GrowPost }) {
  return (
    <Link href={{ pathname: "/post/[id]/grow", params: { id: item.post_id } }}>
      <View className="flex flex-col gap-2 w-[155px]">
        <View className="relative">
          <Image
            source={{
              uri:
                item.file.type === "image"
                  ? item.file.file
                  : replaceMediaUrl(item.file.file),
            }}
            style={{
              height: 224,
              width: 155,
            }}
            resizeMode="cover"
          />

          <View className="absolute bottom-4 w-full flex flex-row justify-between items-center px-4">
            <View className="border border-black-80 bg-white px-2 py-1 rounded-full">
              <Text className="text-black text-xs ">{item.phase.name}</Text>
            </View>

            {item.file.type === "video" && (
              <View style={{
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                padding: 4,
                borderRadius: 9999,
              }}>
                <Video size={18} color={colors.brand.white} />
              </View>
            )}
          </View>
        </View>

        <View className="flex flex-row items-center justify-between gap-2">
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
      </View>
    </Link>
  );
}
