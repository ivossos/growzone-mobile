import AsyncStorage from "@react-native-async-storage/async-storage";

import { USER_STORAGE } from '@/constants/storage';
import { User } from "@/api/@types/models";

export async function storageSaveUser(user: User) {
  await AsyncStorage.setItem(USER_STORAGE, JSON.stringify(user))
}

export async function storageGetUser() {
  const storage = await AsyncStorage.getItem(USER_STORAGE);
  const user: User = storage ? JSON.parse(storage) : {};

  return user
}

export async function storageRemoveUser() {
  await AsyncStorage.removeItem(USER_STORAGE);
}