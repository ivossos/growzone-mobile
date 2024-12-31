import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  ViewStyle,
  StyleProp,
  Text,
} from "react-native";
import {
  useVideoPlayer,
  VideoContentFit,
  VideoSource,
  VideoView,
} from "expo-video";
import { Play, Volume2, VolumeX } from "lucide-react-native";
import Slider from "@react-native-community/slider";
import { VideoPlayerHandle } from "@/api/@types/models";
import { useEvent, useEventListener } from "expo";
import { colors } from "@/styles/colors";
import Loader from "./ui/loader";
import { Ionicons } from "@expo/vector-icons";

interface VideoPlayerProps {
  source: { uri: string };
  data?: any;
  loop?: boolean;
  muted?: boolean;
  autoplay?: boolean;
  resizeMode?: VideoContentFit;
  startPlay?: (value: any) => void;
  styleContainer?: StyleProp<ViewStyle>;
  controls?: Partial<{
    showProgressBar: boolean;
    showMutedButton: boolean;
    handlerMutedVideo: () => void;
    muted: boolean;
  }>;
}

const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  (
    {
      source,
      loop = false,
      autoplay = false,
      muted = false,
      resizeMode = "cover",
      data = null,
      styleContainer = null,
      controls,
      startPlay,
    },
    ref
  ) => {
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const videoRef = useRef<VideoView>(null);

    const player = useVideoPlayer(source, (player) => {
      player.loop = loop;
      player.muted = muted;
      player.timeUpdateEventInterval = 1;
      player.volume = !muted ? 1.0 : 0;
    });

    const { isPlaying } = useEvent(player, "playingChange", {
      isPlaying: player.playing,
    });

    const { status } = useEvent(player, "statusChange", {
      status: player.status,
    });

    const iconControlPlay = useMemo(() => {
      return !isPlaying ? (
        <Ionicons name="play" size={70} color={colors.brand.white} />
      ) : null;
    }, [isPlaying]);

    const handlerPlay = useCallback(() => {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();

        if (startPlay) {
          startPlay(data);
        }

        if (controls && controls.showMutedButton) {
          player.muted = controls.muted as boolean;
        }
      }
    }, [isPlaying]);

    const handleSeek = useCallback(
      (value: number) => {
        player.seekBy(value);
      },
      [player]
    );

    useImperativeHandle(ref, () => ({
      play: () => {
        player.play();
      },
      pause: () => {
        player.pause();
      },
      replace: (source: VideoSource) => {
        player.replace(source);
      },
      mutedVideo: (mutedVideo: boolean) => {
        player.muted = mutedVideo;
      },
    }));

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

    useEventListener(player, "statusChange", ({ status }) => {
      if (status === "readyToPlay" && autoplay) {
        player.play();
        if (startPlay) {
          startPlay(data);
        }
      }
    });

    if (["idle", "loading"].includes(status)) {
      return <Loader isLoading />;
    }

    return (
      <>
        <TouchableOpacity
          style={styleContainer ? styleContainer : styles.container}
          onPress={handlerPlay}
        >
          <VideoView
            ref={videoRef}
            allowsFullscreen={false}
            allowsPictureInPicture={false}
            nativeControls={false}
            contentFit={resizeMode}
            style={styleContainer ? styleContainer : styles.video}
            player={player}
          />

          <View style={styles.iconContainer}>{iconControlPlay}</View>
        </TouchableOpacity>

        <View style={styles.sliderContainer}>
          {controls?.showProgressBar && (
            <View style={{ flex: 1 }}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={duration}
                value={currentTime}
                onSlidingComplete={handleSeek}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="#555555"
                thumbTintColor="#FFFFFF"
              />
            </View>
          )}

          {controls?.showMutedButton && (
            <View>
              <TouchableOpacity onPress={controls.handlerMutedVideo}>
                {controls.muted ? (
                  <VolumeX size={20} color={colors.brand.white} />
                ) : (
                  <Volume2 size={20} color={colors.brand.white} />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </>
    );
  }
);

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
    zIndex: 10,
  },
  sliderContainer: {
    position: "absolute",
    flexDirection: "row",
    alignContent: "center",
    alignItems: "center",
    bottom: 0,
    left: 10,
    right: 10,
  },
  slider: {
    width: "100%",
    height: 40,
  },
});

export default VideoPlayer;
