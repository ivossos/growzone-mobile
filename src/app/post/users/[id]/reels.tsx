import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import {
  RefreshControl,
  StatusBar,
  Dimensions,
  Platform,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { TimelineParams } from "@/api/@types/models";

import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import HeaderGoBack from "@/components/ui/HeaderGoBack";
import ReelsPost from "@/components/ui/reels-post";
import Loader from "@/components/ui/loader";
import { getAllWeedzPost } from "@/api/social/post/timeline/get-all-weedz-post";
import { TimelineType } from "@/api/@types/enums";
import { colors } from "@/styles/colors";

const statusBarHeight =
  Platform.OS === "android" ? (StatusBar.currentHeight || 0) - 66 : 0;
const screenHeight =
  Dimensions.get("window").height -
  (Platform.OS === "ios" ? 0 : statusBarHeight);

export default function Reels() {
  const params = useLocalSearchParams<{
    userId: string;
    id: string;
    uri: string;
  }>();
  const flatListRef = useRef(null);
  const postId = Number(params.id);
  const userId = Number(params.userId);
  const playerRefs = useRef(new Map());
  const [viewableItems, setVisibleItems] = useState(new Set<unknown>());
  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
    waitForInteraction: true,
  };

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: any }) => {
      const newVisibleItems = new Set(
        viewableItems.map(
          (item: { item: { id: any } }) => `post-reels-${item.item.id}`
        )
      );

      setVisibleItems((prevVisibleItems) => {
        if (
          prevVisibleItems.size === newVisibleItems.size &&
          [...prevVisibleItems].every((id) => newVisibleItems.has(id))
        ) {
          return prevVisibleItems;
        }
        return newVisibleItems;
      });
    },
    []
  );

  const handlerGoBack = useCallback(() => {
    router.back();
  }, []);

  const findAllWeedzPost = async ({ pageParam = 0 }) => {
    let weedzPosts = await getAllWeedzPost({
      limit: 10,
      skip: pageParam,
      type: TimelineType.WEEDZ,
      userId,
    } as TimelineParams);

    return weedzPosts;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["all-weedz-post", userId, TimelineType.WEEDZ],
    queryFn: findAllWeedzPost,
    enabled: userId != null,
    refetchOnMount: false,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < 10) return undefined;
      return allPages.length * 10;
    },
    initialPageParam: 0,
  });

  const renderItem = useCallback(
    ({ item }: any) => {
      return (
        <ReelsPost
          videoId={`post-reels-${item.id}`}
          playerRef={playerRefs}
          uri={item.file.file}
          post={item}
          isVisible={viewableItems.has(`post-reels-${item.id}`)}
          videoContainer={{ height: screenHeight }}
        />
      );
    },
    [viewableItems]
  );

  const initialScrollIndex = useMemo(() => {
    if (data?.pages && data?.pages.flat().length > 0) {
      return data?.pages
        .flat()
        .findIndex((item) => item.file.file === params.uri);
    }
    return 0;
  }, [data, postId]);

  useEffect(() => {
    if (initialScrollIndex === 0 && data?.pages?.length) {
      const firstItem = data.pages.flat()[0];
      setVisibleItems(new Set([`post-reels-${firstItem.id}`]));
    }
  }, [initialScrollIndex, data]);

  useFocusEffect(
    useCallback(() => {
      viewableItems.forEach((id) => {
        const playerKey = `${id}-${0}`;
        const player = playerRefs.current.get(playerKey);
        if (player) {
          player.play();
        }
      });

      return () => {
        playerRefs.current.forEach((player) => player.pause());
      };
    }, [viewableItems])
  );

  if (isLoading) {
    return <Loader isLoading />;
  }

  return (
    <View style={{ backgroundColor: colors.black[100], flex: 1 }}>
      <StatusBar translucent backgroundColor={"transparent"} />

      <SafeAreaView
        style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 }}
      >
        <HeaderGoBack
          onBack={handlerGoBack}
          title="Publicações"
          containerStyle={{
            position: "absolute",
            padding: 16,
            top: Platform.OS === "android" ? 30 : 50,
            left: 0,
            right: 0,
            zIndex: 1,
            backgroundColor: "transparent",
          }}
        />
      </SafeAreaView>

      <FlashList
        ref={flatListRef}
        data={data?.pages.flat() || []}
        estimatedItemSize={screenHeight}
        snapToInterval={screenHeight}
        initialScrollIndex={initialScrollIndex}
        snapToAlignment="start"
        pagingEnabled
        decelerationRate="fast"
        removeClippedSubviews
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        ListFooterComponent={isFetchingNextPage ? <Loader isLoading /> : null}
        refreshControl={
          <RefreshControl
            refreshing={isFetchingNextPage}
            onRefresh={() => refetch()}
          />
        }
      />
    </View>
  );
}
