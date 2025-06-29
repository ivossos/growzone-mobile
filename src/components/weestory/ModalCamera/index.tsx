import React, { useRef, useState, useEffect, useCallback } from "react";
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
  Linking,
  Platform,
} from "react-native";
import { ResizeMode, Video } from "expo-av";
import Toast from "react-native-toast-message";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useMicrophonePermission,
  useCameraFormat,
} from "react-native-vision-camera";
import { Ionicons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import * as ImageManipulator from "expo-image-manipulator";
import * as Device from "expo-device";

import Button from "@/components/ui/button";
import { useCameraModal } from "@/context/camera-modal-context";

import { createWeestory } from "@/api/social/weestory/create-weestory";

import GalleryIcon from "@/assets/icons/gallery-icon.svg";
import RevertIcon from "@/assets/icons/revert-icon.svg";
import CopyIcon from "@/assets/icons/copy-item-icon.svg";
import WeestoryCircleIcon from "@/assets/icons/weestory-circle-icon.svg";

import { colors } from "@/styles/colors";
import { styles } from "./styles";
import { router } from "expo-router";

const { height, width } = Dimensions.get("window");

export default function ModalCamera() {
  const insets = useSafeAreaInsets();
  const { infoCamera, isVisible, closeCamera } = useCameraModal();
  const {
    hasPermission: hasCameraPermission,
    requestPermission: requestCameraPermission,
  } = useCameraPermission();
  const {
    hasPermission: hasMicrophonePermission,
    requestPermission: requestMicrophonePermission,
  } = useMicrophonePermission();

  // Usar getCameraDevice como fallback
  const frontDevice = useCameraDevice("front");
  const backDevice = useCameraDevice("back");
  const [loading, setLoading] = useState(true);

  const cameraRef = useRef<Camera | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [facing, setFacing] = useState<"front" | "back">("front");
  const [pulseAnim] = useState(new Animated.Value(1));
  const [scaleAnim] = useState(new Animated.Value(1));
  const [pressTimer, setPressTimer] = useState<any>(null);
  const [didLongPress, setDidLongPress] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null | undefined>(
    null
  );
  const [capturedVideo, setCapturedVideo] = useState<string | null | undefined>(
    null
  );
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [bottomSheetIndex, setBottomSheetIndex] = useState(0);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [showProgress, setShowProgress] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  // Verificações de segurança para devices
  const currentDevice = facing === "front" ? frontDevice : backDevice;

  // Verificar se estamos em um simulador
  const isSimulator = Platform.OS === "ios" && !Device.isDevice;

  // Só tenta usar o formato se o device estiver disponível
  const format = useCameraFormat(currentDevice, [
    { videoResolution: { width: 1080, height: 1920 } },
    { fps: 60 },
  ]);

  const normalizeFileUri = (path: string) =>
    Platform.OS === "android" && !path.startsWith("file://")
      ? `file://${path}`
      : path;

  const handlePresentModal = () => {
    //bottomSheetRef.current?.expand();
    progress.setValue(0);
    setShowBottomSheet(true);
    setBottomSheetIndex(0);
  };

  const handleCloseModal = () => {
    //bottomSheetRef.current?.close();
    progress.setValue(0);
    setShowProgress(false);
    setShowBottomSheet(false);
    setBottomSheetIndex(-1);
  };

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
    if (cameraRef.current && !isRecording && currentDevice) {
      setIsRecording(true);
      startPulsing();
      try {
        setTimeout(async () => {
          try {
            cameraRef.current?.startRecording({
              onRecordingFinished: (video) => {
                console.log("Entrei no onRecordingFinished", video.path);
                const normalizedPath = normalizeFileUri(video.path);
                setCapturedVideo(normalizedPath);
                setIsRecording(false);
                stopPulsing();
              },
              onRecordingError: (error) => {
                console.error("Erro ao gravar:", error);
                setIsRecording(false);
                stopPulsing();
              },
              videoCodec: "h264",
              fileType: "mp4",
            });

            // Para a gravação após 15 segundos
            setTimeout(() => {
              console.log("⏰ Timeout atingido, parando gravação");
              if (cameraRef.current) {
                cameraRef.current.stopRecording();
                setIsRecording(false);
                stopPulsing();
              }
            }, 15000);
          } catch (error) {
            console.error("Erro ao iniciar gravação:", error);
            setIsRecording(false);
            stopPulsing();
          }
        }, 600);
      } catch (e) {
        console.error("Erro ao gravar:", e);
        setIsRecording(false);
        stopPulsing();
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
    if (isRecording || !cameraRef.current || !currentDevice) return;

    try {
      const photo = await cameraRef.current.takePhoto({
        flash: "off",
      });

      if (!photo) return;

      const photoUri = normalizeFileUri(photo.path);

      const fixed = await ImageManipulator.manipulateAsync(photoUri, [], {
        compress: 1,
        format: ImageManipulator.SaveFormat.JPEG,
      });

      const final = await ImageManipulator.manipulateAsync(
        fixed.uri,
        [{ resize: { width: 1080, height: 1920 } }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );

      setCapturedPhoto(final.uri);
    } catch (e) {
      console.error("Erro ao tirar foto:", e);
    }
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

  const handleClose = () => {
    stopRecording();
    setCapturedPhoto(null);
    setCapturedVideo(null);
    setIsRecording(false);
    stopPulsing();
    closeCamera();
    setTimeout(() => {
      router.push("/(drawer)/(tabs)/home");
    }, 800);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setShowProgress(true);
    try {
      await createWeestory({
        image: capturedPhoto,
        video: capturedVideo,
        onProgress: (progressValue) => {
          console.log("[Progress] ", progressValue, "%");
          progress.setValue(progressValue / 100);
        },
      });

      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: "Seu Weestory foi postado com sucesso!",
      });

      handleClose();
    } catch (error) {
      console.error("error ", error);
      handleClose();
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível adicionar seu weestory",
      });
    } finally {
      setIsLoading(false);
      setShowProgress(false);
    }
  };

  const handleClosePreview = () => {
    if (infoCamera.mediaType) {
      handleClose();
      return;
    }
    handleCloseModal();
    setCapturedPhoto(null);
    setCapturedVideo(null);
  };

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  const handlePermissionRequest = async () => {
    await requestCameraPermission();
    await requestMicrophonePermission();

    if (!hasCameraPermission || !hasMicrophonePermission) {
      await Linking.openSettings();
    }
  };

  useEffect(() => {
    if (!hasCameraPermission) {
      requestCameraPermission();
    }

    if (!hasMicrophonePermission) {
      requestMicrophonePermission();
    }

    setLoading(false);

    // Log adicional para debug no iOS
    if (Platform.OS === "ios") {
      console.log("[iOS Debug] isSimulator:", isSimulator);
      console.log("[iOS Debug] Device.isDevice:", Device.isDevice);
      console.log("[iOS Debug] frontDevice available:", !!frontDevice);
      console.log("[iOS Debug] backDevice available:", !!backDevice);
      console.log("[iOS Debug] currentDevice available:", !!currentDevice);

      if (isSimulator) {
        console.warn(
          "[iOS] Você está usando um simulador. VisionCamera pode não funcionar corretamente. Teste em um dispositivo físico."
        );
      }
    }
  }, [hasCameraPermission, hasMicrophonePermission, frontDevice, backDevice]);

  useEffect(() => {
    setShowBottomSheet(false);
    setBottomSheetIndex(-1);
    if (infoCamera.mediaType) {
      if (infoCamera.mediaType === "video") {
        setCapturedVideo(infoCamera.uri);
        return;
      }

      if (infoCamera.mediaType === "photo") {
        setCapturedPhoto(infoCamera.uri);
        return;
      }
    }
  }, [infoCamera]);

  return (
    <Modal visible={isVisible} animationType="fade">
      <SafeAreaView style={styles.safearea}>
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.brand.green} />
          </View>
        ) : !hasCameraPermission || !hasMicrophonePermission ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-base font-medium text-white text-center">
              Precisamos de acesso à sua câmera e microfone para capturar fotos
              e vídeos.
            </Text>
            <Button
              handlePress={handlePermissionRequest}
              containerStyles="mt-4 w-50"
              title="Conceder permissão"
            />
          </View>
        ) : !currentDevice || isSimulator ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-base font-medium text-white text-center mb-4">
              {isSimulator
                ? "O simulador iOS não suporta câmera física."
                : "Nenhum dispositivo de câmera encontrado."}
            </Text>
            <Text className="text-sm font-regular text-neutral-400 text-center mb-4">
              {isSimulator
                ? "Por favor, teste em um dispositivo iPhone físico para usar a câmera."
                : "Verifique se as permissões de câmera foram concedidas e tente novamente."}
            </Text>
            <Button
              handlePress={handleClose}
              containerStyles="mt-4 w-50"
              title="Fechar"
            />
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
                    />
                  ) : capturedVideo ? (
                    <>
                      {!videoReady && (
                        <ActivityIndicator
                          color="#fff"
                          size="large"
                          className="absolute"
                        />
                      )}
                      <Video
                        source={{ uri: capturedVideo }}
                        style={{
                          width,
                          height,
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
                    className="absolute top-5 left-5 w-12 h-12 rounded-full bg-black-80 items-center justify-center"
                  >
                    <Entypo name="chevron-left" size={27} color="white" />
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={handleClose}
                    className="absolute top-5 left-5 z-10"
                  >
                    <Ionicons name="close" size={28} color="white" />
                  </TouchableOpacity>
                  <Camera
                    ref={cameraRef}
                    device={currentDevice!}
                    style={styles.camera}
                    videoBitRate="low"
                    isActive={true}
                    video={true}
                    audio={true}
                    photo={true}
                    format={format}
                    resizeMode="cover"
                  />
                </>
              )}
            </View>
            {capturedPhoto || capturedVideo ? (
              <View style={styles.footer}>
                <View className="bg-black justify-center items-center">
                  <View className="flex-row items-center justify-between w-full px-2 pt-5">
                    <TouchableOpacity className="flex flex-row items-center gap-3 p-4 rounded-full border border-black-80">
                      <CopyIcon />
                      <Text className="text-base font-semibold text-neutral-400">
                        Seu weestory
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handlePresentModal}
                      className="w-12 h-12 rounded-full bg-white items-center justify-center"
                    >
                      <Entypo name="chevron-right" size={24} color="black" />
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
                  <View className="flex-row items-center justify-around w-full">
                    {/* <TouchableOpacity onPress={handleClose} activeOpacity={0.8}>
                      <GalleryIcon />
                    </TouchableOpacity> */}
                    <View style={{ width: 30 }} />
                    <View>
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
                      <Text
                        className="text-white text-base font-semibold text-neutral-400 absolute"
                        style={{
                          fontSize: 14,
                          top: 30,
                          width: 100,
                        }}
                      >
                        WEESTORY
                      </Text>
                    </View>
                    <TouchableOpacity onPress={toggleCameraFacing}>
                      <RevertIcon />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </>
        )}
        {showBottomSheet && (
          <BottomSheet
            ref={bottomSheetRef}
            index={bottomSheetIndex}
            snapPoints={[height * 0.42]}
            onClose={handleCloseModal}
            enablePanDownToClose={true}
            enableHandlePanningGesture={false}
            handleIndicatorStyle={{ backgroundColor: colors.black[80] }}
            backgroundStyle={{ backgroundColor: colors.black[100] }}
          >
            <BottomSheetView className="flex flex-col flex-1 gap-5 p-6 bg-black-100">
              <View className="flex-column justify-start border-b-[2px] border-black-80 p-3">
                <Text className="text-base font-semibold text-white">
                  Compartilhar
                </Text>
              </View>
              <View className="flex-row items-center justify-between w-full gap-3">
                <View className="flex-row items-center gap-3">
                  <TouchableOpacity
                    onPress={handleClosePreview}
                    className="w-12 h-12 rounded-full bg-black-70 items-center justify-center"
                  >
                    <WeestoryCircleIcon />
                  </TouchableOpacity>
                  <Text className="text-base font-semibold text-white">
                    Weestory
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleClosePreview}
                  className="w-8 h-8 rounded-full bg-primary items-center justify-center"
                >
                  <Entypo name="check" size={15} color="black" />
                </TouchableOpacity>
              </View>
              <Button
                isLoading={isLoading}
                handlePress={handleSubmit}
                containerStyles="mt-4 w-full"
                title="Compartilhar"
              />
              {showProgress && (
                <View
                  className="h-1"
                  style={{
                    backgroundColor: "#0B2F08",
                    overflow: "hidden",
                  }}
                >
                  <Animated.View
                    style={{
                      flex: 1,
                      height: 1,
                      backgroundColor: "#2CC420",
                      width: progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", "100%"],
                      }),
                    }}
                  />
                </View>
              )}
            </BottomSheetView>
          </BottomSheet>
        )}
      </SafeAreaView>
    </Modal>
  );
}
