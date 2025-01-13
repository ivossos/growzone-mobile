import React, { useCallback, useMemo, useState } from "react";
import { TouchableOpacity, Text } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { colors } from "@/styles/colors";
import { Trash2, TriangleAlert } from "lucide-react-native";
import { useBottomSheetContext } from "@/context/bottom-sheet-context";
import Toast from "react-native-toast-message";
import AnimatedSuccess from "../animated-success";
import { deletePost } from "@/api/social/post/delete-post";
import { queryClient } from "@/lib/react-query";
import { useAuth } from "@/hooks/use-auth";
import { router } from "expo-router";

interface Props {
  onClose: () => void;
}

const DeletePostBottomSheet = React.forwardRef<BottomSheet, Props>(
  ({ onClose }, ref) => {
    const [reportSubmitted, setReportSubmitted] = useState(false);

    const snapPoints = useMemo(() => ["60%"], []);
    const { user } = useAuth();
    const { postId, isVisible, currentType, closeBottomSheet, callback } =
      useBottomSheetContext();

    function handleClose(submitted = false) {
      setReportSubmitted(false);
      if (submitted) {
        if (callback) {
          callback();
        }
      }
      onClose();
      closeBottomSheet();

      if (router.canGoBack()) {
        router.back();
      }
    }

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          opacity={0.8}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
        />
      ),
      []
    );

    const handleSubmit = useCallback(async () => {
      if (!postId) {
        Toast.show({
          type: "error",
          text1: "Erro",
          text2: "Não foi possível excluir seu post. Tente novamente.",
        });
        return;
      }

      try {
        await deletePost(postId);

        queryClient.removeQueries({ queryKey: ["profile"] });
        queryClient.removeQueries({ queryKey: ["profile-posts"] });
        queryClient.removeQueries({ queryKey: ["profile-post-grow"] });
        queryClient.removeQueries({ queryKey: ["profile-reels"] });
        queryClient.removeQueries({ queryKey: ["timeline"] });

        setReportSubmitted(true);
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Erro",
          text2: "Aconteceu um problema ao excluir seu post, tente novamente.",
        });
      }
    }, [postId]);

    if (!isVisible || currentType !== "delete-post-bottom-sheet") return null;

    const ReportedSuccessfully = () => (
      <BottomSheetView className="flex flex-col items-center flex-1 gap-14 p-6 bg-black-100">
        <AnimatedSuccess />
        <Text className="text-3xl text-white text-center font-semibold">
          Seu post foi excluido com sucesso
        </Text>
        <Text className="text-base font-medium text-center text-brand-grey max-w-80">
          Aproveite para postar novas atualizações para comunidade
        </Text>

        <TouchableOpacity
          className="flex justify-center items-center min-h-[56px] px-4 border border-black-80 rounded-lg w-full"
          onPress={() => handleClose(true)}
        >
          <Text className="text-white text-base font-medium">Fechar</Text>
        </TouchableOpacity>
      </BottomSheetView>
    );

    const renderDecision = () => (
      <BottomSheetView className="flex flex-col flex-1 gap-6 p-6 bg-black-100">
        <BottomSheetView className="flex flex-col items-center gap-2 ">
          <Text className="text-3xl text-white text-center font-semibold">
            Excluir postagem
          </Text>
          <Text className="text-base font-medium text-center text-brand-grey max-w-80">
            Você realmente dejesa excluir seu post?
          </Text>
        </BottomSheetView>

        <BottomSheetView className="flex flex-col items-center mx-auto gap-8 bg-black-100 mt-8 ">
          <BottomSheetView className="flex flex-row items-start justify-start gap-2 w-full px-4">
            <TriangleAlert size={16} color={colors.brand.yellow} />
            <Text className="flex-1 text-base text-brand-grey font-semibold text-left">
              Essa ação é irreversível e não poderá ser desfeita posteriormente.
            </Text>
          </BottomSheetView>
          <BottomSheetView className="flex flex-row items-start justify-start gap-2 w-full px-4">
            <Trash2 size={16} color={colors.brand.error} />
            <Text className="flex-1 text-base text-brand-grey font-semibold text-left">
              Ninguém mais poderá visualizar sua postagem.
            </Text>
          </BottomSheetView>
        </BottomSheetView>

        <TouchableOpacity
          className="flex justify-center items-center min-h-[56px] px-4 bg-brand-green rounded-lg w-full mt-4"
          onPress={handleSubmit}
        >
          <Text className="text-brand-black text-base font-medium">
            Sim, tenho certeza!
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex justify-center items-center min-h-[56px] px-4 border border-black-80 rounded-lg w-full"
          onPress={() => handleClose()}
        >
          <Text className="text-white text-base font-medium">
            Ainda não me decidi
          </Text>
        </TouchableOpacity>
      </BottomSheetView>
    );

    return (
      <BottomSheet
        ref={ref}
        index={1}
        snapPoints={snapPoints}
        enablePanDownToClose={!reportSubmitted}
        handleIndicatorStyle={{ backgroundColor: colors.black[80] }}
        backgroundStyle={{ backgroundColor: colors.black[100] }}
        backdropComponent={renderBackdrop}
        onClose={handleClose}
      >
        {reportSubmitted ? <ReportedSuccessfully /> : renderDecision()}
      </BottomSheet>
    );
  }
);

export default DeletePostBottomSheet;
