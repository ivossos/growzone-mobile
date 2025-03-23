import React, { useState } from "react";
import {
  Text,
  View,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";

type ExpandableTextProps = {
  text: string;
  numberOfLines?: number;
};

const ExpandableText = ({ text, numberOfLines = 1 }: ExpandableTextProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { height } = useWindowDimensions();

  const toggleExpanded = () => setIsExpanded((prev) => !prev);

  return (
    <View className={`p-2 rounded-lg ${isExpanded && 'bg-black-100/70'}`}>
      {isExpanded ? (
        <>
          <ScrollView
            style={{ maxHeight: height * 0.8 }}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            <Text className="text-base text-white">{text}</Text>
          </ScrollView>
          <TouchableOpacity onPress={toggleExpanded}>
            <Text className="text-sm text-primary font-semibold mt-2">
              ver menos
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity onPress={toggleExpanded} activeOpacity={0.8}>
            <Text
              className="text-base text-white"
              numberOfLines={numberOfLines}
              ellipsizeMode="tail"
            >
              {text}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default ExpandableText;
