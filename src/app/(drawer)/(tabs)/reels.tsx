import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  View,
  ViewabilityConfigCallbackPair,
  StatusBar,
  Dimensions,
  Platform,
  ViewabilityConfig,
  ViewToken,
  StyleSheet,
} from "react-native";
import { router, Stack } from "expo-router";
import { colors } from "@/styles/colors";

import ReelsPost from "@/components/ui/reels-post";
import { Camera, ChevronLeft } from "lucide-react-native";
import LogoIcon from "@/assets/icons/logo-small-white.svg";
import Toast from "react-native-toast-message";
import { getReels } from "@/api/social/post/get-reels";
import { ReelsDetail } from "@/api/@types/models";
import { uniqBy } from "lodash";
import { FlatList } from "react-native-gesture-handler";

const statusBarHeight =
  Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;
const ScreenHeight =
  Dimensions.get("window").height -
  (Platform.OS === "ios" ? 72 : statusBarHeight);

export default function Reels() {
  const videoRefs = useRef<Record<number, any>>({} as any);

  const [refreshing, setRefreshing] = useState(false);
  const [activePostId, setActivePostId] = useState<number>();
  const [posts, setPosts] = useState<ReelsDetail[]>([]);
  const [skip, setSkip] = useState(0);
  const [limit] = useState(10);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [mutedVideo, setMutedVideo] = useState(false);

  const viewabilityConfig: ViewabilityConfig = useMemo(() => {
    return {
      itemVisiblePercentThreshold: 80,
      waitForInteraction: true,
    };
  }, []);

  const fetchPostsData = async (skipValue: number, limitValue: number) => {
    try {
      if (loadingMore || refreshing) return;

      setLoadingMore(true);
      const data = await getReels({ skip: skipValue, limit: limitValue });

      if (data.length === 0) {
        setHasMorePosts(false);
      } else {
        setPosts((prevPosts) => uniqBy([...prevPosts, ...data], "post_id"));
      }
    } catch (error) {
      console.error("Erro ao buscar os reels:", error);
      Toast.show({
        type: "error",
        text1: "Ops!",
        text2:
          "Aconteceu um erro ao buscar os reels. Tente novamente mais tarde.",
      });
    } finally {
      setRefreshing(false);
    }
    setLoadingMore(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setSkip(0);
    setHasMorePosts(true);
    setPosts([]);
    await fetchPostsData(0, limit);
  };

  const onViewableItemsChanged = (info: {
    viewableItems: ViewToken<ReelsDetail>[];
    changed: ViewToken<ReelsDetail>[];
  }) => {
    const { viewableItems, changed } = info;

    if (viewableItems.length > 0) {
      const [visibleItem] = viewableItems;
      const [_, oldVisibleItem] = changed;

      const oldItem = posts[visibleItem.index ? visibleItem.index - 1 : 0] ?? null;
      const currentItem = visibleItem?.item ?? null;
      const currentId = currentItem?.id;

      setActivePostId(currentId);

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

  const handlerMutedVideo = useCallback(() => {
    const value = !mutedVideo;

    if (activePostId && videoRefs.current[activePostId]) {
      videoRefs.current[activePostId].mutedVideo(value);
    }

    setMutedVideo(value);
  }, [mutedVideo, activePostId]);

  return (
    <View>
      <StatusBar translucent backgroundColor={"transparent"} />

      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <View style={styles.fullscreenItem}>
            <ReelsPost
              ref={(ref) => {
                if (ref) {
                  videoRefs.current[item.id] = ref;
                }
              }}
              post={item}
              activePostId={activePostId || 0}
              video={{
                handlerMutedVideo,
                muted: mutedVideo,
              }}
            />
          </View>
        )}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        snapToInterval={ScreenHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        pagingEnabled
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        showsVerticalScrollIndicator={false}
        numColumns={1}
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreenItem: {
    height: ScreenHeight,
  },
});
