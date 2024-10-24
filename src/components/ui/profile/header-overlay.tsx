import { Avatar, AvatarFallback, AvatarImage } from "@/components/Avatar";
import { getInitials } from "@/lib/utils";
import { colors } from "@/styles/colors";
import { ChevronLeft } from "lucide-react-native";
import React, { FC, memo, useMemo } from "react";
import { Text, TouchableOpacity, View, ViewProps } from "react-native";

type Props = Pick<ViewProps, "style"> & {
  name: string;
  imageUri?: string;
  onBack: () => void;
};

const HeaderOverlay = ({ name, imageUri, onBack, style }: Props) => {
  const containerStyle = useMemo(() => [style], [style]);

  return (
    <View 
      style={containerStyle} 
      className="flex flex-row items-center gap-4 h-[72px] px-6">
    <TouchableOpacity
      className="p-2 rounded-lg border border-black-80"
      onPress={onBack}
    >
      <ChevronLeft className="w-8 h-8" color={colors.brand.white} />
    </TouchableOpacity>

      <Avatar className="w-10 h-10 border-black-80 border bg-black-80">
          {imageUri ? (
            <AvatarImage className="rounded-full" source={{ uri: imageUri }} />
          ) : (
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          )}
        </Avatar>

    <Text className="text-lg text-white font-medium">{name}</Text>
  </View>
);
   
};


export default memo(HeaderOverlay);