import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail } from 'lucide-react-native';

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Erro', 'Preencha todos os campos');
    
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      Alert.alert('Erro no Login', error.response?.data?.error || 'Verifique suas credenciais');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center bg-slate-50 px-8">
      <View className="items-center mb-10">
        <View className="w-16 h-16 bg-blue-600 rounded-2xl items-center justify-center mb-4">
            <Lock color="white" size={32} />
        </View>
        <Text className="text-2xl font-bold text-slate-800">NFSe Fácil</Text>
        <Text className="text-slate-500">Acesse sua conta</Text>
      </View>

      <View className="space-y-4">
        <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-3">
          <Mail size={20} color="#94a3b8" />
          <TextInput 
            className="flex-1 ml-3 text-slate-700"
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-3">
          <Lock size={20} color="#94a3b8" />
          <TextInput 
            className="flex-1 ml-3 text-slate-700"
            placeholder="Senha"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity 
          onPress={handleLogin}
          disabled={loading}
          className="bg-blue-600 rounded-xl py-4 items-center mt-4 active:bg-blue-700"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-lg">Entrar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}