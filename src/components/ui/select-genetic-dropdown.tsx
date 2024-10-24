import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { colors } from '@/styles/colors';
import debounce from 'lodash/debounce';
import { getGenetics } from '@/api/social/genetic';
import { find } from 'lodash';

interface Genetic {
  name: string;
  id: number;
}

interface SelectGeneticDropdownProps {
  title?: string;
  placeholder: string;
  error?: string;
  handleChangeText: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const SelectGeneticDropdown = ({ title, placeholder, error, handleChangeText, onBlur = () => {}, onFocus = () => {} }: SelectGeneticDropdownProps) => {
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const [data, setData] = useState<Genetic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  const fetchSuggestions = debounce(async (query: string = '', skip: number = 0) => {
    setIsLoading(true);
    try {
      const geneticSelected = find(data, d => d.id === value);
      
      const genetics = await getGenetics({ query, skip, limit });
      const updatedData = [...genetics];
      if (geneticSelected && !updatedData.some(d => d.id === geneticSelected.id)) {
        updatedData.unshift(geneticSelected); 
      }

      if (genetics.length < limit) {
        setHasMore(false); 
      }

      setData(prev => (skip === 0 ? updatedData : [...prev, ...updatedData]));

    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  useEffect(() => {
    setSkip(0);
    fetchSuggestions(searchQuery);
  }, [searchQuery]);

  const loadMoreData = () => {
    if (hasMore && !isLoading) {
      const nextSkip = skip + limit;
      setSkip(nextSkip);
      fetchSuggestions(searchQuery, nextSkip);
    }
  }
 

  return (
    <View style={styles.container}>
      {title && <Text className={`text-base font-medium ${error ? 'text-red-500' : 'text-white'}`}>
          {title}
        </Text>}
      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: colors.brand.green }, !!error && { borderColor: '#ef4444' }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        containerStyle={styles.containerStyles}
        itemContainerStyle={styles.itemContainerStyle}
        itemTextStyle={styles.itemTextStyle}
        iconStyle={styles.iconStyle}
        activeColor={colors.black[70]}
        data={data.map(item => ({ label: item.name, value: item.id }))}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? placeholder : '...'}
        keyboardAvoiding
        mode='auto'
        searchPlaceholder="Pesquisar.."
        value={value}
        onFocus={() => {
          setIsFocus(true);
          onFocus();
        }}
        onBlur={() => {
          setIsFocus(false);
          onBlur();
        }}
        onChange={item => {
          setValue(item.value);
          setIsFocus(false);
          handleChangeText(item.value);
        }}
        onChangeText={text => setSearchQuery(text)}
        flatListProps={{
          onEndReached: loadMoreData,
          onEndReachedThreshold: 0.5,
          ListFooterComponent: isLoading ? (
            <View className="flex flex-row justify-center items-center ">
              <ActivityIndicator color={colors.brand.green} size="small" className="w-7 h-7" />
            </View>
          ) : null
        }}
        renderLeftIcon={(isVisible) => isVisible && (isLoading && <ActivityIndicator size="small" color={colors.brand.green} />)}
      />
      {error && <Text className="text-red-500 text-base font-medium">{error}</Text>}
    </View>
  );
};

export default SelectGeneticDropdown;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    flexDirection: 'column',
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
