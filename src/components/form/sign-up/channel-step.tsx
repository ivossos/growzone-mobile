import React from 'react';
import { StepProps } from '@/app/(auth)/sign-up';
import { colors } from '@/styles/colors';
import { Mail, Phone } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import { Controller } from 'react-hook-form';

export default function ChannelStep({ control, onNext }: StepProps) {
  return (
    <>
      <View className="flex gap-2 pt-6 mb-4">
        <Text className="text-4xl font-semibold text-white text-center">
          Escolha o canal para receber o código
        </Text>

        <Text className="text-lg font-regular text-black-30 text-center ">
          Escolha como você deseja receber seu código de verificação.
        </Text>
      </View>
      <Controller
        control={control}
        name="fieldType"
        render={({ field: { onChange, } }) => (
          <>
            <TouchableOpacity
              onPress={() => {onChange('phone'); onNext('phone')}}
              activeOpacity={0.7}
              className="bg-black-90 rounded-lg min-h-[56px] px-4 flex flex-row justify-start items-center w-full gap-4"
            >
              <Phone width={24} height={24} color={colors.primary} />
              <Text className="text-white text-lg font-medium text-center">Continuar com o Celular</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {onChange('phone'); onNext('email')}}
              activeOpacity={0.7}
              className="bg-black-90 rounded-lg min-h-[56px] px-4 flex flex-row justify-start items-center w-full gap-4 mt-6"
            >
              <Mail width={24} height={24} color={colors.primary} />
              <Text className="text-white text-lg font-medium text-center">Continuar com o Email</Text>
            </TouchableOpacity>
          </>
        )}
      />
    </>
  );
}
