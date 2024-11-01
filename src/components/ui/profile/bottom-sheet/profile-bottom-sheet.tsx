import React, { useCallback, useMemo } from "react";
import {
  TouchableOpacity,
  Text,
} from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { colors } from "@/styles/colors";
import ProfileIcon from "@/assets/icons/profile.svg";
import { BanIcon } from "lucide-react-native";
import { useBottomSheetContext } from "@/context/bottom-sheet-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";


interface ProfileBottomSheetProps {
  onClose: () => void;
}

const ProfileBottomSheet = React.forwardRef<BottomSheet, ProfileBottomSheetProps>(
  ({ onClose }, ref) => {
    const snapPoints = useMemo(() => ['40%', '60%', '90%'], []);

    const { userId, isVisible, currentType, closeBottomSheet, openBottomSheet, callback } = useBottomSheetContext();

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop {...props} opacity={0.8} appearsOnIndex />
      ),
      []
    );

    const handleReportUser = () => {
      openBottomSheet({
        type: "report-user",
        userId: userId!,
      });
    }

    const handleBlockUser = () => {
      openBottomSheet({
        type: "block-user",
        userId: userId!,
        callbackFn: async () => router.push({ pathname: '/home', params: { refresh: Date.now().toString() }})
      });
    }

    const handleOpenRate = () => {
      openBottomSheet({
        type: "rate-profile",
        userId: userId!,
        callbackFn: callback,
      });
    }

    function handleClose() {
      onClose();
      closeBottomSheet();
    }

    if (!isVisible || currentType !== 'profile') return null;

    
    return (
      <BottomSheet
        ref={ref}
        index={1}
        snapPoints={snapPoints}
        handleIndicatorStyle={{
          backgroundColor: colors.black[70],
        }}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: colors.black[100] }}
        backdropComponent={renderBackdrop}
        onClose={handleClose}
      >
        <BottomSheetView className="flex flex-col flex-1 gap-2 p-6 bg-black-100">
            {[
              {
                iconName: 'start',
                title: "Avaliar esse perfil",
                onAction: handleOpenRate,
              },
              {
                Icon: ProfileIcon,
                title: "Denúnciar esse perfil",
                onAction: handleReportUser,
              },
              {
                Icon: BanIcon,
                title: "Bloquer perfil",
                onAction: handleBlockUser,
              },
            ].map(({ title, Icon, iconName, onAction }, index) => (
              <TouchableOpacity
                key={index}
                className="flex flex-row items-center gap-4 border border-black-80 rounded-lg p-4"
                onPress={onAction}
              >
                {iconName ? <Ionicons name="star" size={24} color={colors.brand.green} /> : <Icon width={24} height={24} color={colors.brand.error}/>}
                <Text className="text-lg font-medium text-brand-white">
                  {title}
                </Text>
              </TouchableOpacity>
            ))}
          </BottomSheetView>
      </BottomSheet>
    );
  }
);

export default ProfileBottomSheet;
