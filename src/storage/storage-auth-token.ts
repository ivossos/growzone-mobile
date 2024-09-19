import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_TOKEN_STORAGE } from '@/constants/storage';

type StorageAuthTokenProps = {
  access_token: string; 
  refresh_token: string;
}

export async function storageSaveAuthToken({ access_token, refresh_token }: StorageAuthTokenProps) {
  await AsyncStorage.setItem(AUTH_TOKEN_STORAGE, JSON.stringify({ access_token, refresh_token }));
}

export async function storageGetAuthToken() {
  const response = await AsyncStorage.getItem(AUTH_TOKEN_STORAGE);

  const { access_token, refresh_token } = response ? JSON.parse(response) : {};
  return { access_token, refresh_token } ;
}


export async function storageRemoveAuthToken() {
  await AsyncStorage.removeItem(AUTH_TOKEN_STORAGE);
}