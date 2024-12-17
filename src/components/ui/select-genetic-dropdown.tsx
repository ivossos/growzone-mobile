import React, { useState, useEffect, useCallback, useMemo } from "react";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { colors } from "@/styles/colors";
import debounce from "lodash/debounce";
import { createGenetic, getGenetics } from "@/api/social/genetic";
import { find, uniqBy } from "lodash";
import { CreateGenetic } from "@/api/@types/models";
import Toast from "react-native-toast-message";
import Button from "./button";

interface Genetic {
  name: string;
  id: number;
}

interface SelectGeneticDropdownProps {
  title?: string;
  placeholder: string;
  error?: string;
  initialValue?: { id?: number; label?: string };
  handleChangeText: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const SelectGeneticDropdown = ({
  title,
  placeholder,
  error,
  initialValue,
  handleChangeText,
  onBlur = () => {},
  onFocus = () => {},
}: SelectGeneticDropdownProps) => {
  const [value, setValue] = useState<number | null>(null);
  const [isFocus, setIsFocus] = useState(false);
  const [data, setData] = useState<Genetic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  const fetchSuggestions = debounce(
    async (query: string = "", skip: number = 0) => {
      setIsLoading(true);
      try {
        const geneticSelected = find(data, (d) => d.id === value);
        const genetics = await getGenetics({ query, skip, limit });
        const updatedData = [...genetics];

        if (
          geneticSelected &&
          !updatedData.some((d) => d.id === geneticSelected.id)
        ) {
          updatedData.unshift(geneticSelected as any);
        }

        if (genetics.length < limit) {
          setHasMore(false);
        }

        setData((prev) =>
          skip === 0 ? updatedData : [...prev, ...updatedData]
        );
      } catch (error) {
        console.error("Erro ao buscar sugestões:", error);
      } finally {
        setIsLoading(false);
      }
    },
    300
  );

  useEffect(() => {
    setSkip(0);
    fetchSuggestions(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const loadInitialValue = async () => {
      if (!initialValue || !initialValue.id || value === initialValue.id)
        return;

      if (data.some((item) => item.id === initialValue.id)) return;

      try {
        setIsLoading(true);
        const genetics = await getGenetics({ query: initialValue.label });
        const genetic = genetics.find((item) => item.id === initialValue.id);

        if (genetic) {
          setData((prev) =>
            uniqBy([{ id: genetic.id, name: genetic.name }, ...prev], "id")
          );
          setValue(initialValue.id);
        }
      } catch (error) {
        console.error("Erro ao carregar o item inicial:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialValue();
  }, [initialValue?.id, value, data]);

  const addNewGenetic = useCallback(async () => {
    setIsLoading(true);

    const createGeneticData: CreateGenetic = {
      name: searchQuery.toUpperCase(),
    };

    try {
      await createGenetic(createGeneticData);

      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: "Genética adicionada com sucesso",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erro",
        text2: "Não foi possível adicionar a genética",
      });
    }

    setIsLoading(false);
  }, [searchQuery]);

  const buttonAddNewGenetic = useMemo(() => {
    return (
      <View
        style={{
          flex: 1,
          padding: 16,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Button
          handlePress={addNewGenetic}
          title="Adicionar"
          variant="outline"
          containerStyles="w-full"
        />
      </View>
    );
  }, []);

  const loadMoreData = () => {
    if (hasMore && !isLoading) {
      const nextSkip = skip + limit;
      setSkip(nextSkip);
      fetchSuggestions(searchQuery, nextSkip);
    }
  };

  return (
    <View style={styles.container}>
      {title && (
        <Text
          className={`text-base font-medium ${
            error ? "text-red-500" : "text-white"
          }`}
        >
          {title}
        </Text>
      )}
      <Dropdown
        style={[
          styles.dropdown,
          isFocus && { borderColor: colors.brand.green },
          !!error && { borderColor: "#ef4444" },
        ]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        containerStyle={styles.containerStyles}
        itemContainerStyle={styles.itemContainerStyle}
        itemTextStyle={styles.itemTextStyle}
        iconStyle={styles.iconStyle}
        activeColor={colors.black[70]}
        data={data.map((item) => ({ label: item.name, value: item.id }))}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? placeholder : "..."}
        keyboardAvoiding
        mode="auto"
        searchPlaceholder="Pesquisar.."
        value={value as any}
        onFocus={() => {
          setIsFocus(true);
          onFocus();
        }}
        onBlur={() => {
          setIsFocus(false);
          onBlur();
        }}
        onChange={(item) => {
          setValue(item.value);
          setIsFocus(false);
          handleChangeText(String(item.value));
        }}
        onChangeText={(text) => setSearchQuery(text)}
        flatListProps={{
          onEndReached: loadMoreData,
          ListEmptyComponent: buttonAddNewGenetic,
          onEndReachedThreshold: 0.5,
          ListFooterComponent: isLoading ? (
            <View className="flex flex-row justify-center items-center ">
              <ActivityIndicator
                color={colors.brand.green}
                size="small"
                className="w-7 h-7"
              />
            </View>
          ) : null,
        }}
        renderLeftIcon={(isVisible) => {
          if (isVisible && isLoading) {
            return (
              <ActivityIndicator size="small" color={colors.brand.green} />
            );
          }

          return null;
        }}
      />
      {error && (
        <Text className="text-red-500 text-base font-medium">{error}</Text>
      )}
    </View>
  );
};

export default SelectGeneticDropdown;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    flexDirection: "column",
    gap: 8,
  },
  dropdown: {
    height: 56,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: colors.black[90],
  },
  icon: {
    marginRight: 5,
  },
  label: {
    paddingHorizontal: 8,
    fontSize: 14,
  },
  selectedStyle: {
    backgroundColor: colors.black[60],
  },
  containerStyles: {
    backgroundColor: colors.black[80],
    borderColor: colors.black[90],
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  itemContainerStyle: {
    backgroundColor: colors.black[80],
    color: colors.brand.white,
  },
  itemTextStyle: {
    color: colors.brand.white,
  },
  placeholderStyle: {
    paddingHorizontal: 8,
    fontSize: 16,
    color: colors.brand.grey,
  },
  selectedTextStyle: {
    paddingHorizontal: 8,
    fontSize: 16,
    color: colors.brand.white,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    fontSize: 16,
    borderRadius: 8,
    borderColor: colors.black[80],
    paddingHorizontal: 8,
    backgroundColor: colors.black[90],
    color: colors.brand.white,
  },
});
