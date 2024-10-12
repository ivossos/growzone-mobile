import axios, { AxiosError, AxiosInstance } from 'axios';
import { storageGetAuthToken, storageSaveAuthToken } from '@/storage/storage-auth-token';
import { AuthTokenResponse } from '@/api/@types/models';

type SignOut = () => Promise<void>;

type PromiseType = {
  onSuccess: (token: string) => void;
  onFailure: (error: AxiosError) => void;
};

type APIInstanceProps = AxiosInstance & {
  registerInterceptTokenManager: (signOut: SignOut) => () => void;
};

const authBaseURL = "https://dev.auth.growzone.co/api/v1";
const socialBaseURL = "https://dev.social.growzone.co/api/v1";
const compressBaseURL = "https://dev.compress.growzone.co/api/v1";

const createAPIInstance = (baseURL: string): APIInstanceProps => {
  const api = axios.create({ baseURL }) as APIInstanceProps;

  let failedQueued: Array<PromiseType> = [];
  let isRefreshing = false;

  api.registerInterceptTokenManager = signOut => {
    const interceptTokenManager = api.interceptors.response.use(res => res, async (requestError) => {
      console.log('error', requestError?.response)
      if (requestError?.response?.status === 401) {
        
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
                originalRequestConfig.headers['Authorization'] = `Bearer ${token}`;
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
            const response = await fetch(`${authBaseURL}/login/refresh-token/?refresh_token=${refresh_token}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            });

            if (!response.ok) {
              throw new Error('Erro na requisição');
            }

            const data = await response.json() as AuthTokenResponse;

            await storageSaveAuthToken({ access_token: data.access_token, refresh_token: data.refresh_token });

            originalRequestConfig.headers['Authorization'] = `Bearer ${data.access_token}`;
            api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;

            //todo criar limitar para nao derrubar server 
            failedQueued.forEach(request => {
              request.onSuccess(data.access_token);
            });

            resolve(api(originalRequestConfig));
          } catch (error: any) {
            failedQueued.forEach(request => {
              request.onFailure(error);
            });
            await signOut();
            reject(error);
          } finally {
            isRefreshing = false;
            failedQueued = [];
          }
        });
      }

      console.log('----> error', JSON.stringify(requestError?.response.status))
      return Promise.reject(requestError);
    });

    return () => {
      api.interceptors.response.eject(interceptTokenManager);
    };
  };

  return api;
};

const authApi = createAPIInstance(authBaseURL);
const socialApi = createAPIInstance(socialBaseURL);
const compressApi = createAPIInstance(compressBaseURL);

export { authApi, socialApi, compressApi };
