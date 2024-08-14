import React, { Fragment } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import Button from '@/components/ui/button';
import { StepProps } from '@/app/(auth)/sign-up';
import { Text, View, ScrollView } from 'react-native';
import { router } from 'expo-router';

export default function TermsStep({ handleSubmit, onSubmit }: StepProps) {
  const { formState, getValues} = useFormContext();
  console.log('errors', {errors: formState.errors, values: getValues()})
  const terms = [
    {
      title: "Informações de Registro",
      description: "Ao se registrar no Growzone, você fornece um nome de usuário único e um endereço de e-mail."
    },
    {
      title: "Informações de Perfil",
      description: "Você pode optar por fornecer informações adicionais ao completar seu perfil, como foto de perfil, idade, interesses e localização."
    },
    {
      title: "Conteúdo Gerado pelo Usuário",
      description: "O Growzone pode coletar informações que você publica no aplicativo, incluindo posts, comentários, fotos e vídeos."
    },
    {
      title: "Informações de Uso",
      description: "O aplicativo pode coletar informações sobre como você utiliza as funcionalidades, como interações com posts, eventos participados e produtos visualizados no marketplace."
    }
  ];

  return (
    <>
      <ScrollView className="max-h-80 bg-black-90 rounded-lg">
        <View className="flex flex-col gap-4 p-6">
          <Text className="text-xl font-semibold text-white">Informações Coletadas</Text>
          {terms.map(({ title, description }) => (
            <View key={title} className="flex flex-row items-start justify-start flex-wrap">
              <Text className="text-lg font-medium text-white inline">{title}:</Text>
              <Text className="text-lg font-normal text-black-30 inline whitespace-pre-wrap">{description}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Button
        handlePress={handleSubmit(onSubmit)}
        containerStyles="w-full mt-6"
        title="Continuar"
      />
      <Button
        handlePress={() => router.replace('/welcome')}
        containerStyles="w-full mt-6"
        variant='secondary'
        title="Continuar"
      />
    </>
  );
}