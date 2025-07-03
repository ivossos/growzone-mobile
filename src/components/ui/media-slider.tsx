import { PostType } from "@/api/@types/enums";
import {
  GrowPostDetail,
  PostDetail,
  SocialPostFile,
} from "@/api/@types/models";
import VideoPlayer from "@/components/player/Video";
import { colors } from "@/styles/colors";
import Carousel from "pinar";
import React, { memo } from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import MuteToggleButton from "./mute-toggle-button";

interface MediaSliderProps {
  post: GrowPostDetail | PostDetail;
  postType: PostType;
  items: SocialPostFile[];
  postId: number;
  playerRef: any;
  isVisible: boolean;
  onVideoChange: (postId: number, videoIndex: number) => void;
}

const MediaSlider = ({
  post,
  items,
  postType,
  playerRef,
  postId,
  isVisible,
  onVideoChange,
}: MediaSliderProps) => {
  const handleIndexChange = ({ index }: { index: number; total: number }) => {
    onVideoChange(postId, index);
  };

  const RenderItem = memo(
    ({ item, index }: { item: SocialPostFile; index: number }) => {
      if (item.type === "image") {
        return (
          <View style={[styles.item, { flex: 1 }]}>
            <Image
              source={{ uri: item.file }}
              style={[styles.mediaImage, { flex: 1 }]}
              resizeMode="cover"
            />
            <View className="absolute bottom-6 w-full flex flex-row justify-between items-center px-4">
              {postType === PostType.GROW_POST && (
                <View className="border border-black-80 bg-white px-2 py-1 rounded-full">
                  <Text className="text-black text-base">
                    {(post as GrowPostDetail).phase.name}
                  </Text>
                </View>
              )}
            </View>
          </View>
        );
      }

      return (
        <View className="relative">
          <View style={styles.item}>
            <VideoPlayer
              playerRef={playerRef}
              uri={item.file}
              videoId={postId}
              isVisible={isVisible}
              index={index}
            />
          </View>

          <View className="absolute bottom-4 w-full flex flex-row justify-between items-center px-4">
            {postType === PostType.GROW_POST && (
              <View className="border border-black-80 bg-white px-2 py-1 rounded-full">
                <Text className="text-black text-base">
                  {(post as GrowPostDetail).phase.name}
                </Text>
              </View>
            )}

            <MuteToggleButton />
          </View>
        </View>
      );
    }
  );

  if (items.length === 1) {
    return <RenderItem item={items[0]} index={0} />;
  }

  return (
    <Carousel
      style={styles.carousel}
      showsControls={false}
      dotStyle={styles.dotStyle}
      activeDotStyle={[styles.dotStyle, { backgroundColor: colors.primary }]}
      onIndexChanged={handleIndexChange}
    >
      {items.map((item, index) => (
        <RenderItem key={item.id} index={index} item={item} />
      ))}
    </Carousel>
  );
};

export default memo(MediaSlider);

const screenWidth = Dimensions.get("window").width;
const aspectRatioHeight = screenWidth * 1.25;

const styles = StyleSheet.create({
  dotStyle: {
    width: 8,
    height: 8,
    backgroundColor: colors.black[80],
    marginHorizontal: 4,
    borderRadius: 50,
    marginBottom: -90,
  },
  carousel: {
    width: screenWidth,
    height: aspectRatioHeight,
    alignSelf: "center",
  },
  item: {
    width: screenWidth,
    height: aspectRatioHeight,
    alignSelf: "center",
  },
  mediaWrapper: {
    width: screenWidth,
    height: aspectRatioHeight,
    alignSelf: "center",
  },
  mediaImage: {
    width: screenWidth,
    height: aspectRatioHeight,
    alignSelf: "center",
  },
});
