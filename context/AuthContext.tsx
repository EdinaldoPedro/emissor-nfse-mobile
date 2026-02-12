import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setAuthToken, removeAuthToken } from '../services/api';
import { useRouter, useSegments } from 'expo-router';

interface User {
  id: string;
  nome: string;
  email: string;
  role: string;
}

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    async function loadStorageData() {
      try {
        // Tenta buscar perfil para validar token existente
        const res = await api.get('/perfil');
        setUser(res.data);
      } catch (error) {
        // Se der erro, considera deslogado
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadStorageData();
  }, []);

  // Proteção de Rotas
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // ERRADO: router.replace('/(auth)/login');
      // CORRETO:
      router.replace('/login'); 
    } else if (user && inAuthGroup) {
      // ERRADO: router.replace('/(tabs)');
      // CORRETO (assumindo que (tabs)/index.tsx é a home):
      router.replace('/'); 
    }
  }, [user, segments, isLoading]);

  async function signIn(email: string, pass: string) {
    // Chama sua rota existente no Next.js
    const response = await api.post('/auth/login', {
      login: email, // Seu backend espera "login"
      senha: pass   // Seu backend espera "senha"
    });

    const { token, user } = response.data;

    await setAuthToken(token);
    setUser(user);
  }

  function signOut() {
    removeAuthToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);