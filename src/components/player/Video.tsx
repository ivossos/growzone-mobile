import { useState, useEffect, useMemo } from "react";
import { View, StyleSheet, Pressable, AppState, Platform } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import Slider from "@react-native-community/slider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useEventListener } from "expo";

const VideoPlayer = ({
  videoId,
  uri,
  isVisible,
  playerRef,
  showProgressBar,
  isMuted,
  playVideo,
}: {
  videoId: number;
  uri: string;
  isVisible: boolean;
  playerRef: any;
  showProgressBar?: boolean;
  isMuted?: boolean;
  playVideo?: () => void;
}) => {
  const params = useLocalSearchParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const insets = useSafeAreaInsets();
  const player = useVideoPlayer(uri, (player) => {
    player.loop = true;
    player.muted = isMuted || false;
    player.timeUpdateEventInterval = 2;
    player.volume = 1.0;
    if (isVisible) player.play();
  });

  const handleClickPlayPause = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handlerTime = (value: number) => {
    if (playerRef.current) {
      player.currentTime = value;
    }
  };

  useEventListener(
    player,
    "timeUpdate",
    ({ currentTime, bufferedPosition }) => {
      if (currentTime && bufferedPosition) {
        setCurrentTime(currentTime);
        setDuration(bufferedPosition);
      }
    }
  );

  useEventListener(player, "statusChange", ({ status: statusChangeValue }) => {
    const readyToStartVideo = statusChangeValue === "readyToPlay";

    if (readyToStartVideo && playVideo) {
      playVideo();
    }
  });

  useEffect(() => {
    if (isVisible) {
      player.play();
    } else {
      player.pause();
    }
  }, [isVisible]);

  useEffect(() => {
    playerRef.current.set(videoId, player);
    return () => {
      playerRef.current.delete(videoId);
    };
  }, [videoId, player, playerRef]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "active" && isVisible) {
        player.muted = isMuted || false;
        player.currentTime = 0;
        player.play();
        setDuration(0);
        setCurrentTime(0);
      } else {
        player.pause();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, [isVisible, player, isMuted]);

  useEffect(() => {
    player.muted = isMuted || false;
  }, [isMuted, player]);

  const bottom = useMemo(() => {
    switch (params.type) {
      case "weedz":
        return insets.bottom;

      default:
        return Platform.OS === "android"
          ? insets.bottom + 30
          : insets.bottom - 30;
    }
  }, [params]);

  return (
    <Pressable onPress={handleClickPlayPause}>
      <VideoView
        contentFit="cover"
        player={player}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        nativeControls={false}
        style={styles.video}
      />
      {showProgressBar && (
        <View style={[styles.sliderContainer, { bottom: bottom }]}>
          <View style={{ flex: 1 }}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration}
              value={currentTime}
              onValueChange={handlerTime}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#555555"
              thumbTintColor="#FFFFFF"
            />
          </View>
        </View>
      )}
    </Pressable>
  );
};

export default VideoPlayer;

const styles = StyleSheet.create({
  video: {
    width: "100%",
    height: "100%",
  },
  sliderContainer: {
    position: "absolute",
    flexDirection: "row",
    alignContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  slider: {
    width: "100%",
    height: 60,
  },
});
