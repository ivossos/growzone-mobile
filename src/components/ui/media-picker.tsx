import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';
import { ImageIcon, XCircleIcon, XIcon } from 'lucide-react-native';  // Usando ícone de exclusão XCircleIcon
import { colors } from '@/styles/colors';

const MediaPicker = ({ onMediaSelected }) => {
  const [mediaUris, setMediaUris] = useState<{ uri: string, fileName: string, type: string }[]>([]);

  const pickMedia = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert("Você precisa de permissão para acessar a galeria!");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (pickerResult.cancelled) {
      return;
    }

    if(pickerResult && pickerResult?.assets && pickerResult.assets.length) {
      pickerResult?.assets.forEach(asset => {
        const mediaType = asset.mimeType;
        const newMedia = { uri: asset.uri, fileName: asset.fileName, type: mediaType };
    
        setMediaUris((prevMediaUris) => [...prevMediaUris, newMedia]);
        onMediaSelected(newMedia);
      });
    }
  };

  const removeMedia = (index: number) => {
    const updatedMedia = [...mediaUris];
    updatedMedia.splice(index, 1);
    setMediaUris(updatedMedia);
  };

  return (
    <View style={styles.container}>
       <View style={styles.mediaContainer}>
        {mediaUris.map((media, index) => (
          <TouchableOpacity key={index} onPress={() => removeMedia(index)} style={styles.mediaWrapper}>
            {media.type === 'video' ? (
              <Video
                source={{ uri: media.uri }}
                style={styles.media}
                shouldPlay
                isLooping
                useNativeControls
              />
            ) : (
              <Image
                source={{ uri: media.uri }}
                style={styles.media}
                resizeMode="cover"
              />
            )}
            <View style={styles.deleteButton}>
              <XIcon color={colors.brand.white} size={16} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        className="flex flex-row items-center gap-2 bottom-0 max-w-40 py-2 px-4 border border-black-80 rounded-lg"
        onPress={pickMedia}
      >
        <ImageIcon color={colors.black[70]} size={24} />
        <Text className="text-black-30 text-base font-medium">Foto ou Vídeo</Text>
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
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  mediaWrapper: {
    position: 'relative',
    width: 56,
    height: 56,
    maxWidth: 56,
    maxHeight: 56,
  },
  media: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  deleteButton: {
    position: 'absolute',
    top: '25%',
    right: '25%',
    padding: 4,
    backgroundColor: 'red',
    borderRadius: 50,
  },
});

export default MediaPicker;
