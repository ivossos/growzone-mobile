import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { cn } from '../lib/utils';
import { Check } from 'lucide-react-native';
import { colors } from '@/styles/colors';

interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof View> {
  label?: string;
  labelClasses?: string;
  checkboxClasses?: string;
  isChecked: boolean;
  toggleCheckbox: () => void;
}
function Checkbox({
  label,
  labelClasses,
  checkboxClasses,
  className,
  isChecked,
  toggleCheckbox,
  ...props
}: CheckboxProps) {


  return (
    <View
      className={cn('flex flex-row items-center gap-2', className)}
      {...props}
    >
      <TouchableOpacity onPress={toggleCheckbox}>
        <View
          className={cn(
            'w-6 h-6 border border-brand-green bg-black-70 rounded bg-background flex justify-center items-center',
            {
              'bg-primary': isChecked,
            },
            checkboxClasses
          )}
        >
          {isChecked && <Check size={18} color={colors.brand.white}/>}
        </View>
      </TouchableOpacity>
      {label && (
        <Text className={cn('text-primary', labelClasses)}>{label}</Text>
      )}
    </View>
  );
}

export { Checkbox };
