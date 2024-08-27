import React, { useCallback, useMemo, useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { colors } from '@/styles/colors';
import { ChevronRight } from 'lucide-react-native';
import SuccessIcon from "@/assets/icons/success-check.svg";
import { useBottomSheetContext } from '@/context/bottom-sheet-context';

interface ReportBottomSheetProps {
  onClose: () => void;
}

const ReportBottomSheet = React.forwardRef<BottomSheet, ReportBottomSheetProps>(({ onClose }, ref) => {
  const { isVisible, currentType, closeBottomSheet } = useBottomSheetContext();
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const snapPoints = useMemo(() => ['30%', '60%', '90%'], []);
  
  function handleClose() {
    setReportSubmitted(false);
    onClose();
    closeBottomSheet();
  }
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} opacity={0.8} appearsOnIndex={1} />
    ),
    []
  );

  const handleReportSubmit = useCallback(() => {
    setReportSubmitted(true);
  }, []);

  if (!isVisible || currentType !== 'report') return null;

  const ReportedSuccessfully = () => (
    <BottomSheetView className='flex flex-col items-center flex-1 gap-14 p-6 bg-black-100'>
      <SuccessIcon height={80} width={80} />
      <Text className="text-3xl text-white text-center font-semibold">Post Reportado com Sucesso!</Text>
      <Text className="text-base font-medium text-center text-brand-grey max-w-60">Obrigado! Seu relatório foi enviado e será revisado pela nossa equipe.</Text>  

      <TouchableOpacity className="flex justify-center items-center min-h-[56px] px-4 border border-black-80 rounded-lg w-full" onPress={handleClose}>
        <Text className="text-white text-base font-medium">Fechar</Text>
      </TouchableOpacity>
    </BottomSheetView>
  );

  const renderReportOptions = () => (
    <BottomSheetView className="flex flex-col flex-1 gap-6 p-6 bg-black-100">
      <BottomSheetView className='flex flex-col items-center'>
        <Text className="text-3xl text-white text-center font-semibold">Denunciar esta publicação</Text>
        <Text className="text-base font-medium text-center text-brand-grey max-w-60">Selecione o motivo para você estar denunciando essa publicação</Text>  
      </BottomSheetView>

      <BottomSheetView className="flex flex-col flex-1 gap-2 bg-black-100">
        {[
          { title: 'Golpe ou fraude' },
          { title: 'Bullying, assédio ou abuso' },
          { title: 'Suicídio ou automutilação' },
          { title: 'É spam' },
          { title: 'Outros' },
        ].map((item, index) => (
          <TouchableOpacity 
            key={index} 
            className='flex flex-row items-center justify-between gap-2 border border-black-80 rounded-lg p-4'
            onPress={handleReportSubmit}
          >
            <Text className="text-base font-medium text-brand-white">{item.title}</Text>
            <ChevronRight size={28} color={colors.black[70]} />
          </TouchableOpacity>
        ))}
      </BottomSheetView>
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
      onClose={closeBottomSheet}
    >
      {reportSubmitted ? <ReportedSuccessfully /> : renderReportOptions()}
    </BottomSheet>
  );
})

export default ReportBottomSheet;
