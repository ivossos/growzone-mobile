import React, { useCallback, useMemo } from "react";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import * as ImagePicker from "expo-image-picker";
import { Pencil } from "lucide-react-native";
import TrashIcon from "@/assets/icons/trash.svg";
import { colors } from "@/styles/colors";
import { useBottomSheetContext } from "@/context/bottom-sheet-context";
import Button from "./button";
import Toast from "react-native-toast-message";
import { deleteUserCover } from "@/api/social/user/delete-user-cover";
import { useAuth } from "@/hooks/use-auth";

interface ProfileCoverBottomSheetProps {
  onClose: () => void;
}

const ProfileCoverBottomSheet = React.forwardRef<
  BottomSheet,
  ProfileCoverBottomSheetProps
>(({ onClose }, ref) => {
  const { isVisible, currentType, closeBottomSheet, callback } =
    useBottomSheetContext();
  const { user } = useAuth();
  const snapPoints = useMemo(() => ["30%", "60%"], []);

  const handlerProfileCover = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Toast.show({
        type: "info",
        text1: "Permissão necessária",
        text2: "Você precisa permitir acesso à galeria!",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [21, 9],
      quality: 1,
    });

    if (result.assets && !result.canceled) {
      await handleClose({ cover: result.assets[0], success: true });
    }
  };

  const deleteProfileCover = async () => {
    try {
      await deleteUserCover();

      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: "Capa removida com sucesso do seu perfil.",
      });

      await handleClose({ cover: undefined, success: true });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erro ao remover capa",
        text2: "Não foi possível remover a capa do seu perfil.",
      });
    }
  };

  const handleClose = async (data?: any) => {
    onClose();
    closeBottomSheet();
    if (callback) {
      await callback(data);
    }
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} opacity={0.8} appearsOnIndex={1} />
    ),
    []
  );

  if (!isVisible || currentType !== "profile-cover") return null;

  const renderOptions = () => {
    return (
      <BottomSheetView className="flex-1 gap-4 p-6">
        <Button
          title="Alterar"
          containerStyles="gap-2"
          leftIcon={Pencil}
          variant="secondary"
          leftIconProps={{ color: colors.primary }}
          handlePress={handlerProfileCover}
        />
        <Button
          title="Remover"
          variant="secondary"
          containerStyles="gap-2"
          leftIcon={TrashIcon}
          isDisabled={!user.cover}
          handlePress={deleteProfileCover}
        />
      </BottomSheetView>
    );
  };

  return (
    <BottomSheet
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      handleIndicatorStyle={{ backgroundColor: colors.black[80] }}
      backgroundStyle={{ backgroundColor: colors.black[100] }}
      backdropComponent={renderBackdrop}
      onClose={closeBottomSheet}
    >
      {renderOptions()}
    </BottomSheet>
  );
});

export default ProfileCoverBottomSheet;
