import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, Copy } from "lucide-react-native";
import { colors } from "@/styles/colors";

import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import { MasonryFlashList } from "@shopify/flash-list";
import { ResizeMode, Video } from "expo-av";
import { Dropdown } from "react-native-element-dropdown";

import CopyIcon from "@/assets/icons/copy-item-icon.svg";
import CameraIcon from "@/assets/icons/camera-icon.svg";

const screenWidth = Dimensions.get("window").width;

const options = [
  { label: "Recentes", value: "all" },
  { label: "Fotos", value: "photo" },
  { label: "Vídeos", value: "video" },
];

export default function WeestoryScreen() {
  const [media, setMedia] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedItems, setSelectedItems] = useState<any[]>([]);

  const [permission, requestPermission] = MediaLibrary.usePermissions();

  useEffect(() => {
    if (permission?.status !== "granted") {
      requestPermission();
    } else {
      loadMedia();
    }
  }, [permission, filter]);

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
          const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
          return { ...asset, uri: assetInfo.localUri || asset.uri };
        })
      );

      setMedia(updatedMedia);
    } catch (error) {
      console.error("Erro ao carregar mídia:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (item: {
    id: any;
    mediaType?: string;
    uri?: string;
  }) => {
    setSelectedItems((prevSelected) =>
      prevSelected.includes(item.id)
        ? prevSelected.filter((id) => id !== item.id)
        : [...prevSelected, item.id]
    );
  };

  const handleShareSelected = () => {
    console.log("Itens selecionados para compartilhar:", selectedItems);
  };

  if (!permission) return <ActivityIndicator size="large" color="#0000ff" />;

  if (permission.status !== "granted")
    return (
      <View>
        <Text>Permissão necessária para acessar a galeria</Text>
      </View>
    );

  const gallery = [{ id: "add-weestory", isAddButton: true }, ...media];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.black[100] }}>
      <View className="flex-1 bg-black-100 overflow-hidden">
        <View className="flex flex-row items-center gap-4 px-6 h-[72px] border-b-[1px] border-black-80">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft className="w-6 h-6" color={colors.brand.white} />
          </TouchableOpacity>
          <Text className="text-white text-base font-semibold">
            Criar Weestory
          </Text>
        </View>
        <View className="flex-1 bg-black">
          <View className="flex flex-row justify-between items-center p-7">
            <Dropdown
              style={{
                width: 110,
              }}
              containerStyle={{
                marginVertical: 15,
                width: 150,
              }}
              selectedTextStyle={{
                width: 150,
                fontWeight: "bold",
                color: colors.brand.white,
              }}
              data={options}
              labelField="label"
              valueField="value"
              value={filter}
              onChange={(item) => setFilter(item.value)}
            />

            <TouchableOpacity
              className="flex flex-row items-center gap-3 p-4 rounded-full border border-black-80"
              onPress={handleShareSelected}
            >
              <CopyIcon />
              <Text className="text-white">Selecionar</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-1">
            {loading ? (
              <ActivityIndicator size="large" color="green" />
            ) : (
              <MasonryFlashList
                data={gallery}
                numColumns={3}
                estimatedItemSize={100}
                keyExtractor={({
                  id,
                }: {
                  id: string;
                  mediaType: string;
                  uri: string;
                  isAddButton: boolean;
                }) => String(id)}
                renderItem={({ item }) =>
                  item.isAddButton ? (
                    <TouchableOpacity
                      onPress={() => console.log("abrir a camera")}
                      className="flex flex-column justify-center items-center bg-black-80 m-1"
                      style={{
                        width: screenWidth / 3 - 6,
                        height: 200,
                      }}
                    >
                      <CameraIcon />
                    </TouchableOpacity>
                  ) : (
                    <View
                      className="m-1"
                      style={{
                        borderWidth: selectedItems.includes(item.id) ? 2 : 0,
                        borderColor: "green",
                      }}
                    >
                      {item.mediaType === "photo" ? (
                        <TouchableOpacity onPress={() => toggleSelection(item)}>
                          <Image
                            source={{ uri: item.uri }}
                            style={{
                              width: screenWidth / 3 - 6,
                              height: 200,
                            }}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity onPress={() => toggleSelection(item)}>
                          <Video
                            source={{ uri: item.uri }}
                            style={{
                              width: screenWidth / 3 - 6,
                              height: 200,
                            }}
                            useNativeControls={false}
                            resizeMode={ResizeMode.COVER}
                            isMuted
                          />
                        </TouchableOpacity>
                      )}
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
