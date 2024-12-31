import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { X, ArrowDown } from "lucide-react-native";

import { colors } from "@/styles/colors";
import debounce from "lodash/debounce";
import { getPhases } from "@/api/social/phase";
import { uniqBy } from "lodash";

interface Phase {
  name: string;
  id: number;
}

interface Props {
  title?: string;
  placeholder: string;
  error?: string;
  showClearIcon?: boolean;
  initialValue?: { id?: number; label?: string };
  handleChangeText: (text: string, data: { id: number; label: string }) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const SelectPhaseDropdown = ({
  title,
  placeholder,
  error,
  initialValue,
  showClearIcon = false,
  handleChangeText,
  onBlur = () => {},
  onFocus = () => {},
}: Props) => {
  const [value, setValue] = useState<number | null>(null);
  const [isFocus, setIsFocus] = useState(false);
  const [data, setData] = useState<Phase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  const fetchSuggestions = debounce(
    async (query: string = "", skip: number = 0) => {
      setIsLoading(true);
      try {
        const phases = await getPhases({ query, skip, limit });
        if (phases.length < limit) {
          setHasMore(false);
        }
        setData((prev) => (skip === 0 ? phases : [...prev, ...phases]));
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
        const genetics = await getPhases({ query: initialValue.label });
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

  const loadMoreData = () => {
    if (hasMore && !isLoading) {
      const nextSkip = skip + limit;
      setSkip(nextSkip);
      fetchSuggestions(searchQuery, nextSkip);
    }
  };

  const cleanSelect = useCallback(() => {
    setValue(null);
    handleChangeText(null as any, {} as any);
  }, []);

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
          handleChangeText(item.value, item);
        }}
        onChangeText={(text) => setSearchQuery(text)}
        flatListProps={{
          onEndReached: loadMoreData,
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
        renderRightIcon={() => {
          if (showClearIcon) {
            return (
              <View className="justify-end">
                {value ? (
                  <X
                  size={24}
                  color={colors.brand.grey}
                  onPress={cleanSelect}
                />
                  
                ) : (
                  <ArrowDown size={24} color={colors.brand.grey} />
                )}
              </View>
            );
          }
        }}
        renderLeftIcon={(isVisible) => {
          if (isVisible && isLoading) {
            return (
              <ActivityIndicator size="small" color={colors.brand.green} />
            );
          }
        }}
      />
      {error && (
        <Text className="text-red-500 text-base font-medium">{error}</Text>
      )}
    </View>
  );
};

export default SelectPhaseDropdown;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    flexDirection: "column",
    gap: 8,
  },
  dropdown: {
    height: 68,
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
