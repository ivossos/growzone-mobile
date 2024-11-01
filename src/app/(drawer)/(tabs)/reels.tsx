import { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, FlatList, RefreshControl, TouchableOpacity, View, ViewabilityConfigCallbackPair } from "react-native";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/styles/colors";

import ReelsPost from "@/components/ui/reels-post";
import { Camera, ChevronLeft } from "lucide-react-native";
import LogoIcon from "@/assets/icons/logo-small-white.svg";
import Toast from "react-native-toast-message";
import { getReels } from "@/api/social/post/get-reels";
import { ReelsDetail } from "@/api/@types/models";
import { ResizeMode } from "expo-av";
import { uniqBy } from "lodash";

export default function Reels() {
  const [refreshing, setRefreshing] = useState(false);
  const [activePostId, setActivePostId] = useState<number>();
  const [posts, setPosts] = useState<ReelsDetail[]>([]);
  const [skip, setSkip] = useState(0);
  const [limit] = useState(10);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);


  const fetchPostsData = async (skipValue: number, limitValue: number) => {
    try {
      if (loadingMore || refreshing) return;

      setLoadingMore(true);
      const data = await getReels({ skip: skipValue, limit: limitValue });

      if (data.length === 0) {
        setHasMorePosts(false);
      } else {
        setPosts((prevPosts) => uniqBy([...prevPosts, ...data], 'post_id'));
      }
    } catch (error) {
      console.error('Erro ao buscar os reels:', error);
      Toast.show({
        type: 'error',
        text1: 'Ops!',
        text2: 'Aconteceu um erro ao buscar os reels. Tente novamente mais tarde.'
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

  useEffect(() => {
    if (hasMorePosts) {
      fetchPostsData(skip, limit);
    }
  }, [skip]);

  const loadMorePosts = () => {
    if (!loadingMore && hasMorePosts) {
      setSkip((prevSkip) => prevSkip + limit);
    }
  };

  const viewabilityConfigCallbackPairs = useRef<ViewabilityConfigCallbackPair[]>([
    {
      viewabilityConfig: { itemVisiblePercentThreshold: 80 },
      onViewableItemsChanged: ({ viewableItems }) => {
        if (viewableItems?.length > 0 && viewableItems[0].isViewable) {
          setActivePostId(viewableItems[0].item.post_id);
        }
      },
    },
  ]);

  return (
    <View style={{ backgroundColor: colors.black[100], flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar backgroundColor={colors.black[100]} style="light" />

      <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <View className="flex flex-row items-center justify-between h-[72px] px-6">
          <View className="flex flex-row items-center gap-2">
            <TouchableOpacity
              className="p-2 rounded-lg border border-brand-white"
              style={{ borderColor: 'rgba(255, 255, 255, 0.16)' }}
              onPress={() => router.back()}
            >
              <ChevronLeft className="w-8 h-8" color={colors.brand.white} />
            </TouchableOpacity>
            <LogoIcon width={107} height={30} />
          </View>
          {/* <TouchableOpacity>
            <Camera className="w-8 h-8" color={colors.brand.white} />
          </TouchableOpacity> */}
        </View>
      </SafeAreaView>

      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <ReelsPost post={item} activePostId={activePostId!} resizeMode={ResizeMode.COVER}/>
        )}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        pagingEnabled
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListFooterComponent={loadingMore ? (
          <View className="flex flex-row justify-center items-center py-4">
            <ActivityIndicator color="#fff" size="small" className="w-7 h-7" />
          </View>
        ) : null}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </View>
  );
}
