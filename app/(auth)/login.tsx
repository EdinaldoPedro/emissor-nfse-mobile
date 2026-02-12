import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Image
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Login() {
  const { signIn } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Campos obrigatórios', 'Por favor, informe seu email e senha.');
    }
    
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      // Mensagem amigável baseada no retorno do backend
      const errorMsg = error.response?.data?.error || 'Verifique suas credenciais.';
      Alert.alert('Não foi possível entrar', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} 
          showsVerticalScrollIndicator={false}
          className="px-6"
        >
          
          {/* Logo e Boas-vindas */}
          <View className="items-center mb-10">
            <View className="w-20 h-20 bg-blue-600 rounded-2xl items-center justify-center mb-6 shadow-xl shadow-blue-200">
                <Lock color="white" size={36} strokeWidth={2} />
            </View>
            <Text className="text-3xl font-bold text-slate-900">Bem-vindo</Text>
            <Text className="text-slate-500 mt-2 text-center text-base">
              Acesse sua conta para emitir notas.
            </Text>
          </View>

          {/* Campos */}
          <View className="space-y-5">
            
            {/* Campo Login */}
            <View>
              <Text className="text-slate-700 font-semibold mb-2 ml-1 text-xs uppercase tracking-wider">Email ou CPF</Text>
              <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 h-14 shadow-sm focus:border-blue-500">
                <Mail size={20} color="#64748b" />
                <TextInput 
                  className="flex-1 ml-3 text-slate-800 font-medium text-base h-full"
                  placeholder="seu@email.com"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="none" // CRUCIAL: Evita maiúscula automática
                  autoCorrect={false}   // CRUCIAL: Evita corretor mudar o email
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Campo Senha */}
            <View>
              <Text className="text-slate-700 font-semibold mb-2 ml-1 text-xs uppercase tracking-wider">Senha</Text>
              <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 h-14 shadow-sm focus:border-blue-500">
                <Lock size={20} color="#64748b" />
                <TextInput 
                  className="flex-1 ml-3 text-slate-800 font-medium text-base h-full"
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-2">
                  {showPassword ? <EyeOff size={20} color="#64748b" /> : <Eye size={20} color="#64748b" />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Botão Ação */}
            <TouchableOpacity 
              onPress={handleLogin}
              disabled={loading}
              className={`bg-blue-600 h-14 rounded-xl items-center justify-center mt-6 shadow-lg shadow-blue-200 flex-row ${loading ? 'opacity-70' : ''}`}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text className="text-white font-bold text-lg mr-2">Entrar</Text>
                  <ArrowRight color="white" size={20} />
                </>
              )}
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}