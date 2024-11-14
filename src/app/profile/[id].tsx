import React, { memo, useCallback, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import UserProfileScreen from "@/components/ui/profile/user-profile-screen";

import { colors } from "@/styles/colors";
import { Header } from "@/components/ui/profile";
import { RefreshControl, ScrollView } from "react-native";




const Profile: React.FC = () => {
  const globalParams = useLocalSearchParams();
  const { id } = (globalParams  as { id: number, openReview: string }) || {};

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    
    // Simula a lógica de atualização. Aqui você pode carregar dados, por exemplo.
    try {
      // Adicione a lógica para atualizar dados do perfil, caso necessário.
      // Exemplo: await fetchUserProfile(id);
    } finally {
      setRefreshing(false); // Para de exibir o indicador de carregamento
    }
  }, [id]);

  
  const renderReader = () => <Header onBack={() => router.back()} />

  return (
    <>
      <SafeAreaView className="bg-black-100" style={{ backgroundColor: colors.black[100], flex: 1 }}>
        <UserProfileScreen userId={id} Header={renderReader}/>
      </SafeAreaView>
      {/* <Loader isLoading={isLoading} /> */}
    </>
  );
};

export default memo(Profile);
