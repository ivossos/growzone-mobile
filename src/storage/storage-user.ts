import AsyncStorage from "@react-native-async-storage/async-storage";

import { USER_STORAGE } from '@/constants/storage';
import { UserSocial } from "@/api/@types/models";


export async function storageSaveUser(user: UserSocial) {
  await AsyncStorage.setItem(USER_STORAGE, JSON.stringify(user))
}

export async function storageGetUser(): Promise<UserSocial> {
  const storage = await AsyncStorage.getItem(USER_STORAGE);
  const data = storage ? JSON.parse(storage) : {};

  return data
}

export async function storageRemoveUser() {
  await AsyncStorage.removeItem(USER_STORAGE);
}