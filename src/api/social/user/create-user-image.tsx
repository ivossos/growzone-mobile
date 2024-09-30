import { socialApi } from '@/lib/axios';
import { CreateUserImage } from '@/api/@types/models';
import { ImagePickerAsset } from 'expo-image-picker';

export async function createUserImage(userId: number, image: ImagePickerAsset) {  
  const formData = new FormData();
  formData.append('user_id', userId.toString());
  formData.append('image', {
    uri: image.uri,
    name: image.fileName || 'photo.jpg',
    type: image.type || 'image/jpeg'
  } as any );


  const response = await socialApi.post<CreateUserImage>('/user-image/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });

  return response.data;
}
