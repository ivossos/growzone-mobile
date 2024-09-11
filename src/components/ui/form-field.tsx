import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, TextInputProps } from "react-native";
import { EyeIcon, EyeOffIcon, LucideIcon, X } from "lucide-react-native";
import { colors } from "@/styles/colors";

interface FormFieldProps extends TextInputProps {
  title?: string;
  value: string;
  placeholder: string;
  type?: string;
  handleChangeText: (text: string) => void;
  otherStyles?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  error?: string;  
}

export function FormField({
  title,
  value,
  placeholder,
  handleChangeText,
  otherStyles,
  type = '',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  error,
  ...props
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className={`flex flex-col gap-2 ${otherStyles}`}>
      {title && <Text className={`text-base font-medium ${error ? 'text-red-500' : 'text-white'}`}>{title}</Text>}

      <View className={`w-full h-16 px-4 bg-black-90 rounded-lg flex flex-row items-center gap-2 
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
          className="flex-1 text-white font-medium text-base"
          value={value}
          placeholder={placeholder}
          placeholderTextColor={error ? colors.brand.error : "#B6B6B6"}
          onChangeText={handleChangeText}
          secureTextEntry={type === "password" && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {(type !== "password" && RightIcon) && (
          <RightIcon 
            width={24}
            height={24}
            color={error ? colors.brand.error : isFocused ? colors.brand.green : colors.black[70]}
          />
        )}

        {type === "password" && (
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

        {(type === "clear" && value.length > 0) && (
          <TouchableOpacity onPress={() => handleChangeText('')}>
              <X 
                width={24}
                height={24}
                color={colors.brand.white}
              />
            
          </TouchableOpacity>
        )}
      </View>

      {error && <Text className="text-red-500 text-base font-medium">{error}</Text>}
    </View>
  );
};
