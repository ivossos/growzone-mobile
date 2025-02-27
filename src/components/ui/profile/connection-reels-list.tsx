import { TimelineType } from "@/api/@types/enums";
import { ReelsDetail } from "@/api/@types/models";
import { useAuth } from "@/hooks/use-auth";
import { getMuxThumbnailUrl } from "@/lib/utils";
import { colors } from "@/styles/colors";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Eye } from "lucide-react-native";
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
  data: ReelsDetail;
  index: number;
};

const ConnectionReelstList = forwardRef<Animated.FlatList<ReelsDetail>, Props>(
  ({ userId, data, index }, ref) => {
    const { user } = useAuth();

    if (data.is_compressing) {
      if (user.id != userId) return null;

      return (
        <View
          className="flex flex-row justify-center items-center bg-black-90 m-1"
          style={styles.image}
        >
          <ActivityIndicator size="small" color={colors.brand.green} />
        </View>
      );
    }

    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/post/users/[id]/reels",
            params: {
              id: data.post_id,
              userId: userId,
              type: "postUsers",
              index: index,
              uri: data?.file?.file,
            },
          })
        }
        className="m-1"
      >
        <Image
          source={{ uri: getMuxThumbnailUrl(data?.file?.file) }}
          style={styles.image}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["rgba(255, 255, 255, 0.16)", "rgba(255, 255, 255, 0.32)"]}
          style={styles.blurContainer}
        >
          <Eye size={18} color={colors.brand.white} />
          <Text className="text-white text-base font-medium">
            {data.view_count || 0}
          </Text>
        </LinearGradient>
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
  blurContainer: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 9999,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    shadowColor: "rgba(0, 0, 0, 0.16)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 4,
  },
});

export default memo(ConnectionReelstList);
