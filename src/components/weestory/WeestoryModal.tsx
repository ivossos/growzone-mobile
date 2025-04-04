import React, { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableWithoutFeedback,
  Image,
  Modal,
  Animated,
  Platform,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from "react-native";
import { ResizeMode, Video } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getInitials } from "@/lib/utils";

const { width, height } = Dimensions.get("window");

interface WeestoriesModalProps {
  name: string;
  username: string;
  avatar: {
    image: string;
  };
  content: any;
  setContent: any;
}

export default function WeestoriesModal({
  avatar,
  name,
  username,
  content,
  setContent,
}: WeestoriesModalProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [end, setEnd] = useState(0);
  const [current, setCurrent] = useState(0);
  const [load, setLoad] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const [comment, setComment] = useState("");

  function start(n: number) {
    if (content[current].type == "video") {
      if (load) {
        Animated.timing(progress, {
          toValue: 1,
          duration: n,
          useNativeDriver: false,
        }).start(({ finished }) => {
          if (finished) {
            next();
          }
        });
      }
    } else {
      Animated.timing(progress, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          next();
        }
      });
    }
  }

  function play() {
    start(end);
  }

  function next() {
    if (current !== content.length - 1) {
      let data = [...content];
      data[current].finish = 1;
      setContent(data);
      setCurrent(current + 1);
      progress.setValue(0);
      setLoad(false);
    } else {
      close();
    }
  }

  function previous() {
    if (current - 1 >= 0) {
      let data = [...content];
      data[current].finish = 0;
      setContent(data);
      setCurrent(current - 1);
      progress.setValue(0);
      setLoad(false);
    } else {
      close();
    }
  }

  function close() {
    progress.setValue(0);
    setLoad(false);
    setModalVisible(false);
  }

  return (
    <View>
      <Modal animationType="fade" transparent={false} visible={modalVisible}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.containerModal}>
            <View style={styles.backgroundContainer}>
              {content[current].type == "video" ? (
                <Video
                  source={{
                    uri: content[current].content,
                  }}
                  rate={1.0}
                  volume={1.0}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay={true}
                  positionMillis={0}
                  onReadyForDisplay={play}
                  onPlaybackStatusUpdate={(AVPlaybackStatus) => {
                    if (AVPlaybackStatus.isLoaded) {
                      setLoad(true);
                      setEnd(AVPlaybackStatus.durationMillis ?? 0);
                    } else {
                      setLoad(false);
                    }
                  }}
                  style={{
                    height: "90%",
                    width: "100%",
                    borderRadius: 16,
                  }}
                />
              ) : (
                <Image
                  onLoadEnd={() => {
                    progress.setValue(0);
                    play();
                  }}
                  source={{
                    uri: content[current].content,
                  }}
                  style={{
                    height: "90%",
                    width: "100%",
                    borderRadius: 16,
                    resizeMode: "cover",
                  }}
                />
              )}
            </View>
            <View
              style={{
                flexDirection: "column",
                flex: 1,
              }}
            >
              <LinearGradient
                colors={["rgba(0,0,0,1)", "transparent"]}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 0,
                  height: 0,
                }}
              />
              <View
                style={{
                  flexDirection: "row",
                  paddingTop: 25,
                  paddingHorizontal: 30,
                }}
              >
                {content.map((index: number, key: number) => {
                  return (
                    <View
                      key={key}
                      style={{
                        height: 2,
                        flex: 1,
                        flexDirection: "row",
                        backgroundColor: "#0B2F08",
                        marginHorizontal: 2,
                      }}
                    >
                      <Animated.View
                        style={{
                          flex: current == key ? progress : content[key].finish,
                          height: 2,
                          backgroundColor: "#2CC420",
                        }}
                      ></Animated.View>
                    </View>
                  );
                })}
              </View>

              <View
                style={{
                  height: 50,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingHorizontal: 15,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <TouchableOpacity
                    onPress={() => {
                      close();
                    }}
                  >
                    <View
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        height: 50,
                        marginRight: 10,
                      }}
                    >
                      <Ionicons
                        name="chevron-back-outline"
                        size={20}
                        color="white"
                      />
                    </View>
                  </TouchableOpacity>

                  {avatar ? (
                    <Image
                      style={{ height: 32, width: 32, borderRadius: 25 }}
                      source={{ uri: avatar.image }}
                    />
                  ) : (
                    <View className="w-full bg-black-80 h-full rounded-full justify-center items-center">
                      <Text
                        className="text-brand-green text-primary"
                        style={{ fontSize: 22 }}
                      >
                        {getInitials(name)}
                      </Text>
                    </View>
                  )}
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: "white",
                      paddingLeft: 10,
                    }}
                  >
                    {name ? name : username}
                  </Text>
                </View>
                <View />
              </View>
              <View style={{ flex: 1, flexDirection: "row" }}>
                <TouchableWithoutFeedback onPress={() => previous()}>
                  <View style={{ flex: 1 }}></View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={() => next()}>
                  <View style={{ flex: 1 }}></View>
                </TouchableWithoutFeedback>
              </View>
            </View>
            <View style={styles.overlay}>
              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentInput}
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Comentar..."
                  placeholderTextColor="#999"
                />
                <TouchableOpacity onPress={() => console.log("comentar video")}>
                  <Ionicons name="send" size={20} color="#2CC420" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      <TouchableOpacity
        className="items-center mx-2 gap-2"
        onPress={() => setModalVisible(true)}
      >
        <View className="w-20 h-20 rounded-full border-2 border-brand-green bg-muted p-1">
          {avatar ? (
            <Image
              source={{ uri: avatar.image }}
              className="w-full h-full rounded-full"
            />
          ) : (
            <View className="w-full bg-black-80 h-full rounded-full justify-center items-center">
              <Text
                className="text-brand-green text-primary"
                style={{ fontSize: 22 }}
              >
                {getInitials(name)}
              </Text>
            </View>
          )}
        </View>
        <Text className="text-white text-xs mt-1">{username}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  containerModal: {
    flex: 1,
    backgroundColor: "#0D0D0D",
  },
  backgroundContainer: {
    position: "absolute",
    top: 10,
    bottom: 0,
    left: 10,
    right: 10,
    borderRadius: 20,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#0D0D0D",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    borderRadius: 20,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    margin: 10,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  commentInput: {
    flex: 1,
    color: "white",
    borderRadius: 20,
  },
});
