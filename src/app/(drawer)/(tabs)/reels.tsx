import { useState, useRef, useCallback, useEffect } from "react";
import { RefreshControl, StatusBar, Dimensions, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import { getReels } from "@/api/social/post/get-reels";
import ReelsPost from "@/components/ui/reels-post";
import Loader from "@/components/ui/loader";

const statusBarHeight =
  Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;
const ScreenHeight =
  Dimensions.get("window").height -
  (Platform.OS === "ios" ? 72 : statusBarHeight);

export default function Reels() {
  const playerRefs = useRef(new Map());
  const [viewableItems, setVisibleItems] = useState(new Set<unknown>());
  const firstVideoId = useRef<number | null>(null);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
    waitForInteraction: false,
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: any }) => {
      if (!viewableItems.length) return;

      const newVisibleItems = new Set(
        viewableItems.map((item: { item: { id: number } }) => item.item.id)
      );

      setVisibleItems(newVisibleItems);
    }
  ).current;

  useFocusEffect(
    useCallback(() => {
      viewableItems.forEach((id) => {
        const player = playerRefs.current.get(id);
        if (player) {
          player.play();
        }
      });

      return () => {
        playerRefs.current.forEach((player) => player.pause());
      };
    }, [viewableItems])
  );

  const fetchReelsData = async ({ pageParam = 0 }: any) => {
    const weedz = await getReels({ skip: pageParam, limit: 10 });
    return weedz;
  };

  const renderItem = useCallback(
    ({ item }: any) => (
      <ReelsPost
        videoId={item.id}
        playerRef={playerRefs}
        uri={item.file.file}
        post={item}
      />
    ),
    [viewableItems]
  );

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

  useEffect(() => {
    if (!firstVideoId.current && reelsData?.pages?.length) {
      const firstItem = reelsData?.pages
        .flat()
        .map((item) => item.id)
        .shift();

      if (firstItem) {
        const firstPlayer = playerRefs.current.get(firstItem);
        if (firstPlayer) {
          firstPlayer.play();
        }
      }
    }
  }, [reelsData]);

  if (isLoading) {
    return <Loader isLoading />;
  }

  return (
    <SafeAreaView className="flex-1 bg-black-100" edges={["top"]}>
      <StatusBar translucent backgroundColor={"transparent"} />
      <FlashList
        data={reelsData?.pages.flat() || []}
        estimatedItemSize={ScreenHeight}
        snapToInterval={ScreenHeight}
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
    </SafeAreaView>
  );
}
