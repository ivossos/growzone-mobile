import { forwardRef, Fragment, useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
  FlatList,
  FlatListProps,
} from "react-native";

import { SquareCheck, Square } from "lucide-react-native";
import { colors } from "@/styles/colors";
import Divider from "./ui/divider";
import { Modal } from "./Modal";

interface SelectProps<T> extends Omit<FlatListProps<T>, "renderItem"> {
  data: T[];
  values: T[];
  title: string;
  keyField: keyof T;
  labelField: keyof T;
  multiselected?: boolean;
  loading?: boolean;
  error?: string;
  editable?: boolean;
  onChange: (selectedIds: any[], selectedValue: any[]) => void;
  onClose?: (isClosed: boolean) => void;
}

const Select = forwardRef<React.ElementRef<typeof FlatList>, SelectProps<any>>(
  (
    {
      data,
      values,
      title,
      keyField,
      labelField,
      multiselected = false,
      loading = false,
      editable = true,
      error,
      onChange,
      onClose,
      ...props
    },
    ref
  ) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedValue, setSelectedValue] = useState<Array<any>>([]);
    const [selectedIds, setSelectedIds] = useState<Array<any>>([]);

    const setInitialValues = () => {
      const initialValue = data.filter((value) =>
        values.includes(value[keyField])
      );
      const keysSelected = initialValue.map((value) => {
        return value[keyField];
      });
      setSelectedValue(initialValue);
      setSelectedIds(keysSelected);
    };

    useEffect(() => {
      setInitialValues();
    }, [data, values]);

    const closeModal = useCallback(() => {
      const isModalClosed = !modalVisible;
      setModalVisible(isModalClosed);
      if (onClose) {
        onClose(isModalClosed);
      }
    }, [modalVisible]);

    const handleSelect = (item: any) => {
      if (multiselected) {
        setSelectedIds((prevIds) => {
          const newIds = prevIds.includes(item[keyField])
            ? prevIds.filter((id) => id !== item[keyField])
            : [...prevIds, item[keyField]];

          setSelectedValue((prevSelectedValue) => {
            const newSelectedValue = newIds.includes(item[keyField])
              ? [...prevSelectedValue, item]
              : prevSelectedValue.filter(
                  (value) => value[keyField] !== item[keyField]
                );
            onChange(newIds, newSelectedValue);
            return newSelectedValue;
          });

          return newIds;
        });
      } else {
        const newIds = [item[keyField]];
        const newSelectedValue = [item];
        setSelectedIds(newIds);
        setSelectedValue(newSelectedValue);
        onChange(newIds, newSelectedValue);
        closeModal()
      }
    };

    const renderItem = ({ item }: { item: any }) => {
      const itemSelected = selectedIds.includes(item[keyField]);

      return (
        <TouchableOpacity className="gap-4" onPress={() => handleSelect(item)}>
          <View className="flex flex-row items-center gap-4">
            <View>
              {itemSelected ? (
                <SquareCheck width={34} height={34} color={colors.primary} />
              ) : (
                <Square width={34} height={34} color={colors.brand.grey} />
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Text
                className={`text-lg font-regular 
                    ${error ? "text-red-500" : "text-white"} 
                    ${!editable && "text-black-60"}
                    ${itemSelected && "font-semibold"}`}
                style={{
                  color: itemSelected ? colors.primary : colors.brand.grey,
                  flexWrap: "wrap",
                }}
              >
                {item[labelField]}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    };

    return (
      <TouchableWithoutFeedback onPress={closeModal}>
        <Fragment>
          <View className="gap-2">
            <View>
              {title && (
                <Text
                  className={`text-base font-medium 
                    ${error ? "text-red-500" : "text-white"} 
                    ${!editable && "text-black-60"}`}
                >
                  {title ?? "Selecione uma opção"}
                </Text>
              )}
            </View>

            <View>
              <TouchableOpacity
                className={`bg-black-90 rounded-lg w-full min-h-16 justify-center p-4 ${
                  error && "border border-red-500"
                }`}
                onPress={closeModal}
              >
                {multiselected ? (
                  selectedValue.length > 0 ? (
                    <View className="flex flex-row flex-wrap gap-2">
                      {selectedValue.map((item) => (
                        <View
                          key={item[keyField]}
                          className="bg-primary px-4 py-1 rounded-full"
                        >
                          <Text
                            className={`text-lg font-regular text-black-100`}
                          >
                            {item[labelField]}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text className="text-white text-base">
                      Selecione uma opção
                    </Text>
                  )
                ) : (
                  <Text className="text-white text-base">
                    {selectedValue.length > 0
                      ? selectedValue[0][labelField]
                      : "Selecione uma opção"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {error && (
              <Text className="text-red-500 text-base font-medium">
                {error}
              </Text>
            )}
          </View>

          <Modal
            transparent
            animationType="fade"
            visible={modalVisible}
            onRequestClose={closeModal}
            closeModal={closeModal}
          >
            <FlatList
              ref={ref}
              data={data}
              renderItem={renderItem}
              keyExtractor={(item) => String(item[keyField])}
              style={styles.list}
              ItemSeparatorComponent={() => {
                return <Divider className="!my-4" />;
              }}
              {...props}
            />
          </Modal>
        </Fragment>
      </TouchableWithoutFeedback>
    );
  }
);

const styles = StyleSheet.create({
  loader: {
    padding: 20,
  },
  list: {
    height: 300,
    borderWidth: 1,
    borderColor: colors.brand.black,
    borderRadius: 5,
    backgroundColor: colors.brand.black,
  },
  dropdownContainer: {
    height: 260,
    overflow: "hidden",
  },
});

export { Select };
