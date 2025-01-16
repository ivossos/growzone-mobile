import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  View,
  StatusBar,
  Dimensions,
  Platform,
  ViewabilityConfig,
  StyleSheet,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import { colors } from "@/styles/colors";
import ReelsPost from "@/components/ui/reels-post";
import { getReels } from "@/api/social/post/get-reels";
import { createVideoPlayer } from "expo-video";
import { useVideoPlayerContext } from "@/context/video-player-context";

const statusBarHeight =
  Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;
const ScreenHeight =
  Dimensions.get("window").height -
  (Platform.OS === "ios" ? 72 : statusBarHeight);

export default function Reels() {
  const {
    pauseVideo,
    toggleAudioMute,
    playVideo,
    setPlayer,
    handlerTime,
    clearPlayer,
    getPlayer,
  } = useVideoPlayerContext();

  const [mutedVideo, setMutedVideo] = useState(false);
  const [activePostId, setActivePostId] = useState<number>();
  const [isScreenFocused, setIsScreenFocused] = useState(false);

  const fetchReelsData = async ({ pageParam = 0 }: any) => {
    const data = await getReels({ skip: pageParam, limit: 10 });
    const weedz = data.map((reel, index) => {
      const player = createVideoPlayer({
        uri: reel.file.file,
        metadata: {
          title: `title-reel-${index}`,
          artist: `artist-reel-${index}`,
        },
      });

      player.loop = true;
      player.muted = false;
      player.timeUpdateEventInterval = 2;
      player.volume = 1.0;

      return {
        ...reel,
        player,
      };
    });
    
    return weedz;
  };

  const {
    data: reelsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["reels"],
    queryFn: fetchReelsData,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 10) return undefined;
      return allPages.length * 10;
    },
    initialPageParam: 0,
  });

  const viewabilityConfig: ViewabilityConfig = useMemo(() => {
    return {
      itemVisiblePercentThreshold: 80,
      waitForInteraction: true,
    };
  }, []);

  const onViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const currentItem = viewableItems[0]?.item;
      toggleAudioMute(mutedVideo);
      pauseVideo();
      handlerTime(0);
      
      if (currentItem) {
        setActivePostId(currentItem?.post_id);
        setPlayer(currentItem.player);
        toggleAudioMute(mutedVideo);
        playVideo();
      }
    }
  };

  const handlerMutedVideo = useCallback(() => {
    const value = !mutedVideo;
    toggleAudioMute(value);
    setMutedVideo(value);
  }, [mutedVideo]);

  useEffect(() => {
    const setupPlayer = () => {
      const player = getPlayer();

      if (!player) {
        const currentPost = reelsData?.pages
          .flat()
          .find((item) => item.post_id === activePostId);

        if (currentPost) {
          setPlayer(currentPost.player);
        } else {
          const firstPost = reelsData?.pages.flat()[0];
          if (firstPost) {
            setPlayer(firstPost.player);
          }
        }

        playVideo();
      } else {
        playVideo();
      }
    };

    if (isScreenFocused) {
      setupPlayer();
    }
  }, [activePostId, reelsData, isScreenFocused])

  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      playVideo();

      return () => {
        setIsScreenFocused(false);
        pauseVideo();
        clearPlayer();
      };
    }, [])
  );
  

  return (
    <View>
      <StatusBar translucent backgroundColor={"transparent"} />

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.brand.green} />
      ) : (
        <FlatList
          data={reelsData?.pages.flat() || []}
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
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={isFetchingNextPage}
              onRefresh={() => refetch()}
            />
          }
          initialNumToRender={5}
          windowSize={5}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreenItem: {
    height: ScreenHeight,
  },
});
