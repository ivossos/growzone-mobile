import { GlobalSearchResponse, GrowPost, SocialPost, UserDTO } from "@/api/@types/models";
import ContributorCard from "@/components/ui/contributor-card";
import { FormField } from "@/components/ui/form-field";
import ReelsCard from "@/components/ui/reels-card";
import { useBottomSheetContext } from "@/context/bottom-sheet-context";
import { colors } from "@/styles/colors";
import { Link, router, useFocusEffect } from "expo-router";
import {
  ArrowRight,
  Search,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { debounce } from 'lodash';
import { searchGlobal } from "@/api/social/global-search/seach-global";
import Toast from "react-native-toast-message";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/Avatar";
import { getInitials } from "@/lib/utils";
import { deleteFollow } from "@/api/social/follow/delete-follow";
import { createFollow } from "@/api/social/follow/create-follow";
import { useAuth } from "@/hooks/use-auth";
import { getTrendingWells } from "@/api/social/wells/get-trending-wells";
import { getTrendingGrowPosts } from "@/api/social/post/get-trending-grow-posts";
import { TrendingGrowCard } from "@/components/ui/trending-grow-card";
import { getTopContributors } from "@/api/social/contributor/get-top-contributors";

export default function SearchScreen() {
  const { user } = useAuth();
  const [searchResponse, setSearchResponse] = useState<GlobalSearchResponse[]>([]);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10);
  
  const [loadingMore, setLoadingMore] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [topContributors, setTopContributors] = useState<UserDTO[]>([]);
  const [trendingWells, setTrendingWells] = useState<SocialPost[]>([]);
  const [trendingGrowPosts, setTrendingGrowPosts] = useState<GrowPost[]>([]);
  const [isLoadingTrendingGrowPosts, setIsLoadingTrendingGrowPosts] = useState(false);
  const [isLoadingTrendingWells, setIsLoadingTrendingWells] = useState(false);
  const [isLoadingTopContributors, setIsLoadingTopContributors] = useState(false);
  const [isLoadingHandleFollower, setIsLoadingHandleFollower] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { openBottomSheet } = useBottomSheetContext();

  const handleOpenFilterBottomSheet = () => {
    openBottomSheet({ type: 'search' });
  };

  async function handleFollower(user: GlobalSearchResponse) {
    try {
      setIsLoadingHandleFollower(true);
      
  
      if (user.is_following) {
        await deleteFollow(user.id);
      } else {
        await createFollow(user.id);
      }

      const updatedSearchResponse = searchResponse.map((u) =>
        u.id === user.id ? { ...u, is_following: !user.is_following } : u
      );
      
      setSearchResponse(updatedSearchResponse);

    } catch (error) {
      console.error("erro on handleFollower", error);
  
      Toast.show({
        type: "error",
        text1: "Opss",
        text2: 'Aconteceu um erro realizar essa açåo", "Tente novamente mais tarde.',
      });
    } finally {
      setIsLoadingHandleFollower(false);
    }
  }
  
  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedQuery(query);
    }, 300);
  
    handler();
  
    return () => {
      handler.cancel();
    };
  }, [query]);

  const fetchTopContributors = async () => {
    try {

      setIsLoadingTopContributors(true);
      const data = await getTopContributors({});
      setTopContributors(data);
    } catch (error) {
      console.log('Erro ao buscar as top contributors: ', error);
      Toast.show({
        type: 'error',
        text1: 'Ops!',
        text2: 'Aconteceu um erro ao buscar Top contributors. Tente novamente mais tarde.'
      });
    } finally {
      setIsLoadingTopContributors(false);
    }
  };

  const fetchTrendingWells = async () => {
    try {
      setIsLoadingTrendingWells(true);
      const data = await getTrendingWells({});
      setTrendingWells(data);
    } catch (error) {
      console.log('Erro ao buscar as Trending Wells: ', error);
      Toast.show({
        type: 'error',
        text1: 'Ops!',
        text2: 'Aconteceu um erro ao buscar Trending Wells. Tente novamente mais tarde.'
      });
    } finally {
      setIsLoadingTrendingWells(false);
    }
  };

  const fetchTrendingGrowPosts = async () => {
    try {
      setIsLoadingTrendingGrowPosts(true);
      const data = await getTrendingGrowPosts({});
      setTrendingGrowPosts(data);
    } catch (error) {
      console.log('Erro ao buscar as GrowPosts: ', error);
      Toast.show({
        type: 'error',
        text1: 'Ops!',
        text2: 'Aconteceu um erro ao buscar Top Buds. Tente novamente mais tarde.'
      });
    } finally {
      setIsLoadingTrendingGrowPosts(false);
    }
  };

  const fetchGlobalSearch = async (skipValue: number, limitValue: number) => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await searchGlobal({ skip: skipValue, limit: limitValue, query: debouncedQuery });

      if (res.length === 0) {
        setHasMore(false);
      } else {
        setSearchResponse((prev) => [
          ...prev,
          ...res
        ]);
      }
    } catch (error) {
      console.error("Erro ao carregar os usuários que esse perfil segue:", error);
      Toast.show({
        type: 'error',
        text1: 'Opss',
        text2: 'Aconteceu um erro buscar a pesquisa, tente novamente mais tarde.',
      });
    } finally {
      setLoadingMore(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchTopContributors(),
        fetchTrendingWells(),
        fetchTrendingGrowPosts(),
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchGlobalSearch(skip, limit);
  }, [debouncedQuery]);
  

  useEffect(() => {
    onRefresh();
  }, [])

  useEffect(() => {
    if (hasMore) {
      fetchGlobalSearch(skip, limit);
    }
  }, [skip]);

  // useFocusEffect(
  //   useCallback(() => {
  //     fetchTopContributors();
  //     fetchTrendingWells();
  //     fetchTrendingGrowPosts();
  //   }, [])
  // );

   const loadMorePosts = () => {
    if (!loadingMore && hasMore) {
      setSkip((prevSkip) => prevSkip + limit);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <View className="flex-1 bg-black-100 overflow-hidden">
        {/* <View className="flex flex-row items-center gap-4 px-6 h-[72px] border-b-[1px] border-black-80">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft className="w-6 h-6" color={colors.brand.white} />
          </TouchableOpacity>
          <Text className="text-white text-base font-semibold">
            Pesquisa Global
          </Text>
        </View> */}

        <View className="flex flex-row gap-2 py-6 px-6">
          <FormField
            placeholder="Pesquisa Global"
            value={query}
            handleChangeText={(text) => {
              setSearchResponse([]);
              setSkip(0);
              setHasMore(true);
              setQuery(text);
            }}
            type="clear"
            otherStyles="flex-1"
            leftIcon={Search}
          />
          {/* <TouchableOpacity className="flex items-center justify-center w-14 px-3 bg-black-90 rounded-lg" onPress={handleOpenFilterBottomSheet}>
            <Filter size={20} color={colors.black[70]} />
          </TouchableOpacity> */}
        </View>

        {query && <ScrollView 
            showsVerticalScrollIndicator={false}
            onMomentumScrollEnd={loadMorePosts}
          >
            <View className="flex flex-col gap-4 mt-2  px-6 pb-[400px]">
              {searchResponse.map(res => (
                <Link 
                  key={res.id}
                  href={{ pathname: '/profile/[id]', params: { id: res.id } }}
                >
                  <View className="flex flex-row items-center justify-between w-full">
                  <View className="flex flex-row items-center gap-2 ">
                    <Avatar className="w-12 h-12 bg-black-80">
                      {res?.image?.image ? (
                          <AvatarImage
                            className="rounded-full"
                            source={{ uri: res.image.image }}
                            resizeMode="contain"
                          />
                        ) : (
                          <AvatarFallback textClassname="text-lg">
                            {getInitials(res?.name || res?.username)}
                          </AvatarFallback>
                        )}
                    </Avatar>
                    <View>
                      {res?.name && (
                          <Text className="text-white text-base text-start font-semibold">
                            {res?.name}
                          </Text>
                        )}
                      <Text className={`${ user?.name ? 'text-sm text-brand-grey text-start font-regular' : 'text-white text-base text-start font-semibold'}`}>
                        {res?.username}
                      </Text>
                    </View>
                  </View>

                  {(user.id !== res.id) && (res.is_following ? 
                    <TouchableOpacity className="px-3 py-1 bg-black-80 rounded-[64px]" onPress={() => handleFollower(res)}>
                       {isLoadingHandleFollower && (
                          <ActivityIndicator
                            animating
                            color="#fff"
                            size="small"
                            className="ml-2"
                          />
                        )}
                      {!isLoadingHandleFollower && <Text className="text-base text-neutral-400">Seguindo</Text>}
                    </TouchableOpacity>
                    :
                    <TouchableOpacity className="px-3 py-1 border border-brand-green rounded-[64px]" onPress={() => handleFollower(res)}>
                       {isLoadingHandleFollower && (
                          <ActivityIndicator
                            animating
                            color="#fff"
                            size="small"
                            className="ml-2"
                          />
                        )}
                      {!isLoadingHandleFollower && <Text className="text-base text-brand-green ">+ Seguir</Text>}
                    </TouchableOpacity>)
                  }

                  </View>
                </Link>
              ))}
               {!loadingMore && searchResponse.length === 0 && (
                <View className="flex flex-col justify-center items-center py-6">
                  <Text className="text-base text-brand-grey">Nenhum item foi encontrado para sua pesquisa</Text>
                </View>
               )}
              {loadingMore && (
                <View className="flex items-center justify-center">
                  <ActivityIndicator
                    animating
                    color="#fff"
                    size="small"
                  />
                </View>
              )}
            </View>
          </ScrollView>}

        
      {!query && <FlatList
          data={[{ key: 'contributors' }, { key: 'reels' }, { key: 'buds' }]}
          keyExtractor={(item) => item.key}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-20 flex-grow"
          refreshing={isRefreshing} 
          onRefresh={onRefresh}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={colors.brand.green}
            />
          }  
          renderItem={({ item, index}) => {
            if (item.key === 'contributors') {
              return (
                !isRefreshing && topContributors.length > 0 && <View className="flex flex-col gap-5 px-6">
                  <Text className="text-lg text-white font-semibold">
                    Top Contribuidores
                  </Text>
                  <FlatList
                    data={topContributors}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(user) => user.id.toString()}
                    renderItem={({ item }) => (
                      <ContributorCard key={item.id} user={item} />
                    )}
                    contentContainerStyle={{ gap: 16 }}
                  />
                </View>
              );
            } else if (item.key === 'reels') {
              return (
                !isRefreshing && trendingWells?.length > 0 && <View className="flex flex-col gap-5 px-6 pt-6">
                  <View className="flex flex-row justify-between items-center ">
                    <Text className="text-lg text-white font-semibold">
                      Weedz em Alta
                    </Text>
                    <TouchableOpacity className="flex items-center flex-row gap-1" onPress={() => router.navigate('/reels')}>
                      <Text className="text-primary text-base font-medium">ver mais</Text>
                      <ArrowRight size={18} color={colors.brand.green}/>
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={trendingWells}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(post) => post.post_id.toString()}
                    renderItem={({ item }) => (
                      <ReelsCard key={item.id} {...item} />
                    )}
                    contentContainerStyle={{ gap: 16 }}
                  />
                </View>
              );
            } else if (item.key === 'buds') {
              return (
                !isRefreshing && trendingGrowPosts?.length > 0 && <View className="flex flex-col gap-5 px-6 pt-6">
                  <View className="flex flex-row justify-between items-center ">
                    <Text className="text-lg text-white font-semibold">
                      Top Buds
                    </Text>
                    {/* <TouchableOpacity className="flex items-center flex-row gap-1" onPress={() => router.navigate('/reels')}>
                      <Text className="text-primary text-base font-medium">ver mais</Text>
                      <ArrowRight size={18} color={colors.brand.green}/>
                    </TouchableOpacity> */}
                  </View>
                  <FlatList
                    data={trendingGrowPosts}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(post) => post.post_id.toString()}
                    renderItem={({ item }) => (
                      <TrendingGrowCard key={item.id} item={item} />
                    )}
                    contentContainerStyle={{ gap: 16 }}
                  />
                </View>
              );
            } else {
              return null
            }
          }}
        />}
      </View>
    </SafeAreaView>
  );
}
