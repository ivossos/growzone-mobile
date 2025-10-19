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
  TextInput,
  TouchableOpacity,
  Text,
  Keyboard,
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
  const [videoDuration, setVideoDuration] = useState(15000);
  const [replyText, setReplyText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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
  //TODO: Talvez usar isso aqui para corrigir o problema da tela preta entre stories;
  // useEventListener(player, "playingChange", (event) => {
  //   if (currentStory.type === "video") {
  //     console.log("timeUpdate", event);
  //   }
  // });

  const startProgress = (fromValue: number, duration: number) => {
    progress.setValue(fromValue);

    progressAnimation.current = Animated.timing(progress, {
      toValue: 1,
      duration: (1 - fromValue) * duration,
      easing: Easing.linear, // Smooth linear progression
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

  const handleSendReply = () => {
    if (!replyText.trim()) return;

    // TODO: Send reply to backend
    console.log("Sending reply:", replyText, "to story:", currentStory._id);

    // Clear input
    setReplyText("");
    Keyboard.dismiss();

    // Show success feedback
    // TODO: Navigate to DM with user
  };

  const handleQuickReaction = (emoji: string) => {
    // TODO: Send reaction to backend
    console.log("Quick reaction:", emoji, "on story:", currentStory._id);

    // Visual feedback
    // TODO: Show emoji animation flying up
  };

  const quickEmojis = ["❤️", "🔥", "👏", "😂", "😮", "😍"];

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
    Animated.spring(transitionAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
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
    if (currentStory.type !== "video") return;
    if (Platform.OS === "ios") {
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
      startProgress(0, 16000);
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
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                marginHorizontal: 2,
                overflow: "hidden",
                borderRadius: 2,
              }}
            >
              {i === storyIndex ? (
                <Animated.View
                  style={{
                    height: 3,
                    backgroundColor: "#FFFFFF",
                    width: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "100%"],
                    }),
                    shadowColor: "#FFFFFF",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.5,
                    shadowRadius: 3,
                  }}
                />
              ) : (
                <View
                  style={{
                    height: 3,
                    backgroundColor: i < storyIndex ? "#FFFFFF" : "rgba(255, 255, 255, 0.3)",
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
          viewsCount={currentStory.views || 0}
          onViewsPress={() => {
            setIsPaused(true);
            player?.pause();
            progress.stopAnimation((value) => {
              currentProgress.current = value;
            });
            progressAnimation.current?.stop();
            // TODO: Open viewers list modal
            console.log("Show viewers list");
          }}
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

        {/* Reply/Reaction Bar */}
        <View
          style={{
            position: "absolute",
            bottom: insets.bottom + 10,
            left: 16,
            right: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          {/* Quick reactions */}
          {showEmojiPicker && (
            <View
              style={{
                position: "absolute",
                bottom: 60,
                left: 0,
                right: 0,
                backgroundColor: "rgba(0, 0, 0, 0.9)",
                borderRadius: 24,
                padding: 12,
                flexDirection: "row",
                justifyContent: "space-around",
              }}
            >
              {quickEmojis.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => {
                    handleQuickReaction(emoji);
                    setShowEmojiPicker(false);
                  }}
                  style={{
                    width: 44,
                    height: 44,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 28 }}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Reply input */}
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: 24,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.2)",
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}
          >
            <TextInput
              value={replyText}
              onChangeText={setReplyText}
              placeholder={`Responder para ${currentUser.name || currentUser.username}...`}
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              style={{
                flex: 1,
                color: "#FFFFFF",
                fontSize: 14,
                fontWeight: "400",
              }}
              onFocus={() => {
                setIsPaused(true);
                player?.pause();
                progress.stopAnimation((value) => {
                  currentProgress.current = value;
                });
                progressAnimation.current?.stop();
              }}
              onBlur={() => {
                setIsPaused(false);
                player?.play();
                const duration = currentStory.type === "image" ? 5000 : videoDuration;
                startProgress(currentProgress.current, duration);
              }}
            />
          </View>

          {/* Send/Emoji button */}
          {replyText.trim() ? (
            <TouchableOpacity
              onPress={handleSendReply}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "#2CC420",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="send" size={20} color="#000" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setShowEmojiPicker(!showEmojiPicker)}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.2)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 24 }}>😊</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      <ReportBottomSheet
        ref={reportSheetRef}
        onClose={closeReportBottomSheet}
      />
    </Modal>
  );
}
