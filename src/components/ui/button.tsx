import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { LucideIcon } from 'lucide-react-native';
import { colors } from '@/styles/colors';


interface Props {
  title: string;
  handlePress: () => void;
  containerStyles?: string;
  textStyles?: string;
  isLoading?: boolean;
  variant?: 'default' | 'outline';
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
}

const Button: React.FC<Props> = ({
  title,
  handlePress,
  containerStyles,
  textStyles,
  isLoading,
  variant = 'default',
  leftIcon: LeftIcon,
  rightIcon: RightIcon
}) => {
  const buttonClassName = variant === 'outline'
    ? `border border-primary active:bg-primary rounded-lg min-h-[56px] px-4 flex flex-row justify-center items-center group-isolate ${containerStyles} ${isLoading ? "opacity-50" : ""}`
    : `bg-primary rounded-lg min-h-[56px] px-4 flex flex-row justify-center items-center gap-2 ${containerStyles} ${isLoading ? "opacity-50" : ""}`;

  const textClassName = variant === 'outline'
    ? `text-primary group-isolate-active:text-brand-black font-medium text-lg ${textStyles}`
    : `text-brand-black font-medium text-lg ${textStyles}`;

  const iconColor = variant === 'outline' ? colors.primary : colors.brand.black

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={buttonClassName}
      disabled={isLoading}
    >
      {LeftIcon && (
        <LeftIcon 
          width={20}
          height={20}
          color={iconColor}
        />
      )}
      <Text className={`${textClassName} text-4xl`}>
        {title}
      </Text>
      {isLoading && (
        <ActivityIndicator
          animating={isLoading}
          color="#fff"
          size="small"
          className="ml-2"
        />
      )}
      {RightIcon && (
        <RightIcon 
          width={20}
          height={20}
          color={iconColor}
        />
      )}
    </TouchableOpacity>
  );
};

export default Button;
