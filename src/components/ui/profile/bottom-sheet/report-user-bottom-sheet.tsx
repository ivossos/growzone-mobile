import React, { useCallback, useEffect, useMemo, useState } from "react";
import { TouchableOpacity, Text } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { colors } from "@/styles/colors";
import { ChevronRight } from "lucide-react-native";
import { useBottomSheetContext } from "@/context/bottom-sheet-context";
import Toast from "react-native-toast-message";
import { getReportReasons } from "@/api/social/report-reason/get-report-reasons";
import { ReportReason } from "@/api/@types/models";
import { createReportUser } from "@/api/social/user/report/create-report-user";

import Loader from "../../loader";
import AnimatedSuccess from "../../animated-success";

interface Props {
  onClose: () => void;
}

const ReportUserBottomSheet = React.forwardRef<BottomSheet, Props>(
  ({ onClose }, ref) => {
    const [reportSubmitted, setReportSubmitted] = useState(false);
    const [reportReasons, setReportReasons] = useState<ReportReason[]>([]);
    const [reportSuccess, setReportSuccess] = useState(false);

    const [isLoadingFetchReportReasons, setIsLoadingFetchReportReasons] =
      useState(false);
    const [isDecided, setIsDecided] = useState<ReportReason | null>(null);
    const snapPoints = useMemo(() => ["40%", "70%", "90%"], []);

    const { userId, isVisible, currentType, closeBottomSheet } =
      useBottomSheetContext();

    const fetchReportReasons = useCallback(async () => {
      try {
        setIsLoadingFetchReportReasons(true);

        const data = await getReportReasons({});
        setReportReasons(data);
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Opss",
          text2:
            "Aconteceu um erro ao buscar as razões de report, tente novamente mais tarde.",
        });
      } finally {
        setIsLoadingFetchReportReasons(false);
      }
    }, []);

    function handleClose() {
      setReportSubmitted(false);
      setIsDecided(null);
      setReportSuccess(false);
      setReportReasons([]);
      onClose();
      closeBottomSheet();
    }

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop {...props} opacity={0.8} appearsOnIndex={1} />
      ),
      []
    );

    const handleReportSubmit = useCallback(async () => {
      if (!userId || !isDecided) {
        Toast.show({
          type: "error",
          text1: "Erro",
          text2: "Não foi possível reportar esse perfil. Tente novamente.",
        });
        setReportSuccess(false);
        return;
      }

      try {
        await createReportUser(userId, isDecided.id);
        setReportSubmitted(true);
        setReportSuccess(true);
      } catch (error) {
        setReportSuccess(false);
        Toast.show({
          type: "error",
          text1: "Erro",
          text2: "Falha ao enviar o report, tente novamente.",
        });
      }
    }, [userId, isDecided]);

    useEffect(() => {
      if (isVisible && currentType === "report-user") {
        fetchReportReasons();
      }
    }, [isVisible, currentType, fetchReportReasons]);

    if (!isVisible || currentType !== "report-user") return null;

    const ReportedSuccessfully = () => (
      <BottomSheetView className="flex flex-col items-center flex-1 gap-14 p-6 bg-black-100">
        <AnimatedSuccess />
        <Text className="text-3xl text-white text-center font-semibold">
          Sua denúncia foi relizada com Sucesso!
        </Text>
        <Text className="text-base font-medium text-center text-brand-grey mx-auto">
          Obrigado! Seu reporte sera revisado pela nossa equipe.
        </Text>

        <TouchableOpacity
          className="flex justify-center items-center min-h-[56px] px-4 border border-black-80 rounded-lg w-full"
          onPress={handleClose}
        >
          <Text className="text-white text-base font-medium">Fechar</Text>
        </TouchableOpacity>
      </BottomSheetView>
    );

    const ReportedDecision = () => (
      <BottomSheetView className="flex flex-col items-center flex-1 gap-4 p-6 bg-black-100">
        <Text className="text-3xl text-white text-center font-semibold">
          Tem certeza que deseja reportar esse perfil?
        </Text>
        <Text className="text-base font-medium text-center text-brand-grey max-w-60">
          Seu reporte será enviado e revisado pela nossa equipe.
        </Text>

        <TouchableOpacity
          className="flex justify-center items-center min-h-[56px] px-4 bg-brand-green rounded-lg w-full"
          onPress={handleReportSubmit}
        >
          <Text className="text-brand-black text-base font-medium">
            Sim, tenho certeza!
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex justify-center items-center min-h-[56px] px-4 border border-black-80 rounded-lg w-full"
          onPress={() => {
            setIsDecided(null);
            ref?.current?.snapToIndex(2);
          }}
        >
          <Text className="text-white text-base font-medium">
            Ainda não me decidi
          </Text>
        </TouchableOpacity>
      </BottomSheetView>
    );

    const renderReportOptions = () => (
      <BottomSheetView className="flex flex-col flex-1 gap-6 p-6 bg-black-100">
        <BottomSheetView className="flex flex-col items-center">
          <Text className="text-3xl text-white text-center font-semibold">
            Denunciar este perfil
          </Text>
          <Text className="text-base font-medium text-center text-brand-grey max-w-60">
            Selecione o motivo para você estar denunciando esse perfil
          </Text>
        </BottomSheetView>

        <BottomSheetView className="flex flex-col flex-1 gap-2 bg-black-100">
          <Loader isLoading={isLoadingFetchReportReasons} />
          {reportReasons.map((item, index) => (
            <TouchableOpacity
              key={index}
              className="flex flex-row items-center justify-between gap-2 border border-black-80 rounded-lg p-4"
              onPress={() => {
                setIsDecided(item);
                ref?.current?.snapToIndex(1);
              }}
            >
              <Text className="flex-shrink text-base font-medium text-brand-white">
                {item.name}
              </Text>
              <ChevronRight size={28} color={colors.black[70]} />
            </TouchableOpacity>
          ))}
        </BottomSheetView>
      </BottomSheetView>
    );

    return (
      <BottomSheet
        ref={ref}
        index={2}
        snapPoints={snapPoints}
        enablePanDownToClose
        handleIndicatorStyle={{ backgroundColor: colors.black[80] }}
        backgroundStyle={{ backgroundColor: colors.black[100] }}
        backdropComponent={renderBackdrop}
        onClose={handleClose}
      >
        {reportSubmitted ? (
          <ReportedSuccessfully />
        ) : isDecided ? (
          <ReportedDecision />
        ) : (
          renderReportOptions()
        )}
      </BottomSheet>
    );
  }
);

export default ReportUserBottomSheet;
