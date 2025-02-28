import { useState, useRef, useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  View,
  StatusBar,
  Dimensions,
  Platform,
  StyleSheet,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import { colors } from "@/styles/colors";
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
  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: any }) => {
      const newVisibleItems = new Set(
        viewableItems.map((item: { item: { id: any } }) => item.item.id)
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

  const renderItem = useCallback(
    ({ item }: any) => (
      <ReelsPost
        videoId={item.id}
        playerRef={playerRefs}
        uri={item.file.file}
        post={item}
        isVisible={viewableItems.has(item.id)}
      />
    ),
    [viewableItems]
  );

  const fetchReelsData = async ({ pageParam = 0 }: any) => {
    const weedz = await getReels({ skip: pageParam, limit: 10 });
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

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.brand.green} />
      </View>
    );
  }

  return (
    <View>
      <StatusBar translucent backgroundColor={"transparent"} />
      <FlatList
        data={reelsData?.pages.flat() || []}
        renderItem={renderItem}
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
        ListFooterComponent={isFetchingNextPage ? <Loader isLoading /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreenItem: {
    height: ScreenHeight,
    justifyContent: "center",
  },
  loading: {
    height: ScreenHeight,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  sliderContainer: {
    position: "absolute",
    flexDirection: "row",
    alignContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  slider: {
    width: "100%",
    height: 60,
  },
});
