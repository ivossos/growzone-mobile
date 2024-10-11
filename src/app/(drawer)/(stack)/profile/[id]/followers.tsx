import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Search } from "lucide-react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { colors } from "@/styles/colors";
import LogoIcon from "@/assets/icons/logo-small.svg";
import UserIcon from "@/assets/icons/user-check.svg";
import { FormField } from "@/components/ui/form-field";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/Avatar";
import { useAuth } from "@/hooks/use-auth";
import { readFollowers } from "@/api/social/follow/read-followers";
import { useEffect, useState } from "react";
import { Follower } from "@/api/@types/models";
import { getInitials } from "@/lib/utils";
import Toast from "react-native-toast-message";
import { debounce } from "lodash"; 

export default function Followers() {
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const navigation = useNavigation();
  const { user } = useAuth();
  const { id } = useLocalSearchParams();
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

  const loadFollowers = async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const res = await readFollowers({ id: parseInt(normalizedId), page, size: 50, query: debouncedQuery });
      setFollowers((prev) => [
        ...prev,
        ...res.filter((newUser) => !prev.some((existingUser) => existingUser.id === newUser.id)),
      ]);
      setHasMore(res.length > 0);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("Erro ao carregar seguidores:", error);
      Toast.show({
        type: 'error',
        text1: 'Opss',
        text2: 'Aconteceu um erro ao buscar os seguidores desse perfil, tente novamente mais tarde.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFollowers();
  }, [debouncedQuery]); 

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadFollowers();
    }
  };

  return (
    <View className="flex-1 bg-black-100 overflow-hidden">
      <SafeAreaView>
        <View className="flex flex-row items-center gap-4 h-[72px] px-6 border-b-[1px] border-black-80">
          <TouchableOpacity className="p-2 rounded-lg border border-black-80" onPress={() => navigation.goBack()}>
            <ChevronLeft className="w-8 h-8" color={colors.brand.white} />
          </TouchableOpacity>
          <LogoIcon width={102} height={11} />
        </View>
        <View className="flex flex-col gap-6 p-6">
          <View className="flex flex-row items-center gap-2">
            <UserIcon width={24} height={24} />
            <Text className="text-white text-lg font-semibold">
              {user.id.toString() === normalizedId ? `Meus seguidores` : 'Seguidores'}
            </Text>
          </View>

          <FormField
            placeholder="Buscar"
            value={query}
            handleChangeText={(text) => {
              setFollowers([]);
              setPage(0);
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
              {followers.map((user) => (
                <View key={user?.follower?.id} className="flex flex-row items-center justify-between w-full">
                  <View className="flex flex-row items-center gap-2">
                    <Avatar className="w-12 h-12 bg-black-80">
                      {user?.follower?.image?.image ? (
                        <AvatarImage
                          className="rounded-full"
                          source={{ uri: user.follower.image.image }}
                          resizeMode="contain"
                        />
                      ) : (
                        <AvatarFallback textClassname="text-lg">
                          {getInitials(user?.follower?.name || user?.follower?.username)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <View>
                      {user?.follower?.name && (
                        <Text className="text-white text-base text-start font-semibold">
                          {user?.follower?.name}
                        </Text>
                      )}
                      <Text className="text-brand-grey text-sm text-start font-regular">
                        {user?.follower?.username}
                      </Text>
                    </View>
                  </View>

                  {false ? (
                    <TouchableOpacity className="px-3 py-1 bg-black-80 rounded-[64px]">
                      <Text className="text-base text-neutral-400">Seguindo</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity className="px-3 py-1 border border-brand-green rounded-[64px]">
                      <Text className="text-base text-brand-green">+ Seguir</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              {loading && (
                <View className="flex items-center justify-center">
                  <ActivityIndicator animating color="#fff" size="small" />
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
