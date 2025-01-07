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
import { useVideoPlayerContext } from "@/context/video-player-context";
import { createVideoPlayer, useVideoPlayer, VideoPlayer } from "expo-video";

const statusBarHeight =
  Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;
const ScreenHeight =
  Dimensions.get("window").height -
  (Platform.OS === "ios" ? 72 : statusBarHeight);

export default function Reels() {
  const { pauseVideo, toggleAudioMute, playVideo, setPlayer, handlerTime, getPlayer } =
    useVideoPlayerContext();

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

  const buildWeedzData = useCallback(
    (weedzData: Array<ReelsDetail>): Array<ReelsDetail> => {
      return weedzData.map((weedz, index) => {
        const player = createVideoPlayer({
          uri: weedz.file.file,
          metadata: {
            title: `title-weedz-${index}`,
            artist: `artist-weedz-${index}`,
          },
        });

        player.loop = true;
        player.muted = false;
        player.timeUpdateEventInterval = 2;
        player.volume = 1.0;

        weedz.file.player = player;

        return {
          ...weedz,
          player,
        };
      });
    },
    []
  );

  const fetchPostsData = async (skipValue: number, limitValue: number) => {
    try {
      if (loadingMore || refreshing) return;

      setLoadingMore(true);
      const data = await getReels({ skip: skipValue, limit: limitValue });

      if (data.length === 0) {
        setHasMorePosts(false);
      } else {
        const weedz: Array<ReelsDetail> = buildWeedzData(data);
        const player = getPlayer()

        if (!player) {
          const [weed] = weedz
          setPlayer(weed.player)
        }

        setPosts((prevPosts) => uniqBy([...prevPosts, ...weedz], "post_id"));
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
    const { viewableItems } = info;

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

    toggleAudioMute(value);
    setMutedVideo(value);
  }, [mutedVideo]);

  return (
    <View>
      <StatusBar translucent backgroundColor={"transparent"} />

      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <View style={styles.fullscreenItem}>
            <ReelsPost
              post={item}
              activePostId={activePostId || 0}
              video={{
                controls: {
                  showButtonPlay: false,
                  showProgressBar: true,
                  handlerMutedVideo,
                },
                player: item.player,
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
        initialNumToRender={5}
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
