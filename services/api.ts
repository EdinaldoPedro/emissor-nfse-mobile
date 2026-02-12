import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// IP da sua VM Local
const API_URL = 'http://192.168.0.115:3000/api'; 

const api = axios.create({
  baseURL: API_URL,
});

const TOKEN_KEY = 'nfse_token';

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // Adicione outros headers se seu backend exigir (ex: x-user-id)
    // Mas geralmente o Bearer resolve se o backend decodificar o JWT
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = async (token: string) => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};

export const removeAuthToken = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};

export default api;