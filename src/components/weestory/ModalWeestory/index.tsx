import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Image,
  Dimensions,
  Animated,
  Pressable,
  SafeAreaView,
  Platform,
  Easing,
} from "react-native";
import { useEventListener, useEvent } from "expo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomSheet from "@gorhom/bottom-sheet";

import { useVideoPlayer, VideoView } from "expo-video";

import ReportBottomSheet from "@/components/ui/report-bottom-sheet";
import { useBottomSheetContext } from "@/context/bottom-sheet-context";

import Controls from "../ModalWeestory/Controls";
import Header from "../ModalWeestory/Header";

import { styles } from "./styles";

const { width, height } = Dimensions.get("window");

export default function ModalWeestory({
  users,
  initialUserIndex,
  onClose,
}: any) {
  const insets = useSafeAreaInsets();
  const [userIndex, setUserIndex] = useState(initialUserIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const transitionAnim = useRef(new Animated.Value(0)).current;
  const currentProgress = useRef(0);
  const reportSheetRef = useRef<BottomSheet>(null);
  const [videoDuration, setVideoDuration] = useState(5000);

  const { openBottomSheet } = useBottomSheetContext();

  const currentUser = users[userIndex];
  const currentStory = currentUser.stories[storyIndex];

  const player = useVideoPlayer(currentStory.uri, (player) => {
    player.muted = false;
    player.timeUpdateEventInterval = 500;
    player.volume = 1.0;
  });

  useEventListener(player, "playToEnd", () => {
    if (currentStory.type === "video") {
      handleNextStory();
    }
  });

  const startProgress = (fromValue: number, duration: number) => {
    progress.setValue(fromValue);

    progressAnimation.current = Animated.timing(progress, {
      toValue: 1,
      duration: (1 - fromValue) * duration,
      useNativeDriver: false,
    });

    progressAnimation.current.start(({ finished }) => {
      if (finished) {
        progressAnimation.current = null;
        handleNextStory();
      }
    });
  };

  const handleTogglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const handleNextStory = () => {
    setIsPaused(false);
    if (storyIndex + 1 < currentUser.stories.length) {
      setStoryIndex(storyIndex + 1);
    } else if (userIndex + 1 < users.length) {
      setUserIndex(userIndex + 1);
      setStoryIndex(0);
    } else {
      onClose();
    }
  };

  const handlePreviousStory = () => {
    setIsPaused(false);
    if (storyIndex > 0) {
      setStoryIndex(storyIndex - 1);
    } else if (userIndex > 0) {
      setUserIndex(userIndex - 1);
      setStoryIndex(users[userIndex - 1].stories.length - 1);
    } else {
      onClose();
    }
  };

  const handlePressReport = () => {
    setIsPaused(true);
    player?.pause();
    progress.stopAnimation((value) => {
      currentProgress.current = value;
    });
    progressAnimation.current?.stop();

    openBottomSheet({
      type: "report",
      id: currentUser.stories[storyIndex].postId,
    });
  };

  const closeReportBottomSheet = () => {
    setIsPaused(false);
    player?.play();
    const duration = currentStory.type === "image" ? 5000 : videoDuration;
    startProgress(currentProgress.current, duration);
    reportSheetRef.current?.close();
  };

  useEffect(() => {
    progress.setValue(0);
    currentProgress.current = 0;
    progressAnimation.current = null;

    if (currentStory.type === "image") {
      startProgress(0, 5000);
    }

    return () => {
      progressAnimation.current?.stop();
    };
  }, [storyIndex, userIndex]);

  useEffect(() => {
    transitionAnim.setValue(0);
    Animated.timing(transitionAnim, {
      toValue: 1,
      duration: 400,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [userIndex]);

  useEffect(() => {
    if (player) {
      if (isPaused) {
        player.pause();
      } else {
        player.play();
      }
    }
  }, [isPaused, player]);

  useEffect(() => {
    if (Platform.OS === "ios" && currentStory.type === "video") {
      const updateProgress = () => {
        if (player) {
          const currentTime = player.currentTime;
          const duration = player.duration;
          if (currentTime != null && duration != null && duration > 0) {
            const progressValue = currentTime / duration;
            progress.setValue(progressValue);
          }
        }
      };

      const interval = setInterval(updateProgress, 100);
      return () => clearInterval(interval);
    } else {
      startProgress(0, 5000);
    }
  }, [player]);

  const headerTop = Platform.OS === "ios" ? insets.top + 10 : insets.top - 25;

  return (
    <Modal visible animationType="fade">
      <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
        <View style={[styles.header, { top: headerTop }]}>
          {currentUser.stories.map((_: any, i: number) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 3,
                backgroundColor: "#0B2F08",
                marginHorizontal: 2,
                overflow: "hidden",
                borderRadius: 2,
              }}
            >
              {i === storyIndex ? (
                <Animated.View
                  style={{
                    height: 3,
                    backgroundColor: "#2CC420",
                    width: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "100%"],
                    }),
                  }}
                />
              ) : (
                <View
                  style={{
                    height: 3,
                    backgroundColor: i < storyIndex ? "#2CC420" : "#0B2F08",
                    width: "100%",
                  }}
                />
              )}
            </View>
          ))}
        </View>

        <Header
          avatar={currentUser.avatar}
          name={currentUser.name || currentUser.username}
          createdAt={currentStory.createdAt}
          onPress={onClose}
          handlePressReport={handlePressReport}
        />

        <Animated.View
          style={{
            flex: 1,
            opacity: transitionAnim,
            transform: [
              {
                scale: transitionAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.96, 1],
                }),
              },
            ],
          }}
        >
          <Pressable onPress={handleTogglePause} style={{ flex: 1 }}>
            {currentStory.type === "image" ? (
              <Image
                source={{ uri: currentStory.uri }}
                style={{
                  width,
                  height,
                  resizeMode: "cover",
                  borderRadius: 20,
                }}
              />
            ) : (
              player && (
                <VideoView
                  player={player}
                  nativeControls={false}
                  contentFit="cover"
                  style={{
                    width,
                    height,
                    borderRadius: 20,
                  }}
                />
              )
            )}
          </Pressable>
        </Animated.View>

        <Controls
          handleNext={handleNextStory}
          handlePrevious={handlePreviousStory}
        />
      </SafeAreaView>

      <ReportBottomSheet
        ref={reportSheetRef}
        onClose={closeReportBottomSheet}
      />
    </Modal>
  );
}
