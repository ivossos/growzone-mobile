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
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

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

      console.log('📦 Loading user data from storage...');
      const userLogged = await storageGetUser();
      const { access_token, refresh_token } = await storageGetAuthToken();

      console.log('📦 Storage data:', {
        hasUser: !!userLogged,
        hasToken: !!access_token,
        userId: userLogged?.id,
        isMockToken: access_token?.startsWith("mock-token-")
      });

      if (access_token && refresh_token && userLogged) {
        console.log('✅ Restoring session from storage');
        updateUserAndToken(userLogged, access_token);
      } else {
        console.log('❌ No valid session in storage');
      }

      // 🧪 Only update from backend if NOT a mock user
      if (userLogged && access_token && !access_token.startsWith("mock-token-")) {
        console.log('🔄 Updating user data from backend...');
        await updateUserData();
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);
    } finally {
      setIsLoadingUserStorage(false);
    }
  }

  async function signIn(email: string, password: string) {
    setIsLoadingUserStorage(true);
    try {
      // 🧪 DEVELOPMENT MODE ONLY: Mock Authentication
      // SECURITY: Only enabled in development to prevent production security issues
      const __DEV_MODE__ = process.env.NODE_ENV === 'development' || __DEV__;

      if (__DEV_MODE__) {
        console.log('🧪 DEV MODE: Checking for mock user credentials');
        // Check if using test credentials
        const MOCK_USERS = [
          { email: "test@growzone.co", password: "Test123!", username: "testuser" },
          { email: "dev@growzone.co", password: "Test123!", username: "devuser" },
          { email: "user@growzone.co", password: "Test123!", username: "regularuser" },
          { email: "premium@growzone.co", password: "Test123!", username: "premiumuser" },
        ];

        const mockUser = MOCK_USERS.find(
          (u) => (u.email === email || u.username === email) && u.password === password
        );

        if (mockUser) {
          console.log('🧪 DEV MODE: Mock user found -', mockUser.username);
          // Mock authentication successful
          const mockToken = "mock-token-" + Date.now();
          const mockUserData: UserSocial = {
            id: "mock-" + mockUser.username,
            username: mockUser.username,
            name: mockUser.username === "testuser" ? "Você" : mockUser.username,
            email: mockUser.email,
            avatar: "https://i.pravatar.cc/150?img=10",
            bio: `Usuário de teste (${mockUser.username})`,
            is_verified: true,
            has_username: true,
            category_id: 1, // Set default category to avoid redirect loops
          } as UserSocial;

          console.log('🧪 DEV MODE: Setting up mock auth headers');
          authApi.defaults.headers.common["Authorization"] = `Bearer ${mockToken}`;
          socialApi.defaults.headers.common["Authorization"] = `Bearer ${mockToken}`;

          console.log('💾 Saving mock user to storage...');
          await storageSaveUserAndToken(mockUserData, mockToken, "mock-refresh-token");
          updateUserAndToken(mockUserData, mockToken);

          console.warn("✅ DEV MODE: Mock authentication successful -", mockUser.username);
          return mockUserData;
        } else {
          console.log('🧪 DEV MODE: No mock user matched, trying real backend');
        }
      }

      // Real backend authentication
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

      // 🧪 DEV MODE: Check if current user is mock (skip backend call)
      const { access_token } = await storageGetAuthToken();
      const __DEV_MODE__ = process.env.NODE_ENV === 'development' || __DEV__;

      if (__DEV_MODE__ && access_token && access_token.startsWith("mock-token-")) {
        console.warn("⚠️ DEV MODE: Mock user detected, skipping backend user fetch");
        const storedUser = await storageGetUser();
        if (storedUser) {
          setUser(storedUser);
        }
        return;
      }

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

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthContextProvider");
  }
  return context;
}
