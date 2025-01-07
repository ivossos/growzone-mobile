import React, { useCallback, useMemo } from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { colors } from "@/styles/colors";

import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useBottomSheetContext } from "@/context/bottom-sheet-context";
import { Pencil, Trash2 } from "lucide-react-native";
import { router } from "expo-router";

interface Props {
  onClose: () => void;
}

const PostBottomSheet = React.forwardRef<BottomSheet, Props>(
  ({ onClose }, ref) => {
    const snapPoints = useMemo(() => ["30%"], []);
    const {
      postId,
      isVisible,
      currentType,
      closeBottomSheet,
      openBottomSheet,
    } = useBottomSheetContext();

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

    function handleClose() {
      onClose();
      closeBottomSheet();
    }

    const navigate = () => {
      const routesMap: Record<string, string> = {
        "post-bottom-sheet": "/edit-post",
        "reel-post-bottom-sheet": "/edit-reels-post",
        "grow-post-bottom-sheet": "/edit-grow-post",
      };

      if (currentType && routesMap[currentType]) {
        router.push({
          pathname: routesMap[currentType],
          params: { id: postId },
        });
      }
    };

    const handleDeletePost = () => {
      if (!postId) return;

      openBottomSheet({
        type: "delete-post-bottom-sheet",
        id: postId,
      });
    };

    if (
      !isVisible ||
      (currentType !== "post-bottom-sheet" &&
        currentType !== "reel-post-bottom-sheet" &&
        currentType !== "grow-post-bottom-sheet")
    )
      return null;

    return (
      <BottomSheet
        ref={ref}
        index={1}
        snapPoints={snapPoints}
        enableOverDrag={false}
        enablePanDownToClose={true}
        handleIndicatorStyle={{
          backgroundColor: colors.black[70],
        }}
        backgroundStyle={{ backgroundColor: colors.black[100] }}
        backdropComponent={renderBackdrop}
        onClose={handleClose}
      >
        <BottomSheetView className="flex flex-col flex-1 gap-2 p-6 bg-black-100">
          {[
            {
              Icon: (
                <Pencil width={24} height={24} color={colors.brand.green} />
              ),
              title: "Editar post",
              description: "Editar a descrição do seu post",
              onAction: navigate,
            },
            {
              Icon: (
                <Trash2 width={24} height={24} color={colors.brand.error} />
              ),
              title: "Excluir post",
              description: "Exclua sua postagem aqui.",
              onAction: handleDeletePost,
            },
          ].map(({ title, description, Icon, onAction }, index) => (
            <TouchableOpacity
              key={index}
              className="flex flex-row items-center gap-2 border border-black-80 rounded-lg p-4"
              onPress={onAction}
            >
              {Icon}
              <View>
                <Text className="text-base font-medium text-brand-white">
                  {title}
                </Text>
                <Text className="text-sm font-medium text-brand-grey">
                  {description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

export default PostBottomSheet;
