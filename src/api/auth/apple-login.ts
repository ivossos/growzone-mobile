import { authApi } from "@/lib/axios";
import { AppError } from "@/api/@types/AppError";

export interface AppleLoginRequest {
  identity_token: string;
  user_id: string;
  name?: string;
  email?: string;
}

export interface AppleLoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user_id: number;
  has_username: boolean;
  email?: string;
  name?: string;
  category_id?: number;
}

export interface SetUsernameRequest {
  username: string;
}

export interface SetUsernameResponse {
  status: boolean;
  message: string;
  username: string;
}

export const appleLogin = async (data: AppleLoginRequest): Promise<AppleLoginResponse> => {
  try {
    const response = await authApi.post<AppleLoginResponse>("/apple/login", data);
    return response.data;
  } catch (error: any) {
    console.log('Apple login failed', error);
    throw new AppError(error?.response?.data || error?.message || "Apple login failed");
  }
};

export const setAppleUsername = async (data: SetUsernameRequest): Promise<SetUsernameResponse> => {
  try {
    const response = await authApi.post<SetUsernameResponse>("/apple/set-username", data);
    return response.data;
  } catch (error: any) {
    console.log('Apple Login - Failed to set username', error);
    throw new AppError(error?.response?.data || error?.message || "Failed to set username");
  }
}; 