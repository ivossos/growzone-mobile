import { UserSocial } from "@/api/@types/models";
import { accessToken } from "@/api/auth/access-token";
import { getCurrentUser } from "@/api/social/user/get-current-user";
import { authApi, socialApi } from "@/lib/axios";
import { storageGetAuthToken, storageRemoveAuthToken, storageSaveAuthToken } from "@/storage/storage-auth-token";
import { storageGetUser, storageRemoveUser, storageSaveUser } from "@/storage/storage-user";
import { createContext, ReactNode, useEffect, useState } from "react";

type AuthContextProps = {
  user: UserSocial;
  isLoadingUserStorage: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserData: () => Promise<void>
}

type AuthContextProviderProps = {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState({} as UserSocial);
  const [isLoadingUserStorage, setIsLoadingUserStorage] = useState(true)

  async function loadUserData() {
    try {
      setIsLoadingUserStorage(true);

      const userLogged = await storageGetUser();
      const { access_token, refresh_token } = await storageGetAuthToken();

      if(access_token && refresh_token && userLogged) {
        updateUserAndToken(userLogged, access_token)
      }
    } catch(err) {
      throw err
    } finally {
      setIsLoadingUserStorage(false)
    }
    
  }

  async function signIn(email: string, password: string) {
    try {
      const res = await accessToken({ username: email, password });

      authApi.defaults.headers.common['Authorization'] = `Bearer ${res.access_token}`;
      socialApi.defaults.headers.common['Authorization'] = `Bearer ${res.access_token}`;

      const userData = await getCurrentUser();

      await storageSaveUserAndToken(userData, res.access_token, res.refresh_token);
      updateUserAndToken(userData, res.access_token)
    } catch(err) {
      throw err;
    } finally {
      setIsLoadingUserStorage(false);
    }
  }

  async function updateUserData() {
    try {
      setIsLoadingUserStorage(true);
      
      const user = await getCurrentUser();

      await storageSaveUser(user);
      setUser(user);
    } catch(err) {
      throw err;
    } finally {
      setIsLoadingUserStorage(false);
    }
    
  } 

  async function signOut() {
    try {
      setIsLoadingUserStorage(true);
      setUser({} as UserSocial);
      await storageRemoveUser();
      await storageRemoveAuthToken();
    } catch (error) {
      throw error;
    } finally {
      setIsLoadingUserStorage(false);
    }
  }

  async function storageSaveUserAndToken(user: UserSocial, access_token: string, refresh_token: string) {
    try {
      setIsLoadingUserStorage(true);

      await storageSaveUser(user);
      await storageSaveAuthToken({ access_token, refresh_token });
    } catch (error) {
      throw error;
    } finally {
      setIsLoadingUserStorage(false);
    }
  }

  function updateUserAndToken(user: UserSocial, token: string) {
    try {
      authApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      socialApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
     
      setUser(user);
    } catch (error) {
      throw error
    } 
  }

  useEffect(() => {
    loadUserData()
  },[])

  useEffect(() => {
    const authSubscribe = authApi.registerInterceptTokenManager(signOut);
    const socialSubscribe = socialApi.registerInterceptTokenManager(signOut);
  
    return () => {
      authSubscribe();
      socialSubscribe();
    }
  },[signOut])


  return (
    <AuthContext.Provider value={{ user, signIn, signOut, isLoadingUserStorage, updateUserData }}>
      {children}
    </AuthContext.Provider>
  )
} 