import {
  FlatList,
  StyleSheet,
  View,
  Dimensions,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ViewToken,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CalendarDaysIcon, Eye } from "lucide-react-native";
import { colors } from "@/styles/colors";
import { GrowPost, SocialPost } from "@/api/@types/models";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { getUserGrowPosts } from "@/api/social/post/get-user-grow-posts";
import Toast from "react-native-toast-message";
import VideoPlayer from "../VideoPlayer";
import { createVideoPlayer, useVideoPlayer } from "expo-video";
import { useVideoPlayerContext } from "@/context/video-player-context";

const numColumns = 2;
const w = Dimensions.get("window").width;

type PlantGridProps = {
  userId: number;
};

export default function PlantGrid({ userId }: PlantGridProps) {
  const {
    pauseVideo,
    toggleAudioMute,
    playVideo,
    setPlayer,
    handlerTime,
    getPlayer,
  } = useVideoPlayerContext();

  const [activePostId, setActivePostId] = useState<number>();
  const [mutedVideo, setMutedVideo] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [plants, setPlants] = useState<GrowPost[]>([]);
  const [skip, setSkip] = useState(0);
  const [limit] = useState(10);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const buildPlantsData = (plants: GrowPost[]) => {
    return plants.map((plant, index) => {
      const player = createVideoPlayer({
        uri: plant.file.file,
        metadata: {
          title: `title-post-plant-${index}`,
          artist: `artist-post-plant-${index}`,
        },
      });

      player.loop = true;
      player.muted = false;
      player.timeUpdateEventInterval = 2;
      player.volume = 1.0;

      plant.file.player = player;

      return plant;
    });
  };

  const fetchPostsData = async (skipValue: number, limitValue: number) => {
    try {
      if (!userId || loadingMore || refreshing) return;

      setLoadingMore(true);
      const data = await getUserGrowPosts({
        id: userId,
        skip: skipValue,
        limit: limitValue,
      });
      if (data.length < limit) {
        setHasMorePosts(false);
      }

      const dataBuild = buildPlantsData(data);
      const player = getPlayer();

      if (!player) {
        const [post] = dataBuild;
        setPlayer(post.file.player);
      }

      setPlants((prevPosts) => [...prevPosts, ...dataBuild]);
    } catch (error) {
      console.log("Erro ao buscar as postagens: ", error);
      Toast.show({
        type: "error",
        text1: "Opss",
        text2:
          "Aconteceu um erro ao buscar as Plantas desse perfil. Tente novamente mais tarde.",
      });
    } finally {
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const handlerMutedVideo = useCallback(() => {
    const value = !mutedVideo;

    toggleAudioMute(value);
    setMutedVideo(value);
  }, [mutedVideo]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const [visibleItem] = viewableItems;

        const currentItem = visibleItem?.item ?? null;
        const currentId = currentItem?.id;

        setActivePostId(currentId);

        toggleAudioMute(mutedVideo);
        pauseVideo();
        handlerTime(0);

        if (currentItem && currentItem.id) {
          setPlayer(currentItem.file.player);
          toggleAudioMute(mutedVideo);
          playVideo();
        }
      }
    }
  ).current;

  const onRefresh = async () => {
    setRefreshing(true);
    setSkip(0);
    setHasMorePosts(true);
    setPlants([]);
    await fetchPostsData(0, limit);
  };

  const loadMorePosts = () => {
    if (!loadingMore && hasMorePosts) {
      setSkip((prevSkip) => prevSkip + limit);
    }
  };

  useEffect(() => {
    if (hasMorePosts) {
      fetchPostsData(skip, limit);
    }
  }, [skip]);

  const renderItem = ({ item, index }: { index: number; item: GrowPost }) => {
    if (item.is_compressing) {
      Toast.show({
        type: "info",
        text1: "Opa",
        text2: "Seu post esta sendo processado!",
      });

      return null;
    }

    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/post/[id]/grow",
            params: { id: item.post_id },
          })
        }
        className="flex flex-col gap-2 mb-6"
      >
        <View className="relative">
          {item.file.type === "image" ? (
            <Image
              source={{ uri: item.file.file }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <VideoPlayer
              player={item.file.player}
              styleContainer={styles.image}
              muted={mutedVideo}
              resizeMode="cover"
              controls={{
                handlerMutedVideo,
                showButtonPlay: true,
                showProgressBar: true,
              }}
              autoplay={item.id === activePostId}
              loop={false}
            />
          )}

          <View className="absolute bottom-4 left-2 bg-white px-2 py-1 rounded-full">
            <Text className="text-black text-xs ">{item.phase.name}</Text>
          </View>
        </View>

        <View className="flex flex-row justify-between items-center gap-2">
          {item.strain && (
            <Text
              className="text-base text-brand-grey font-normal w-24 truncate"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.description}
            >
              {item.strain.name}
            </Text>
          )}

          <View className="flex flex-row item-center gap-1 border border-black-80 bg-black-100 px-2 py-1 rounded-full">
            <CalendarDaysIcon size={12} color={colors.brand.green} />
            <Text className="text-brand-green text-xs ">
              {item.day === 1 ? `${item.day} dia` : `${item.day} dias`}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={plants.filter((r) => !r.is_compressing)}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      numColumns={numColumns}
      contentContainerClassName="mt-2"
      columnWrapperClassName="flex gap-6 px-4 w-full"
      onEndReached={loadMorePosts}
      onEndReachedThreshold={0.5}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 80,
      }}
      // refreshControl={
      //   <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      // }
      ListFooterComponent={
        loadingMore ? (
          <View className="flex flex-row justify-center items-center py-4">
            <ActivityIndicator color="#fff" size="small" className="w-7 h-7" />
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: w / numColumns - 24,
    height: 224,
    borderRadius: 16,
  },
  description: {
    maxWidth: w / numColumns,
  },
  blurContainer: {
    position: "absolute",
    bottom: 16,
    left: 16,
    flexDirection: "row",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 9999,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    shadowColor: "rgba(0, 0, 0, 0.16)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 16,

    elevation: 4,
  },
});
