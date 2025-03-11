import React, { useEffect, useRef, useState } from "react";
import { useVideoPlayer, VideoView } from "expo-video";
import {
  View,
  StyleSheet,
  Pressable,
  AppState,
  Dimensions,
  Platform,
} from "react-native";
import Slider from "@react-native-community/slider";
import { useEventListener } from "expo";
import { usePlayerContext } from "@/context/player-context";
import { colors } from "@/styles/colors";
const isAndroid = Platform.OS === "android";

interface VideoPlayerProps {
  uri: string;
  videoId: number;
  playerRef: any;
  progressBar?: boolean;
  progressBarBottom?: number;
  playVideo?: () => void;
  isVisible: boolean;
  index?: number;
}

const VideoPlayer = ({
  uri,
  videoId,
  playerRef,
  progressBar,
  progressBarBottom,
  playVideo,
  isVisible,
  index = 0,
}: VideoPlayerProps) => {
  const { isMuted } = usePlayerContext();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const player = useVideoPlayer(uri, (player) => {
    player.loop = true;
    player.muted = isMuted;
    player.timeUpdateEventInterval = 2;
    player.volume = 1.0;
    if (isVisible) player.play();
  });

  const togglePlayPause = () => {
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

  useEventListener(player, "statusChange", ({ status: statusChangeValue }) => {
    const readyToStartVideo = statusChangeValue === "readyToPlay";

    if (readyToStartVideo && playVideo) {
      playVideo();
    }
  });

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "active" && isVisible) {
        player.muted = isMuted;
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
  }, [isVisible, player]);

  useEventListener(
    player,
    "timeUpdate",
    ({ currentTime, bufferedPosition }) => {
      if (isAndroid) return;

      if (currentTime && bufferedPosition) {
        setCurrentTime(currentTime);
        setDuration(bufferedPosition);
      }
    }
  );

  useEffect(() => {
    if (isVisible) {
      player.play();
    } else {
      player.pause();
    }
  }, [isVisible]);

  useEffect(() => {
    if (isMuted) {
      player.muted = true;
    } else {
      player.muted = false;
    }
  }, [isMuted]);

  useEffect(() => {
    const playerKey = `${videoId}-${index}`;
    playerRef.current.set(playerKey, player);
    return () => {
      playerRef.current.delete(playerKey);
    };
  }, [videoId, index, player, playerRef]);

  return (
    <Pressable onPress={togglePlayPause}>
      <VideoView
        contentFit="cover"
        player={player}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        nativeControls={false}
        style={styles.video}
      />
      {progressBar && (
        <View style={[styles.sliderContainer, { bottom: progressBarBottom }]}>
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
  container: {
    width: "100%",
    height: Dimensions.get("window").height,
    backgroundColor: colors.black[100],
    justifyContent: "center",
    alignItems: "center",
  },
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
