import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Search } from "lucide-react-native";
import { useNavigation } from "expo-router";
import { colors } from "@/styles/colors";
import LogoIcon from "@/assets/icons/logo-small.svg";
import UserIcon from "@/assets/icons/user-check.svg";
import { FormField } from "@/components/ui/form-field";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { Following } from "@/api/@types/models";
import { readFollowing } from "@/api/social/follow/read-following";
import { debounce } from 'lodash';
import { useRoute } from "@react-navigation/native";
import UserItemCard from "@/components/ui/user-item-card";

export default function FollowingPage() {
  const [following, setFollowing] = useState<Following[]>([]);
  const [skip, setSkip] = useState(0);
  const [limit] = useState(50);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const navigation = useNavigation();
  const route = useRoute();
  const id = (route.params as { id: number })?.id;
  const normalizedId = Array.isArray(id) ? id[0] : id;

  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedQuery(query);
    }, 500);

    handler();

    return () => {
      handler.cancel();
    };
  }, [query]);

  const loadFollowing = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    
    try {
      const res = await readFollowing({
        id: parseInt(normalizedId),
        skip,
        limit,
        query: debouncedQuery
      });
      setFollowing((prev) => [
        ...prev,
        ...res.filter((newUser) => !prev.some((existingUser) => existingUser.id === newUser.id))
      ]);
      setHasMore(res.length > 0);
      if (res.length > 0) {
        setSkip(prev => prev + limit);
      }
    } catch (error) {
      console.error("Erro ao carregar os usuários que esse perfil segue:", error);
      Toast.show({
        type: 'error',
        text1: 'Opss',
        text2: 'Aconteceu um erro buscar os usuários que esse perfil segue, tente novamente mais tarde.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFollowing();
  }, [debouncedQuery]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadFollowing();
    }
  };

  return (
    <View className="flex-1 bg-black-100 overflow-hidden">
      <SafeAreaView>
        <View className="flex flex-row items-center gap-4 h-[72px] px-6 border-b-[1px] border-black-80">
          <TouchableOpacity className="p-2 rounded-lg border border-black-80" onPress={() => navigation.goBack()}>
            <ChevronLeft className="w-8 h-8" color={colors.brand.white} />
          </TouchableOpacity>
          <LogoIcon width={102} height={30} />
        </View>
        <View className="flex flex-col gap-6 p-6">
          <View className="flex flex-row items-center gap-2">
            <UserIcon width={24} height={24} />
            <Text className="text-white text-lg font-semibold">
              Seguindo
            </Text>
          </View>

          <FormField
            placeholder="Buscar"
            value={query}
            handleChangeText={(text) => {
              setFollowing([]);
              setSkip(0);
              setHasMore(true);
              setQuery(text);
            }}
            rightIcon={Search}
          />

          <ScrollView 
            showsVerticalScrollIndicator={false}
            onMomentumScrollEnd={handleLoadMore}
          >
            <View className="flex flex-col gap-4 pb-[400px]">
              {following.map(user => <UserItemCard key={user.id + user.created_at} item={user.followed}/> )}
              {loading && (
                <View className="flex items-center justify-center">
                  <ActivityIndicator
                    animating
                    color="#fff"
                    size="small"
                  />
                </View>
              )}
              {!loading && following.length === 0 && (
                <View className="flex flex-col justify-center items-center py-6">
                  <Text className="text-base text-brand-grey">Nenhum item foi encontrado para sua pesquisa</Text>
                </View>
               )}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
