import { Fragment } from "react";
import { View, Text } from "react-native";

interface DividerProps {
  text?: string;
  className?: string;
}

const Divider = ({ text, className }:DividerProps) => {
  return (
    <View className={`flex-row items-center my-8 ${className}`}>
      <View className="flex-1 h-px bg-black-90" />
      {text ? (
        <Fragment>
          <Text className="px-2 text-brand-grey text-lg font-medium">{text}</Text>
          <View className="flex-1 h-px  bg-black-90" />
        </Fragment>
      ) : (
        <View className="flex-1 h-px bg-black-90" />
      )}
    </View>
  );
};

export default Divider;
