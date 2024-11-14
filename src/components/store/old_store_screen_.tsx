import ImageCarousel from '@/components/ui/image-carousel';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import Banner1 from '@/assets/images/banner-1.png'
import Banner2 from '@/assets/images/banner-2.png'
import Banner3 from '@/assets/images/banner-3.png'
import Banner4 from '@/assets/images/banner-4.png'
import Banner5 from '@/assets/images/banner-5.png'
import Banner6 from '@/assets/images/banner-6.png'
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '@/components/ui/header';
import { categoriesMock } from '@/constants/mock';
import Button from '@/components/ui/button';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Lead } from '@/api/@types/models';
import { getLead } from '@/api/social/lead';
import Toast from 'react-native-toast-message';

const banners = [Banner1, Banner2, Banner3, Banner4, Banner5, Banner6];
export default function StoreScreen() {
  const [lead, setLead] = useState<Lead>();
  const [loading, setLoading] = useState(false);

  const loadLead = async () => {
    try {
      if (lead) return;
      setLoading(true);
      
      const data = await getLead();

      setLead(data);
    
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Opss',
        text2: 'Erro ao buscar o lead enviar.',
      });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadLead();
    }, [])
  );
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <View className="flex-1 bg-black-100">
        <Header />
        <ImageCarousel imageUrls={banners} />

        <View className="flex flex-col gap-3 pl-6 py-2 pb-4">
        <Text className="text-white text-xl font-bold">Categorias de produtos</Text>
        <FlatList
          data={categoriesMock}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(user) => user.id.toString()}
          renderItem={({ item }) => {
            const { title, Icon } = item;
            return (
              <TouchableOpacity className="flex flex-col items-center justify-center gap-2 py-3 px-3 bg-black-90 rounded-lg">
                <Icon width={48} height={48}  />
                <Text className="text-base text-brand-grey">{title}</Text>
              </TouchableOpacity>
            )
          }}
          contentContainerStyle={{ gap: 12, paddingBottom: 12 }}
        />
        </View>
        
        {!lead && <View className="flex flex-col justify-center items-center gap-4 px-6 mt-4">
          <Text 
            className="max-w-60 text-center text-lg text-brand-grey" >
              Quer vender seus produtos no Marketplace da Growzone?
          </Text>

          {/* <Text 
            className="text-center text-xl text-brand-green" >
              Em breve será possível!
          </Text> */}

          <Button
              handlePress={() => router.push("/lead-store")}
              containerStyles="w-full mt-6"
              title="Sim!"
              isLoading={loading}
            />
        </View>}
        {lead && <View className="flex flex-col justify-center items-center gap-6 px-6 mt-4">
          <Text 
            className="max-w-60 text-center text-lg text-brand-grey" >
              Você já está na growlist, em breve lançaremos o marketplace.
          </Text>
          <Text className="max-w-60 text-center text-lg text-brand-grey mt-4" >
              Aguarde...
          </Text>
        </View>}
      </View>
    </SafeAreaView>
  );
}
