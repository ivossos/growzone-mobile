import React, { useCallback, useMemo, useState } from "react";
import { Text, View } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { colors } from "@/styles/colors";
import { useBottomSheetContext } from "@/context/bottom-sheet-context";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SelectPhaseDropdown from "./select-phase-dropdown";
import Button from "./button";
import { ScrollView } from "react-native-gesture-handler";

interface Props {
  onClose: () => void;
}

type FormFilterGenetic = {
  phase: {
    id: number | null;
    name: string | null;
  };
};

export const filterGeneticValidation = z.object({
  phase: z
    .object({
      id: z.number().nullable(),
      name: z.string().nullable(),
    })
    .nullable(),
});

const GlobalSearchBottomSheet = React.forwardRef<BottomSheet, Props>(
  ({ onClose }, ref) => {
    const { isVisible, currentType, closeBottomSheet, callback } =
      useBottomSheetContext();

    const form = useForm<
      FormFilterGenetic,
      FormFilterGenetic,
      FormFilterGenetic
    >({
      resolver: zodResolver(filterGeneticValidation),
      defaultValues: {
        phase: { id: null, name: null },
      },
    });

    const snapPoints = useMemo(() => ["60%", "90%"], []);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} opacity={0.8} appearsOnIndex={1} />
      ),
      []
    );

    const handleClose = useCallback(() => {
      onClose();
      closeBottomSheet();
    }, [onClose, closeBottomSheet]);

    const handlerSubmit = useCallback(
      async (values: FormFilterGenetic) => {
        if (callback) {
          await callback({ ok: true, ...values });
        }

        handleClose();
      },
      [handleClose, callback]
    );

    const footerComponent = useMemo(() => {
      return (props: BottomSheetFooterProps) => (
        <BottomSheetFooter style={{ paddingHorizontal: 18, paddingBottom: 18 }} {...props}>
          <Button
            title="Pesquisar"
            handlePress={form.handleSubmit(handlerSubmit)}
          />
        </BottomSheetFooter>
      );
    }, [form, handlerSubmit]);

    const renderReportOptions = () => (
      <BottomSheetView className="flex-1 gap-6 p-6 bg-black-100">
        <View className="gap-2">
          <Text className="text-2xl text-white text-start font-semibold">
            Filtrar Genética
          </Text>

          <Text className="text-base font-semibold text-start text-brand-grey">
            Selecione os filtros que você deseja aplicar
          </Text>
        </View>

        <ScrollView className="gap-2">
          <View>
            <Controller
              control={form.control}
              name="phase"
              render={({ field: { onChange, value }, fieldState }) => (
                <SelectPhaseDropdown
                  title="Fase"
                  placeholder="Selecione uma fase"
                  showClearIcon
                  initialValue={{
                    id: value.id || 0,
                    label: value.name || "",
                  }}
                  handleChangeText={(selectedId, data) => {
                    onChange({
                      id: selectedId || null,
                      name: data.label || null,
                    });
                  }}
                  error={fieldState.error?.["phase"]?.message}
                />
              )}
            />
          </View>
        </ScrollView>
      </BottomSheetView>
    );

    if (!isVisible || currentType !== "search-genetic") return null;

    return (
      <BottomSheet
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        handleIndicatorStyle={{ backgroundColor: colors.black[80] }}
        backgroundStyle={{ backgroundColor: colors.black[100] }}
        keyboardBlurBehavior="restore"
        keyboardBehavior="extend"
        android_keyboardInputMode="adjustResize"
        backdropComponent={renderBackdrop}
        onClose={handleClose}
        footerComponent={footerComponent}
      >
        {renderReportOptions()}
      </BottomSheet>
    );
  }
);

export default GlobalSearchBottomSheet;
