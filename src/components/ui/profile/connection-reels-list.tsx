import { SocialPost } from "@/api/@types/models";
import { getUserReelsPosts } from "@/api/social/post/get-user-reels-posts";
import { useAuth } from "@/hooks/use-auth";
import { colors } from "@/styles/colors";
import { ResizeMode, Video } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { uniqBy } from "lodash";
import { Eye } from "lucide-react-native";
import React, { forwardRef, memo, useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatListProps,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import Animated from "react-native-reanimated";
import Toast from "react-native-toast-message";

const numColumns = 2;
const w = Dimensions.get("window").width;

type Props = Omit<FlatListProps<SocialPost>, "renderItem"> & {
  userId: number;
};

const ConnectionReelstList = forwardRef<Animated.FlatList<SocialPost>, Props>(
  ({ userId, ...rest }, ref) => {
    const [refreshing, setRefreshing] = useState(false);
    const [reels, setReels] = useState<SocialPost[]>([]);
    const [skip, setSkip] = useState(0);
    const [limit] = useState(10);
    const [hasMorePosts, setHasMorePosts] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const videoRefs = useRef<(Video | null)[]>([]);
    
    const { user } = useAuth();

    const fetchPostsData = async (skipValue: number, limitValue: number) => {
      try {
        if (!userId || loadingMore || refreshing) return;
  
        setLoadingMore(true);
        const data = await getUserReelsPosts({ id: userId, skip: skipValue, limit: limitValue });
        if (data.length < limit) {
          setHasMorePosts(false);
        }
  
        setReels((prevPosts) => uniqBy([...prevPosts, ...data], 'post_id'));
      } catch (error) {
        console.log('Erro ao buscar as postagens: ', error);
        Toast.show({
          type: 'error',
          text1: 'Opss',
          text2: 'Aconteceu um erro ao buscar as Wells desse perfil. Tente novamente mais tarde.'
        });
      } finally {
        setLoadingMore(false);
        setRefreshing(false);
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
  
    const onRefresh = async () => {
      setRefreshing(true);
      setSkip(0);
      setHasMorePosts(true);
      setReels([]);
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
  
    const renderItem = ({ item, index }: { index: number, item: SocialPost}) => {
      if(item.is_compressing) {
        if(user.id != userId) return null;

        return (
          <View className="flex flex-row justify-center items-center bg-black-90" style={styles.image}>
            <ActivityIndicator size="small" color={colors.brand.green} />
          </View>
        )
      }
  
      return (
        <TouchableOpacity onPress={() => router.push({ pathname: '/post/[id]/reels', params: { id: item.post_id }})} className="flex flex-col gap-2">
           <Video
            ref={ref => (videoRefs.current[index] = ref)} 
            source={{ uri: item?.file?.file}}
            style={styles.image}
            shouldPlay={false}
            isLooping={false}
            isMuted={true} 
            useNativeControls={false}
            resizeMode={ResizeMode.COVER}
          />
          <LinearGradient
            colors={["rgba(255, 255, 255, 0.16)", "rgba(255, 255, 255, 0.32)"]}
            style={styles.blurContainer}
          >
            <Eye size={18} color={colors.brand.white}/>
            <Text className="text-white text-base font-medium">{item.view_count}</Text>
          </LinearGradient>
          <View className="flex flex-col gap-1">
            {/* {item.description && <Text
              className="text-base text-brand-grey font-normal"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.description}
              >
                {item.description}
            </Text>} */}
            {/* <View className="flex flex-row items-center gap-2">
              <Avatar className="w-6 h-6 bg-black-60">
                {!!(user.image?.image) && <AvatarImage
                  className="rounded-full"
                  source={{ uri: user.image?.image}}
                />}
                <AvatarFallback>{getInitials(user?.name || user?.username)}</AvatarFallback>
              </Avatar>
              <Text 
                className="text-white text-sm text-start font-semibold" 
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                  {user?.name || user?.username}
                </Text>
            </View> */}
  
          </View>
        </TouchableOpacity>
      )
  };

    useEffect(() => {
      fetchPostsData(skip, limit);
    }, []);

    return (
      <Animated.FlatList
        ref={ref}
        {...rest}
      data={reels}
      renderItem={renderItem}
      keyExtractor={(item) => item.post_id.toString()}
      numColumns={numColumns}
      showsVerticalScrollIndicator={false}
      contentContainerClassName="bg-black-100 px-6 mt-2"
      columnWrapperClassName="flex gap-2 w-full"
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
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black[100]
  },
  image: {
    width: w / numColumns - 24,
    height: 224,
    borderRadius: 16,
  },
  description: {
    maxWidth: w / numColumns ,
  },
  blurContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 9999,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    shadowColor: 'rgba(0, 0, 0, 0.16)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 16, 

    elevation: 4,
  },
});

export default memo(ConnectionReelstList);
