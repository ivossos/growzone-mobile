import React, { FC, useCallback, useMemo, useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  Pressable,
  AppState,
} from "react-native";
import { VideoView } from "expo-video";
import Slider from "@react-native-community/slider";
import { useEvent, useEventListener } from "expo";
import { Ionicons } from "@expo/vector-icons";

import { useVideoPlayerContext } from "@/context/video-player-context";
import { colors } from "@/styles/colors";
import { VideoPlayerProps } from "./Types";

import { useSafeAreaInsets } from "react-native-safe-area-context";

const VideoPlayer: FC<VideoPlayerProps> = ({
  player,
  autoplay = false,
  controls,
  data = null,
  resizeMode = "cover",
  startPlay,
  styleContainer = null,
}) => {
  const insets = useSafeAreaInsets();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const { handlerTime, playVideo, getPlayer, setPlayer } = useVideoPlayerContext();

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player ? player.playing : false,
  });

  const iconControlPlay = useMemo(() => {
    return !isPlaying ? (
      <Ionicons name="play" size={70} color={colors.brand.white} />
    ) : null;
  }, [isPlaying]);

  const handlerPlay = useCallback(() => {
    const currentPlayer = getPlayer();
    
    if (currentPlayer && currentPlayer !== player) {
      currentPlayer.pause();
    }

    if(!currentPlayer) {
      setPlayer(player);
    }
    
    if (isPlaying) {
      player.pause();
    } else {
      player.play();

      if (startPlay) {
        startPlay(data);
      }
    }
  }, [isPlaying, startPlay, getPlayer]);

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
    const readyToStartVideo = statusChangeValue === "readyToPlay" && autoplay;

    if (readyToStartVideo) {
      playVideo();
      if (startPlay) {
        startPlay(data);
      }
    }
  });

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "active") {
        player?.pause();
        player?.replay();
        setDuration(0)
      }
    };
  
    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, []);

  return (
    <Pressable
      style={styleContainer ? styleContainer : styles.container}
      onPress={handlerPlay}
    >
      <VideoView
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        nativeControls={false}
        contentFit={resizeMode}
        style={styleContainer ? styleContainer : styles.video}
        player={player}
      />

      {controls?.showButtonPlay && (
        <View style={styles.iconContainer}>{iconControlPlay}</View>
      )}

      {controls?.showProgressBar && (
        <View style={[styles.sliderContainer, { bottom: insets.bottom + 44 }]}>
          <View style={{ flex: 1 }}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration}
              value={currentTime}
              onSlidingComplete={handlerTime}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#555555"
              thumbTintColor="#FFFFFF"
            />
          </View>
        </View>
      )}

      {/* {controls?.showMutedButton && (
        <View style={[styles.muteContainer, { bottom: insets.bottom + 44 }]}>
          <View style={{ left: 100 }}>
            <TouchableOpacity onPress={controls.handlerMutedVideo}>
              {controls.muted ? (
                <VolumeX size={20} color={colors.brand.white} />
              ) : (
                <Volume2 size={20} color={colors.brand.white} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      )} */}
    </Pressable>
  );
};

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
    height: Dimensions.get("window").height,
  },
  iconContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
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

export default VideoPlayer;
