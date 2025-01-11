import { StyleSheet, Image, View, TouchableOpacity, Text } from "react-native";
import React, {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Carousel from "pinar";
import { colors } from "@/styles/colors";
import {
  GrowPostDetail,
  PostDetail,
  SocialPostFile,
  VideoPlayerHandle,
} from "@/api/@types/models";
import VideoPlayer from "../VideoPlayer";
import { useVideoPlayerContext } from "@/context/video-player-context";
import { Volume2, VolumeX } from "lucide-react-native";
import { PostType } from "@/api/@types/enums";

interface MediaSliderProps {
  post: GrowPostDetail | PostDetail;
  postType: PostType;
  items: SocialPostFile[];
  postId: number;
  audioMute: boolean;
  handlerAudioMute: (muted: boolean) => void;
}

const MediaSlider = ({
  post,
  items,
  audioMute,
  postType,
  handlerAudioMute,
}: MediaSliderProps) => {
  const { pauseVideo, toggleAudioMute, playVideo, setPlayer } =
    useVideoPlayerContext();

  const [activeIndex, setActiveIndex] = useState(0);

  const handleIndexChange = useCallback(
    ({ index }: { index: number }) => {
      if (index !== activeIndex) {
        pauseVideo();
      }

      if (index >= 0 && index < items.length) {
        const item = items[index];
        if (item.type === "video") {
          pauseVideo();
          setPlayer(item.player);

          toggleAudioMute(audioMute);

          playVideo();

          setActiveIndex(index);
        } else {
          pauseVideo();
          setPlayer(undefined);
        }
      }
    },
    [items, audioMute, activeIndex]
  );

  const RenderItem = memo(
    ({ item, index }: { item: SocialPostFile; index: number }) => {
      if (item.type === "image") {
        return (
          <View className="relative">
            <Image
              source={{ uri: item.file }}
              style={styles.item}
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
          <VideoPlayer
            styleContainer={styles.item}
            resizeMode="cover"
            player={item.player}
            autoplay={index === activeIndex}
            loop
            controls={{
              showProgressBar: false,
              showButtonPlay: false,
            }}
            muted={audioMute}
          />

          <View className="absolute bottom-4 w-full flex flex-row justify-between items-center px-4">
            {postType === PostType.GROW_POST && (
              <View className="border border-black-80 bg-white px-2 py-1 rounded-full">
                <Text className="text-black text-base">
                  {(post as GrowPostDetail).phase.name}
                </Text>
              </View>
            )}

            <View className="border border-black-80 bg-white px-4 py-2 rounded-full">
              <TouchableOpacity onPress={() => handlerAudioMute(!audioMute)}>
                {audioMute ? (
                  <VolumeX size={20} color={colors.brand.black} />
                ) : (
                  <Volume2 size={20} color={colors.brand.black} />
                )}
              </TouchableOpacity>
            </View>
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
    height: 350,
    width: "100%",
    borderRadius: 16,
  },
  item: {
    width: "100%",
    height: 350,
    borderRadius: 16,
  },
});
