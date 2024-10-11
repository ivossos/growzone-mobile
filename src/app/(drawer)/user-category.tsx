import { useCallback, useEffect, useState } from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LogoIcon from "@/assets/icons/logo.svg";
import { UserCategory } from "@/api/@types/models";
import { getUserCategories } from "@/api/social/user/get-user-categories";
import Toast from "react-native-toast-message";
import Carousel from "react-native-reanimated-carousel";
import Animated, { interpolate, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import Button from "@/components/ui/button";
import { colors } from "@/styles/colors";

const { width } = Dimensions.get("window");
const ITEM_SIZE = width * 0.7;
const SPACING = 20;

export default function UserCategoryScreen() {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<UserCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const pressAnim = useSharedValue<number>(0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getUserCategories({ page: 0, size: 20 });
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        Toast.show({
          type: "error",
          text1: "Opss",
          text2:
            "Aconteceu um erro buscar as categorias, tente novamente mais tarde.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const animationStyle = useCallback((value: number) => {
    "worklet";
    const zIndex = interpolate(value, [-1, 0, 1], [-1000, 0, 1000]);
    const translateX = interpolate(value, [-1, 0, 1], [-width, 0, width]);

    return {
      transform: [{ translateX }],
      zIndex,
    };
  }, []);

  const handleSelectCategory = (categoryId: number) => {
    setSelectedCategory(categoryId);
  };

  const renderCategoryItem = ({ item }: { item: UserCategory }) => {
    return (
      <View style={{ flex: 1, marginHorizontal: SPACING / 2 }}>
        <TouchableOpacity onPress={() => handleSelectCategory(item.id)}>
          <View
            className={`flex flex-col items-center gap-2 p-4 rounded-lg ${
              selectedCategory === item.id
                ? "border-2 border-brand-green"
                : "border border-black-80"
            }`}
          >
            <Image
              source={{ uri: item.image }}
              className="w-full h-full rounded-lg"
              resizeMode="contain"
            />
            <Text
              className={`text-lg text-center font-semibold ${
                selectedCategory === item.id ? "text-brand-green" : "text-white"
              }`}
            >
              {item.name}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-black-100">
      <SafeAreaView className="flex flex-col flex-1 justify-center items-center">
        <View className="flex flex-col justify-center items-center w-full px-6">
          <View className="flex flex-row justify-center items-center gap-4 h-[72px]">
            <LogoIcon width={150} height={30} />
          </View>

          <View className="flex flex-col gap-6 py-6 w-full items-center">
            <Text className="text-white text-2xl text-center font-medium">
              Selecione o item que mais encaixa com seu perfil
            </Text>
            <Text className="text-brand-grey text-lg font-regular text-center">
              Isso vai diferenciar sua experiência na plataforma
            </Text>
          </View>

          {loading ? (
            <View className="flex items-center justify-center">
              <ActivityIndicator animating color="#fff" size="small" />
            </View>
          ) : (
            <View className="flex flex-col flex-1 items-center bg-red-500">
              <Carousel
                loop
                width={width}
                autoPlay={false}
                data={categories}
                customAnimation={animationStyle}
                scrollAnimationDuration={1200}
                onSnapToItem={(index) => console.log("current index:", index)}
                style={{ width: width, height: 400 }}
                renderItem={({ index, item }) => (
                  <CustomItem
                    source={item.image}
                    name={item.name}
                    key={index}
                    pressAnim={pressAnim}
                  />
                )}
              />

              {/* Botão centralizado abaixo do carrossel */}
              <View className="flex-1 absolute bottom-0 mt-6">
                <Button
                  containerStyles="w-64"
                  title="Selecionar"
                  handlePress={() => {
                    if (selectedCategory !== null) {
                      // Lógica ao selecionar a categoria
                      console.log("Categoria selecionada:", selectedCategory);
                    }
                  }}
                  isLoading={false}
                />
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

interface ItemProps {
  pressAnim: Animated.SharedValue<number>;
  source: string;
  name: string;
}

const CustomItem: React.FC<ItemProps> = ({ pressAnim, source, name }) => {
  const animStyle = useAnimatedStyle(() => {
    const scale = interpolate(pressAnim.value, [0, 1], [1, 0.9]);
    const borderRadius = interpolate(pressAnim.value, [0, 1], [0, 30]);

    return {
      transform: [{ scale }],
      borderRadius,
    };
  }, []);

  return (
    <Animated.View
      className="flex flex-col gap-4 overflow-hidden items-center p-4 rounded-lg border-2 border-brand-green"
      style={[animStyle]}
    >
      <Animated.Image
        source={{ uri: source }}
        resizeMode="center"
        style={{ width: "100%", height: "80%" }}
      />

      <Animated.Text className="text-xl text-center font-semibold text-white">
        {name}
      </Animated.Text>
    </Animated.View>
  );
};
