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
  StatusBar 
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, ArrowRight, Eye, EyeOff, FileText, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function Login() {
  const { signIn } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Atenção', 'Preencha email e senha.');
    
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Verifique suas credenciais.';
      Alert.alert('Erro no acesso', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-blue-600">
      <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
      
      {/* 1. HEADER (Identidade Visual da Marca) */}
      <View className="h-[35%] justify-center items-center px-6">
        <View className="w-24 h-24 bg-white/20 rounded-3xl items-center justify-center mb-4 backdrop-blur-md border border-white/30">
            <FileText color="white" size={48} strokeWidth={1.5} />
        </View>
        
        <Text className="text-white text-3xl font-bold tracking-tight">Emissor NFSe</Text>
        <Text className="text-blue-100 text-base font-medium mt-1 text-center opacity-90">
          Gerencie suas notas fiscais de{'\n'}onde estiver.
        </Text>
      </View>

      {/* 2. CORPO (Formulário estilo "Sheet") */}
      <View className="flex-1 bg-slate-50 rounded-t-[32px] px-8 pt-10 shadow-2xl">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            
            <Text className="text-slate-800 text-2xl font-bold mb-6">Acesse sua conta</Text>

            <View className="space-y-5">
              {/* Input Email */}
              <View>
                <Text className="text-slate-600 font-semibold mb-2 ml-1 text-xs uppercase tracking-wider">Email ou CPF</Text>
                <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 h-16 focus:border-blue-600 focus:bg-blue-50/10">
                  <Mail size={22} color="#64748b" />
                  <TextInput 
                    className="flex-1 ml-4 text-slate-900 font-medium text-base h-full"
                    placeholder="exemplo@email.com"
                    placeholderTextColor="#94a3b8"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              {/* Input Senha */}
              <View>
                <Text className="text-slate-600 font-semibold mb-2 ml-1 text-xs uppercase tracking-wider">Senha</Text>
                <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 h-16 focus:border-blue-600 focus:bg-blue-50/10">
                  <Lock size={22} color="#64748b" />
                  <TextInput 
                    className="flex-1 ml-4 text-slate-900 font-medium text-base h-full"
                    placeholder="Sua senha secreta"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-2">
                    {showPassword ? (
                      <EyeOff size={22} color="#64748b" />
                    ) : (
                      <Eye size={22} color="#64748b" />
                    )}
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity className="self-end mt-3 py-1 px-1">
                    <Text className="text-blue-600 font-semibold text-sm">Esqueceu a senha?</Text>
                </TouchableOpacity>
              </View>

              {/* Botão Principal de Login */}
              <TouchableOpacity 
                onPress={handleLogin}
                disabled={loading}
                className={`bg-blue-600 h-16 rounded-2xl items-center justify-center mt-4 shadow-lg shadow-blue-300 flex-row active:bg-blue-700 ${loading ? 'opacity-80' : ''}`}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text className="text-white font-bold text-lg mr-2">Entrar</Text>
                    <ArrowRight color="white" size={22} strokeWidth={2.5} />
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Linha Divisória */}
            <View className="flex-row items-center my-8">
              <View className="flex-1 h-[1px] bg-slate-200" />
              <Text className="text-slate-400 font-medium mx-4 text-sm">OU</Text>
              <View className="flex-1 h-[1px] bg-slate-200" />
            </View>

            {/* NOVO: Botão de Planos */}
            <TouchableOpacity 
              onPress={() => Alert.alert("Planos", "Redirecionando para a página de planos...")}
              className="bg-white border-2 border-slate-100 h-16 rounded-2xl items-center justify-center flex-row shadow-sm active:bg-slate-50"
            >
              <Sparkles color="#2563eb" size={20} className="mr-2" />
              <Text className="text-slate-700 font-bold text-base">Conheça seu plano perfeito</Text>
            </TouchableOpacity>

            {/* Rodapé (Cadastro Web) */}
            <View className="mt-8 flex-row justify-center items-center">
                <Text className="text-slate-500 font-medium text-sm">Não tem uma conta?</Text>
                <TouchableOpacity onPress={() => Alert.alert("Cadastro", "Acesse nosso site para criar sua conta.")}>
                    <Text className="text-blue-600 font-bold ml-1 text-sm">Cadastre-se pelo site</Text>
                </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}