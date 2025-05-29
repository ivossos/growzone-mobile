import React, { useRef, useState, useEffect, use } from "react";
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
} from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import Toast from "react-native-toast-message";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import {
  CameraView,
  CameraType,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import * as ImageManipulator from "expo-image-manipulator";

import Button from "@/components/ui/button";
import { useCameraModal } from "@/context/camera-modal-context";

import { createWeestory } from "@/api/social/weestory/create-weestory";

import GalleryIcon from "@/assets/icons/gallery-icon.svg";
import RevertIcon from "@/assets/icons/revert-icon.svg";
import CopyIcon from "@/assets/icons/copy-item-icon.svg";
import WeestoryCircleIcon from "@/assets/icons/weestory-circle-icon.svg";

import { colors } from "@/styles/colors";
import { styles } from "./styles";

const { height, width } = Dimensions.get("window");

export default function ModalCamera() {
  const insets = useSafeAreaInsets();
  const { infoCamera, isVisible, closeCamera } = useCameraModal();
  const [permission, requestPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] =
    useMicrophonePermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [facing, setFacing] = useState<CameraType>("front");
  const [scale, setScale] = useState<number>(-1);
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
  const bottomSheetRef = useRef<BottomSheet>(null);
  const player = useVideoPlayer(
    capturedVideo === undefined ? "" : capturedVideo,
    (player) => {
      player.loop = true;
      player.play();
    }
  );

  const handlePresentModal = () => {
    bottomSheetRef.current?.expand();
  };

  const handleCloseModal = () => {
    bottomSheetRef.current?.close();
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
    if (cameraRef.current && !isRecording) {
      setIsRecording(true);
      startPulsing();
      try {
        setTimeout(async () => {
          const video = await cameraRef.current?.recordAsync({
            maxDuration: 10,
          });
          setCapturedVideo(video?.uri);
          setIsRecording(false);
        }, 600);
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

/**
 * Captures a photo using the camera and processes the image.
 * 
 * This function checks if the camera is recording or if the camera reference 
 * is unavailable, and returns early if either condition is true. It then 
 * takes a picture using the camera, and if successful, manipulates the captured 
 * photo by resizing it to specified dimensions. The manipulated image is then 
 * saved, and its URI is stored in the state.
 * 
 * @throws Will log an error message if image manipulation fails.
 */
  const handleCapture = async () => {
    if (isRecording || !cameraRef.current) return;

    const photo = await cameraRef.current.takePictureAsync({});
    if (!photo) return;

    try {
      const manipulate = ImageManipulator.ImageManipulator.manipulate(
        photo.uri
      );
      // Nova API com operações combinadas
      const result = await manipulate
        .resize({ width: 1080, height: 1920 })
        .renderAsync();
      const final = await result.saveAsync();
      setCapturedPhoto(final.uri);
    } catch (e) {
      console.error("Image manipulation failed", e);
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
    setScale(-1);
    closeCamera();
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await createWeestory({
        image: capturedPhoto,
        video: capturedVideo,
      });

      handleClose();

      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: "Seu Weestory foi postado com sucesso!",
      });
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
    setScale(-1);
  };

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  const handlePermissionRequest = async () => {
    if (permission?.canAskAgain) {
      await requestPermission();
    }

    if (microphonePermission?.canAskAgain) {
      await requestMicrophonePermission();
    }

    if (!permission?.canAskAgain || !microphonePermission?.canAskAgain) {
      await Linking.openSettings();
    }
  };

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }

    if (!microphonePermission?.granted) {
      requestMicrophonePermission();
    }
  }, [permission, microphonePermission]);

  useEffect(() => {
    if (infoCamera.mediaType) {
      if (infoCamera.mediaType === "video") {
        setScale(1);
        setCapturedVideo(infoCamera.uri);
        return;
      }

      if (infoCamera.mediaType === "photo") {
        setScale(1);
        setCapturedPhoto(infoCamera.uri);
        return;
      }
    }
  }, [infoCamera]);

  /**
   * @description
   * This function returns a footer component for the camera modal that shows a preview of the captured weestory.
   * If the user has captured a weestory, it shows a preview of the weestory and a button to share it.
   * If the user has not captured a weestory, it shows a camera button to capture a weestory.
   * @returns A footer component for the camera modal.
   */
  const hasCapturedMyWeestory = () => {
    if (capturedPhoto || capturedVideo) {
      return (
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
      );
    }
    return (
      <View style={styles.footer}>
        <View
          className="bg-black justify-center items-center"
          style={{ paddingBottom: insets.bottom || 16 }}
        >
          <View className="flex-row items-center justify-around w-full">
            <TouchableOpacity onPress={handleClose} activeOpacity={0.8}>
              <GalleryIcon />
            </TouchableOpacity>
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
                className="text-white text-base font-semibold  absolute"
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
    );
  };

  /**
   * Returns the captured photo or video, or null if nothing has been captured
   * yet.
   * If a photo was captured, it renders the photo, scaled and transformed
   * according to the camera's facing and the device's orientation.
   * If a video was captured, it renders the video player, with a
   * transform applied if the camera is facing front.
   * If the video player is not ready, it renders an activity indicator.
   */
  const hasCapturedSomething = () => {
    if (capturedPhoto) {
      return (
        <Image
          source={{ uri: capturedPhoto }}
          className="w-full h-full"
          resizeMode="cover"
          style={{
            transform: facing === "front" ? [{ scaleX: scale }] : undefined,
          }}
        />
      );
    }
    if (capturedVideo) {
      return (
        <>
          {!videoReady && (
            <ActivityIndicator color="#fff" size="large" className="absolute" />
          )}
          <VideoView
            player={player}
            style={{
              width,
              height,
              transform: facing === "front" ? [{ scaleX: scale }] : undefined,
            }}
            contentFit="cover"
            allowsFullscreen
            onFirstFrameRender={() => setVideoReady(true)}
          />
        </>
      );
    }
    return null;
  };

  /**
   * Renders a permission request screen if the user has not granted permission to access
   * the camera and microphone, or if the user has not granted permission to record video.
   * If the user has granted permission, it renders the camera preview screen.
   * @returns A JSX element representing the permission request screen or the camera preview screen.
   */
  const hasPermission = () => {
    if (!permission) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.brand.green} />
        </View>
      );
    }
    if (!permission?.granted || !microphonePermission?.granted) {
      return (
        <View className="flex-1 items-center justify-center">
          <Text className="text-base font-medium text-white text-center">
            Precisamos de acesso à sua câmera e microfone para capturar fotos e
            vídeos.
          </Text>
          <Button
            handlePress={handlePermissionRequest}
            containerStyles="mt-4 w-50"
            title={
              permission?.canAskAgain
                ? "Conceder permissão"
                : "Abrir configurações"
            }
          />
        </View>
      );
    }
    return (
      <>
        <View style={styles.cameraContainer}>
          {capturedPhoto || capturedVideo ? (
            <View className="flex-1 justify-center items-center bg-black">
              {hasCapturedSomething()}
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
              <CameraView
                ref={cameraRef}
                facing={facing}
                style={styles.camera}
                mode={isRecording ? "video" : "picture"}
                ratio="16:9"
                pictureSize="1080x1920"
              />
            </>
          )}
        </View>
        {hasCapturedMyWeestory()}
      </>
    );
  };

  return (
    <Modal visible={isVisible} animationType="fade">
      <SafeAreaView style={styles.safearea}>
        {hasPermission()}
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={[height * 0.3]}
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
          </BottomSheetView>
        </BottomSheet>
      </SafeAreaView>
    </Modal>
  );
}
