import { FlatList, StyleSheet, View, Dimensions, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Eye } from "lucide-react-native";
import { colors } from "@/styles/colors";
import { SocialPost } from "@/api/@types/models";
import { Video } from "expo-av";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { getUserReelsPosts } from "@/api/social/post/get-user-reels-posts";

const numColumns = 2;
const w = Dimensions.get("window").width;

type ReelsGridProps = {
  userId: number
}

export default function ReelsGrid({ userId }: ReelsGridProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [reels, setReels] = useState<SocialPost[]>([]);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPostsData = async (skipValue: number, limitValue: number) => {
    try {
      if (!userId || loadingMore || refreshing) return;

      setLoadingMore(true);
      console.log('skip ReelsGrid', skipValue);
      const data = await getUserReelsPosts({ id: userId, skip: skipValue, limit: limitValue });

      if (data.length < limit) {
        setHasMorePosts(false);
      }

      setReels((prevPosts) => [...prevPosts, ...data]);
    } catch (error) {
      console.log('Erro ao buscar as postagens: ', error);
      Toast.show({
        type: 'error',
        text1: 'Opss',
        text2: 'Aconteceu um erro ao buscar as Wells desse perfil. Tente novamente mais tarde.'
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
    setReels([]);
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

  const renderItem = ({ item }: { item: SocialPost}) => {
    return (
      <TouchableOpacity onPress={() => router.push(`/reels/${item.post_id}`)} className="flex flex-col gap-2 mb-4">
         <Video
          source={{ uri: item?.file?.file}}
          style={styles.image}
          shouldPlay={false}
          isLooping
          useNativeControls={false}
        />
        <LinearGradient
          colors={["rgba(255, 255, 255, 0.16)", "rgba(255, 255, 255, 0.32)"]}
          style={styles.blurContainer}
        >
          <Eye size={18} color={colors.brand.white}/>
          <Text className="text-white text-base font-medium">{item.view_count}</Text>
        </LinearGradient>
        <View className="flex flex-col gap-1">
          {item.description && <Text
            className="text-base text-brand-grey font-normal"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.description}
            >
              {item.description}
          </Text>}
          {/* <View className="flex flex-row items-center gap-2">
            <Avatar className="w-6 h-6 bg-black-60">
              {!!(user.image?.image) && <AvatarImage
                className="rounded-full"
                source={{ uri: user.image?.image}}
              />}
              <AvatarFallback>{getInitials(user?.name || user?.username)}</AvatarFallback>
            </Avatar>
            <Text 
              className="text-white text-sm text-start font-semibold" 
              numberOfLines={1}
              ellipsizeMode="tail"
            >
                {user?.name || user?.username}
              </Text>
          </View> */}

        </View>
      </TouchableOpacity>
    )
};

  return (
    <FlatList
      nestedScrollEnabled
      data={reels.filter(r => !r.is_compressing)}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      numColumns={numColumns}
      columnWrapperClassName="flex gap-4 px-6 w-full"
      scrollEnabled={false}
      onEndReached={loadMorePosts}
      onEndReachedThreshold={0.5} 
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      // refreshControl={
      //   <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      // }
      ListFooterComponent={loadingMore ? (
        <View className="flex flex-row justify-center items-center py-4">
          <ActivityIndicator color="#fff" size="small" className="w-7 h-7" />
        </View>
      ) : null}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: w / numColumns - 24,
    height: 224,
    borderRadius: 16,
  },
  description: {
    maxWidth: w / numColumns ,
  },
  blurContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 9999,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    shadowColor: 'rgba(0, 0, 0, 0.16)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 16, 

    elevation: 4,
  },

});
