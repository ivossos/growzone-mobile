import { TimelineType } from "@/api/@types/enums";
import { GrowPost } from "@/api/@types/models";
import { useAuth } from "@/hooks/use-auth";
import { replaceMediaUrl } from "@/lib/utils";
import { colors } from "@/styles/colors";
import { useRouter } from "expo-router";
import { CalendarDaysIcon, } from "lucide-react-native";
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

type Props = {
  userId: number;
  data: GrowPost;
  index: number;
};

const ConnectionGrowPostList = forwardRef<Animated.FlatList<GrowPost>, Props>(
  ({ userId, data, index }, ref) => {
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

    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/post/[id]/timeline/[userId]",
            params: {
              id: data.post_id,
              userId: userId,
              type: TimelineType.GROW,
              index: index
            },
          })
        }
        className="gap-1 mx-1 py-3"
      >
        <View>
          {data.file.type === "image" ? (
            <Image
              source={{ uri: data.file.file }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={{ uri: replaceMediaUrl(data?.file?.file) }}
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
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black[100],
  },
  image: {
    width: "100%",
    height: 224,
    borderRadius: 16,
  },
  description: {
    maxWidth: w / numColumns,
  },
});

export default memo(ConnectionGrowPostList);
