import { useState, useRef, useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  RefreshControl,
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
import { getReels } from "@/api/social/post/get-reels";

// import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";

const statusBarHeight =
  Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;
const ScreenHeight =
  Dimensions.get("window").height -
  (Platform.OS === "ios" ? 72 : statusBarHeight);

const VideoItem = ({
  uri,
  isVisible,
  shouldPause,
}: {
  uri: string;
  isVisible: boolean;
  shouldPause: boolean;
}) => {
  const player = useVideoPlayer(uri, (player) => {
    player.loop = true;
    player.muted = false;
    player.timeUpdateEventInterval = 2;
    player.volume = 1.0;
    if (isVisible) player.play();
  });

  useEffect(() => {
    if (isVisible) {
      console.log(`🎥 Video ${uri} está visível. Tocando...`);
      player.play();
    } else if (shouldPause) {
      console.log(`⏸️ Pausando vídeo ${uri} porque a tela perdeu o foco.`);
      player.pause();
    } else {
      console.log(`⏸️ Video ${uri} saiu da tela. Pausando...`);
      player.pause();
    }
  }, [isVisible, shouldPause]);

  return (
    <VideoView
      player={player}
      allowsFullscreen
      allowsPictureInPicture
      // nativeControls={false}
      contentFit="cover"
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default function Reels() {
  const [shouldPause, setShouldPause] = useState(false);
  const [viewableItems, setVisibleItems] = useState(new Set<unknown>());
  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: any }) => {
      const newVisibleItems = new Set(
        viewableItems.map((item: { item: { id: any } }) => item.item.id)
      );
      setVisibleItems(newVisibleItems);

      console.log("👀 Vídeos visíveis:", Array.from(newVisibleItems));
    }
  ).current;

  // Pausa todos os vídeos ao sair da tela
  useFocusEffect(
    useCallback(() => {
      console.log("✅ Tela com vídeos ganhou foco.");
      setShouldPause(false);

      return () => {
        console.log("⏹ Tela com vídeos perdeu foco, pausando tudo.");
        setShouldPause(true);
      };
    }, [])
  );

  const fetchReelsData = async ({ pageParam = 0 }: any) => {
    const data = await getReels({ skip: pageParam, limit: 10 });
    const weedz = data.map((item) => ({
      id: item.id,
      uri: item.file.file,
    }));
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
      <View
        style={{
          height: ScreenHeight,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "black",
        }}
      >
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
          <View style={styles.fullscreenItem}>
            <VideoItem
              isVisible={viewableItems.has(item.id)}
              shouldPause={shouldPause}
              uri={item.uri}
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
        ListFooterComponent={
          isFetchingNextPage ? (
            <View
              style={{
                height: ScreenHeight,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "black",
              }}
            >
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
});
