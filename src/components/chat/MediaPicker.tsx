/**
 * Media Picker Component
 * Handles image, video, and audio uploads for chat
 */

import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Audio } from "expo-av";
import { uploadMedia } from "@/api/chat/chat-api";
import { colors } from "@/styles/colors";

interface MediaPickerProps {
  onMediaSelected: (mediaData: MediaData) => void;
  onClose: () => void;
  visible: boolean;
}

export interface MediaData {
  type: "image" | "video" | "audio" | "file";
  uri: string;
  duration?: number; // For audio/video
  name?: string; // For files
}

export function MediaPicker({ onMediaSelected, onClose, visible }: MediaPickerProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const requestPermissions = async (type: "camera" | "library" | "audio") => {
    try {
      if (type === "camera") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        return status === "granted";
      } else if (type === "library") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        return status === "granted";
      } else if (type === "audio") {
        const { status } = await Audio.requestPermissionsAsync();
        return status === "granted";
      }
      return false;
    } catch (error) {
      console.error("Permission error:", error);
      return false;
    }
  };

  const uploadFile = async (uri: string, type: string): Promise<string> => {
    try {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();

      // Get file extension
      const uriParts = uri.split(".");
      const fileExtension = uriParts[uriParts.length - 1];

      // Create file object
      const file: any = {
        uri: Platform.OS === "ios" ? uri.replace("file://", "") : uri,
        type: `${type}/${fileExtension}`,
        name: `upload_${Date.now()}.${fileExtension}`,
      };

      formData.append("file", file);
      formData.append("type", type);

      // Simulate progress (real implementation would use XMLHttpRequest or axios with progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const result = await uploadMedia(formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      return result.url;
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Erro", "Falha ao fazer upload do arquivo");
      throw error;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleCamera = async () => {
    const hasPermission = await requestPermissions("camera");
    if (!hasPermission) {
      Alert.alert("Permissão Negada", "Precisamos de acesso à câmera");
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images", "videos"],
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 60, // 1 minute
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const uploadedUrl = await uploadFile(
          asset.uri,
          asset.type === "video" ? "video" : "image"
        );

        onMediaSelected({
          type: asset.type === "video" ? "video" : "image",
          uri: uploadedUrl,
          duration: asset.duration,
        });
        onClose();
      }
    } catch (error) {
      console.error("Camera error:", error);
    }
  };

  const handleImageLibrary = async () => {
    const hasPermission = await requestPermissions("library");
    if (!hasPermission) {
      Alert.alert("Permissão Negada", "Precisamos de acesso à galeria");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const uploadedUrl = await uploadFile(
          asset.uri,
          asset.type === "video" ? "video" : "image"
        );

        onMediaSelected({
          type: asset.type === "video" ? "video" : "image",
          uri: uploadedUrl,
          duration: asset.duration,
        });
        onClose();
      }
    } catch (error) {
      console.error("Image library error:", error);
    }
  };

  const handleDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const uploadedUrl = await uploadFile(asset.uri, "file");

        onMediaSelected({
          type: "file",
          uri: uploadedUrl,
          name: asset.name,
        });
        onClose();
      }
    } catch (error) {
      console.error("Document picker error:", error);
    }
  };

  const options = [
    {
      icon: "camera" as const,
      label: "Câmera",
      onPress: handleCamera,
      color: colors.primary,
    },
    {
      icon: "images" as const,
      label: "Galeria",
      onPress: handleImageLibrary,
      color: colors.primary,
    },
    {
      icon: "document" as const,
      label: "Arquivo",
      onPress: handleDocument,
      color: colors.primary,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 bg-black/70 justify-end"
      >
        <TouchableOpacity activeOpacity={1} className="bg-black-90 rounded-t-3xl p-6">
          {uploading ? (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="text-white mt-4 text-sm">
                Fazendo upload... {uploadProgress}%
              </Text>
              <View className="w-full h-2 bg-black-80 rounded-full mt-2 overflow-hidden">
                <View
                  style={{ width: `${uploadProgress}%` }}
                  className="h-full bg-brand-green"
                />
              </View>
            </View>
          ) : (
            <>
              <Text className="text-white text-lg font-semibold mb-4">
                Enviar Mídia
              </Text>
              <View className="space-y-2">
                {options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={option.onPress}
                    className="flex-row items-center py-4 px-4 bg-black-80 rounded-2xl active:bg-black-70"
                  >
                    <View
                      style={{ backgroundColor: option.color }}
                      className="w-12 h-12 rounded-full items-center justify-center opacity-20"
                    >
                      <Ionicons
                        name={option.icon}
                        size={24}
                        color={option.color}
                      />
                    </View>
                    <Text className="text-white text-base font-medium ml-4">
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                onPress={onClose}
                className="mt-4 py-4 items-center bg-black-80 rounded-2xl"
              >
                <Text className="text-white/60 text-base font-medium">
                  Cancelar
                </Text>
              </TouchableOpacity>
            </>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
