import React, { useEffect, useRef, useState } from "react";
import { useVideoPlayer, VideoView } from "expo-video";
import { View, StyleSheet, Pressable, AppState } from "react-native";
import Slider from "@react-native-community/slider";
import { useEventListener } from "expo";
import { usePlayerContext } from "@/context/player-context";

interface VideoPlayerProps {
  uri: string;
  videoId: number;
  playerRef: any;
  progressBar?: boolean;
  progressBarBottom?: number;
  playVideo?: () => void;
  isVisible: boolean;
}

const VideoPlayer = ({
  uri,
  videoId,
  playerRef,
  progressBar,
  progressBarBottom,
  playVideo,
  isVisible,
}: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const player = useVideoPlayer(uri, (player) => {
    player.loop = true;
    player.muted = false;
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
        player.muted = false;
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
    playerRef.current.set(videoId, player);
    return () => {
      playerRef.current.delete(videoId);
    };
  }, [videoId, player, playerRef]);

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
