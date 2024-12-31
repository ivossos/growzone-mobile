import { GrowPost, VideoPlayerHandle } from "@/api/@types/models";
import { colors } from "@/styles/colors";
import { Link } from "expo-router";
import { CalendarDaysIcon } from "lucide-react-native";
import { useRef } from "react";
import { Image, Text, View } from "react-native";
import VideoPlayer from "../VideoPlayer";

export function TrendingGrowCard({ item }: { item: GrowPost }) {
  const videoRef = useRef<VideoPlayerHandle | null>(null);
  return (
    <Link href={{ pathname: "/post/[id]/grow", params: { id: item.post_id } }}>
      <View className="flex flex-col gap-2 w-[155px]">
        <View className="relative">
          {item.file.type === "image" ? (
            <Image
              source={{ uri: item.file.file }}
              style={{
                height: 224,
                width: 155,
              }}
              resizeMode="cover"
            />
          ) : (
            <VideoPlayer
              ref={(ref) => (videoRef.current = ref)}
              source={{ uri: item?.file?.file }}
              controls={{
                showProgressBar: true,
              }}
              loop={false}
            />
          )}

          <View className="absolute bottom-4 left-2 border border-black-100 bg-white px-2 py-1 rounded-full">
            <Text className="text-black text-xs ">{item.phase.name}</Text>
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
