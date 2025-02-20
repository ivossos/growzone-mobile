import { useState, useRef, useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  View,
  StatusBar,
  Dimensions,
  Platform,
  StyleSheet,
  Pressable,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import { colors } from "@/styles/colors";
import { getReels } from "@/api/social/post/get-reels";
import ReelsPost from "@/components/ui/reels-post";
import { useVideoPlayer, VideoView } from "expo-video";
import Slider from "@react-native-community/slider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEventListener } from "expo";

const statusBarHeight =
  Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;
const ScreenHeight =
  Dimensions.get("window").height -
  (Platform.OS === "ios" ? 72 : statusBarHeight);

const VideoItem = ({
  uri,
  isVisible,
  playerRef,
  id,
}: {
  id: number;
  uri: string;
  isVisible: boolean;
  playerRef: any;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const insets = useSafeAreaInsets();
  const player = useVideoPlayer(uri, (player) => {
    player.loop = true;
    player.muted = false;
    player.timeUpdateEventInterval = 2;
    player.volume = 1.0;
    if (isVisible) player.play();
  });

  const togglePlayPause = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handlerTime = (value: number) => {
    if (playerRef.current) {
      player.currentTime = value;
    }
  };

  useEventListener(
    player,
    "timeUpdate",
    ({ currentTime, bufferedPosition }) => {
      if (currentTime && bufferedPosition) {
        setCurrentTime(currentTime);
        setDuration(bufferedPosition);
      }
    }
  );

  useEffect(() => {
    if (isVisible) {
      player.play();
    } else {
      player.pause();
    }
  }, [isVisible]);

  useEffect(() => {
    playerRef.current.set(id, player);
    return () => {
      playerRef.current.delete(id);
    };
  }, [id, player, playerRef]);

  return (
    <Pressable onPress={togglePlayPause}>
      <VideoView
        contentFit="cover"
        player={player}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        nativeControls={false}
        style={{ width: "100%", height: "100%" }}
      />
      <View style={[styles.sliderContainer, { bottom: insets.bottom - 30 }]}>
        <View style={{ flex: 1 }}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration}
            value={currentTime}
            onValueChange={handlerTime}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#555555"
            thumbTintColor="#FFFFFF"
          />
        </View>
      </View>
    </Pressable>
  );
};

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
        renderItem={({ item }) => (
          <ReelsPost post={item}>
            <View style={styles.fullscreenItem}>
              <VideoItem
                id={item.id}
                playerRef={playerRefs}
                isVisible={viewableItems.has(item.id)}
                uri={item.file.file}
              />
            </View>
          </ReelsPost>
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
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={colors.brand.green} />
            </View>
          ) : null
        }
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
