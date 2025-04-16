import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  Pressable,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Easing,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import Controls from "../ModalWeestory/Controls";
import Header from "../ModalWeestory/Header";

import { styles } from "./styles";

const { width } = Dimensions.get("window");

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

  const videoRef = useRef<Video>(null);
  const [videoDuration, setVideoDuration] = useState(5000);
  const [comment, setComment] = useState("");

  const currentUser = users[userIndex];
  const currentStory = currentUser.stories[storyIndex];

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

  const handleVideoStatusUpdate = (status: any) => {
    if (!status?.isLoaded) return;

    if (status.durationMillis && status.durationMillis !== videoDuration) {
      setVideoDuration(status.durationMillis);
    }

    if (status.didJustFinish) {
      handleNextStory();
      return;
    }

    if (!isPaused && status.isPlaying && progressAnimation.current === null) {
      startProgress(0, status.durationMillis);
    }
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

  const headerTop = Platform.OS === "ios" ? insets.top + 10 : insets.top - 25;

  return (
    <Modal visible animationType="fade">
      <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
        <View
          style={[
            styles.header,
            {
              top: headerTop,
            },
          ]}
        >
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
          name={currentUser.name}
          onPress={onClose}
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
                  height: "90%",
                  resizeMode: "cover",
                  borderRadius: 20,
                }}
              />
            ) : (
              <Video
                ref={videoRef}
                source={{ uri: currentStory.uri }}
                style={{ width, height: "90%", borderRadius: 20 }}
                resizeMode={ResizeMode.COVER}
                shouldPlay={!isPaused}
                onPlaybackStatusUpdate={handleVideoStatusUpdate}
              />
            )}
          </Pressable>
        </Animated.View>

        <Controls
          handleNext={handleNextStory}
          handlePrevious={handlePreviousStory}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 50}
          style={{
            position: "absolute",
            zIndex: 6,
            bottom: insets.bottom,
            width,
          }}
        >
          <View
            style={{
              justifyContent: "flex-end",
              marginHorizontal: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderRadius: 8,
                paddingVertical: 15,
                paddingHorizontal: 15,
                borderWidth: 1,
                borderColor: "#333",
                gap: 10,
              }}
            >
              <TextInput
                style={{
                  flex: 1,
                  color: "white",
                  borderRadius: 20,
                  width: "100%",
                }}
                value={comment}
                onChangeText={setComment}
                placeholder="Comentar..."
                placeholderTextColor="#ffffff"
                onFocus={() => {
                  setIsPaused(true);
                  videoRef.current?.pauseAsync();
                  progress.stopAnimation((value) => {
                    currentProgress.current = value;
                  });
                  progressAnimation.current?.stop();
                }}
                onBlur={() => {
                  setIsPaused(false);
                  videoRef.current?.playAsync();
                  const duration =
                    currentStory.type === "image" ? 5000 : videoDuration;
                  startProgress(currentProgress.current, duration);
                }}
              />

              <TouchableOpacity
                onPress={() =>
                  console.log("curtir o video/imagem", currentUser)
                }
              >
                <Ionicons name="heart-outline" size={25} color="#2CC420" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  console.log("comentar o video/imagem", currentUser)
                }
              >
                <Ionicons name="send" size={25} color="#2CC420" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
