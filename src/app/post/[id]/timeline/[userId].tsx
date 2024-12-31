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
};

type Item = PostDetail | ReelsDetail | GrowPostDetail;

export default function Timeline() {
  const params = useLocalSearchParams<TimelineParams>();
  const userId = Number(params.userId);
  const postId = Number(params.id);

  const flatListRef = useRef<FlatList>(null);
  const videoRefs = useRef<Record<number, any>>({} as any);

  const [currentVideoId, setCurrentVideoId] = useState<number | null>(null);
  const [mutedVideo, setMutedVideo] = useState(false);

  const { data, isLoading, hasNextPage, fetchNextPage } = useTimeline({
    userId,
    type: params.type,
  });

  const viewabilityConfig: ViewabilityConfig = useMemo(() => {
    return {
      itemVisiblePercentThreshold: 50,
      waitForInteraction: true,
    };
  }, []);

  const isWeedzScreen = useMemo(() => {
    return params.type === TimelineType.WEEDZ;
  }, [params.type]);

  const loadComments = async () => {};

  const onViewableItemsChanged = useCallback(
    (info: {
      viewableItems: ViewToken<PostDetail | ReelsDetail | GrowPostDetail>[];
      changed: ViewToken<PostDetail | ReelsDetail | GrowPostDetail>[];
    }) => {
      const { viewableItems, changed } = info;

      if (viewableItems.length > 0 && isWeedzScreen) {
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

        if (oldItem && videoRefs.current[`${oldItem.id}`]) {
          videoRefs.current[`${oldItem.id}`]?.pause();
        }

        if (currentItem && videoRefs.current[currentId]) {
          videoRefs.current[currentId]?.play();
        }
      }
    },
    [isWeedzScreen, mutedVideo]
  );

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
        [TimelineType.SOCIAL]: { itemHeight: 400 },
        [TimelineType.WEEDZ]: { itemHeight: screenHeight },
        [TimelineType.GROW]: { itemHeight: 550 },
      };
      const { itemHeight } = typeHeights[params.type];
      return { length: itemHeight, offset: itemHeight * index, index };
    },
    [params.type]
  );

  const handlerMutedVideo = useCallback(() => {
    const value = !mutedVideo;

    if (currentVideoId && videoRefs.current[`${currentVideoId}`]) {
      videoRefs.current[`${currentVideoId}`].mutedVideo(value);
    }

    setMutedVideo(value);
  }, [mutedVideo, currentVideoId]);

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
          post={item as PostDetail}
        />
      ),
      [TimelineType.WEEDZ]: (
        <Fragment key={`weedz_card_${index}`}>
          <HeaderGoBack
            onBack={() => router.back()}
            title="Publicações"
            containerStyle={styles.header}
          />

          <View style={styles.fullscreenItem}>
            <ReelsPost
              ref={(ref) => {
                if (ref) {
                  videoRefs.current[item.id] = ref;
                }
              }}
              video={{
                handlerMutedVideo,
                muted: mutedVideo,
              }}
              activePostId={currentVideoId || 0}
              post={item as ReelsDetail}
            />
          </View>
        </Fragment>
      ),
      [TimelineType.GROW]: (
        <GrowPostCard
          key={`grow_card_${index}`}
          post={item as GrowPostDetail}
        />
      ),
    };

    return screen[params.type];
  };

  useEffect(() => {
    if (data.length && postId && flatListRef.current) {
      const index = data.findIndex((post) => post.post_id === postId);
      if (index !== -1) {
        if (params.type === TimelineType.WEEDZ) {
          setCurrentVideoId(data[index].id);
        }
        flatListRef.current.scrollToIndex({ index, animated: true });
      }
    }
  }, [postId]);

  return (
    <SafeAreaView className="flex-1 bg-black-100">
      <FlatList
        data={data}
        ref={flatListRef}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.post_id.toString()}
        numColumns={1}
        getItemLayout={getItemLayout as any}
        ListHeaderComponent={() => {
          if (isWeedzScreen) {
            return null;
          }

          return (
            <HeaderGoBack onBack={() => router.back()} title="Publicações" />
          );
        }}
        contentContainerClassName="bg-black-500"
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        snapToInterval={isWeedzScreen ? screenHeight : undefined}
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
        initialNumToRender={5}
        windowSize={5}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        pagingEnabled={isWeedzScreen}
        ListFooterComponent={
          isLoading ? (
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
