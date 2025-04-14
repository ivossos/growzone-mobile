import React, { useRef, useState, useEffect } from "react";
import {
  Modal,
  View,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  Text,
  Animated,
  Image,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { useCameraModal } from "@/context/camera-modal-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";

import { ResizeMode, Video } from "expo-av";
import { styles } from "./styles";
import { colors } from "@/styles/colors";

const { height, width } = Dimensions.get("window");

export default function CameraModal() {
  const insets = useSafeAreaInsets();
  const { isVisible, closeCamera } = useCameraModal();
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [facing, setFacing] = useState<CameraType>("front");
  const [pulseAnim] = useState(new Animated.Value(1));
  const [scaleAnim] = useState(new Animated.Value(1));
  const [pressTimer, setPressTimer] = useState<any>(null);
  const [didLongPress, setDidLongPress] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null | undefined>(
    null
  );
  const [capturedVideo, setCapturedVideo] = useState<string | null | undefined>(
    null
  );

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const startPulsing = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulsing = () => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const startRecording = async () => {
    if (cameraRef.current && !isRecording) {
      setIsRecording(true);
      startPulsing();
      try {
        const video = await cameraRef.current.recordAsync({ maxDuration: 10 });
        await new Promise((res) => setTimeout(res, 500));
        setCapturedVideo(video?.uri);
      } catch (e) {
        console.error("Erro ao gravar:", e);
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
      stopPulsing();
      setIsRecording(false);
    }
  };

  const handleCapture = async () => {
    if (isRecording || !cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync();
    setCapturedPhoto(photo?.uri);
  };

  const handlePressIn = () => {
    const timer = setTimeout(() => {
      setDidLongPress(true);
      startRecording();
    }, 200);

    setPressTimer(timer);
  };

  const handlePressOut = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }

    if (didLongPress) {
      stopRecording();
    } else {
      handleCapture();
    }

    setDidLongPress(false);
  };

  const reset = () => {
    setCapturedPhoto(null);
    setCapturedVideo(null);
    setIsRecording(false);
    stopPulsing();
  };

  const handleClose = () => {
    stopRecording();
    reset();
    closeCamera();
  };

  const handleClosePreview = () => {
    setCapturedPhoto(null);
    setCapturedVideo(null);
  };

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  return (
    <Modal visible={isVisible} animationType="fade">
      <SafeAreaView style={styles.safearea}>
        {!permission ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-white">Carregando...</Text>
          </View>
        ) : !permission?.granted ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-white">Permissão para câmera negada</Text>
          </View>
        ) : (
          <>
            <View style={styles.cameraContainer}>
              {capturedPhoto || capturedVideo ? (
                <View className="flex-1 justify-center items-center bg-black">
                  {capturedPhoto ? (
                    <Image
                      source={{ uri: capturedPhoto }}
                      className="w-full h-full"
                      resizeMode="cover"
                      style={{
                        transform:
                          facing === "front" ? [{ scaleX: -1 }] : undefined,
                      }}
                    />
                  ) : capturedVideo ? (
                    <>
                      {!videoReady && (
                        <ActivityIndicator
                          color="#fff"
                          size="large"
                          style={{ position: "absolute" }}
                        />
                      )}
                      <Video
                        source={{ uri: capturedVideo }}
                        style={{
                          width,
                          height,
                          transform:
                            facing === "front" ? [{ scaleX: -1 }] : undefined,
                        }}
                        resizeMode={ResizeMode.COVER}
                        useNativeControls={false}
                        onReadyForDisplay={() => setVideoReady(true)}
                        shouldPlay
                        isLooping
                      />
                    </>
                  ) : null}

                  <TouchableOpacity
                    onPress={handleClosePreview}
                    className="absolute top-5 left-5"
                  >
                    <Ionicons name="close" size={32} color="white" />
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View className="absolute top-5 left-5 z-10">
                    <TouchableOpacity onPress={handleClose}>
                      <Ionicons name="close" size={28} color="white" />
                    </TouchableOpacity>
                  </View>
                  <CameraView
                    ref={cameraRef}
                    facing={facing}
                    style={styles.camera}
                    mode="video"
                  />
                </>
              )}
            </View>
            {capturedPhoto || capturedVideo ? (
              <View style={styles.footer}>
                <View className="bg-black justify-center items-center">
                  <View className="flex-row items-center justify-end w-full px-10 pt-5">
                    <TouchableOpacity
                      onPress={() => {}}
                      className="w-12 h-12 rounded-full bg-white items-center justify-center"
                    >
                      <Ionicons
                        name="chevron-forward"
                        size={24}
                        color="black"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.footer}>
                <View
                  className="bg-black justify-center items-center"
                  style={{ paddingBottom: insets.bottom || 16 }}
                >
                  <View className="flex-row items-center justify-around w-full px-10">
                    <TouchableOpacity onPress={handleClose} activeOpacity={0.8}>
                      <Ionicons name="images-outline" size={30} color="white" />
                    </TouchableOpacity>
                    <TouchableWithoutFeedback
                      onPressIn={handlePressIn}
                      onPressOut={handlePressOut}
                    >
                      <Animated.View
                        style={[
                          styles.outerCircle,
                          {
                            borderColor: isRecording
                              ? colors.primary
                              : colors.brand.white,
                            transform: [
                              { scale: isRecording ? pulseAnim : scaleAnim },
                            ],
                          },
                        ]}
                      >
                        <View style={styles.innerCircle}>
                          <View style={styles.centerCircle} />
                        </View>
                      </Animated.View>
                    </TouchableWithoutFeedback>
                    <TouchableOpacity onPress={toggleCameraFacing}>
                      <Ionicons
                        name="camera-reverse-outline"
                        size={35}
                        color="white"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
}
