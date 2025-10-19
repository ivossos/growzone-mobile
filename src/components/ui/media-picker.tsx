import React, { useCallback, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { createVideoPlayer, VideoPlayer as VideoPlayerType } from "expo-video";
import { Camera, ImageIcon, XIcon } from "lucide-react-native";
import Toast from "react-native-toast-message";

type MediaUpload = { uri: string; fileName?: string; type?: string };

const colors = {
  primary: "#00A86B",
  brand: { white: "#fff" },
  black: { 70: "#666" }
};

export default function MediaPicker({ onMediaSelected }: { onMediaSelected: (m: MediaUpload) => void }) {
  const [mediaUris, setMediaUris] = useState<Array<MediaUpload & { player?: VideoPlayerType }>>([]);

  const pickFromLibrary = async (videos = false) => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Toast.show({ type: "info", text1: "Permissão necessária", text2: "Permita acesso à galeria." });

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: videos ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1
    });

    if (!res.canceled && res.assets?.length) handleResult(res);
  };

  const captureWithCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return Toast.show({ type: "info", text1: "Permissão necessária", text2: "Permita acesso à câmera." });

    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1
    });

    if (!res.canceled) handleResult(res);
  };

  const handleResult = (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled || !result.assets) return;

    result.assets.forEach((a, i) => {
      const isVideo = a.type?.startsWith("video");
      const ext = isVideo ? "mp4" : "jpg";

      const m: MediaUpload = {
        uri: a.uri,
        fileName: a.fileName || `media-${Date.now()}-${i}.${ext}`,
        type: a.mimeType || (isVideo ? "video/mp4" : "image/jpeg")
      };

      let player: VideoPlayerType | undefined = undefined;
      if (isVideo) {
        player = createVideoPlayer({ uri: m.uri });
        player.loop = true;
        player.volume = 1.0;
      }

      setMediaUris(prev => [...prev, { ...m, player }]);
      onMediaSelected(m);
    });
  };

  const removeMedia = (index: number) => {
    setMediaUris(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <View style={{ gap: 8 }}>
        <TouchableOpacity style={styles.btn} onPress={captureWithCamera}>
          <Camera color={colors.primary} size={20} />
          <Text style={styles.btnTxt}>Usar a Câmera</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={() => pickFromLibrary(false)}>
          <ImageIcon color={colors.primary} size={20} />
          <Text style={styles.btnTxt}>Escolher Foto</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={() => pickFromLibrary(true)}>
          <ImageIcon color={colors.primary} size={20} />
          <Text style={styles.btnTxt}>Escolher Vídeo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mediaContainer}>
        {mediaUris.map((media, index) => (
          <TouchableOpacity key={index} style={styles.mediaWrapper} onPress={() => removeMedia(index)}>
            {media.type?.startsWith("video") ? (
              <View style={[styles.media, { backgroundColor: "#111", justifyContent: "center", alignItems: "center" }]}>
                <Text style={{ color: "#fff", fontSize: 12 }}>Vídeo</Text>
              </View>
            ) : (
              <Image source={{ uri: media.uri }} style={styles.media} />
            )}
            <View style={styles.deleteButton}>
              <XIcon size={16} color="#fff" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16, alignItems: "flex-start" },
  btn: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderWidth: 1, borderColor: "#333", borderRadius: 8 },
  btnTxt: { color: "#ddd", fontSize: 14 },
  mediaContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  mediaWrapper: { width: 72, height: 72, position: "relative" },
  media: { width: "100%", height: "100%", borderRadius: 8 },
  deleteButton: { position: "absolute", top: 4, right: 4, backgroundColor: "red", borderRadius: 50, padding: 4 }
});