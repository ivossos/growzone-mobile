import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInputProps } from "react-native";
import { EyeIcon, EyeOffIcon, LucideIcon, X } from "lucide-react-native";
import { colors } from "@/styles/colors";
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';

interface FormFieldProps extends TextInputProps {
  title?: string;
  value: string;
  placeholder: string;
  type?: string;
  handleChangeText: (text: string) => void;
  containerStyles?: string;
  otherStyles?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  error?: string; 
}

export function FormFieldBottomSheetText({
  title,
  value,
  placeholder,
  handleChangeText,
  containerStyles,
  otherStyles,
  type = '',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  error,
  editable = true,
  onBlur = () => {}, 
  ...props
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className={`flex flex-col gap-2 ${otherStyles} ${!editable && 'opacity-80'}`}>
      {title && <Text className={`text-base font-medium ${error ? 'text-red-500' : 'text-white'} ${!editable && 'text-black-60'}`}>{title}</Text>}

      <View className={`w-full h-16 p-4 bg-black-90 rounded-lg flex flex-row gap-2
        ${containerStyles} 
        ${isFocused && 'border border-brand-green'}
        ${error && 'border border-red-500'}`}>
        {LeftIcon && (
          <LeftIcon 
            width={24}
            height={24}
            color={error ? colors.brand.error : isFocused ? colors.brand.green : colors.black[70]}
          />
        )}
        
        <BottomSheetTextInput
          className={`flex-1 text-white text-start font-medium text-base ${!editable && 'text-black-60'}`}
          style={{ textAlignVertical: 'top'}}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={error ? colors.brand.error : "#B6B6B6"}
          onChangeText={handleChangeText}
          secureTextEntry={type === "password" && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur(e);
          }}
          editable={editable}
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
