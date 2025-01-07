import React, { useState, useEffect } from "react";
import { View, Text, Linking, Platform } from "react-native";
import * as Updates from "expo-updates";
import * as Device from "expo-device";
import { Modal } from "@/components/Modal";
import Toast from "react-native-toast-message";
import Button from "@/components/ui/button";

export default function UpdateAppModal() {
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    checkForUpdates();
  }, []);

  const closeModal = () => {
    setModalVisible(false);
  };

  const checkForUpdates = async () => {
    if (!Device.isDevice) {
      return
    }

    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable && Platform.OS === 'ios') {
        setModalVisible(true);
      }
    } catch (e) {
      console.error("Erro ao verificar atualização:", e);
    }
  };

  const goToStore = async () => {
    // TODO: alterar url do android quando o app ficar disponivel na loja
    const storeUrl =
      Platform.OS === "ios"
        ? `https://apps.apple.com/br/app/growzone/id6737212804`
        : `https://play.google.com/store/apps`;

    closeModal();

    try {
      await Linking.openURL(storeUrl);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Opss",
        text2: "Aconteceu um erro ao tentarmos abrir a loja",
      });
    }
  };

  if (!isModalVisible) {
    return null;
  }

  return (
    <Modal closeModal={closeModal}>
      <View className="gap-4">
        <View className="gap-2">
          <Text className="text-xl text-gray-100 font-semibold">
            Nova atualização disponível!
          </Text>
          <Text className="text-base font-medium text-brand-grey">
            Baixe agora a nova atualização do nosso aplicativo na sua loja.
          </Text>
        </View>
        <Button
          title="Atualizar agora"
          handlePress={goToStore}
          variant="default"
        />
        <Button title="Fechar" handlePress={closeModal} variant="secondary" />
      </View>
    </Modal>
  );
}
