import { TimelineType } from "@/api/@types/enums";
import {
  GrowPostDetail,
  PostDetail,
  ReelsDetail,
  VideoPlayerHandle,
} from "@/api/@types/models";
import Divider from "@/components/ui/divider";
import GrowPostCard from "@/components/ui/grow-post-card";
import Loader from "@/components/ui/loader";
import PostCard from "@/components/ui/post-card";
import ReelsPost from "@/components/ui/reels-post";
import useTimeline from "@/hooks/useTimeline";
import { colors } from "@/styles/colors";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  View,
  ViewabilityConfig,
  ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import HeaderGoBack from "@/components/ui/HeaderGoBack";
import { useVideoPlayerContext } from "@/context/video-player-context";
import { queryClient } from "@/lib/react-query";
import { VideoPlayer } from "expo-video";

const w = Dimensions.get("window").width;

const statusBarHeight =
  Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;
const screenHeight =
  Dimensions.get("window").height -
  (Platform.OS === "ios" ? 78 : statusBarHeight);

type TimelineParams = {
  id: string;
  userId: string;
  type: TimelineType;
  index: string;
};

type Item = PostDetail | ReelsDetail | GrowPostDetail;

export default function Timeline() {
  const params = useLocalSearchParams<TimelineParams>();
  const userId = Number(params.userId);
  const postId = Number(params.id);

  const { pauseVideo, toggleAudioMute, playVideo, setPlayer, handlerTime } =
    useVideoPlayerContext();

  const flatListRef = useRef<FlatList>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState<number | null>(null);
  const [mutedVideo, setMutedVideo] = useState(false);
  const [indexItemSelected, setIndexItemSelected] = useState(
    params.index != null ? Number(params.index) : 0
  );

  const [hasScrolledToItem, setHasScrolledToItem] = useState(false);

  // const initialLimit = indexItemSelected + 1;
  const { data, isLoading, hasNextPage, isRefetching, fetchNextPage, refetch } =
    useTimeline({
      userId,
      type: params.type,
    });

  const isWeedzScreen = useMemo(() => {
    return params.type === TimelineType.WEEDZ;
  }, [params.type]);

  const viewabilityConfig: ViewabilityConfig = useMemo(() => {
    const config = {
      itemVisiblePercentThreshold: isWeedzScreen ? 50 : 80,
      waitForInteraction: true,
    };

    return config;
  }, [isWeedzScreen]);

  const loadComments = async () => {};

  const getPlayerValue = useCallback(
    (currentItem: PostDetail | ReelsDetail | GrowPostDetail) => {
      let player: VideoPlayer | undefined = undefined;

      if (isWeedzScreen) {
        const item = currentItem as ReelsDetail;
        player = item.player;
      }

      if (params.type === TimelineType.SOCIAL) {
        const item = currentItem as PostDetail;
        const playerItem = item.files.find((file) => {
          return file.type === "video";
        });

        if (playerItem) {
          player = playerItem.player;
        }
      }

      if (params.type === TimelineType.GROW) {
        const item = currentItem as GrowPostDetail;
        const playerItem = item.files.find((file) => {
          return file.type === "video";
        });

        if (playerItem) {
          player = playerItem.player;
        }
      }

      return player;
    },
    [isWeedzScreen, params.type]
  );

  const handleRefresh = useCallback(() => {
    try {
      setIsRefreshing(true);
      queryClient.removeQueries({ queryKey: ["profile"] });
      queryClient.removeQueries({ queryKey: ["follow"] });
      queryClient.removeQueries({ queryKey: ["profile-posts"] });
      queryClient.removeQueries({ queryKey: ["timeline"] });
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const viewabilityConfigCallbackPairs = useRef([
    {
      viewabilityConfig: { itemVisiblePercentThreshold: 50 },
      onViewableItemsChanged: ({
        changed,
        viewableItems,
      }: {
        viewableItems: ViewToken<ReelsDetail | PostDetail | GrowPostDetail>[];
        changed: ViewToken<ReelsDetail | PostDetail | GrowPostDetail>[];
      }) => {
        if (viewableItems.length > 0) {
          const [visibleItem] = viewableItems;
          const [_, oldVisibleItem] = changed;

          const currentItem = visibleItem?.item ?? null;
          const currentId = currentItem?.id || 0;

          if (isWeedzScreen) {
            setCurrentVideoId(currentId);
          }

          pauseVideo();
          toggleAudioMute(mutedVideo);

          const playerValue = getPlayerValue(currentItem);

          if (currentItem && currentItem.id) {
            setPlayer(playerValue);
            toggleAudioMute(mutedVideo);
            playVideo();
          }
        }
      },
    },
  ]);

  const onViewableItemsChanged = useCallback(
    (info: {
      viewableItems: ViewToken<ReelsDetail | PostDetail | GrowPostDetail>[];
      changed: ViewToken<ReelsDetail | PostDetail | GrowPostDetail>[];
    }) => {
      const { viewableItems } = info;

      if (viewableItems.length > 0) {
        const [visibleItem] = viewableItems;

        const currentItem = visibleItem?.item ?? null;
        const currentId = currentItem?.id || 0;

        if (isWeedzScreen) {
          setCurrentVideoId(currentId);
        }

        pauseVideo();
        toggleAudioMute(mutedVideo);

        const playerValue = getPlayerValue(currentItem);

        if (currentItem && currentItem.id) {
          setPlayer(playerValue);
          toggleAudioMute(mutedVideo);
          playVideo();
        }
      }
    },
    [isWeedzScreen, mutedVideo, getPlayerValue]
  );

  const refetchData = useCallback(async () => {
    await refetch();
  }, []);

  const stickyHeaderHiddenOnScroll = useMemo(() => {
    if (isWeedzScreen) {
      return undefined;
    }

    return [TimelineType.GROW, TimelineType.SOCIAL].includes(params.type);
  }, [isWeedzScreen, params.type]);

  const stickyHeaderIndices = useMemo(() => {
    return isWeedzScreen ? undefined : [0];
  }, [isWeedzScreen]);

  const getItemLayout = useCallback(
    (data: any[], index: number) => {
      const typeHeights = {
        [TimelineType.SOCIAL]: { itemHeight: screenHeight - 240 },
        [TimelineType.WEEDZ]: { itemHeight: screenHeight },
        [TimelineType.GROW]: { itemHeight: screenHeight - 180 },
      };
      const { itemHeight } = typeHeights[params.type];
      return { length: itemHeight, offset: itemHeight * index, index };
    },
    [params.type]
  );

  const handlerMutedVideo = useCallback(() => {
    const value = !mutedVideo;
    toggleAudioMute(value);
    setMutedVideo(value);
  }, [mutedVideo, setMutedVideo]);

  const handlerPlayerVideo = (indexItem: number) => {
    const isWeedz = params.type === TimelineType.WEEDZ;
    const isSocial = params.type === TimelineType.SOCIAL;
    const isGrow = params.type === TimelineType.GROW;

    const post = data[indexItem];

    if (isWeedz) {
      const weedzPost = post as ReelsDetail;
      setPlayer(weedzPost.player);
      setCurrentVideoId(weedzPost.id);
    }

    if (isSocial || isGrow) {
      const socialPost = post as PostDetail;

      const postWithVideo = socialPost.files.find((file) => {
        return file.type === "video";
      });

      if (postWithVideo) {
        setPlayer(postWithVideo.player);
      }
    }
  };

  const handleScrollToIndexFailed = (info: {
    index: number;
    averageItemLength: number;
  }) => {
    flatListRef.current?.scrollToOffset({
      offset: info.index * info.averageItemLength,
      animated: true,
    });
  };

  const handlerGoBack = () => {
    pauseVideo();
    queryClient.removeQueries({ queryKey: ["timeline"] });
    setPlayer(undefined);
    router.back();
  };

  const renderItem = ({ item, index }: { index: number; item: Item }) => {
    if (item.is_compressing) {
      return (
        <View
          key={`is_compressing_${index}`}
          className="bg-black-90 rounded-lg border border-black-80"
        >
          <View
            className="flex flex-row justify-center items-center"
            style={styles.image}
          >
            <ActivityIndicator size="small" color={colors.brand.green} />
          </View>
        </View>
      );
    }

    const screen = {
      [TimelineType.SOCIAL]: (
        <PostCard
          key={`post_card_${index}`}
          loadComments={loadComments}
          handlerAudioMute={handlerMutedVideo}
          audioMute={mutedVideo}
          post={item as PostDetail}
        />
      ),
      [TimelineType.WEEDZ]: (
        <Fragment key={`weedz_card_${index}`}>
          <HeaderGoBack
            onBack={handlerGoBack}
            title="Publicações"
            containerStyle={styles.header}
          />

          <View style={styles.fullscreenItem}>
            <ReelsPost
              video={{
                controls: {
                  handlerMutedVideo,
                  showProgressBar: true,
                  showButtonPlay: true,
                },
                muted: mutedVideo,
                player: (item as ReelsDetail).player,
              }}
              activePostId={currentVideoId}
              post={item as ReelsDetail}
            />
          </View>
        </Fragment>
      ),
      [TimelineType.GROW]: (
        <GrowPostCard
          key={`grow_card_${index}`}
          handlerAudioMute={handlerMutedVideo}
          audioMute={mutedVideo}
          post={item as GrowPostDetail}
        />
      ),
    };

    return screen[params.type];
  };

  const handleScrollToIndex = async () => {
    const hasData =
      !isLoading &&
      data.length > 0 &&
      postId &&
      flatListRef.current &&
      !hasScrolledToItem;

    let indexPostSelected = indexItemSelected;

    if (params.index == "") {
      indexPostSelected = data.findIndex(
        (postData) => postData.post_id === postId
      );
    }

    if (hasData) {
      if (indexPostSelected >= data.length) {
        await fetchNextPage();
      } else {
        const index = indexPostSelected != -1 ? indexPostSelected : 0;
        setIndexItemSelected(index);
        handlerPlayerVideo(index);
        flatListRef.current.scrollToIndex({
          index,
          animated: true,
        });
        setHasScrolledToItem(true);
      }
    }
  };

  useEffect(() => {
    handleScrollToIndex();
  }, [data]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-black-100">
        <Loader isLoading />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black-100">
      <FlatList
        data={data as any}
        ref={flatListRef}
        initialScrollIndex={indexItemSelected}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, index) => `post_timeline_${index}`}
        numColumns={1}
        getItemLayout={getItemLayout as any}
        ListHeaderComponent={() => {
          if (isWeedzScreen) {
            return null;
          }

          return <HeaderGoBack onBack={handlerGoBack} title="Publicações" />;
        }}
        contentContainerClassName="bg-black-500"
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        snapToInterval={isWeedzScreen ? screenHeight : undefined}
        initialNumToRender={5}
        windowSize={5}
        ItemSeparatorComponent={() => {
          if (isWeedzScreen) {
            return null;
          }

          return <Divider className="!my-4" />;
        }}
        stickyHeaderIndices={stickyHeaderIndices}
        stickyHeaderHiddenOnScroll={stickyHeaderHiddenOnScroll}
        decelerationRate={isWeedzScreen ? "fast" : undefined}
        snapToAlignment={isWeedzScreen ? "start" : undefined}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        pagingEnabled={isWeedzScreen}
        onScrollToIndexFailed={handleScrollToIndexFailed}
        ListFooterComponent={
          !hasScrolledToItem ? (
            <View className="flex-1 justify-center items-center bg-black-100">
              <Loader isLoading />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullscreenItem: {
    height: screenHeight,
  },
  image: {
    width: w,
    height: 120,
  },
  header: {
    position: "absolute",
    padding: 16,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: "transparent",
  },
});
