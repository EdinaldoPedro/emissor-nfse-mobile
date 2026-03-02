import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setAuthToken, removeAuthToken, authService } from '../services/api';
import { useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  nome: string;
  email: string;
  role: string;
  empresaId?: string;
}

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  empresaSelecionada: string | null;
  signIn: (login: string, pass: string) => Promise<void>;
  signOut: () => void;
  selecionarEmpresa: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [empresaSelecionada, setEmpresaSelecionada] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  // 1. Carrega dados salvos sem bater na API (Evita o erro 401 no boot)
  useEffect(() => {
    async function loadStorageData() {
      try {
        const token = await authService.getToken();
        const userData = await SecureStore.getItemAsync('nfse_user');
        const empresaCtx = await authService.getEmpresaContext();
        
        if (token && userData) {
           setUser(JSON.parse(userData));
           setEmpresaSelecionada(empresaCtx);
        }
      } catch (error) {
        console.log("Erro ao carregar sessão");
      } finally {
        setIsLoading(false);
      }
    }
    loadStorageData();
  }, []);

  // 2. Lógica de Redirecionamento Baseada no Perfil (A Regra que você pediu)
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)' || segments[0] === 'login';
    const isContadorScreen = segments[0] === 'selecionar-empresa';

    if (!user && !inAuthGroup) {
      // Não logado -> Vai pro Login
      router.replace('/login'); 
    } else if (user) {
      if (user.role === 'CONTADOR' && !empresaSelecionada) {
        // É Contador e não escolheu empresa -> Força a tela de seleção
        if (!isContadorScreen) router.replace('/selecionar-empresa');
      } else if (inAuthGroup || isContadorScreen) {
        // É ADM/Cliente OU Contador que já escolheu a empresa -> Vai pra Dashboard
        router.replace('/(tabs)');
      }
    }
  }, [user, empresaSelecionada, segments, isLoading]);

  async function signIn(loginInput: string, passInput: string) {
    const loginLimpo = loginInput.trim().toLowerCase();
    
    const response = await api.post('/auth/login', { login: loginLimpo, senha: passInput.trim() });
    const { token, user: userData } = response.data;

    await setAuthToken(token);
    await SecureStore.setItemAsync('nfse_user', JSON.stringify(userData));
    setUser(userData);
  }

  async function selecionarEmpresa(id: string) {
    await authService.setEmpresaContext(id);
    setEmpresaSelecionada(id);
    router.replace('/(tabs)');
  }

  async function signOut() {
    await removeAuthToken();
    await SecureStore.deleteItemAsync('nfse_user');
    setUser(null);
    setEmpresaSelecionada(null);
    router.replace('/login');
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, empresaSelecionada, signIn, signOut, selecionarEmpresa }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);