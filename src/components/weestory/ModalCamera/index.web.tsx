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
  Platform,
} from "react-native";
import Toast from "react-native-toast-message";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";

import Button from "@/components/ui/button";
import { useCameraModal } from "@/context/camera-modal-context";
import { createWeestory } from "@/api/social/weestory/create-weestory";

import RevertIcon from "@/assets/icons/revert-icon.svg";
import CopyIcon from "@/assets/icons/copy-item-icon.svg";
import WeestoryCircleIcon from "@/assets/icons/weestory-circle-icon.svg";

import { colors } from "@/styles/colors";
import { styles } from "./styles";
import { router } from "expo-router";

const { height, width } = Dimensions.get("window");
const MAX_RECORDING_DURATION = 15000; // 15 segundos

export default function ModalCamera() {
  const insets = useSafeAreaInsets();
  const { infoCamera, isVisible, closeCamera } = useCameraModal();

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startRecordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pulseAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const isMountedRef = useRef(true);

  // State
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [capturedVideo, setCapturedVideo] = useState<string | null>(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [bottomSheetIndex, setBottomSheetIndex] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [didLongPress, setDidLongPress] = useState(false);
  const [pressTimer, setPressTimer] = useState<any>(null);

  // Animation
  const [pulseAnim] = useState(new Animated.Value(1));
  const [scaleAnim] = useState(new Animated.Value(1));
  const progress = useRef(new Animated.Value(0)).current;

  // Initialize camera on web
  const initializeCamera = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        Toast.show({
          type: "error",
          text1: "Câmera não suportada",
          text2: "Seu navegador não suporta acesso à câmera.",
        });
        setLoading(false);
        return;
      }

      // Request camera and microphone permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: true,
      });

      streamRef.current = stream;

      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setHasPermission(true);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao acessar câmera:", error);

      let errorMessage = "Não foi possível acessar a câmera.";
      if (error instanceof Error) {
        if (error.name === "NotAllowedError") {
          errorMessage = "Permissão de câmera negada. Permita o acesso nas configurações do navegador.";
        } else if (error.name === "NotFoundError") {
          errorMessage = "Nenhuma câmera encontrada no dispositivo.";
        }
      }

      Toast.show({
        type: "error",
        text1: "Erro de câmera",
        text2: errorMessage,
      });

      setHasPermission(false);
      setLoading(false);
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Switch camera facing
  const toggleCameraFacing = async () => {
    if (!isMountedRef.current) return;

    stopCamera();
    setFacing((current) => (current === "user" ? "environment" : "user"));

    // Reinitialize with new facing mode
    setTimeout(() => {
      if (isMountedRef.current) {
        initializeCamera();
      }
    }, 100);
  };

  // Take photo
  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || !isMountedRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob and then to data URL
      canvas.toBlob((blob) => {
        if (!blob || !isMountedRef.current) return;

        const url = URL.createObjectURL(blob);
        setCapturedPhoto(url);
      }, "image/jpeg", 0.95);
    } catch (error) {
      console.error("Erro ao capturar foto:", error);
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível capturar a foto.",
      });
    }
  };

  // Start video recording
  const startRecording = async () => {
    if (!streamRef.current || isRecording || !isMountedRef.current) return;

    try {
      setIsRecording(true);
      startPulsing();

      startRecordingTimeoutRef.current = setTimeout(async () => {
        if (!isMountedRef.current || !streamRef.current) return;

        try {
          recordedChunksRef.current = [];

          // Check supported mime types
          const mimeTypes = [
            "video/webm;codecs=vp9",
            "video/webm;codecs=vp8",
            "video/webm",
            "video/mp4",
          ];

          let mimeType = "video/webm";
          for (const type of mimeTypes) {
            if (MediaRecorder.isTypeSupported(type)) {
              mimeType = type;
              break;
            }
          }

          const mediaRecorder = new MediaRecorder(streamRef.current, {
            mimeType,
            videoBitsPerSecond: 2500000, // 2.5 Mbps
          });

          mediaRecorderRef.current = mediaRecorder;

          mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
              recordedChunksRef.current.push(event.data);
            }
          };

          mediaRecorder.onstop = () => {
            if (!isMountedRef.current) return;

            const blob = new Blob(recordedChunksRef.current, {
              type: mimeType,
            });
            const url = URL.createObjectURL(blob);
            setCapturedVideo(url);
            setIsRecording(false);
            stopPulsing();
          };

          mediaRecorder.start();

          // Auto stop after 15 seconds
          recordingTimeoutRef.current = setTimeout(() => {
            if (!isMountedRef.current) return;
            stopRecording();
          }, MAX_RECORDING_DURATION);
        } catch (error) {
          console.error("Erro ao iniciar gravação:", error);
          setIsRecording(false);
          stopPulsing();
          clearAllTimers();

          Toast.show({
            type: "error",
            text1: "Erro",
            text2: "Não foi possível gravar o vídeo.",
          });
        }
      }, 600);
    } catch (error) {
      console.error("Erro ao gravar:", error);
      setIsRecording(false);
      stopPulsing();
      clearAllTimers();
    }
  };

  // Stop video recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      stopPulsing();
      setIsRecording(false);
      clearAllTimers();
    }
  };

  // Pulse animation for recording indicator
  const startPulsing = () => {
    if (!isMountedRef.current) return;

    if (pulseAnimationRef.current) {
      pulseAnimationRef.current.stop();
    }

    pulseAnimationRef.current = Animated.loop(
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
    );

    pulseAnimationRef.current.start();
  };

  const stopPulsing = () => {
    if (pulseAnimationRef.current) {
      pulseAnimationRef.current.stop();
      pulseAnimationRef.current = null;
    }
    pulseAnim.setValue(1);
  };

  const clearAllTimers = () => {
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }

    if (startRecordingTimeoutRef.current) {
      clearTimeout(startRecordingTimeoutRef.current);
      startRecordingTimeoutRef.current = null;
    }

    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  // Handle press in (for long press to record)
  const handlePressIn = () => {
    if (!isMountedRef.current) return;

    const timer = setTimeout(() => {
      if (!isMountedRef.current) return;
      setDidLongPress(true);
      startRecording();
    }, 200);

    setPressTimer(timer);
  };

  // Handle press out
  const handlePressOut = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }

    if (!isMountedRef.current) return;

    if (didLongPress) {
      stopRecording();
    } else {
      handleCapture();
    }

    setDidLongPress(false);
  };

  // Handle close
  const handleClose = () => {
    stopRecording();
    stopCamera();
    clearAllTimers();
    stopPulsing();

    setCapturedPhoto(null);
    setCapturedVideo(null);
    setIsRecording(false);
    closeCamera();

    setTimeout(() => {
      if (isMountedRef.current) {
        router.push("/(drawer)/(tabs)/home");
      }
    }, 300);
  };

  // Handle submit (upload weestory)
  const handleSubmit = async () => {
    if (!isMountedRef.current) return;

    setIsLoading(true);
    setShowProgress(true);

    try {
      // Convert blob URL to File for upload
      let imageFile: File | undefined;
      let videoFile: File | undefined;

      if (capturedPhoto) {
        const response = await fetch(capturedPhoto);
        const blob = await response.blob();
        imageFile = new File([blob], `weestory-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
      }

      if (capturedVideo) {
        const response = await fetch(capturedVideo);
        const blob = await response.blob();
        videoFile = new File([blob], `weestory-${Date.now()}.webm`, {
          type: blob.type,
        });
      }

      await createWeestory({
        image: capturedPhoto || undefined,
        video: capturedVideo || undefined,
        onProgress: (progressValue) => {
          if (!isMountedRef.current) return;
          console.log("[Progress] ", progressValue, "%");
          progress.setValue(progressValue / 100);
        },
      });

      if (!isMountedRef.current) return;

      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: "Seu Weestory foi postado com sucesso!",
      });

      handleClose();
    } catch (error) {
      console.error("error ", error);
      handleClose();

      if (isMountedRef.current) {
        Toast.show({
          type: "error",
          text1: "Erro",
          text2: "Não foi possível adicionar seu weestory",
        });
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setShowProgress(false);
      }
    }
  };

  // Handle bottom sheet
  const handlePresentModal = () => {
    if (!isMountedRef.current) return;
    progress.setValue(0);
    setShowBottomSheet(true);
    setBottomSheetIndex(0);
  };

  const handleCloseModal = () => {
    if (!isMountedRef.current) return;
    progress.setValue(0);
    setShowProgress(false);
    setShowBottomSheet(false);
    setBottomSheetIndex(-1);
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

  // Effects
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      clearAllTimers();
      stopPulsing();
      stopRecording();
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (isVisible && !capturedPhoto && !capturedVideo) {
      initializeCamera();
    } else if (!isVisible) {
      stopCamera();
      clearAllTimers();
      stopPulsing();
      setIsRecording(false);
      setCapturedPhoto(null);
      setCapturedVideo(null);
      setShowProgress(false);
      setShowBottomSheet(false);
    }
  }, [isVisible]);

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
            <Text className="text-white text-sm mt-4">
              Iniciando câmera...
            </Text>
          </View>
        ) : !hasPermission ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-base font-medium text-white text-center mb-4">
              Precisamos de acesso à sua câmera e microfone
            </Text>
            <Text className="text-sm font-regular text-neutral-400 text-center mb-4">
              Permita o acesso quando solicitado pelo navegador.
            </Text>
            <Button
              handlePress={initializeCamera}
              containerStyles="mt-4 w-50"
              title="Tentar novamente"
            />
            <Button
              handlePress={handleClose}
              containerStyles="mt-2 w-50 bg-transparent border border-white"
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
                    <video
                      src={capturedVideo}
                      autoPlay
                      loop
                      muted={false}
                      playsInline
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
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

                  {/* Video preview */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transform: facing === "user" ? "scaleX(-1)" : "none",
                    }}
                  />

                  {/* Hidden canvas for photo capture */}
                  <canvas
                    ref={canvasRef}
                    style={{ display: "none" }}
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
            snapPoints={[height * (showProgress ? 0.28 : 0.32)]}
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

              {showProgress ? (
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
              ) : (
                <Button
                  isLoading={isLoading}
                  handlePress={handleSubmit}
                  containerStyles="mt-4 w-full"
                  title="Compartilhar"
                />
              )}
            </BottomSheetView>
          </BottomSheet>
        )}
      </SafeAreaView>
    </Modal>
  );
}
