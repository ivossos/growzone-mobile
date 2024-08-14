import { View, Text } from "react-native";

interface DividerProps {
  text?: string;
}

const Divider = ({ text }:DividerProps) => {
  return (
    <View className="flex-row items-center my-8">
      <View className="flex-1 h-px bg-black-90" />
      {text ? (
        <>
          <Text className="px-2 text-brand-grey text-lg font-medium">{text}</Text>
          <View className="flex-1 h-px  bg-black-90" />
        </>
      ) : (
        <View className="flex-1 h-px bg-black-90" />
      )}
    </View>
  );
};

export default Divider;
