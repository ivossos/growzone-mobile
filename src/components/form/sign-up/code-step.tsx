import React from 'react';
import { Controller } from 'react-hook-form';
import { FormField } from '@/components/ui/form-field';
import Button from '@/components/ui/button';
import { StepProps } from '@/app/(auth)/sign-up';
import OtpInput from '@/components/ui/input-otp';
import { Text, TouchableOpacity, View } from 'react-native';
import { RefreshCw } from 'lucide-react-native';
import { colors } from '@/styles/colors';

export default function CodeStep({ control, onNext = () => {} }: StepProps) {
  return (
    <View className='flex flex-col w-full'>
      <Controller
        control={control}
        name="code"
        render={({ fieldState, field: { onChange, value } }) => (
          <OtpInput
            title="Código"
            onComplete={onChange}
            defaultValue={value}
            otpLength={5}
            errorMessage={fieldState.error?.message}
            />
          // <FormField
          //   title="Código"
          //   placeholder="Digite seu código"
          //   otherStyles="mt-6"
            
          // />
        )}
      />

        <TouchableOpacity className='flex flex-row items-center gap-2 mt-2'>
          <RefreshCw width={16} height={16} color={colors.brand.white}/>
          <Text className="text-lg font-medium text-brand-grey">Reenviar código</Text>

        </TouchableOpacity>

        <Button
          handlePress={onNext}
          containerStyles="w-full mt-6"
          title="Continuar"
        />
      
    </View>
  );
}