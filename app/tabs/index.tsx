import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { LogOut, Building, FileCheck } from 'lucide-react-native';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async () => {
    try {
      // Sua rota /api/perfil retorna os dados da empresa e do usuário
      const res = await api.get('/perfil');
      setStats(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView 
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        
        {/* Header */}
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-slate-500 text-sm">Bem-vindo,</Text>
            <Text className="text-slate-800 text-xl font-bold">{user?.nome}</Text>
          </View>
          <TouchableOpacity onPress={signOut} className="p-2 bg-white rounded-full border border-slate-200">
            <LogOut size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Card Empresa */}
        <View className="bg-blue-600 rounded-2xl p-6 mb-6 shadow-sm">
          <View className="flex-row items-center mb-4">
            <Building color="white" size={24} />
            <Text className="text-white font-bold text-lg ml-2">Minha Empresa</Text>
          </View>
          <Text className="text-blue-100 text-sm uppercase">Razão Social</Text>
          <Text className="text-white font-bold text-lg mb-2">{stats?.razaoSocial || 'Carregando...'}</Text>
          
          <Text className="text-blue-100 text-sm uppercase">CNPJ</Text>
          <Text className="text-white font-mono">{stats?.documento || '...'}</Text>
        </View>

        {/* Estatísticas Rápidas (Exemplo) */}
        <View className="flex-row gap-4">
            <View className="flex-1 bg-white p-4 rounded-xl border border-slate-200">
                <FileCheck size={24} color="#2563eb" />
                <Text className="text-slate-500 mt-2 text-xs">Plano Atual</Text>
                <Text className="text-slate-800 font-bold text-lg">{stats?.planoDetalhado?.nome || 'Gratuito'}</Text>
            </View>
            <View className="flex-1 bg-white p-4 rounded-xl border border-slate-200">
                 <Text className="text-slate-800 font-bold text-3xl">{stats?.planoDetalhado?.usoEmissoes || 0}</Text>
                 <Text className="text-slate-500 text-xs">Notas este mês</Text>
            </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}