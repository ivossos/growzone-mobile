import React, { Fragment } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import Button from '@/components/ui/button';
import { StepProps } from '@/app/(auth)/sign-up';
import { Text, View, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { terms as termsList  } from '@/constants/mock';

type Term = {
  title?: string;
  description: string;
}

export default function TermsStep({ handleSubmit, onSubmit }: StepProps) {  
  return (
    <>
      <ScrollView className="max-h-80 bg-black-90 rounded-lg">
        <View className="flex flex-col gap-4 p-6">
        {termsList.map(({title, terms}) => (
          <>
            <Text className="text-xl font-semibold text-white">{title}</Text>
            {terms.map(({ title, description }: Term) => (
              <View key={title} className="flex flex-row items-start justify-start flex-wrap">
                {title && <Text className="text-lg font-medium text-white inline">{title}:</Text>}
                <Text className="text-lg font-normal text-black-30 inline whitespace-pre-wrap">{description}</Text>
              </View>
            ))}
            </>
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