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
}

const VideoPlayer = ({
  uri,
  videoId,
  playerRef,
  progressBar,
  progressBarBottom,
  playVideo,
}: VideoPlayerProps) => {
  const ref = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const { isMuted } = usePlayerContext();

  const player = useVideoPlayer(uri, (player) => {
    player.loop = true;
    player.muted = false;
    player.volume = 1.0;
  });

  const handlerTime = (value: number) => {
    if (playerRef.current) {
      player.currentTime = value;
    }
  };

  const handlerClickPlayer = () => {
    if (playerRef.current) {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEventListener(player, "statusChange", ({ status: statusChangeValue }) => {
    const readyToStartVideo = statusChangeValue === "readyToPlay";

    if (readyToStartVideo && playVideo) {
      playVideo();
    }
  });

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
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "active") {
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
  }, [player]);

  useEffect(() => {
    if (player) {
      player.muted = isMuted;
      playerRef.current.set(videoId, player);
    }
    return () => {
      playerRef.current.delete(videoId);
    };
  }, [player, videoId, isMuted]);

  return (
    <Pressable onPress={handlerClickPlayer}>
      <VideoView
        ref={ref}
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
