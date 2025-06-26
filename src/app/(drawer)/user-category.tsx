import { useEffect, useState } from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LogoIcon from "@/assets/icons/logo.svg";
import { UserCategory } from "@/api/@types/models";
import { getUserCategories } from "@/api/social/user/get-user-categories";
import Toast from "react-native-toast-message";
import Button from "@/components/ui/button";
import { router } from "expo-router";
import { orderBy } from "lodash";
import { updateUser } from "@/api/social/profile/update-user";
import { useAuth } from "@/hooks/use-auth";

export default function UserCategoryScreen() {
  const [loading, setLoading] = useState(false);
  const [isLoadingSaveCategory, setIsLoadingSaveCategory] = useState(false);
  const [categories, setCategories] = useState<UserCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const { updateUserData } = useAuth();

  async function handleSaveCategory() {
    if(!selectedCategory) {
      Toast.show({
        type: 'error',
        text1: 'Ops!',
        text2: 'Você precisa selecionar uma categoria!',
      });
      return 
    }

    try {
      setIsLoadingSaveCategory(true);
      await updateUser({ category_id: selectedCategory });
      await updateUserData();
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Sua categoria foi adicionada com sucesso.',
      });
    } catch (err) {
      console.error('Erro ao atualizar perfil', err);
      Toast.show({
        type: 'error',
        text1: 'Ops!',
        text2: 'Ocorreu um erro ao Salvar sua categoria',
      });

    } finally {
      setIsLoadingSaveCategory(false);
      router.push('/home');
    }
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getUserCategories({ page: 0, size: 20 });
        setCategories(orderBy(data, "name", "asc"));
        setSelectedCategory(data[0].id);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        Toast.show({
          type: "error",
          text1: "Opss",
          text2:
            "Aconteceu um erro buscar as categorias, tente novamente mais tarde.",
        });

        router.replace("/home");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSelectCategory = (categoryId: number) => {
    setSelectedCategory(categoryId);
  };

  const renderCategoryItem = (item: UserCategory) => {
    return (
      <TouchableOpacity onPress={() => handleSelectCategory(item.id)}>
        <View
          className={`flex flex-row items-center gap-4 bg-black-80 rounded-lg w-full ${
            selectedCategory === item.id && "border border-brand-green"
          }`}
        >
          <Image
            source={{ uri: item.image }}
            resizeMode="center"
            style={{
              width: 96,
              height: 80,
              borderBottomLeftRadius: 8,
              borderTopLeftRadius: 8,
            }}
          />
          <Text className="text-xl text-white font-bold">{item.name}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-black-100">
      <SafeAreaView edges={["top"]} className="flex-1">
        <ScrollView
          contentContainerStyle={{ gap: 12, paddingBottom: 94 }}
          stickyHeaderIndices={[0]}
          showsVerticalScrollIndicator={false}
        >

          <View className="bg-black-100">
            <View className="flex flex-row justify-center items-center pt-10">
              <LogoIcon width={150} height={30} />
            </View>

            <View className="flex flex-col gap-4 py-6 w-full items-center">
              <Text className="text-white text-2xl text-center font-medium">
                Selecione o perfil que te define melhor
              </Text>
              <Text className="text-brand-grey text-lg font-regular text-center">
                Isso vai diferenciar sua experiência na plataforma
              </Text>
            </View>
          </View>

          {loading ? (
            <View className="flex items-center justify-center">
              <ActivityIndicator animating color="#fff" size="small" />
            </View>
          ) : (
            categories.map((category) => (
              <View key={category.id} className="px-6">
                {renderCategoryItem(category)}
              </View>
            ))
          )}
        </ScrollView>

        {!loading && <View className="absolute bottom-0 w-full px-6 py-3 mb-6">
          <Button
            containerStyles="w-full"
            title="Selecionar"
            handlePress={() => handleSaveCategory()}
            isLoading={isLoadingSaveCategory}
          />
        </View>}
      </SafeAreaView>
    </View>
  );
}
