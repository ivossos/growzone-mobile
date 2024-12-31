import { StyleSheet, Image } from "react-native";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Carousel from "pinar";

import { colors } from "@/styles/colors";
import { SocialPostFile, VideoPlayerHandle } from "@/api/@types/models";
import VideoPlayer from "../VideoPlayer";
import { View } from "lucide-react-native";

interface MediaSliderProps {
  items: SocialPostFile[];
  postId: number;
}

const MediaSlider = ({ items }: MediaSliderProps) => {
  const videoRef = useRef<VideoPlayerHandle>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [audioMute, setAudioMute] = useState(false);

  const handleIndexChange = useCallback(
    ({ index }: { index: number }) => {
      if (index < 0 || index >= items.length) return;

      const item = items[index];

      if (item?.type === "video") {
        setActiveIndex(index);
      }
    },
    [items, setActiveIndex]
  );

  const handlerMutedVideo = useCallback(() => {
    const mutedValue = !audioMute;
    videoRef.current?.mutedVideo(mutedValue);
    setAudioMute(mutedValue);
  }, [audioMute]);

  const RenderItem = ({
    item,
    index,
  }: {
    item: SocialPostFile;
    index: number;
  }) => {
    const styleComponent: any = {
      width: "100%",
      height: 350,
      borderRadius: 16,
    };
    if (item.type === "image") {
      return (
        <Image
          source={{ uri: item.file }}
          style={styleComponent}
          resizeMode="cover"
        />
      );
    }

    return (
      <VideoPlayer
        ref={videoRef}
        styleContainer={styleComponent}
        resizeMode="cover"
        source={{ uri: item.file }}
        loop
        controls={{
          showMutedButton: false,
          handlerMutedVideo,
          muted: audioMute,
        }}
        muted={audioMute}
      />
    );
  };

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
        <RenderItem key={item.id} item={item} index={index} />
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
    minHeight: 350,
    width: "100%",
    borderRadius: 16,
  },
});
