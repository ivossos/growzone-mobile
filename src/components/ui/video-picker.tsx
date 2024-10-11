import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';
import { ImageIcon } from 'lucide-react-native';
import { colors } from '@/styles/colors';


const VideoPicker = ({ onMediaSelected }) => {
  const [mediaUri, setMediaUri] = useState<{ uri: string; fileName: string, type: string } | null>(null);

  const pickMedia = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert("Você precisa de permissão para acessar a galeria!");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });

    if (pickerResult.cancelled) {
      return;
    }

    if (pickerResult.assets && pickerResult.assets.length > 0) {
      const asset = pickerResult.assets[0];
      const newMedia = { uri: asset.uri, type: asset.mimeType, fileName: asset.fileName };

      setMediaUri(newMedia);
      onMediaSelected(newMedia);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mediaContainer}>
        {mediaUri && (
          <TouchableOpacity style={styles.mediaWrapper}>
            <Video
              source={{ uri: mediaUri.uri }}
              style={styles.media}
              shouldPlay
              isLooping
              isMuted={true}
              useNativeControls={false}
            />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        style={styles.selectButton}
        onPress={pickMedia}
      >
        <ImageIcon color={colors.black[70]} size={24} />
        <Text style={styles.buttonText}>Selecionar Vídeo</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    gap: 24,
  },
  mediaContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  mediaWrapper: {
    width: 200,
    height: 200,
  },
  media: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderColor: colors.black[80],
    borderWidth: 1,
    marginTop: 10,
  },
  buttonText: {
    marginLeft: 10,
    color: colors.black[30],
    fontSize: 16,
    fontWeight: '500',
  },
});

export default VideoPicker;
