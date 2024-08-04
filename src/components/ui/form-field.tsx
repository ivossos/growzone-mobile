import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, TextInputProps } from "react-native";
import { EyeIcon, EyeOffIcon, LucideIcon } from "lucide-react-native";
import { colorScheme } from "nativewind";
import { colors } from "@/styles/colors";

interface FormFieldProps extends TextInputProps {
  title: string;
  value: string;
  placeholder: string;
  handleChangeText: (text: string) => void;
  otherStyles?: string;
  leftIcon?: LucideIcon;
}

export function FormField({
  title,
  value,
  placeholder,
  handleChangeText,
  otherStyles,
  leftIcon: LeftIcon,
  ...props
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className={`flex flex-col gap-2 ${otherStyles}`}>
      <Text className="text-base font-medium text-white">{title}</Text>

      <View className={`w-full h-16 px-4 bg-black-90 rounded-lg flex flex-row items-center gap-2 ${isFocused ? 'border border-brand-green' : ''}`}>
        {LeftIcon && (
          <LeftIcon 
            width={24}
            height={24}
            color={isFocused ? colors.brand.green : colors.black[70]}
          />
        )}
        <TextInput
          className="flex-1 text-white font-medium text-base"
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#B6B6B6"
          onChangeText={handleChangeText}
          secureTextEntry={title === "Password" && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {title === "Password" && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? 
              <EyeIcon 
                width={24}
                height={24}
                color={colors.black[70]}
              /> : 
              <EyeOffIcon 
                width={24}
                height={24}
                color={colors.black[70]} 
              />
            }
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
