import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import {
  RefreshControl,
  StatusBar,
  Dimensions,
  Platform,
  View,
} from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";

import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery } from "@tanstack/react-query";
import ReelsPost from "@/components/ui/reels-post";
import Loader from "@/components/ui/loader";
import { getReels } from "@/api/social/post/get-reels";
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
  const playerRefs = useRef(new Map());
  const [viewableItems, setVisibleItems] = useState(new Set<unknown>());
  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
    waitForInteraction: true,
  };

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: any }) => {
      const newVisibleItems = new Set(
        viewableItems.map((item: { item: { id: any } }) => item.item.id)
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

  const fetchReelsData = async ({ pageParam = 0 }: any) => {
    const weedz = await getReels({ skip: pageParam, limit: 10 });
    return weedz;
  };

  const {
    data,
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

  const renderItem = useCallback(
    ({ item }: any) => {
      return (
        <ReelsPost
          type="weedz"
          videoId={item.id}
          playerRef={playerRefs}
          uri={item.file.file}
          post={item}
          isVisible={viewableItems.has(item.id)}
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
      setVisibleItems(new Set([firstItem.id]));
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
