import { Image, StyleSheet, Dimensions, TouchableOpacity, View, ActivityIndicator, RefreshControl, ViewToken, ViewabilityConfig } from "react-native";
import { router } from "expo-router";
import { SocialPost } from "@/api/@types/models";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getUserPosts } from "@/api/social/post/get-user-posts";
import Toast from "react-native-toast-message";
import { VideoView } from "expo-video";
import VideoPlayer from "../VideoPlayer";
import { FlatList } from "react-native-gesture-handler";

const numColumns = 3;
const w = Dimensions.get("window").width;

type PostGridProps = {
  userId: number
}

export default function PostGrid({ userId }: PostGridProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [skip, setSkip] = useState(0);
  const [limit] = useState(10);
  const [currentVideoId, setCurrentVideoId] = useState<number | null>(null);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [mutedVideo, setMutedVideo] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const videoRefs = useRef<Record<number, any>>({} as any);

  const fetchPostsData = async (skipValue: number, limitValue: number) => {
    try {
      if (!userId || loadingMore || refreshing) return;

      setLoadingMore(true);
      const data = await getUserPosts({ id: userId, skip: skipValue, limit: limitValue });

      if (data.length < limit) {
        setHasMorePosts(false);
      }

      setPosts((prevPosts) => [...prevPosts, ...data]);
    } catch (error) {
      console.error('Erro ao buscar as postagens: ', error);
      Toast.show({
        type: 'error',
        text1: 'Opss',
        text2: 'Aconteceu um erro ao buscar as postagens desse perfil. Tente novamente mais tarde.'
      });
    } finally {
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

    const viewabilityConfig: ViewabilityConfig = useMemo(() => {
      return {
        itemVisiblePercentThreshold: 80,
        waitForInteraction: true,
      };
    }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setSkip(0);
    setHasMorePosts(true);
    setPosts([]);
    await fetchPostsData(0, limit);
  };

  const loadMorePosts = () => {
    if (!loadingMore && hasMorePosts) {
      setSkip((prevSkip) => prevSkip + limit);
    }
  };

    const onViewableItemsChanged = useCallback(
      (info: {
        viewableItems: ViewToken<SocialPost>[];
        changed: ViewToken<SocialPost>[];
      }) => {
        const { viewableItems, changed } = info;
  
        if (viewableItems.length > 0) {
          const [visibleItem] = viewableItems;
          const [_, oldVisibleItem] = changed;
  
          const oldItem = oldVisibleItem?.item ?? null;
          const currentItem = visibleItem?.item ?? null;
          const currentId = currentItem?.id
  
          setCurrentVideoId(currentId);
  
          videoRefs.current[currentId]?.mutedVideo(mutedVideo);
  
          if (oldItem && oldItem.id) {
            videoRefs.current[oldItem.id]?.mutedVideo(mutedVideo);
          }
  
          if (oldItem && videoRefs.current[oldItem.id]) {
            videoRefs.current[oldItem.id]?.pause();
          }
  
          if (currentItem && videoRefs.current[currentId]) {
            videoRefs.current[currentId]?.play();
          }
        }
      },
      []
    );

    const handlerMutedVideo = useCallback(() => {
      const value = !mutedVideo;
  
      if (currentVideoId && videoRefs.current[currentVideoId]) {
        videoRefs.current[`${currentVideoId}`].mutedVideo(value);
      }
  
      setMutedVideo(value);
    }, [mutedVideo, currentVideoId]);

  // const onViewableItemsChanged = useRef(({ viewableItems }: {viewableItems: ViewToken[]}) => {
  //   viewableItems.forEach(({ index }) => {
  //     const videoRef = videoRefs.current[index as number];
  //     if (videoRef) {
  //       videoRef.pauseAsync();
  //     }
  //   });
  // }).current;

  // useEffect(() => {
  //   return () => {
  //     videoRefs.current.forEach(async (videoRef) => {
  //       if (videoRef) {
  //         await videoRef.pauseAsync();
  //         await videoRef.unloadAsync();
  //       }
  //     });
  //   };
  // }, []);

  useEffect(() => {
    if (hasMorePosts) {
      fetchPostsData(skip, limit);
    }
  }, [skip]);

  const renderItem = ({ item, index }: { index: number, item: SocialPost }) => {

    if(item.is_compressing) {
      Toast.show({
        type: 'info',
        text1: 'Opa',
        text2: 'Seu post esta sendo processado!'
      });

      return null;
    }
    
    return (
      <TouchableOpacity onPress={() => router.push({ pathname: '/post/[id]', params: { id: item.post_id }})} className="mb-1">
        {item?.file?.type === 'image' ? (
          <Image source={{ uri: item?.file?.file }} style={styles.image} resizeMode="contain" />
        ) : (
          <VideoPlayer
            player={item.file.player}
            loop
            muted={mutedVideo}
            controls={{
              showProgressBar: true,
              handlerMutedVideo,
              showButtonPlay: true,
            }}
            autoplay={currentVideoId === item.id}
          />
        )}
      </TouchableOpacity>
    );
  }

  return (
    <FlatList
      data={posts}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      numColumns={numColumns}
      scrollEnabled={false}
      columnWrapperClassName="flex gap-1"
      onEndReached={loadMorePosts}
      onEndReachedThreshold={0.5}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      viewabilityConfig={viewabilityConfig}
      onViewableItemsChanged={onViewableItemsChanged}
      // refreshControl={
      //   <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      // }
      ListFooterComponent={loadingMore ? (
        <View className="flex flex-row justify-center items-center py-4">
          <ActivityIndicator color="#fff" size="small" className="w-7 h-7" />
        </View>
      ) : null}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: w / numColumns - 3,
    height: 120,
  },
});
