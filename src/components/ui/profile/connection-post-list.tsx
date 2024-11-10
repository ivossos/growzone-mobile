import { SocialPost } from "@/api/@types/models";
import { getUserPosts } from "@/api/social/post/get-user-posts";
import { useAuth } from "@/hooks/use-auth";
import { colors } from "@/styles/colors";
import { Video } from "expo-av";
import { router } from "expo-router";
import { uniqBy } from "lodash";
import React, { forwardRef, memo, useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatListProps,
  Image,
  ListRenderItem,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import Animated from "react-native-reanimated";
import Toast from "react-native-toast-message";

const numColumns = 3;
const w = Dimensions.get("window").width;

type Props = Omit<FlatListProps<SocialPost>, "renderItem"> & {
  userId: number;
};

const ConnectionPostList = forwardRef<Animated.FlatList<SocialPost>, Props>(
  ({ userId,...rest }, ref) => {
    const [refreshing, setRefreshing] = useState(false);
    const [posts, setPosts] = useState<SocialPost[]>([]);
    const [skip, setSkip] = useState(0);
    const [limit, setLimit] = useState(10);
    const [hasMorePosts, setHasMorePosts] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const videoRefs = useRef<(Video | null)[]>([]);
    const { user } = useAuth();

    const fetchPostsData = async (skipValue: number, limitValue: number) => {

      try {
        if (!userId || loadingMore || refreshing) return;

        setLoadingMore(true);
        const data = await getUserPosts({
          id: userId,
          skip: skipValue,
          limit: limitValue,
        });

        if (data.length < limit) {
          setHasMorePosts(false);
        }

        setPosts((prevPosts) => uniqBy([...prevPosts, ...data], 'post_id'));
      } catch (error) {
        console.error("Erro ao buscar as postagens: ", error);
        Toast.show({
          type: "error",
          text1: "Opss",
          text2: "Aconteceu um erro ao buscar as postagens desse perfil. Tente novamente mais tarde.",
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

    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
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

    useEffect(() => {
      fetchPostsData(skip, limit);
    }, []);

    const renderItem = ({ item, index }: { index: number; item: SocialPost }) => {
      if (item.is_compressing) {
        
        if(user.id != userId) return null;

        return (
          <View className="mb-1 bg-black-90">
            <View className="flex flex-row justify-center items-center" style={styles.image}>
                <ActivityIndicator size="small" color={colors.brand.green} />
              </View>
          </View>
        )
      }

      return (
        <TouchableOpacity onPress={() => router.push({ pathname: '/post/[id]', params: { id: item.post_id } })} className="mb-1">
          {item?.file?.type === "image" ? (
            <Image source={{ uri: item?.file?.file }} style={styles.image} resizeMode="contain" />
          ) : (
            <Video
              ref={(ref) => (videoRefs.current[index] = ref)}
              source={{ uri: item?.file?.file }}
              style={styles.image}
              isMuted={false}
              shouldPlay={false}
              isLooping={false}
              useNativeControls={false}
            />
          )}
        </TouchableOpacity>
      );
    };

    return (
      <Animated.FlatList
        ref={ref}
        {...rest} 
        data={posts}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.post_id.toString()}
        numColumns={numColumns}
        columnWrapperClassName="flex gap-1"
        contentContainerClassName="bg-black-100 mt-2"
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
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
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black[100]
  },
  image: {
    width: w / numColumns - 3,
    height: 120,
  },
});

export default memo(ConnectionPostList);
