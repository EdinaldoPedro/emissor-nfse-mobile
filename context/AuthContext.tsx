import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setAuthToken, removeAuthToken } from '../services/api';
import { useRouter, useSegments } from 'expo-router';
import { Alert } from 'react-native';

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
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  // Carregar sessão salva ao abrir o app
  useEffect(() => {
    async function loadStorageData() {
      try {
        const token = await api.authService.getToken(); // Helper do api.ts
        
        if (token) {
           try {
             // Validamos o token buscando o perfil
             const res = await api.get('/perfil');
             setUser(res.data);
           } catch (err) {
             console.log("Token inválido ou expirado");
             await signOut();
           }
        }
      } catch (error) {
        console.log("Sem sessão salva");
      } finally {
        setIsLoading(false);
      }
    }
    loadStorageData();
  }, []);

  // Proteção de Rotas (Redirecionamento Automático)
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/login'); 
    } else if (user && inAuthGroup) {
      router.replace('/'); 
    }
  }, [user, segments, isLoading]);

  async function signIn(emailInput: string, passInput: string) {
    try {
      // 1. HIGIENIZAÇÃO (O segredo do Mobile)
      // Removemos espaços laterais e forçamos minúsculo para garantir o match no banco
      const loginLimpo = emailInput.trim().toLowerCase(); 
      const senhaLimpa = passInput.trim(); // Senhas geralmente não tem espaço no início/fim

      console.log("Enviando login:", loginLimpo); // Para você conferir no terminal

      // 2. ENVIO EXATO (Conforme route.ts do backend: login e senha)
      const response = await api.post('/auth/login', {
        login: loginLimpo, 
        senha: senhaLimpa  
      });

      const { token, user } = response.data;

      // 3. SALVAR SESSÃO
      await setAuthToken(token);
      setUser(user);
      
      // Força a ida para a home
      router.replace('/');

    } catch (error: any) {
      console.error("Erro AuthContext:", error.response?.data || error.message);
      // Repassamos o erro para a tela de login exibir o alerta
      throw error; 
    }
  }

  async function signOut() {
    await removeAuthToken();
    setUser(null);
    router.replace('/login');
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);