import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

type ExpandableTextProps = {
  text: string;
  numberOfLines?: number;
};

const ExpandableText = ({ text, numberOfLines = 1 }: ExpandableTextProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <TouchableOpacity onPress={toggleExpanded} activeOpacity={0.8}>
      <View
        className={`p-2 rounded-lg ${
          isExpanded ? "bg-black-100/70" : "bg-transparent"
        }`}
      >
        <Text
          className="text-base text-white font-normal w-full"
          numberOfLines={isExpanded ? undefined : numberOfLines}
          ellipsizeMode="tail"
        >
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ExpandableText;
