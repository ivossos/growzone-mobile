import React, { useState } from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";

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
    <TouchableOpacity onPress={toggleExpanded}>
      <Text
        className="text-base text-brand-grey font-normal w-full"
        numberOfLines={isExpanded ? undefined : numberOfLines}
        ellipsizeMode="tail"
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
};

export default ExpandableText;
