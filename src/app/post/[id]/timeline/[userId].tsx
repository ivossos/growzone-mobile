import { TimelineType } from "@/api/@types/enums";
import { GrowPostDetail, PostDetail, ReelsDetail } from "@/api/@types/models";
import Divider from "@/components/ui/divider";
import GrowPostCard from "@/components/ui/grow-post-card";
import Loader from "@/components/ui/loader";
import PostCard from "@/components/ui/post-card";
import ReelsPost from "@/components/ui/reels-post";
import useTimeline from "@/hooks/useTimeline";
import { colors } from "@/styles/colors";
import { ResizeMode, Video } from "expo-av";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import {
  ActivityIndicator,
  Dimensions,
  PixelRatio,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
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
import VideoPlayer from "@/components/VideoPlayer";
import HeaderGoBack from "@/components/ui/HeaderGoBack";
import { FlashList } from "@shopify/flash-list";

const w = Dimensions.get("window").width;

const heightScreen = Dimensions.get("window").height;

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
  const videoRefs = useRef<Record<string, any>>({});

  const [currentVideoId, setCurrentVideoId] = useState<number | null>(null);
  const [statusVideo, setStatusVideo] = useState({});

  const { data, isLoading, hasNextPage, fetchNextPage } = useTimeline({
    userId,
    type: params.type,
  });

  const viewabilityConfig: ViewabilityConfig = useMemo(() => {
    return {
      itemVisiblePercentThreshold: 50,
      waitForInteraction: true,
    }
  }, [])

  const loadComments = async () => {};

  const onViewableItemsChanged = useCallback(
    async (info: {
      viewableItems: ViewToken<PostDetail | ReelsDetail | GrowPostDetail>[],
      changed: ViewToken<PostDetail | ReelsDetail | GrowPostDetail>[],
    }) => {
      const { viewableItems, changed } = info;

      console.log('viewableItems ', { viewableItems: JSON.stringify(viewableItems) });

      console.log('changed ', { changed: JSON.stringify(changed) });

      if (viewableItems.length > 0 && params.type === TimelineType.WEEDZ) {
        const [firstVisibleItem] = viewableItems;

        console.log('currentVideoId ', currentVideoId);

        if (currentVideoId && videoRefs.current[currentVideoId]) {
          // console.log("Pausing current video:", currentVideoId);
          await videoRefs.current[currentVideoId]?.pause();
        }

        console.log("brendoooooooooooo  ", firstVisibleItem.item.id);
        setCurrentVideoId(firstVisibleItem.item.id); // Atualiza o estado

        if (videoRefs.current[firstVisibleItem.item.id]) {
          //console.log("Playing new current video:", newCurrentId);
          await videoRefs.current[firstVisibleItem.item.id]?.play();
        }
      }
    },
    [currentVideoId, params.type]
  );

  const stickyHeaderHiddenOnScroll = useMemo(() => {
    if (params.type === TimelineType.WEEDZ) {
      return undefined;
    }

    return [TimelineType.GROW, TimelineType.SOCIAL].includes(params.type);
  }, [params.type]);

  const stickyHeaderIndices = useMemo(() => {
    if (params.type === TimelineType.WEEDZ) {
      return undefined;
    }

    return [0];
  }, [params.type]);

  const getItemLayout = useCallback(
    (data: any[], index: number) => {
      const typeHeights = {
        [TimelineType.SOCIAL]: { itemHeight: 400 },
        [TimelineType.WEEDZ]: { itemHeight: heightScreen },
        [TimelineType.GROW]: { itemHeight: 550 },
      };
      const { itemHeight } = typeHeights[params.type];
      return { length: itemHeight, offset: itemHeight * index, index };
    },
    [params.type]
  );

  const viewabilityConfigCallbackPairs = useRef([
    {
      viewabilityConfig: viewabilityConfig,
      onViewableItemsChanged: onViewableItemsChanged,
    },
  ]);

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
            title={`Publicações ${item.id}`}
            containerStyle={styles.header}
          />

          <View style={styles.fullscreenItem}>
            <ReelsPost
              ref={(ref) => {
                if (ref) {
                  videoRefs.current[item.id] = ref;
                }
              }}
              activePostId={currentVideoId || 0}
              resizeMode={ResizeMode.COVER}
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
          if (params.type === TimelineType.WEEDZ) {
            return null;
          }

          return (
            <HeaderGoBack onBack={() => router.back()} title="Publicações" />
          );
        }}
        contentContainerClassName="bg-black-500"
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        snapToInterval={heightScreen}
        ItemSeparatorComponent={() => {
          if (params.type === TimelineType.WEEDZ) {
            return null;
          }

          return <Divider className="!my-4" />;
        }}
        stickyHeaderIndices={stickyHeaderIndices}
        stickyHeaderHiddenOnScroll={stickyHeaderHiddenOnScroll}
        decelerationRate="fast"
        snapToAlignment="start"
        initialNumToRender={5}
        windowSize={5}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        pagingEnabled={params.type === TimelineType.WEEDZ}
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
    height: heightScreen,
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
