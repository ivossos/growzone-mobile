import { colors } from "@/styles/colors";
import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Device from "expo-device";
import {
  Camera,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
  useMicrophonePermission,
} from "react-native-vision-camera";
import Button from "@/components/ui/button";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { Image } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";

import RevertIcon from "@/assets/icons/revert-icon.svg";
import CopyIcon from "@/assets/icons/copy-item-icon.svg";
import WeestoryCircleIcon from "@/assets/icons/weestory-circle-icon.svg";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import * as ImageManipulator from "expo-image-manipulator";
import { createWeestory } from "@/api/social/weestory/create-weestory";

const MAX_RECORDING_DURATION = 15000; // 15 segundos
const { height, width } = Dimensions.get("window");

export default function WeestoryScreen() {
  const insets = useSafeAreaInsets();
  const {
    hasPermission: hasCameraPermission,
    requestPermission: requestCameraPermission,
  } = useCameraPermission();
  const {
    hasPermission: hasMicrophonePermission,
    requestPermission: requestMicrophonePermission,
  } = useMicrophonePermission();
  const [loading, setLoading] = useState<boolean>(false);
  const camera = useRef<Camera>(null);
  const [cameraPosition, setCameraPosition] = useState<"front" | "back">(
    "front"
  );
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [capturedVideo, setCapturedVideo] = useState<string | null>(null);
  const [cameraIsReady, setCameraIsReady] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startRecordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timePressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [pulseAnim] = useState(new Animated.Value(1));
  const pulseAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  const [showProgress, setShowProgress] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  const playerVideoPreview = useVideoPlayer(capturedVideo, (player) => {
    // Configurações do player se necessário
    player.muted = false;
    player.loop = true;
    player.play();
  });
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [bottomSheetIndex, setBottomSheetIndex] = useState(0);

  const [isLoadingResponse, setIsLoadingResponse] = useState(false);

  // Verifica se estamos em um simulador
  const isSimulator = Platform.OS === "ios" && !Device.isDevice;
  // ================================================

  // Camera device settings
  let cameraDevice = useCameraDevice(cameraPosition);
  const format = useCameraFormat(cameraDevice, [
    {
      videoAspectRatio: 16 / 9,
      photoAspectRatio: 16 / 9,
      photoResolution: { width: 1920, height: 1080 },
      videoResolution: { width: 1920, height: 1080 },
      videoHdr: false,
      fps: 30,
    },
  ]);
  // ================================================

  // Functions

  /**
   * Normaliza o URI do arquivo
   */
  const normalizeFileUri = (path: string) => {
    return Platform.OS === "android" && !path.startsWith("file://")
      ? `file://${path}`
      : path;
  };

  /**
   * Abre o bottom sheet
   */
  const openBottomSheet = () => {
    setShowBottomSheet(true);
    setBottomSheetIndex(0);
    progress.setValue(0);
  };

  /**
   * Fecha o bottom sheet
   */
  const closeBottomSheet = () => {
    setShowBottomSheet(false);
    setBottomSheetIndex(0);
    progress.setValue(0);
    setShowProgress(false);
    clearProcess();
  };

  /**
   * Envia o weestory para o servidor
   */
  const handleSubmit = async () => {
    console.log("[Iniciando processo de envio de weestory]");
    if (!capturedPhoto && !capturedVideo) {
      Toast.show({
        type: "error",
        text1: "Nenhum arquivo encontrado",
        text2: "A camera não conseguiu capturar nenhum arquivo",
      });
      return;
    }
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
        text1: "Sucesso!",
        text2: "Seu weestory foi postado!",
      });
    } catch (error) {
      console.log("[Erro ao tentar subir o weestory]", error);
      Toast.show({
        type: "error",
        text1: "Não foi possível adicionar seu weestory",
        text2: "Tente novamente mais tarde",
      });
    } finally {
      closeCamera();
    }
  };

  /**
   * Limpa todos os estados e recursos
   */
  const clearProcess = () => {
    setCapturedPhoto(null);
    setCapturedVideo(null);
    setIsRecording(false);
    setIsLoadingResponse(false);
    setShowBottomSheet(false);
    setBottomSheetIndex(0);
    progress.setValue(0);
    setShowProgress(false);
    if (playerVideoPreview) {
      playerVideoPreview.release();
    }
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }

    if (pulseAnimationRef.current) {
      pulseAnimationRef.current.stop();
      pulseAnimationRef.current = null;
    }

    if (startRecordingTimeoutRef.current) {
      clearTimeout(startRecordingTimeoutRef.current);
      startRecordingTimeoutRef.current = null;
    }

    if (timePressTimeoutRef.current) {
      clearTimeout(timePressTimeoutRef.current);
      timePressTimeoutRef.current = null;
    }
  };

  /**
   * Fecha a câmera e redireciona para a tela inicial
   */
  const closeCamera = () => {
    clearProcess();
    setLoading(true);
    setTimeout(() => {
      router.push("/(drawer)/(tabs)/home");
    }, 600);
  };

  /**
   * Iniciar animação de gravar tela
   */
  const startPulsing = () => {
    // Limpa animação anterior se existir
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

  /**
   * Encerrar animação de gravar tela
   */
  const stopPulsing = () => {
    if (pulseAnimationRef.current) {
      pulseAnimationRef.current.stop();
      pulseAnimationRef.current = null;
    }
    pulseAnim.setValue(1);
  };

  /**
   * Captura uma foto
   */
  const takePhoto = async () => {
    if (!camera.current || !cameraDevice) {
      Toast.show({
        type: "error",
        text1: "Erro ao capturar foto",
        text2: "Tente novamente mais tarde",
      });
      closeCamera();
      return;
    }
    if (isRecording) return;
    setIsLoadingResponse(true);
    try {
      const photo = await camera.current.takePhoto({
        flash: "off",
      });
      if (!photo || !camera.current) {
        Toast.show({
          type: "error",
          text1: "Foto não capturada",
          text2: "Tente novamente mais tarde",
        });
        return;
      }
      const photoUri = normalizeFileUri(photo.path);
      const final = await ImageManipulator.manipulateAsync(photoUri, [], {
        compress: 1,
        format: ImageManipulator.SaveFormat.JPEG,
      });
      if (!final) {
        Toast.show({
          type: "error",
          text1: "Erro ao processar foto",
          text2: "Tente novamente mais tarde",
        });
        return;
      }
      setCapturedPhoto(final.uri);
    } catch (error) {
      console.log("[Erro ao capturar foto]", error);
      Toast.show({
        type: "error",
        text1: "Erro ao capturar foto",
        text2: "Tente novamente mais tarde",
      });
    } finally {
      setIsLoadingResponse(false);
    }
  };

  const recordVideo = async () => {
    if (!camera.current || !cameraDevice) {
      Toast.show({
        type: "error",
        text1: "Erro ao capturar vídeo",
        text2: "Tente novamente mais tarde",
      });
      closeCamera();
      return;
    }
    startPulsing();
    try {
      camera.current.startRecording({
        videoCodec: "h264",
        onRecordingError: (error) => {
          console.error("[Erro ao gravar (onRecordingError)]", error);
          Toast.show({
            type: "error",
            text1: "Erro ao gravar vídeo",
            text2: "Tente novamente mais tarde",
          });
          closeCamera();
        },
        onRecordingFinished: (video) => {
          console.log("[Video gravado]");
          if (recordingTimeoutRef.current) {
            clearTimeout(recordingTimeoutRef.current);
            recordingTimeoutRef.current = null;
          }
          if (!video) {
            Toast.show({
              type: "error",
              text1: "Erro ao pegar vídeo gravado",
              text2: "Tente novamente mais tarde",
            });
            closeCamera();
            return;
          }
          const videoUri = normalizeFileUri(video.path);
          if (!videoUri) {
            Toast.show({
              type: "error",
              text1: "Erro ao pegar caminho do vídeo gravado",
              text2: "Tente novamente mais tarde",
            });
            closeCamera();
            return;
          }
          setCapturedVideo(videoUri);
          stopPulsing();
        },
      });

      // Parar a gravação após 15 segundos
      recordingTimeoutRef.current = setTimeout(() => {
        console.log("⏰ Timeout atingido, parando gravação");
        if (camera.current) {
          camera.current.stopRecording();
          stopPulsing();
        }
      }, MAX_RECORDING_DURATION);
    } catch (error) {
      console.error("[Erro ao gravar (catch)]", error);
      Toast.show({
        type: "error",
        text1: "Erro ao gravar vídeo",
        text2: "Tente novamente mais tarde",
      });
    }
  };

  /**
   * Inicia a ação de pressionar o botão. Longo período pressionando, gravação inicia, curto, tirar foto.
   */
  const handlePressIn = () => {
    console.log("[Pressionei o botão]", new Date().toISOString());
    timePressTimeoutRef.current = setTimeout(() => {
      console.log("[Estou gravando]", new Date().toISOString());
      setIsRecording(true);
      recordVideo();
    }, 200);
  };

  /**
   * Encerra a ação de pressionar o botão, e defini se houve a ação de tirar foto ou encerrar gravação de video.
   */
  const handlePressOut = () => {
    console.log("[Soltei o botão]", new Date().toISOString());
    if (timePressTimeoutRef.current) {
      clearTimeout(timePressTimeoutRef.current);
      timePressTimeoutRef.current = null;
    }
    if (isRecording) {
      console.log("[Finalizei a gravação]", new Date().toISOString());
      if (camera.current) {
        camera.current.stopRecording();
        stopPulsing();
      }
    } else {
      console.log("[Opa, Tirei foto!]", new Date().toISOString());
      takePhoto();
    }
    setIsRecording(false);
  };

  // ================================================

  // Pega a permissão da câmera e do microfone
  const userHasPermission = hasCameraPermission && hasMicrophonePermission;
  useEffect(() => {
    if (!hasCameraPermission) {
      requestCameraPermission();
    }

    if (!hasMicrophonePermission) {
      requestMicrophonePermission();
    }

    if (hasCameraPermission && hasMicrophonePermission) {
      setLoading(false);
    }
  }, [hasCameraPermission, hasMicrophonePermission]);
  // ================================================

  // Atualiza player de vídeo
  useEffect(() => {
    if (capturedVideo && playerVideoPreview) {
      playerVideoPreview.replace(capturedVideo);
    }
  }, [capturedVideo]);
  // ================================================

  // Content

  /**
   * Mostra a preview do media capturado
   */
  const showMediaPreview = () => {
    if (capturedPhoto) {
      return (
        <Image
          source={{ uri: capturedPhoto }}
          className="rounded flex"
          style={{
            height: height * 0.92,
            width: "100%",
            borderRadius: 10,
          }}
          resizeMode="contain"
        />
      );
    }
    if (capturedVideo && playerVideoPreview) {
      return (
        <VideoView
          player={playerVideoPreview}
          style={{
            height: height * 0.92,
            width: "100%",
            borderRadius: 10,
          }}
          contentFit="contain"
        />
      );
    }
    return (
      <>
        <ActivityIndicator size="large" color={colors.brand.green} />
        <Text className="text-base font-medium text-white text-center mb-4">
          Mídia não encontrada
        </Text>
      </>
    );
  };

  /**
   * Renderiza o conteúdo da câmera
   */
  const renderContentCamera = () => {
    if (!cameraDevice || isSimulator) {
      return (
        <>
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
            handlePress={() => {}}
            containerStyles="mt-4 w-50"
            title="Fechar"
          />
        </>
      );
    }
    const hasCapturedMedia = capturedPhoto ?? capturedVideo;
    const isDisabledButton = !cameraIsReady || isLoadingResponse;
    return (
      <View
        className="relative w-full bg-black-100"
        style={{
          height: height,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            hasCapturedMedia ? clearProcess() : closeCamera();
          }}
          className={`absolute left-5 w-12 h-12 rounded-full bg-black-80 items-center justify-center z-10 ${
            Platform.OS === "ios" ? "top-[45px]" : "top-[40px]"
          }`}
        >
          {hasCapturedMedia ? (
            <Entypo name="chevron-left" size={27} color="white" />
          ) : (
            <Ionicons name="close" size={28} color="white" />
          )}
        </TouchableOpacity>
        {hasCapturedMedia ? (
          showMediaPreview()
        ) : (
          <Camera
            ref={camera}
            device={cameraDevice}
            isActive={true}
            format={format}
            video={true}
            photo={true}
            audio={true}
            videoBitRate="low"
            resizeMode="contain"
            outputOrientation="preview"
            style={{
              width: "100%",
              height: "90%",
              zIndex: 0,
              borderRadius: 10,
            }}
            onInitialized={() => {
              setCameraIsReady(true);
              console.log("Camera is ready");
            }}
            onError={(error) => {
              console.log("Camera error", error);
            }}
          />
        )}
        <View
          className={`flex justify-end flex-1 ${
            Platform.OS === "ios" && "mb-[70px]"
          }`}
        >
          <View className="bg-black-100 flex justify-center items-center">
            <View className="flex-row items-center justify-between w-full px-2 pt-5">
              {hasCapturedMedia ? (
                <>
                  <View className="flex flex-row items-center gap-3 p-4 rounded-full border border-black-80">
                    <CopyIcon />
                    <Text className="text-base font-semibold text-neutral-400">
                      Seu weestory
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={openBottomSheet}
                    className="w-12 h-12 rounded-full bg-white items-center justify-center"
                  >
                    <Entypo name="chevron-right" size={24} color="black" />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={{ width: 30 }} />
                  <View>
                    <TouchableWithoutFeedback
                      disabled={isDisabledButton}
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
                          <View
                            style={styles.centerCircle}
                            className={`flex items-center justify-center ${
                              isDisabledButton && "opacity-70"
                            }`}
                          >
                            {isLoadingResponse && (
                              <ActivityIndicator
                                size="large"
                                color={colors.primary}
                              />
                            )}
                          </View>
                        </View>
                      </Animated.View>
                    </TouchableWithoutFeedback>
                    <Text
                      className="text-white text-base font-semibold absolute"
                      style={{
                        fontSize: 14,
                        top: 30,
                        width: 100,
                      }}
                    >
                      WEESTORY
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setCameraPosition(
                        cameraPosition === "front" ? "back" : "front"
                      );
                    }}
                  >
                    <RevertIcon />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };
  // ================================================

  return (
    <View className="flex flex-1 items-center justify-center relative">
      {!userHasPermission || loading ? (
        <ActivityIndicator size="large" color={colors.brand.green} />
      ) : (
        <>
          {renderContentCamera()}
          {showBottomSheet && (
            <BottomSheet
              index={bottomSheetIndex}
              snapPoints={[height * (showProgress ? 0.25 : 0.32)]}
              onClose={closeBottomSheet}
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
                      onPress={closeBottomSheet}
                      className="w-12 h-12 rounded-full bg-black-70 items-center justify-center"
                    >
                      <WeestoryCircleIcon />
                    </TouchableOpacity>
                    <Text className="text-base font-semibold text-white">
                      Weestory
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={closeBottomSheet}
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
                    isLoading={false}
                    handlePress={handleSubmit}
                    containerStyles="mt-4 w-full"
                    title="Compartilhar"
                  />
                )}
              </BottomSheetView>
            </BottomSheet>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    bottom: 65,
  },
  innerCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  centerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
  },
});
