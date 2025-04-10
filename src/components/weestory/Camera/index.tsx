import React, { useRef, useState } from "react";
import {
  Modal,
  View,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  Text,
  Animated,
  Image,
} from "react-native";
import { useCameraModal } from "@/context/camera-modal-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";

import { styles } from "./styles";

const { height, width } = Dimensions.get("window");

export default function CameraModal() {
  const { isVisible, closeCamera } = useCameraModal();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [capturedPhoto, setCapturedPhoto] = useState<string | null | undefined>(
    null
  );
  const cameraRef = useRef<CameraView | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();

  const handleCapture = async () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setCapturedPhoto(photo?.uri);
      console.log("📸 Foto tirada:", photo?.uri);
    }
  };

  const handleClosePhoto = () => {
    setCapturedPhoto(null);
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
              {capturedPhoto ? (
                <View className="flex-1 justify-center items-center bg-black">
                  <Image
                    source={{ uri: capturedPhoto }}
                    className="w-full h-full"
                    resizeMode="cover"
                    style={{
                      transform:
                        facing === "front" ? [{ scaleX: -1 }] : undefined,
                    }}
                  />
                  <TouchableOpacity
                    onPress={handleClosePhoto}
                    className="absolute top-5 left-5"
                  >
                    <Ionicons name="close" size={32} color="white" />
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View className="absolute top-5 left-5 z-10">
                    <TouchableOpacity onPress={closeCamera}>
                      <Ionicons name="close" size={28} color="white" />
                    </TouchableOpacity>
                  </View>
                  <CameraView
                    ref={cameraRef}
                    facing={facing}
                    style={styles.camera}
                  />
                </>
              )}
            </View>

            {capturedPhoto ? (
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
                  style={{
                    paddingBottom: insets.bottom || 16,
                  }}
                >
                  <View className="flex-row items-center justify-around w-full px-10">
                    <TouchableOpacity onPress={closeCamera} activeOpacity={0.8}>
                      <Ionicons name="images-outline" size={30} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleCapture}
                      activeOpacity={0.8}
                    >
                      <View style={styles.outerCircle}>
                        <View style={styles.innerCircle}>
                          <View style={styles.centerCircle} />
                        </View>
                      </View>
                    </TouchableOpacity>
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
