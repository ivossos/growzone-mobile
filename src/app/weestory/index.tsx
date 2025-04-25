import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { colors } from "@/styles/colors";

import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Linking,
} from "react-native";
import Button from "@/components/ui/button";
import * as MediaLibrary from "expo-media-library";
import { MasonryFlashList } from "@shopify/flash-list";
import { Dropdown } from "react-native-element-dropdown";
import * as VideoThumbnails from "expo-video-thumbnails";
import * as FileSystem from "expo-file-system";

import CameraIcon from "@/assets/icons/camera-icon.svg";
import { useCameraModal } from "@/context/camera-modal-context";

const screenWidth = Dimensions.get("window").width;

const options = [
  { label: "Recentes", value: "all" },
  { label: "Fotos", value: "photo" },
  { label: "Vídeos", value: "video" },
];

export default function WeestoryScreen() {
  const { openCamera } = useCameraModal();
  const [permission, requestPermission] = MediaLibrary.usePermissions();
  const [media, setMedia] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const handlePermissionRequest = async () => {
    if (permission?.canAskAgain) {
      const result = await requestPermission();
      if (result.granted) {
        loadMedia();
      }
    } else {
      await Linking.openSettings();
    }
  };

  const loadMedia = async () => {
    try {
      setLoading(true);

      const album = await MediaLibrary.getAssetsAsync({
        mediaType: filter === "all" ? ["photo", "video"] : ([filter] as any),
        first: 50,
        sortBy: [[MediaLibrary.SortBy.creationTime, false]],
      });

      const updatedMedia = await Promise.all(
        album.assets.map(async (asset) => {
          try {
            let assetInfo = await MediaLibrary.getAssetInfoAsync(asset.id);
            let localUri = assetInfo.localUri;
            let thumbnail = null;

            if (asset.mediaType === "video" && localUri) {
              const fileName = asset.filename || `video_${asset.id}.mov`;
              const safePath = `${FileSystem.documentDirectory}${fileName}`;

              await FileSystem.copyAsync({
                from: localUri,
                to: safePath,
              });

              const { uri: thumb } = await VideoThumbnails.getThumbnailAsync(
                safePath,
                {
                  time: 1000,
                }
              );

              thumbnail = thumb;
              localUri = safePath;
            }

            return {
              ...asset,
              uri: localUri,
              thumbnail,
            };
          } catch (e) {
            console.warn("Erro ao processar mídia:", e);
            return null;
          }
        })
      );

      setMedia(updatedMedia.filter(Boolean));
    } catch (error) {
      console.error("Erro ao carregar mídia:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (durationInSeconds: number) => {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = Math.floor(durationInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (permission?.status !== "granted") {
      requestPermission();
    } else {
      loadMedia();
    }
  }, [permission, filter]);

  const gallery = [{ id: "add-weestory", isAddButton: true }, ...media];

  if (!permission) {
    return (
      <SafeAreaView className="flex-1 bg-black-100">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.brand.green} />
        </View>
      </SafeAreaView>
    );
  }

  if (permission.status !== "granted") {
    return (
      <SafeAreaView className="flex-1 bg-black-100">
        <View className="flex-1 items-center justify-center">
          <Text className="text-base text-center font-medium text-white">
            Precisamos de acesso à sua galeria para selecionar fotos e vídeos.
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black-100">
      <View className="flex-1 bg-black-100 overflow-hidden">
        <View className="flex flex-row items-center gap-4 px-6 h-[72px] border-b-[1px] border-black-80">
          <TouchableOpacity onPress={() => router.push("/weestory")}>
            <ArrowLeft className="w-6 h-6" color={colors.brand.white} />
          </TouchableOpacity>
          <Text className="text-white text-lg font-semibold">
            Criar Weestory
          </Text>
        </View>
        <View className="flex-1 bg-black">
          <View className="flex flex-row justify-between items-center p-7">
            <Dropdown
              style={styles.dropdown}
              selectedTextStyle={styles.selectedTextStyle}
              iconStyle={styles.iconStyle}
              containerStyle={styles.dropdownContainer}
              itemTextStyle={styles.itemTextStyle}
              activeColor={colors.black[80]}
              data={options}
              labelField="label"
              valueField="value"
              value={filter}
              onChange={(item) => setFilter(item.value)}
            />
          </View>

          <View className="flex-1">
            {loading ? (
              <View className="flex justify-center items-center bg-black-100 h-full">
                <ActivityIndicator size="large" color={colors.brand.green} />
              </View>
            ) : (
              <MasonryFlashList
                data={gallery}
                numColumns={3}
                estimatedItemSize={100}
                keyExtractor={({
                  id,
                }: {
                  thumbnail: string;
                  id: string;
                  mediaType: string;
                  uri: string;
                  isAddButton: boolean;
                  duration: any;
                }) => String(id)}
                renderItem={({ item }) =>
                  item.isAddButton ? (
                    <TouchableOpacity
                      onPress={openCamera}
                      className="flex flex-column justify-center items-center bg-black-80 m-1"
                      style={{
                        width: screenWidth / 3 - 6,
                        height: 220,
                      }}
                    >
                      <CameraIcon />
                    </TouchableOpacity>
                  ) : (
                    <View className="m-1">
                      <TouchableOpacity onPress={() => openCamera(item)}>
                        <View>
                          <Image
                            resizeMode="cover"
                            source={{
                              uri:
                                item.mediaType === "photo"
                                  ? item.uri
                                  : item.thumbnail,
                            }}
                            style={{
                              width: screenWidth / 3 - 6,
                              height: 220,
                            }}
                          />
                          {item.mediaType === "video" && (
                            <View className="absolute bottom-2 right-2 rounded-full border border-black-70 p-1 px-2 bg-black-70">
                              <Text className="text-sm text-white">
                                {formatDuration(item.duration)}
                              </Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    </View>
                  )
                }
              />
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    width: 100,
    height: 30,
    borderBottomWidth: 0,
  },
  selectedTextStyle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.brand.white,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  dropdownContainer: {
    borderRadius: 10,
    paddingVertical: 6,
    backgroundColor: colors.black[70],
    shadowColor: colors.black[100],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
    borderColor: colors.black[70],
    width: 130,
    marginTop: 10,
  },
  itemTextStyle: {
    color: colors.brand.white,
  },
});
