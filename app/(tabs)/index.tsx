import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  Building, 
  FileText, 
  Bell, 
  TrendingUp, 
  Users, 
  HelpCircle,
  User,
  PlusCircle,
  LogOut // <-- Adicionado o ícone de Sair
} from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';

export default function Dashboard() {
  const { user, signOut } = useAuth(); // <-- Puxando a função signOut
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [recentNotas, setRecentNotas] = useState<any[]>([]);

  const [quickActions, setQuickActions] = useState([
    { id: 'emitir', label: 'Nova Nota', icon: PlusCircle, color: '#2563eb', bg: 'bg-blue-50', route: '/(tabs)/emitir' },
    { id: 'conta', label: 'Minha Conta', icon: User, color: '#7c3aed', bg: 'bg-violet-50', route: '/configuracoes/conta' },
    { id: 'empresa', label: 'Minha Empresa', icon: Building, color: '#0891b2', bg: 'bg-cyan-50', route: '/configuracoes/empresa' },
    { id: 'clientes', label: 'Clientes', icon: Users, color: '#9333ea', bg: 'bg-purple-50', route: '/clientes' },
    { id: 'ajuda', label: 'Ajuda', icon: HelpCircle, color: '#16a34a', bg: 'bg-green-50', route: '/ajuda' }
  ]);

  const handleActionPress = (action: any) => {
    // 1. Reordenar: Move o item clicado para o início do array
    const newOrder = [
      action,
      ...quickActions.filter(item => item.id !== action.id)
    ];
    setQuickActions(newOrder);

    // 2. Navegar para a rota clicada (Agora sem bloqueios para telas de configuração)
    if (action.route) {
        router.push(action.route as any);
    }
  };

  const fetchData = async () => {
    try {
      const resPerfil = await api.get('/perfil');
      setStats(resPerfil.data);
      
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

  const emissoesFeitas = stats?.planoDetalhado?.usoEmissoes || 0;
  const limitePlano = 50; 
  const progresso = Math.min((emissoesFeitas / limitePlano) * 100, 100);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* === HEADER COM BOTÃO DE SAIR === */}
        <View className="px-6 pt-4 pb-6 flex-row justify-between items-center">
          <View>
            <Text className="text-slate-500 text-sm font-medium">Bem-vindo,</Text>
            <Text className="text-slate-900 text-2xl font-bold">{user?.nome?.split(' ')[0]}</Text>
          </View>
          
          {/* BOTÕES NO TOPO */}
          <View className="flex-row items-center gap-3">
            {/* NOVO BOTÃO DE SAIR PARA VOCÊ ESCAPAR */}
            <TouchableOpacity onPress={signOut} className="w-10 h-10 bg-red-50 items-center justify-center rounded-full border border-red-100 shadow-sm">
              <LogOut size={18} color="#ef4444" />
            </TouchableOpacity>

            <TouchableOpacity className="w-10 h-10 bg-white items-center justify-center rounded-full border border-slate-200 shadow-sm">
              <Bell size={20} color="#64748b" />
              <View className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* === CARD DA EMPRESA === */}
        <View className="mx-6">
          <View className="bg-blue-600 rounded-3xl p-6 shadow-xl shadow-blue-200 overflow-hidden relative">
            <View className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500 rounded-full opacity-30" />
            <View className="absolute top-20 -left-10 w-32 h-32 bg-blue-400 rounded-full opacity-20" />

            <View className="flex-row items-center mb-6">
              <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mr-3 backdrop-blur-sm">
                <Building color="white" size={20} />
              </View>
              <View className="flex-1">
                <Text className="text-blue-100 text-xs font-bold uppercase tracking-wider">Empresa Ativa</Text>
                <Text className="text-white font-bold text-lg leading-tight" numberOfLines={1}>
                  {stats?.razaoSocial || stats?.empresa?.razaoSocial || 'Carregando...'}
                </Text>
              </View>
            </View>

            <View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-blue-100 text-xs font-medium">Consumo do Plano</Text>
                <Text className="text-white text-xs font-bold">{emissoesFeitas} / {limitePlano} Notas</Text>
              </View>
              <View className="h-2 bg-blue-900/30 rounded-full overflow-hidden">
                <View style={{ width: `${progresso}%` }} className="h-full bg-white rounded-full" />
              </View>
            </View>
          </View>
        </View>

        {/* === ACESSO RÁPIDO === */}
        <View className="mt-8">
          <Text className="px-6 text-slate-800 font-bold text-lg mb-4">Acesso Rápido</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 10 }}>
            {quickActions.map((action) => (
              <TouchableOpacity key={action.id} onPress={() => handleActionPress(action)} className="mr-3 w-28 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm items-center justify-center h-28">
                <View className={`w-12 h-12 ${action.bg} rounded-full items-center justify-center mb-2`}>
                  <action.icon color={action.color} size={24} />
                </View>
                <Text className="text-slate-700 font-bold text-xs text-center leading-4">{action.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* === ATIVIDADE RECENTE === */}
        <View className="px-6 mt-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-slate-800 font-bold text-lg">Últimas Notas</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/notas')}>
              <Text className="text-blue-600 font-bold text-sm">Ver todas</Text>
            </TouchableOpacity>
          </View>

          {recentNotas.length === 0 ? (
            <View className="bg-white p-6 rounded-2xl border border-slate-100 items-center py-8 border-dashed">
               <View className="bg-slate-50 p-4 rounded-full mb-3">
                 <FileText size={24} color="#cbd5e1" />
               </View>
               <Text className="text-slate-400 font-medium">Nenhuma nota emitida ainda.</Text>
            </View>
          ) : (
            recentNotas.map((venda, index) => {
               const nota = venda.notas?.[0] || {};
               const isAutorizada = nota.status === 'AUTORIZADA';
               
               return (
                <View key={venda.id || index} className="bg-white p-4 mb-3 rounded-2xl border border-slate-100 flex-row justify-between items-center shadow-sm">
                  <View className="flex-row items-center flex-1">
                    <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${isAutorizada ? 'bg-green-50' : 'bg-slate-100'}`}>
                      <TrendingUp size={18} color={isAutorizada ? '#16a34a' : '#64748b'} />
                    </View>
                    <View>
                      <Text className="font-bold text-slate-800 text-base" numberOfLines={1}>{venda.cliente?.nome || 'Cliente Final'}</Text>
                      <Text className="text-slate-400 text-xs">{new Date(venda.createdAt).toLocaleDateString('pt-BR')} • {nota.numero ? `Nº ${nota.numero}` : 'Proc...'}</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="font-bold text-slate-900">{venda.valor ? `R$ ${venda.valor}` : 'R$ 0,00'}</Text>
                    <Text className={`text-[10px] font-bold ${isAutorizada ? 'text-green-600' : 'text-slate-400'}`}>{nota.status || 'PENDENTE'}</Text>
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