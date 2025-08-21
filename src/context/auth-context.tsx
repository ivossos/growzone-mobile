import { User, UserSocial } from "@/api/@types/models";
import { accessToken } from "@/api/auth/access-token";
import { getCurrentUser } from "@/api/social/user/get-current-user";
import { authApi, socialApi } from "@/lib/axios";
import {
  storageGetAuthToken,
  storageRemoveAuthToken,
  storageSaveAuthToken,
} from "@/storage/storage-auth-token";
import {
  storageGetUser,
  storageRemoveUser,
  storageSaveUser,
} from "@/storage/storage-user";
import { createContext, ReactNode, useEffect, useState } from "react";

type AuthContextProps = {
  token: string | null;
  setToken: (token: string | null) => void;
  user: UserSocial;
  isLoadingUserStorage: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
  updateUserData: () => Promise<void>;
  setUserAndToken: (user: User, token: string) => void;
  setUserAndTokenFully: (user: User, token: string, refreshToken?: string) => Promise<void>;
};

type AuthContextProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState({} as UserSocial);
  const [token, setToken] = useState<string | null>(null);
  const [isLoadingUserStorage, setIsLoadingUserStorage] = useState(true);

  async function loadUserData() {
    try {
      setIsLoadingUserStorage(true);

      const userLogged = await storageGetUser();
      const { access_token, refresh_token } = await storageGetAuthToken();

      if (access_token && refresh_token && userLogged) {
        updateUserAndToken(userLogged, access_token);
      }

      if (userLogged) {
        await updateUserData();
      }
    } finally {
      setIsLoadingUserStorage(false);
    }
  }

  async function signIn(email: string, password: string) {
    setIsLoadingUserStorage(true);
    try {
      const res = await accessToken({ username: email, password });

      authApi.defaults.headers.common["Authorization"] = `Bearer ${res.access_token}`;
      socialApi.defaults.headers.common["Authorization"] = `Bearer ${res.access_token}`;

      const authUser = await getCurrentUser({
        Authorization: `Bearer ${res.access_token}`
      });

      if (authUser.is_verified) {
        const userData = await getCurrentUser({
          Authorization: `Bearer ${res.access_token}`
        });
        await storageSaveUserAndToken(userData, res.access_token, res.refresh_token);
        updateUserAndToken(userData, res.access_token);
      } else {
        const userSocial: UserSocial = { ...authUser };
        await storageSaveUserAndToken(userSocial, res.access_token, res.refresh_token);
        updateUserAndToken(userSocial, res.access_token);
      }

      return authUser;
    } finally {
      setIsLoadingUserStorage(false);
    }
  }

  async function updateUserData() {
    try {
      setIsLoadingUserStorage(true);
      const user = await getCurrentUser();

      let userData = user;
      if (user.username) {
        userData = { ...user, has_username: true };
      } else {
        userData = { ...user, has_username: false };
      }
      await storageSaveUser(userData);
      setUser(userData);
    } catch (err) {
      throw err;
    } finally {
      setIsLoadingUserStorage(false);
    }
  }

  async function signOut() {
    try {
      setIsLoadingUserStorage(true);
      setUser({} as UserSocial);
      setToken(null);
      await storageRemoveUser();
      await storageRemoveAuthToken();
    } finally {
      setIsLoadingUserStorage(false);
      delete authApi.defaults.headers.common["Authorization"];
      delete socialApi.defaults.headers.common["Authorization"];
    }
  }

  async function storageSaveUserAndToken(
    user: UserSocial,
    access_token: string,
    refresh_token: string
  ) {
    try {
      setIsLoadingUserStorage(true);

      authApi.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
      socialApi.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      let userData = user;
      if (user.username) {
        userData = { ...user, has_username: true };
      } else {
        userData = { ...user, has_username: false };
      }

      await storageSaveUser(userData);
      await storageSaveAuthToken({ access_token, refresh_token });
    } finally {
      setIsLoadingUserStorage(false);
    }
  }

  function updateUserAndToken(user: UserSocial, token: string) {
    authApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    socialApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    let userData = user;
    if (user.username) {
      userData = { ...user, has_username: true };
    } else {
      userData = { ...user, has_username: false };
    }
    setUser(userData);
    setToken(token);
  }

  function setUserAndToken(user: User, token: string) {
    setToken(token);
    setUser(user);
  }

  async function setUserAndTokenFully(user: UserSocial, token: string, refreshToken?: string) {
    try {
      let userData = user;
      if (user.username) {
        userData = { ...user, has_username: true };
      } else {
        userData = { ...user, has_username: false };
      }

      await storageSaveUserAndToken(userData, token, refreshToken ?? "");
      updateUserAndToken(userData, token);
    } catch (error) {
      throw error;
    }
  }

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    const authSub = authApi.registerInterceptTokenManager(signOut);
    const socialSub = socialApi.registerInterceptTokenManager(signOut);

    return () => {
      authSub();
      socialSub();
    };
  }, [signOut]);

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signOut,
        token,
        setToken,
        isLoadingUserStorage,
        updateUserData,
        setUserAndToken,
        setUserAndTokenFully,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
