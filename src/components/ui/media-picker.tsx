import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ImageIcon, XIcon, Camera } from "lucide-react-native"; // Usando ícone de exclusão XCircleIcon
import { colors } from "@/styles/colors";
import { Modal } from "../Modal";
import Button from "./button";
import Toast from "react-native-toast-message";
import { MediaUpload } from "@/api/@types/models";
import { createVideoPlayer, VideoPlayer as VideoPlayerType } from "expo-video";
import VideoPlayer from "../VideoPlayer";

interface MediaPickerProps {
  onMediaSelected: (media: MediaUpload) => void;
}

const MediaPicker = ({ onMediaSelected }: MediaPickerProps) => {
  const [isOpenMedia, setIsOpenMedia] = useState(false);
  const [mediaUris, setMediaUris] = useState<
    Array<MediaUpload & { player?: VideoPlayerType }>
  >([]);

  const handleMedia = useCallback(() => {
    setIsOpenMedia(!isOpenMedia);
  }, [isOpenMedia]);

  const selectFromGallery = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Toast.show({
        type: "info",
        text1: "Permissão necessária",
        text2: "Você precisa permitir acesso à galeria!",
      });
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    handleMediaResult(pickerResult);
  };

  const captureWithCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Toast.show({
        type: "info",
        text1: "Permissão necessária",
        text2: "Você precisa permitir acesso à câmera!",
      });
      return;
    }

    const cameraResult = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    handleMediaResult(cameraResult);
  };

  const handleMediaResult = (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled || !result.assets || !result.assets.length) return;

    result.assets.forEach((asset, index) => {
      const extension = asset.type === "video" ? "MP4" : "JPEG";

      const newMedia: MediaUpload = {
        uri: asset.uri,
        fileName: asset.fileName || `media-${Date.now()}.${extension}`,
        type: asset.type as string,
      };

      let player: VideoPlayerType | undefined = undefined;

      if (asset.type === "video") {
        player = createVideoPlayer({
          uri: newMedia.uri,
          metadata: {
            title: `title-post-${index}`,
            artist: `artist-post-${index}`,
          },
        });

        player.loop = true;
        player.muted = false;
        player.timeUpdateEventInterval = 2;
        player.volume = 1.0;
      }

      setMediaUris((prevMediaUris) => [
        ...prevMediaUris,
        { ...newMedia, player },
      ]);
      onMediaSelected(newMedia);
    });

    handleMedia();
  };

  const removeMedia = (index: number) => {
    const updatedMedia = [...mediaUris];
    updatedMedia.splice(index, 1);
    setMediaUris(updatedMedia);
  };

  const actionModalMedia = useMemo(() => {
    return (
      <View className="gap-8">
        <View className="gap-2">
          <Text className="text-lg font-medium text-brand-white">
            Adicione um momento
          </Text>
          <Text className="text-medium font-medium text-brand-grey">
            Campartilhe fotos ou vídeos
          </Text>
        </View>
        <View className="gap-4">
          <Button
            title="Usar a Câmera"
            handlePress={captureWithCamera}
            variant="secondary"
            leftIcon={Camera}
            textStyles="text-base font-medium text-brand-white"
            leftIconProps={{ color: colors.primary }}
            containerStyles="gap-2"
          />

          <Button
            title="Escolher Foto ou Vídeo"
            handlePress={selectFromGallery}
            variant="secondary"
            leftIcon={ImageIcon}
            textStyles="text-base font-medium text-brand-white"
            leftIconProps={{ color: colors.primary }}
            containerStyles="gap-2"
          />
        </View>
      </View>
    );
  }, []);

  const modalSelectedMedia = useMemo(() => {
    return (
      <Modal
        transparent
        animationType="fade"
        visible={isOpenMedia}
        closeModal={handleMedia}
        onRequestClose={handleMedia}
      >
        {actionModalMedia}
      </Modal>
    );
  }, [isOpenMedia, actionModalMedia, handleMedia]);

  return (
    <View style={styles.container}>
      {isOpenMedia && modalSelectedMedia}

      <View style={styles.mediaContainer}>
        {mediaUris.map((media, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => removeMedia(index)}
            style={styles.mediaWrapper}
          >
            {media.type === "video" ? (
              <VideoPlayer
                player={media.player as VideoPlayerType}
                styleContainer={styles.media}
                autoplay={false}
                controls={{
                  showButtonPlay: false,
                  showProgressBar: false,
                }}
                loop
              />
            ) : (
              <Image
                source={{ uri: media.uri }}
                style={styles.media}
                resizeMode="cover"
              />
            )}
            <View style={styles.deleteButton}>
              <XIcon color={colors.brand.white} size={16} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        className="flex flex-row items-center gap-2 bottom-0 py-2 px-4 border border-black-80 rounded-lg"
        onPress={handleMedia}
      >
        <ImageIcon color={colors.black[70]} size={24} />
        <Text className="text-black-30 text-base font-medium">
          Foto ou Vídeo
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    gap: 24,
  },
  mediaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
  },
  mediaWrapper: {
    position: "relative",
    width: 56,
    height: 56,
    maxWidth: 56,
    maxHeight: 56,
  },
  media: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  deleteButton: {
    position: "absolute",
    top: "25%",
    right: "25%",
    padding: 4,
    backgroundColor: "red",
    borderRadius: 50,
  },
});

export default MediaPicker;
