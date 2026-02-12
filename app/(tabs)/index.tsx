import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  Building, 
  FileText, 
  ChevronRight, 
  Bell, 
  TrendingUp, 
  Users, 
  HelpCircle 
} from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { formatCurrency } from '../../utils/format'; // Verifique se criou esse arquivo antes, se não, crie um simples

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [recentNotas, setRecentNotas] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      // 1. Dados do Perfil/Empresa
      const resPerfil = await api.get('/perfil');
      setStats(resPerfil.data);

      // 2. Últimas 3 notas para o resumo
      const resNotas = await api.get('/notas?limit=3');
      setRecentNotas(resNotas.data.data || []);
      
    } catch (error) {
      console.log("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Cálculos visuais do plano
  const emissoesFeitas = stats?.planoDetalhado?.usoEmissoes || 0;
  const limitePlano = 50; // Valor fixo de exemplo ou vindo do backend
  const progresso = Math.min((emissoesFeitas / limitePlano) * 100, 100);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* === HEADER === */}
        <View className="px-6 pt-2 pb-6 flex-row justify-between items-center">
          <View>
            <Text className="text-slate-500 text-sm font-medium">Bem-vindo de volta,</Text>
            <Text className="text-slate-900 text-2xl font-bold">{user?.nome?.split(' ')[0]}</Text>
          </View>
          <TouchableOpacity className="w-10 h-10 bg-white items-center justify-center rounded-full border border-slate-200 shadow-sm">
            <Bell size={20} color="#64748b" />
            <View className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </TouchableOpacity>
        </View>

        {/* === CARD DA EMPRESA (Principal) === */}
        <View className="mx-6">
          <View className="bg-blue-600 rounded-3xl p-6 shadow-xl shadow-blue-200 overflow-hidden relative">
            {/* Decoração de fundo (círculos) */}
            <View className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500 rounded-full opacity-30" />
            <View className="absolute top-20 -left-10 w-32 h-32 bg-blue-400 rounded-full opacity-20" />

            <View className="flex-row items-center mb-6">
              <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mr-3 backdrop-blur-sm">
                <Building color="white" size={20} />
              </View>
              <View className="flex-1">
                <Text className="text-blue-100 text-xs font-bold uppercase tracking-wider">Empresa Ativa</Text>
                <Text className="text-white font-bold text-lg leading-tight" numberOfLines={1}>
                  {stats?.razaoSocial || stats?.empresa?.razaoSocial || 'Minha Empresa'}
                </Text>
              </View>
            </View>

            {/* Barra de Progresso do Plano */}
            <View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-blue-100 text-xs font-medium">Consumo do Plano</Text>
                <Text className="text-white text-xs font-bold">{emissoesFeitas} / {limitePlano} Notas</Text>
              </View>
              <View className="h-2 bg-blue-900/30 rounded-full overflow-hidden">
                <View style={{ width: `${progresso}%` }} className="h-full bg-white rounded-full" />
              </View>
              <Text className="text-blue-200 text-[10px] mt-2 text-right">Renova em 01/03</Text>
            </View>
          </View>
        </View>

        {/* === AÇÕES RÁPIDAS (Grid) === */}
        <View className="px-6 mt-8">
          <Text className="text-slate-800 font-bold text-lg mb-4">Acesso Rápido</Text>
          <View className="flex-row gap-4">
            
            {/* Botão Emitir */}
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/emitir')}
              className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm items-center"
            >
              <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center mb-2">
                <FileText color="#2563eb" size={24} />
              </View>
              <Text className="text-slate-700 font-bold text-sm">Nova Nota</Text>
            </TouchableOpacity>

            {/* Botão Clientes */}
            <TouchableOpacity 
              onPress={() => alert('Em breve: Gestão de Clientes')} // Ou router.push se tiver a tela
              className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm items-center"
            >
              <View className="w-12 h-12 bg-purple-50 rounded-full items-center justify-center mb-2">
                <Users color="#9333ea" size={24} />
              </View>
              <Text className="text-slate-700 font-bold text-sm">Clientes</Text>
            </TouchableOpacity>

            {/* Botão Suporte */}
            <TouchableOpacity 
              className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm items-center"
            >
              <View className="w-12 h-12 bg-green-50 rounded-full items-center justify-center mb-2">
                <HelpCircle color="#16a34a" size={24} />
              </View>
              <Text className="text-slate-700 font-bold text-sm">Ajuda</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* === ATIVIDADE RECENTE === */}
        <View className="px-6 mt-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-slate-800 font-bold text-lg">Últimas Notas</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/notas')}>
              <Text className="text-blue-600 font-bold text-sm">Ver todas</Text>
            </TouchableOpacity>
          </View>

          {recentNotas.length === 0 ? (
            <View className="bg-white p-6 rounded-2xl border border-slate-100 items-center py-8">
               <View className="bg-slate-50 p-4 rounded-full mb-3">
                 <FileText size={24} color="#cbd5e1" />
               </View>
               <Text className="text-slate-400 font-medium">Nenhuma nota recente.</Text>
            </View>
          ) : (
            recentNotas.map((venda, index) => {
               // Ajuste conforme a estrutura do seu backend (venda.notas[0] ou venda direta)
               const nota = venda.notas?.[0] || {};
               const statusColor = nota.status === 'AUTORIZADA' ? 'text-green-600 bg-green-50' : 'text-slate-500 bg-slate-100';
               
               return (
                <View key={venda.id || index} className="bg-white p-4 mb-3 rounded-2xl border border-slate-100 flex-row justify-between items-center shadow-sm">
                  <View className="flex-row items-center flex-1">
                    <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${statusColor}`}>
                      <TrendingUp size={18} color={nota.status === 'AUTORIZADA' ? '#16a34a' : '#64748b'} />
                    </View>
                    <View>
                      <Text className="font-bold text-slate-800 text-base">{venda.cliente?.nome || 'Consumidor'}</Text>
                      <Text className="text-slate-400 text-xs">
                         {new Date(venda.createdAt).toLocaleDateString('pt-BR')} • {nota.numero ? `Nº ${nota.numero}` : 'Proc...'}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="font-bold text-slate-900">R$ {venda.valor}</Text>
                    <Text className="text-[10px] text-slate-400 font-bold">{nota.status || 'PENDENTE'}</Text>
                  </View>
                </View>
               );
            })
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}