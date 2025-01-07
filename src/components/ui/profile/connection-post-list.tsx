import { SocialPost } from "@/api/@types/models";
import { getUserPosts } from "@/api/social/post/get-user-posts";
import { useAuth } from "@/hooks/use-auth";
import { replaceMediaUrl } from "@/lib/utils";
import { colors } from "@/styles/colors";
import { router } from "expo-router";
import React, { forwardRef, Fragment, memo } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { useInfiniteQuery } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { TimelineType } from "@/api/@types/enums";
import { Video } from "lucide-react-native";

const w = Dimensions.get("window").width;

type Props = {
  userId: number;
  data: SocialPost;
  index: number;
};

const ConnectionPostList = forwardRef<Animated.FlatList<SocialPost>, Props>(
  ({ userId, data, index }, ref) => {
    if (data.is_compressing) {
      if (data.id !== userId) return null;

      return (
        <View className="mb-1 bg-black-90">
          <View
            className="flex flex-row justify-center items-center"
            style={styles.image}
          >
            <ActivityIndicator size="small" color={colors.brand.green} />
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
              type: TimelineType.SOCIAL,
              index: index,
            },
          })
        }
        className="m-1"
      >
        {data?.file?.type === "image" ? (
          <Image
            source={{ uri: data?.file?.file }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <Fragment>
            <Image
              source={{ uri: replaceMediaUrl(data?.file?.file) }}
              style={styles.image}
              resizeMode="cover"
            />

            {data.file.type === "video" && (
              <View style={styles.videoIconContainer}>
                <Video size={18} color={colors.brand.white} />
              </View>
            )}
          </Fragment>
        )}
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  image: {
    height: 140,
    width: "100%",
    borderRadius: 4,
  },
  videoIconContainer: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 4,
    borderRadius: 9999,
  },
});

export default memo(ConnectionPostList);
