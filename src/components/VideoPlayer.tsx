import React, {
  forwardRef,
  Fragment,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import {
  Video,
  AVPlaybackStatus,
  AVPlaybackStatusSuccess,
  ResizeMode,
  Audio,
  InterruptionModeIOS,
  InterruptionModeAndroid,
} from "expo-av";
import { Pause } from "lucide-react-native";
import Slider from "@react-native-community/slider";
import { VideoPlayerHandle } from "@/api/@types/models";
import { replaceMediaUrl } from "@/lib/utils";

// Helper function for debounce
const useDebouncedCallback = (callback: Function, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
};

interface VideoPlayerProps {
  source: { uri: string };
  loop?: boolean;
  autoplay?: boolean;
  resizeMode?: ResizeMode;
  onPlaybackStatusUpdate?: (playbackStatus: AVPlaybackStatus) => void;
}

const statusBarHeight =
  Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;
const ScreenHeight =
  Dimensions.get("window").height -
  (Platform.OS === "ios" ? 72 : statusBarHeight);

const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  (
    {
      source,
      loop = false,
      autoplay = false,
      resizeMode = ResizeMode.COVER,
      onPlaybackStatusUpdate,
    },
    ref
  ) => {
    const videoRef = useRef<Video>(null);
    const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
    const [showButtonPause, setShowButtonPause] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const isStatusSuccess = useCallback(
      (
        playbackStatus: AVPlaybackStatus | null
      ): playbackStatus is AVPlaybackStatusSuccess => {
        return playbackStatus?.isLoaded === true;
      },
      []
    );

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      play: async () => {
        if (isStatusSuccess(status)) {
          await videoRef.current?.playAsync();
        }
      },
      pause: async () => {
        if (isStatusSuccess(status)) {
          await videoRef.current?.pauseAsync();
        }
      },
      seek: async (position: number) => {
        if (isStatusSuccess(status)) {
          await videoRef.current?.setPositionAsync(position);
        }
      },
    }));

    const handleTogglePlay = useCallback(async () => {
      if (isStatusSuccess(status) && status.isPlaying) {
        await videoRef.current?.pauseAsync();
      } else if (isStatusSuccess(status)) {
        await videoRef.current?.playAsync();
      }
    }, [isStatusSuccess, status, videoRef.current]);

    const handleSeek = useCallback(
      async (value: number) => {
        if (isStatusSuccess(status)) {
          await videoRef.current?.setPositionAsync(value);
        }
      },
      [isStatusSuccess, status, videoRef.current]
    );

    // Optimized handler for playback status update with debounce
    const handlerPlaybackStatusUpdate = useDebouncedCallback(
      useCallback(
        (playbackStatus: AVPlaybackStatus) => {
          setStatus(playbackStatus);

          if (
            playbackStatus.isLoaded &&
            !playbackStatus.isPlaying &&
            playbackStatus.positionMillis === 0
          ) {
            setShowButtonPause(true);
          } else {
            setShowButtonPause(false);
          }

          if (onPlaybackStatusUpdate) {
            onPlaybackStatusUpdate(playbackStatus);
          }
        },
        [onPlaybackStatusUpdate]
      ),
      400
    );

    const pauseIcon = useMemo(() => {
      if (showButtonPause) {
        return <Pause size={48} color="white" style={styles.playIcon} />;
      }
    }, [showButtonPause]);

    useEffect(() => {
      const configureAudio = async () => {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
          playThroughEarpieceAndroid: false,
        });
      };
    
      configureAudio();
    }, []);

    return (
      <Fragment>
        {/* Video and Controls */}
        <TouchableOpacity onPress={handleTogglePlay}>
          <View>
            {isLoading && (
              <View style={styles.bufferingIndicator}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            )}

            {!isStatusSuccess(status) && (
              <Image
                source={{ uri: replaceMediaUrl(source.uri) }}
                style={styles.video}
                resizeMode="cover"
              />
            )}

            <Video
              ref={videoRef}
              style={styles.video}
              source={source}
              resizeMode={resizeMode}
              shouldPlay={autoplay}
              onLoadStart={() => setIsLoading(true)}
              onLoad={() => setIsLoading(false)}
              isLooping={loop}
              isMuted={false}
              onPlaybackStatusUpdate={handlerPlaybackStatusUpdate}
            />

            {pauseIcon}

            {/* Slider inside the video */}
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={
                  isStatusSuccess(status) ? status.durationMillis : 1
                }
                value={isStatusSuccess(status) ? status.positionMillis : 0}
                onSlidingComplete={handleSeek}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="#555555"
                thumbTintColor="#FFFFFF"
              />
            </View>
          </View>
        </TouchableOpacity>
      </Fragment>
    );
  }
);

const styles = StyleSheet.create({
  video: {
    width: "100%",
    height: Dimensions.get("window").height,
  },
  playIcon: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -24 }, { translateY: -24 }], // Center the icon
  },
  sliderContainer: {
    position: "absolute",
    bottom: 0, // Posiciona o slider próximo à parte inferior do vídeo
    left: 10,
    right: 10,
  },
  slider: {
    width: "100%",
    height: 40, // Altura suficiente para facilitar o toque
  },
  bufferingIndicator: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
});

export default VideoPlayer;
