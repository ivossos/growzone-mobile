import { FlatList, Image, StyleSheet, Dimensions, TouchableOpacity, View, ActivityIndicator, RefreshControl, ViewToken } from "react-native";
import { router } from "expo-router";
import { SocialPost } from "@/api/@types/models";
import { Video } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { getUserPosts } from "@/api/social/post/get-user-posts";
import Toast from "react-native-toast-message";

const numColumns = 3;
const w = Dimensions.get("window").width;

type PostGridProps = {
  userId: number
}

export default function PostGrid({ userId }: PostGridProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const videoRefs = useRef<(Video | null)[]>([]);

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

  const onViewableItemsChanged = useRef(({ viewableItems }: {viewableItems: ViewToken[]}) => {
    viewableItems.forEach(({ index }) => {
      const videoRef = videoRefs.current[index as number];
      if (videoRef) {
        videoRef.pauseAsync();
      }
    });
  }).current;

  useEffect(() => {
    return () => {
      videoRefs.current.forEach(async (videoRef) => {
        if (videoRef) {
          await videoRef.pauseAsync();
          await videoRef.unloadAsync();
        }
      });
    };
  }, []);

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
      <TouchableOpacity onPress={() => router.push(`/post/${item.post_id}`)} className="mb-1">
        {item?.file?.type === 'image' ? (
          <Image source={{ uri: item?.file?.file }} style={styles.image} resizeMode="contain" />
        ) : (
          <Video
            ref={ref => (videoRefs.current[index] = ref)} 
            source={{ uri: item?.file?.file}}
            style={styles.image}
            isMuted={false}
            shouldPlay={false}
            isLooping={false}
            useNativeControls={false}
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
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 50,
      }}
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
