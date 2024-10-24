import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Search } from "lucide-react-native";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
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
import { debounce } from 'lodash';

export default function PostLikes() {
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState<PostLike[]>([]);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [skip, setSkip] = useState(0);
  const [limit] = useState(10);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const navigation = useNavigation();
  const globalParams = useLocalSearchParams();
  const { id } = (globalParams  as { id: number }) || {};

  const fetchPostLikesData = async (skipValue: number, limitValue: number) => {
    try {
      if (loadingMore || refreshing) return;

      setLoadingMore(true);
      const data = await getPostLikes({ 
        postId: id, 
        skip: skipValue, 
        limit: limitValue,
        query: debouncedQuery
      });

      if (data.length === 0) {
        setHasMorePosts(false);
      } else {
        setUsers((prevPosts) => [...prevPosts, ...data]);
      }
    } catch (error) {
      console.error('Erro ao buscar as curtidas: ', error);
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

  const loadMorePosts = () => {
    if (!loadingMore && hasMorePosts && users.length >= 10) {
      setSkip((prevSkip) => prevSkip + limit);
    }
  };

  useEffect(() => {
    if (hasMorePosts) {      
      fetchPostLikesData(skip, limit);
    }
  }, [skip, debouncedQuery]);

  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedQuery(query);
    }, 500);

    handler();

    setSkip(0);
    setHasMorePosts(true);
    setUsers([]);
    return () => {
      handler.cancel();
    };
  }, [query]);

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
            value={query}
            handleChangeText={(text) => {
              setUsers([]);
              setSkip(0);
              setHasMorePosts(true);
              setQuery(text);
            }}
            rightIcon={Search}
          />

          <FlatList
            data={users}
            contentContainerStyle={{ gap: 12, paddingBottom: 400 }}
            renderItem={({ item }) => <UserItemCard item={item.user} />}
            keyExtractor={(item) => item.id.toString()}
            contentContainerClassName="py-1"
            onEndReached={loadMorePosts}
            onEndReachedThreshold={0.1}
            refreshing={refreshing}
            onRefresh={onRefresh}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={() => {
              if (loadingMore) {
                return (
                  <View className="flex items-center justify-center">
                    <ActivityIndicator animating color="#fff" size="small" />
                  </View>
                );
              }

              if (!loadingMore && users.length === 0) {
                return (
                  <View className="flex flex-col justify-center items-center py-6">
                    <Text className="text-base text-brand-grey">Nenhum item foi encontrado para sua pesquisa</Text>
                  </View>
                );
              }

              return null;
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
