import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://192.168.0.119:3001/api'; // Mantenha seu IP

const api = axios.create({
  baseURL: API_URL,
});

const TOKEN_KEY = 'nfse_token';
const EMPRESA_KEY = 'nfse_empresa_id';

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  const empresaId = await SecureStore.getItemAsync(EMPRESA_KEY);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Se o contador selecionou uma empresa, envia para o backend saber o contexto
  if (empresaId) {
    config.headers['x-empresa-id'] = empresaId;
  }
  
  return config;
});

export const setAuthToken = async (token: string) => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};

export const removeAuthToken = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(EMPRESA_KEY);
};

export const authService = {
    async getToken() { return await SecureStore.getItemAsync(TOKEN_KEY); },
    async setEmpresaContext(id: string) { await SecureStore.setItemAsync(EMPRESA_KEY, id); },
    async getEmpresaContext() { return await SecureStore.getItemAsync(EMPRESA_KEY); }
};

export default api;