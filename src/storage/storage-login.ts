import { LOGIN_DATA_STORAGE } from "@/constants/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

type LoginData = {
  username: string;
  password: string;
  remember: boolean;
}

export async function storageSaveLogin(data: LoginData) {
  await AsyncStorage.setItem(LOGIN_DATA_STORAGE, JSON.stringify(data))
}

export async function storageGetLogin() {
  const storage = await AsyncStorage.getItem(LOGIN_DATA_STORAGE);
  const data: LoginData = storage ? JSON.parse(storage) : {};

  return data
}

export async function storageRemoveLogin() {
  await AsyncStorage.removeItem(LOGIN_DATA_STORAGE);
}