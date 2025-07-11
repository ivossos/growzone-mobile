import { TimelineType } from "@/api/@types/enums";
import { PostDetail } from "@/api/@types/models";
import { getMuxThumbnailUrl } from "@/lib/utils";
import { colors } from "@/styles/colors";
import { router } from "expo-router";
import { Video } from "lucide-react-native";
import React, { forwardRef, Fragment, memo } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Animated from "react-native-reanimated";

import { Dimensions } from "react-native";

const gap = 7;
const screenWidth = Dimensions.get("window").width;
const numColumns = 3;
const totalSpacing = gap * (numColumns + 1);
const itemWidth = (screenWidth - totalSpacing) / numColumns;
const itemHeight = itemWidth * 1.25;

type Props = {
  userId: number;
  data: PostDetail;
  index: number;
};

const ConnectionPostList = forwardRef<Animated.FlatList<PostDetail>, Props>(
  ({ userId, data, index }, ref) => {
    if (data.is_compressing) {
      return (
        <View className="m-1 bg-black-90">
          <View
            className="flex flex-row justify-center items-center"
            style={styles.image}
          >
            <ActivityIndicator size="small" color={colors.brand.green} />
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
              type: TimelineType.SOCIAL,
              index: index,
            },
          })
        }
        className="m-1"
      >
        {file.type === "image" ? (
          <Image
            source={{ uri: file.file }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <Fragment>
            <Image
              source={{ uri: getMuxThumbnailUrl(file.file) }}
              style={styles.image}
              resizeMode="cover"
            />

            {file.type === "video" && (
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
    width: itemWidth,
    height: itemHeight,
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
