import { TimelineType } from "@/api/@types/enums";
import { GrowPostDetail } from "@/api/@types/models";
import { useAuth } from "@/hooks/use-auth";
import { getMuxThumbnailUrl } from "@/lib/utils";
import { colors } from "@/styles/colors";
import { useRouter } from "expo-router";
import { CalendarDaysIcon } from "lucide-react-native";
import React, { forwardRef, memo } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated from "react-native-reanimated";

const numColumns = 2;
const w = Dimensions.get("window").width;
const itemWidth = w / numColumns;
const itemHeight = itemWidth * 1.25;

type Props = {
  userId: number;
  data: GrowPostDetail;
  index: number;
};

const ConnectionGrowPostList = forwardRef<
  Animated.FlatList<GrowPostDetail>,
  Props
>(({ userId, data, index }, ref) => {
  const router = useRouter();
  const { user } = useAuth();

  if (data.is_compressing) {
    if (user.id != userId) return null;
    return (
      <View className="flex flex-col gap-1 m-2">
        <View>
          <View>
            <View
              className="flex flex-row justify-center items-center bg-black-90"
              style={styles.image}
            >
              <ActivityIndicator size="small" color={colors.brand.green} />
            </View>

            <View className="absolute bottom-4 left-2 bg-white px-2 py-1 rounded-full">
              <Text className="text-black text-xs ">{data.phase.name}</Text>
            </View>
          </View>
        </View>

        <View className="flex flex-row justify-between items-center gap-2">
          {data.strain && (
            <Text
              className="text-base text-brand-grey font-normal w-24 truncate"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.description}
            >
              {data.strain.name}
            </Text>
          )}

          <View className="flex flex-row item-center gap-1 border border-black-80 bg-black-100 px-2 py-1 rounded-full">
            <CalendarDaysIcon size={12} color={colors.brand.green} />
            <Text className="text-brand-green text-xs ">
              {data.day === 1 ? `${data.day} dia` : `${data.day} dias`}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const [file] = data.files;

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/post/[id]/timeline/[userId]",
          params: {
            id: data.post_id,
            userId: userId,
            type: TimelineType.GROW,
            index: index,
          },
        })
      }
      className="gap-1 mx-1 py-3"
    >
      <View>
        {file.type === "image" ? (
          <Image
            source={{ uri: file.file }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <Image
            source={{ uri: getMuxThumbnailUrl(file?.file) }}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        <View className="absolute bottom-4 left-2 bg-white px-2 py-1 rounded-full">
          <Text className="text-black text-xs ">{data.phase.name}</Text>
        </View>
      </View>

      <View>
        <View className="flex flex-row justify-between items-center gap-2">
          {data.strain && (
            <Text
              className="text-base text-brand-grey font-normal w-24 truncate"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.description}
            >
              {data.strain.name}
            </Text>
          )}

          <View className="flex flex-row item-center gap-1 border border-black-80 bg-black-100 px-2 py-1 rounded-full">
            <CalendarDaysIcon size={12} color={colors.brand.green} />
            <Text className="text-brand-green text-xs ">
              {data.day === 1 ? `${data.day} dia` : `${data.day} dias`}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black[100],
  },
  image: {
    width: itemWidth,
    height: itemHeight,
    borderRadius: 16,
  },
  description: {
    maxWidth: w / numColumns,
  },
});

export default memo(ConnectionGrowPostList);
