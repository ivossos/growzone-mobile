import axios, { AxiosError, AxiosInstance } from 'axios';
import { AppError } from '@/api/@types/AppError';
import { storageGetAuthToken, storageSaveAuthToken } from '@/storage/storage-auth-token';
import { refreshToken } from '@/api/auth/refresh-token';
import { AuthTokenResponse } from '@/api/@types/models';

type SignOut = () => Promise<void>

type PromiseType = {
  onSuccess: (token: string) => void;
  onFailure: (error: AxiosError) => void;
}

type APIInstanceProps = AxiosInstance & {
  registerInterceptTokenManager: (signOut: SignOut) => () => void;
}
const baseURL = "https://dev.auth.growzone.co/api/v1";

const api = axios.create({
  baseURL: baseURL
}) as APIInstanceProps;

let failedQueued: Array<PromiseType> = [];
let isRefreshing = false;

api.registerInterceptTokenManager = signOut => {
  const interceptTokenManager = api.interceptors.response.use(res => res, async (requestError) => {
    console.log('api requestError', requestError)
    console.log('api requestError', JSON.stringify(requestError.response.data))
    console.log('api requestError', JSON.stringify(requestError.request))
    console.log('api requestError', JSON.stringify(requestError.request.headers))
    console.log('HEADERS api requestError', JSON.stringify(requestError.request.headers))
    if(requestError?.response?.status === 401) {
      console.log('entrou 401', requestError.response.data?.detail)
      if(requestError.response.data?.detail === 'Invalid token' || requestError.response.data?.message === 'token.invalid') { 
        console.log('entrou 401 if', requestError.response.data?.detail)
        const { refresh_token } = await storageGetAuthToken();

        console.log('pegou o refresh token', refresh_token)
        if(!refresh_token) {
          await signOut();
          return Promise.reject(requestError);
        }

        const originalRequestConfig = requestError.config

        if(isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueued.push({
              onSuccess: (token: string) => { 
                console.log('callback failedQueued ', token)
                originalRequestConfig.headers = { 'Authorization': `Bearer ${token}` };
                resolve(api(originalRequestConfig));
              },
              onFailure: (error: AxiosError) => {
                reject(error)
              },
            })
          })
        }

        isRefreshing = true
        return new Promise(async (resolve, reject) => {
          let res;
          try {
            console.log('revalidando o token com refresh')
            
              const response = await fetch(`${baseURL}/login/refresh-token/?refresh_token=${refresh_token}` , {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: null,
              });
              
              if (!response.ok) {
                throw new Error('Erro na requisição');
              }
              
              const data = await response.json() as AuthTokenResponse
              

            console.log('resposta do refresh token', res)
           
            await storageSaveAuthToken({ access_token: data.access_token, refresh_token: data.refresh_token });

            if(originalRequestConfig.data) {
              originalRequestConfig.data = JSON.parse(originalRequestConfig.data);
            }

            originalRequestConfig.headers = { 'Authorization': `Bearer ${data.access_token}` };
            api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;

            failedQueued.forEach(request => {
              request.onSuccess(data.access_token);
            });

            console.log("TOKEN ATUALIZADO");

            resolve(api(originalRequestConfig));
          } catch (error: any) {
            console.log('FABIO ->>>>>>>> ', error)
            failedQueued.forEach(request => {
              request.onFailure(error);
            })
            console.log('vai fazer p sinout  ->>>>>>>> ', error)
            await signOut();
            console.log('fez ->>>>>>>> ', error)
            reject(error);
          } finally {
            isRefreshing = false;
            failedQueued = []
          }
        })

      }

      await signOut();
    }

    if(requestError.response && requestError.response.data) {
      return Promise.reject(requestError)
    } else {
      return Promise.reject(requestError)
    }
  });

  return () => {
    api.interceptors.response.eject(interceptTokenManager);
  }
};


export { api }