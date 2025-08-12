import axios, { AxiosError, AxiosInstance } from "axios";
import Constants from "expo-constants";
import {
  storageGetAuthToken,
  storageSaveAuthToken,
} from "@/storage/storage-auth-token";
import { AuthTokenResponse } from "@/api/@types/models";
import { AppError } from "@/api/@types/AppError";

type SignOut = () => Promise<void>;

type PromiseType = {
  onSuccess: (token: string) => void;
  onFailure: (error: AxiosError) => void;
};

type APIInstanceProps = AxiosInstance & {
  registerInterceptTokenManager: (signOut: SignOut) => () => void;
};

const extra = (Constants.expoConfig?.extra ?? (Constants as any).manifestExtra ?? {}) as any;

const authBaseURL = extra.AUTH_API_URL || "https://dev.auth.growzone.co/api/v1";
const socialBaseURL = extra.SOCIAL_API_URL || "https://dev.social.growzone.co/api/v1";

const createAPIInstance = (baseURL: string): APIInstanceProps => {
  const api = axios.create({ baseURL }) as APIInstanceProps;

  let failedQueued: Array<PromiseType> = [];
  let isRefreshing = false;

  api.interceptors.request.use((config) => {
    /** In dev, intercepts request and logs it into console for dev */
    // console.info("✉️ ", JSON.stringify(config, null, 2));
    return config;
  }, (error) => {
    // console.error("✉️ ", error);
    return Promise.reject(error);
  });

  api.registerInterceptTokenManager = (signOut) => {
    const interceptTokenManager = api.interceptors.response.use(
      (res) => res,
      async (requestError) => {
        if (requestError?.response?.status === 409) {
          return Promise.reject(new AppError(requestError?.response?.data));
        }

        if (requestError?.response?.status === 502) {
          await signOut();
          return Promise.reject(requestError);
        }

        if (
          requestError?.response?.status === 401 &&
          requestError?.response?.data?.detail === "Inactive user"
        ) {
          await signOut();
          return Promise.reject(requestError?.response?.data?.detail);
        }

        if (
          requestError?.response?.status === 401 &&
          requestError?.response?.data?.detail === "Invalid token"
        ) {
          const { refresh_token } = await storageGetAuthToken();

          if (!refresh_token) {
            await signOut();
            return Promise.reject(requestError);
          }

          const originalRequestConfig = requestError.config;

          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueued.push({
                onSuccess: (token: string) => {
                  originalRequestConfig.headers["Authorization"] = `Bearer ${token}`;
                  resolve(api(originalRequestConfig));
                },
                onFailure: (error: AxiosError) => {
                  reject(error);
                },
              });
            });
          }

          isRefreshing = true;

          return new Promise(async (resolve, reject) => {
            try {
              const response = await fetch(
                `${authBaseURL}/login/refresh-token/?refresh_token=${refresh_token}`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                }
              );

              if (!response.ok) throw new Error("Erro na requisição");

              const data = (await response.json()) as AuthTokenResponse;

              await storageSaveAuthToken({
                access_token: data.access_token,
                refresh_token: data.refresh_token,
              });

              originalRequestConfig.headers["Authorization"] = `Bearer ${data.access_token}`;
              api.defaults.headers.common["Authorization"] = `Bearer ${data.access_token}`;

              failedQueued.forEach((request) => request.onSuccess(data.access_token));

              resolve(api(originalRequestConfig));
            } catch (error: any) {
              failedQueued.forEach((request) => request.onFailure(error));
              await signOut();
              reject(error);
            } finally {
              isRefreshing = false;
              failedQueued = [];
            }
          });
        }

        return Promise.reject(requestError);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptTokenManager);
    };
  };

  return api;
};

function addLogging(api: APIInstanceProps, name: string) {
  api.interceptors.request.use((config) => {
    const method = (config.method || "get").toUpperCase();
    const base = config.baseURL || "";
    const url = typeof config.url === "string" ? config.url : "";
    return config;
  });

  api.interceptors.response.use(
    (res) => {
      return res;
    },
    (err) => {
      const status = err.response?.status ?? "NO_STATUS";
      const url = err.config?.url ?? "NO_URL";
      const detail = err.response?.data?.detail || err.message;

      return Promise.reject(err);
    }
  );
}

const authApi = createAPIInstance(authBaseURL);
const socialApi = createAPIInstance(socialBaseURL);


addLogging(authApi, "authApi");
addLogging(socialApi, "socialApi");

(async () => {
  try {
    const { access_token } = await storageGetAuthToken();
    if (access_token) {
      authApi.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
      socialApi.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
    }
  } catch (e) {
    console.error("Falha ao injetar token nas instâncias DEV de Axios", e);
  }
})();

export { authApi, socialApi };
