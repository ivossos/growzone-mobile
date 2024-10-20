import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, TextInputProps } from "react-native";
import { LucideIcon, X } from "lucide-react-native";
import { colors } from "@/styles/colors";
import { getGenetics, createGenetic } from "@/api/social/genetic";
import { debounce } from "lodash";
import { Genetic } from "@/api/@types/models";


interface AutocompleteFieldProps extends TextInputProps {
  title?: string;
  value: string;
  placeholder: string;
  containerStyles?: string;
  otherStyles?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  error?: string; 
  creatable?: boolean;
  onSelectItem: (item: Genetic) => void; // Agora retorna um objeto com ID e Nome
  editable?: boolean;
}

export function AutocompleteField({
  title,
  value,
  placeholder,
  onSelectItem,
  containerStyles,
  otherStyles,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  error,
  editable = true,
  creatable = false,
  onBlur = () => {},
  ...props
}: AutocompleteFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Genetic[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = debounce(async (query: string) => {
    setLoading(true);
    try {
      const data = await getGenetics({ query });
      setSuggestions(data);
    } catch (error) {
      console.error("Erro ao buscar sugestões:", error);
    } finally {
      setLoading(false);
    }
  }, 300);

  const handleChangeText = (text: string) => {
    if (text.length > 0) {
      fetchSuggestions(text);
    } else {
      setSuggestions([]);
    }
  };

  const handleCreateItem = async () => {
    if (creatable && value) {
      try {
        const newGenetic = await createGenetic({ name: value });
        onSelectItem(newGenetic);
        setIsFocused(false);
      } catch (error) {
        console.error("Erro ao criar nova genética:", error);
      }
    }
  };

  return (
    <View className={`flex flex-col gap-2 ${otherStyles} ${!editable && 'opacity-80'}`}>
      {title && <Text className={`text-base font-medium ${error ? 'text-red-500' : 'text-white'} ${!editable && 'text-black-60'}`}>{title}</Text>}

      <View className={`w-full h-16 p-4 bg-black-90 rounded-lg flex flex-row gap-2
        ${containerStyles} 
        ${isFocused && 'border border-brand-green'}
        ${error && 'border border-red-500'}`}>
        {LeftIcon && (
          <LeftIcon 
            width={24}
            height={24}
            color={error ? colors.brand.error : isFocused ? colors.brand.green : colors.black[70]}
          />
        )}
        <TextInput
          className={`flex-1 text-white text-start font-medium text-base ${!editable && 'text-black-60'}`}
          style={{ textAlignVertical: 'top'}}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={error ? colors.brand.error : "#B6B6B6"}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={editable}
          {...props}
        />

        {RightIcon && (
          <RightIcon 
            width={24}
            height={24}
            color={error ? colors.brand.error : isFocused ? colors.brand.green : colors.black[70]}
          />
        )}

        {/* Ícone de limpar */}
        {value.length > 0 && (
          <TouchableOpacity onPress={() => handleChangeText('')}>
            <X 
              width={24}
              height={24}
              color={colors.brand.white}
            />
          </TouchableOpacity>
        )}
      </View>

      {isFocused && suggestions.length > 0 && (
        <View className="bg-black-90 p-2 rounded-lg" style={{ flex: 1 }}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => {
                onSelectItem(item);
                setIsFocused(false);
              }}>
                <Text className="p-2 text-white">{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {creatable && isFocused && suggestions.length === 0 && value && (
        <TouchableOpacity 
          onPress={handleCreateItem}
          className="bg-black-90 p-2 rounded-lg"
        >
          <Text className="p-2 text-white">Criar genética "{value}"</Text>
        </TouchableOpacity>
      )}

      {error && <Text className="text-red-500 text-base font-medium">{error}</Text>}
    </View>
  );
}
