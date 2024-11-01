import React, { useCallback, useMemo, useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { colors } from '@/styles/colors';
import { useBottomSheetContext } from '@/context/bottom-sheet-context';
import Toast from 'react-native-toast-message';
import AnimatedSuccess from '../../animated-success';
import { deleteBlockUser } from '@/api/social/user/block/delete-block';

interface Props {
  onClose: () => void;
}

const UnlockUserBottomSheet = React.forwardRef<BottomSheet, Props>(({ onClose }, ref) => {
  const [unlockSubmitted, setUnlockSubmitted] = useState(false);
  const snapPoints = useMemo(() => ['30%', '40%', '70%'], []);
  
  const { userId, isVisible, currentType, closeBottomSheet, callback } = useBottomSheetContext();
  
  function handleClose() {
    setUnlockSubmitted(false);
    if(callback) callback()
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
        text2: 'Não foi possível desbloquear esse usuário. Tente novamente.',
      });
      setUnlockSubmitted(false);
      return;
    }

    try {
      await deleteBlockUser(userId);
      ref?.current?.snapToIndex(2);
      setUnlockSubmitted(true);
    } catch (error) {
      setUnlockSubmitted(false); 
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Falha ao enviar o report, tente novamente.',
      });
    }
  }, [userId]);

  if (!isVisible || currentType !== 'unlock-user') return null;

  const ReportedSuccessfully = () => (
    <BottomSheetView className='flex flex-col items-center flex-1 gap-14 p-6 bg-black-100'>
      <AnimatedSuccess />
      <Text className="text-3xl text-white text-center font-semibold">Você desbloqueou o contato</Text>
      <Text className="text-base font-medium text-center text-brand-grey max-w-80">Tenha uma ótima experiência.</Text>  

      <TouchableOpacity className="flex justify-center items-center min-h-[56px] px-4 border border-black-80 rounded-lg w-full" onPress={handleClose}>
        <Text className="text-white text-base font-medium">Fechar</Text>
      </TouchableOpacity>
    </BottomSheetView>
  );

  const renderDecision = () => (
    <BottomSheetView className="flex flex-col flex-1 gap-6 p-6 bg-black-100">

        <BottomSheetView className="flex flex-col items-center gap-2 ">
          <Text className="text-3xl text-white text-center font-semibold">Tem certeza que deseja desbloquear esse perfil?</Text>
        </BottomSheetView>

        <TouchableOpacity className="flex justify-center items-center min-h-[56px] px-4 bg-brand-green rounded-lg w-full mt-4" onPress={handleSubmit}>
          <Text className="text-brand-black text-base font-medium">Tenho certeza!</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex justify-center items-center min-h-[56px] px-4 border border-black-80 rounded-lg w-full" onPress={handleClose}>
          <Text className="text-white text-base font-medium">Fechar</Text>
        </TouchableOpacity>

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
      {unlockSubmitted ? <ReportedSuccessfully /> : renderDecision()}
    </BottomSheet>
  );
})

export default UnlockUserBottomSheet;
