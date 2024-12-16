import {
  Comment,
  GrowPostDetail,
  PostLike,
  SocialPost,
} from "@/api/@types/models";
import { getUserGrowPosts } from "@/api/social/post/get-user-grow-posts";
import { getUserPosts } from "@/api/social/post/get-user-posts";
import GrowPostCard from "@/components/ui/grow-post-card";
import { useActivePostHome } from "@/hooks/use-active-post-home";
import { colors } from "@/styles/colors";
import { router, useLocalSearchParams } from "expo-router";
import { uniqBy } from "lodash";
import { ArrowLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const numColumns = 3;
const w = Dimensions.get("window").width;

type TimelineParams = {
  id: string;
  userId: string;
};

export default function Timeline() {
  const params = useLocalSearchParams<TimelineParams>();
  const userId = Number(params.userId);
  const postId = Number(params.id);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPostsData = async (skipValue: number, limitValue: number) => {
    try {
      if (!userId || loadingMore || refreshing) return;

      setLoadingMore(true);
      const data = await getUserPosts({
        id: userId,
        skip: skipValue,
        limit: limitValue,
      });

      if (data.length < limit) {
        setHasMorePosts(false);
      }

      console.log("setPosts ", userId);

      setPosts((prevPosts) => uniqBy([...prevPosts, ...data], "post_id"));
    } catch (error) {
      console.error("Erro ao buscar as postagens: ", error);
      Toast.show({
        type: "error",
        text1: "Opss",
        text2:
          "Aconteceu um erro ao buscar as postagens desse perfil. Tente novamente mais tarde.",
      });
    } finally {
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setSkip(0);
    setHasMorePosts(true);
    setPosts([]);
    await fetchPostsData(0, limit);
  };

  const loadMorePosts = () => {
    if (!loadingMore && hasMorePosts) {
      setSkip((prevSkip) => prevSkip + limit);
    }
  };

  useEffect(() => {
    if (hasMorePosts) {
      fetchPostsData(skip, limit);
    }
  }, [skip]);

  useEffect(() => {
    fetchPostsData(skip, limit);
  }, []);

  const renderItem = ({ item, index }: { index: number; item: SocialPost }) => {
    if (item.is_compressing) {
      return (
        <View className="mb-1 bg-black-90">
          <View
            className="flex flex-row justify-center items-center"
            style={styles.image}
          >
            <ActivityIndicator size="small" color={colors.brand.green} />
          </View>
        </View>
      );
    }

    return (
      <View>
        <Text>OK</Text>
      </View>
    );
  };

  return (
    <Animated.FlatList
      data={posts}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      keyExtractor={(item) => item.post_id.toString()}
      numColumns={numColumns}
      columnWrapperClassName="flex gap-1"
      contentContainerClassName="bg-black-100 mt-2"
      onEndReached={loadMorePosts}
      onEndReachedThreshold={0.5}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      // onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 50,
      }}
      ListFooterComponent={
        loadingMore ? (
          <View className="flex flex-row justify-center items-center py-4">
            <ActivityIndicator color="#fff" size="small" className="w-7 h-7" />
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black[100],
  },
  image: {
    width: w / numColumns - 3,
    height: 120,
  },
});
