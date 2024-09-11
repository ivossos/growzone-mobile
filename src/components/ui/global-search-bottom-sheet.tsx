import React, { useCallback, useMemo, useState } from "react";
import { TouchableOpacity, Text } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { colors } from "@/styles/colors";
import { ChevronRight, X } from "lucide-react-native";
import SuccessIcon from "@/assets/icons/success-check.svg";
import { useBottomSheetContext } from "@/context/bottom-sheet-context";
import { Checkbox } from "../Checkbox";
import { rolesMock } from "@/constants/mock";
import clsx from "clsx";

interface Props {
  onClose: () => void;
}

const GlobalSearchBottomSheet = React.forwardRef<BottomSheet, Props>(
  ({ onClose }, ref) => {
    const { isVisible, currentType, closeBottomSheet } =
      useBottomSheetContext();

    const snapPoints = useMemo(() => ["60%", "90%"], []);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop {...props} opacity={0.8} appearsOnIndex={1} />
      ),
      []
    );

    const [selectedRoles, setSelectedRoles] = useState<number[]>([]);

    // Alternar seleção de item
    const toggleRoleSelection = (id: number) => {
      if (selectedRoles.includes(id)) {
        setSelectedRoles(selectedRoles.filter((roleId) => roleId !== id));
      } else {
        setSelectedRoles([...selectedRoles, id]);
      }
    };

    const renderReportOptions = () => (
      <BottomSheetView className="flex flex-col flex-1 gap-6 p-6 bg-black-100">
        <BottomSheetView className="flex flex-col items-start gap-2">
          <Text className="text-2xl text-white text-start font-semibold">
            Filtrar
          </Text>
        </BottomSheetView>
        <BottomSheetView className="flex flex-col flex-1 gap-2 bg-black-100">
          <Text className="text-base font-semibold text-start text-brand-grey">
            Selecione os filtros que você deseja aplicar
          </Text>
          <BottomSheetScrollView contentContainerClassName="flex-row flex-wrap gap-3">
            {rolesMock.map((item) => {
              const isSelected = selectedRoles.includes(item.id);
              return (
                <TouchableOpacity
  key={item.id}
  className={clsx(
    "flex flex-row items-center px-4 py-2 rounded-[100px]",
    " transform transition duration-300 hover:scale-105 hover:shadow-2xl",
    {
      " bg-green-darker-80": isSelected, // Cores especiais se selecionado
      "bg-black-70": !isSelected, // Padrão para não selecionado
    }
  )}
  onPress={() => toggleRoleSelection(item.id)}
>
  <Text
    className={clsx("text-sm font-semibold", {
      "text-primary": isSelected,
      "text-white": !isSelected
    })}
  >
    {item.title}
  </Text>
  {/* {isSelected && (
    <TouchableOpacity onPress={() => toggleRoleSelection(item.id)}>
      <X size={18} color={colors.green.darker[90]} />
    </TouchableOpacity>
  )} */}
</TouchableOpacity>
              );
            })}
          </BottomSheetScrollView>
        </BottomSheetView>
      </BottomSheetView>
    );

    if (!isVisible || currentType !== "search") return null;

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
        {renderReportOptions()}
      </BottomSheet>
    );
  }
);

export default GlobalSearchBottomSheet;
