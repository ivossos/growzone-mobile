import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  Button,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { ResizeMode, Video } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { useCameraModal } from "@/context/camera-modal-context";
import RevertCameraIcon from "@/assets/icons/revert-icon.svg";

const CameraScreen = () => {
  const { isVisible, closeCamera } = useCameraModal();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [media, setMedia] = useState<{
    uri: string;
    type: "photo" | "video";
  } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);

  const takePicture = async () => {
    if (cameraRef.current) {
      setLoading(true);
      const photo = await cameraRef.current.takePictureAsync();
      setMedia({ uri: photo.uri, type: "photo" });
      setLoading(false);
    }
  };

  const recordVideo = async () => {
    if (cameraRef.current && !isRecording) {
      setIsRecording(true);
      const video = await cameraRef.current.recordAsync();
      setMedia({ uri: video.uri, type: "video" });
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };

  const resetMedia = () => setMedia(null);

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  console.log("logger", media);

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.header}>
        <TouchableOpacity onPress={closeCamera}>
          <Ionicons name="close" size={35} color="white" />
        </TouchableOpacity>
      </View>

      {!permission && <View />}

      {!permission?.granted && (
        <View>
          <Text>We need your permission to show the camera</Text>
          <Button onPress={requestPermission} title="grant permission" />
        </View>
      )}

      {permission?.granted && (
        <View className="flex-1 bg-black-100">
          {media ? (
            <View className="flex-1 justify-center items-center">
              {media.type === "photo" ? (
                <Image source={{ uri: media.uri }} className="w-full h-4/5" />
              ) : (
                <Video
                  source={{ uri: media.uri }}
                  className="w-full h-4/5"
                  useNativeControls
                  resizeMode={ResizeMode.COVER}
                  isLooping
                />
              )}
              <View className="flex-row justify-between w-full p-4 absolute bottom-5">
                <TouchableOpacity
                  onPress={resetMedia}
                  className="bg-red-500 p-3 rounded-full"
                >
                  <Ionicons name="close" size={30} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={closeCamera}
                  className="bg-green-500 p-3 rounded-full"
                >
                  <Ionicons name="checkmark" size={30} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <CameraView ref={cameraRef} facing={facing} style={styles.camera}>
              <View style={styles.buttonContainer}>
                <View style={{ height: 10 }} />
                <TouchableOpacity
                  onPressIn={recordVideo}
                  onPressOut={stopRecording}
                  onLongPress={recordVideo}
                  onPress={takePicture}
                  className="w-20 h-20 border-4 border-white rounded-full justify-center items-center"
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : isRecording ? (
                    <View className="w-12 h-12 bg-red-500 rounded-lg" />
                  ) : (
                    <View className="w-16 h-16 bg-white rounded-full" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleCameraFacing}>
                  <RevertCameraIcon />
                </TouchableOpacity>
              </View>
            </CameraView>
          )}
        </View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1,
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 130,
    backgroundColor: "#000",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 20,
  },
});

export default CameraScreen;
