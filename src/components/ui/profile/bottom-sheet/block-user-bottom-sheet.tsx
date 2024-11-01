import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { colors } from '@/styles/colors';
import { BellOffIcon, SearchX, SettingsIcon } from 'lucide-react-native';
import { useBottomSheetContext } from '@/context/bottom-sheet-context';
import Toast from 'react-native-toast-message';
import { UserProfile } from '@/api/@types/models';
import Loader from '../../loader';
import AnimatedSuccess from '../../animated-success';
import { getProfileUser } from '@/api/social/profile/get-profile-user';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { getInitials } from '@/lib/utils';
import { createBlockUser } from '@/api/social/user/block/create-block-user';

interface Props {
  onClose: () => void;
}

const BlockUserBottomSheet = React.forwardRef<BottomSheet, Props>(({ onClose }, ref) => {
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [profile, setProfile] = useState<UserProfile>();
  const [reportSuccess, setReportSuccess] = useState(false);

  const [isLoadingFetchUser, setIsLoadingFetchUser] = useState(false);
  const snapPoints = useMemo(() => ['40%', '70%', '90%'], []);
  
  const { userId, isVisible, currentType, closeBottomSheet, callback } = useBottomSheetContext();
  
  const fetchUser = async () => {
    try {
      if(!userId) return;
      setIsLoadingFetchUser(true);
      
      const data = await getProfileUser(userId);
      setProfile(data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Opss',
        text2: 'Aconteceu um erro ao buscar as informações desse usuário',
      });

    } finally {
      setIsLoadingFetchUser(false);
    }
  };
  
  function handleClose(submitted = false) {
    setReportSubmitted(false);
    setReportSuccess(false);
    setProfile(undefined);
    if(submitted) {
      if(callback) callback()
    }
    onClose();
    closeBottomSheet();
  }

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} opacity={0.8} appearsOnIndex={1} />
    ),
    []
  );

  const handleSubmit = useCallback(async () => {
    if (!userId) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível bloquear esse usuário. Tente novamente.',
      });
      setReportSuccess(false);
      return;
    }

    try {
      await createBlockUser(userId);
      setReportSubmitted(true);
      setReportSuccess(true);
    } catch (error) {
      setReportSuccess(false); 
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Falha ao enviar o report, tente novamente.',
      });
    }
  }, [userId]);

  useEffect(() => {
    if (isVisible && currentType === 'block-user') {
      fetchUser();
    }
  }, [isVisible, currentType]);

  if (!isVisible || currentType !== 'block-user') return null;

  const ReportedSuccessfully = () => (
    <BottomSheetView className='flex flex-col items-center flex-1 gap-14 p-6 bg-black-100'>
      <AnimatedSuccess />
      <Text className="text-3xl text-white text-center font-semibold">{`Você bloqueou o perfil ${profile?.info?.name || profile?.info.username}`}</Text>
      <Text className="text-base font-medium text-center text-brand-grey max-w-80">Você pode desbloquear esse perfil a qualquer momento nas configurações.</Text>  

      <TouchableOpacity className="flex justify-center items-center min-h-[56px] px-4 border border-black-80 rounded-lg w-full" onPress={() => handleClose(true)}>
        <Text className="text-white text-base font-medium">Fechar</Text>
      </TouchableOpacity>
    </BottomSheetView>
  );

  const renderReportOptions = () => (
    <BottomSheetView className="flex flex-col flex-1 gap-6 p-6 bg-black-100">
      <Loader isLoading={isLoadingFetchUser} />

      {!isLoadingFetchUser && <>
        <BottomSheetView className="flex flex-col items-center gap-2 ">
          <Avatar className="bg-black-80 border border-brand-green" style={{ width: 80, height: 80 }}>
            {profile?.image?.image ? (
                <AvatarImage
                  className="rounded-full"
                  source={{ uri: profile.image.image }}
                  resizeMode="contain"
                />
              ) : (
                <AvatarFallback textClassname="text-lg">
                  {getInitials(profile?.info.name || profile?.info.username)}
                </AvatarFallback>
              )}
          </Avatar>
          <Text className="text-3xl text-white text-center font-semibold">{profile?.info.name || profile?.info.username}</Text>
          <Text className="text-base font-medium text-center text-brand-grey max-w-80">Você esta prestes a bloquear essa pessoa</Text>  
        </BottomSheetView>

        <BottomSheetView className="flex flex-col items-center mx-auto gap-8 bg-black-100 mt-8 ">
          <BottomSheetView className="flex flex-row items-start justify-start gap-2 w-full px-4">
            <SearchX size={16} color={colors.brand.green} />
            <Text className="flex-1 text-base text-brand-grey font-semibold text-left">
              Essa pessoa não poderá encontrar seu perfil e visualizar seus conteúdos.
            </Text>
          </BottomSheetView>

          <BottomSheetView className="flex flex-row items-start justify-start gap-2 w-full px-4">
            <BellOffIcon size={16} color={colors.brand.green} />
            <Text className="flex-1 text-base text-brand-grey font-semibold text-left">
              O perfil não será notificado que você a bloqueou.
            </Text>
          </BottomSheetView>

          <BottomSheetView className="flex flex-row items-start justify-start gap-2 w-full px-4">
            <SettingsIcon size={16} color={colors.brand.green} />
            <Text className="flex-1 text-base text-brand-grey font-semibold text-left">
              Você pode desbloquear esse perfil quando desejar nas configurações.
            </Text>
          </BottomSheetView>
        </BottomSheetView>

        <TouchableOpacity className="flex justify-center items-center min-h-[56px] px-4 bg-brand-green rounded-lg w-full mt-4" onPress={handleSubmit}>
          <Text className="text-brand-black text-base font-medium">Sim, tenho certeza!</Text>
        </TouchableOpacity>
      </>}

    </BottomSheetView>
  );

  return (
    <BottomSheet
      ref={ref}
      index={1}
      snapPoints={snapPoints}
      enablePanDownToClose
      handleIndicatorStyle={{ backgroundColor: colors.black[80] }}
      backgroundStyle={{ backgroundColor: colors.black[100]}}
      backdropComponent={renderBackdrop}
      onClose={handleClose}
    >
      {reportSubmitted ? <ReportedSuccessfully /> : renderReportOptions()}
    </BottomSheet>
  );
})

export default BlockUserBottomSheet;
