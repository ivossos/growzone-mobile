import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Search } from "lucide-react-native";
import { router, useNavigation } from "expo-router";
import { colors } from "@/styles/colors";
import LogoIcon from "@/assets/icons/logo-small.svg";
import LikeIcon from "@/assets/icons/like-green.svg";
import { FormField } from "@/components/ui/form-field";
import { PostLike } from "@/api/@types/models";
import { useEffect, useState } from "react";
import { getPostLikes } from "@/api/social/post/like/get-likes";
import Toast from "react-native-toast-message";
import { useRoute } from "@react-navigation/native";
import UserItemCard from "@/components/ui/user-item-card";

export default function PostLikes() {
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState<PostLike[]>([]);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const id = (route.params as { id: number })?.id;
  

  const fetchPostLikesData = async (skipValue: number, limitValue: number) => {
    try {
      if (loadingMore || refreshing) return;

      setLoadingMore(true);
      const data = await getPostLikes({ postId: id, skip: skipValue, limit: limitValue });

      if (data.length === 0) {
        setHasMorePosts(false);
      } else {
        setUsers((prevPosts) => [...prevPosts, ...data]);
      }
    } catch (error) {
      console.error('Erro ao buscar as postagens: ', error);
      Toast.show({
        type: 'error',
        text1: 'Ops!',
        text2: 'Aconteceu um erro ao buscar os likes da postagem. Tente novamente mais tarde.'
      });
      router.back();
    } finally {
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setSkip(0);
    setHasMorePosts(true);
    setUsers([]);
    await fetchPostLikesData(0, limit);
  };

  useEffect(() => {
    if (hasMorePosts) {
      fetchPostLikesData(skip, limit);
    }
  }, [skip]);

  const loadMorePosts = () => {
    if (!loadingMore && hasMorePosts) {
      setSkip((prevSkip) => prevSkip + limit);
    }
  };

  return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
    <View className="flex-1 bg-black-100">
        <View className="flex flex-row items-center gap-4 h-[72px] px-6 border-b-[1px] border-black-80">
          <TouchableOpacity className="p-2 rounded-lg border border-black-80" onPress={() => navigation.goBack()}>
            <ChevronLeft className="w-8 h-8" color={colors.brand.white} />
          </TouchableOpacity>
          <LogoIcon width={102} height={30} />
        </View>
        <View className="flex flex-col gap-6 p-6">
          <View className="flex flex-row items-center gap-2">
            <LikeIcon width={24} height={24} stroke={'#FFF'} />
            <Text className="text-white text-lg font-semibold">
              Curtidas
            </Text>
          </View>

          <FormField
            placeholder="Buscar"
            value={''}
            handleChangeText={(e) => {}}
            rightIcon={Search}
          />

          <FlatList
            data={users}
            contentContainerStyle={{ gap: 12, paddingBottom: 400 }}
            renderItem={({ item }) => <UserItemCard item={item.user}/>}
            keyExtractor={(item) => item.id.toString()} 
            onEndReached={loadMorePosts}
            onEndReachedThreshold={0.1}
            refreshing={refreshing}
            onRefresh={onRefresh}
            showsVerticalScrollIndicator={false}
          />
        </View>
    </View>
      </SafeAreaView>
  );
}
