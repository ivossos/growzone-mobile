import { socialApi } from '@/lib/axios';
import { CreateUserCover } from '@/api/@types/models';
import { ImagePickerAsset } from 'expo-image-picker';
import { Platform } from 'react-native';

export async function createUserCover(cover: ImagePickerAsset) {  
  const formData = new FormData();
  const isAndroid = Platform.OS === 'android'

  formData.append('cover', {
    uri: cover.uri,
    name: cover.fileName || 'cover.jpg',
    type: (isAndroid ? cover.mimeType : cover.type) || 'image/jpeg'
  } as any );


  const response = await socialApi.post<CreateUserCover>('/user-cover/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });

  return response.data;
}
