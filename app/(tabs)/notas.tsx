import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FileText, Search, TrendingUp, Filter, Calendar } from 'lucide-react-native';
import api from '../../services/api';
import { useFocusEffect } from 'expo-router';

// Helper para os meses
const MESES = [
  { val: '', label: 'Todos' }, { val: '01', label: 'Jan' }, { val: '02', label: 'Fev' },
  { val: '03', label: 'Mar' }, { val: '04', label: 'Abr' }, { val: '05', label: 'Mai' },
  { val: '06', label: 'Jun' }, { val: '07', label: 'Jul' }, { val: '08', label: 'Ago' },
  { val: '09', label: 'Set' }, { val: '10', label: 'Out' }, { val: '11', label: 'Nov' },
  { val: '12', label: 'Dez' }
];

export default function HistoricoNotas() {
  const insets = useSafeAreaInsets();
  
  const [notas, setNotas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados dos Filtros
  const [mesSelecionado, setMesSelecionado] = useState('');
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear().toString());
  const [buscaFornecedor, setBuscaFornecedor] = useState('');

  const fetchNotas = async () => {
    setLoading(true);
    try {
      // Monta a query string com os filtros (ajuste as variáveis conforme a sua API no Next.js espera)
      // Ex: /notas?mes=03&ano=2024&clienteNome=Joao
      let query = `/notas?ano=${anoSelecionado}`;
      if (mesSelecionado) query += `&mes=${mesSelecionado}`;
      if (buscaFornecedor) query += `&search=${buscaFornecedor}`; // Use 'search' ou 'cliente' dependendo da sua API

      const res = await api.get(query);
      setNotas(res.data.data || res.data || []);
    } catch (error) {
      console.log("Erro ao buscar histórico de notas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Recarrega sempre que o usuário muda um filtro ou abre a aba
  useFocusEffect(
    useCallback(() => {
      fetchNotas();
    }, [mesSelecionado, anoSelecionado])
  );

  // Debounce manual simples para a busca por texto não travar a tela
  useEffect(() => {
      const delayBusca = setTimeout(() => {
          fetchNotas();
      }, 800);
      return () => clearTimeout(delayBusca);
  }, [buscaFornecedor]);

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      
      {/* HEADER DA ABA */}
      <View className="px-6 py-4 bg-white border-b border-slate-100 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-slate-800">Histórico de Notas</Text>
        <View className="w-10 h-10 bg-blue-50 items-center justify-center rounded-full">
            <FileText size={20} color="#2563eb" />
        </View>
      </View>

      {/* ÁREA DE FILTROS */}
      <View className="bg-white border-b border-slate-200 shadow-sm pb-4">
          
          {/* Campo de Busca (Fornecedor/Tomador) */}
          <View className="px-6 pt-4 pb-2">
            <View className="flex-row items-center bg-slate-100 border border-slate-200 rounded-xl px-4 h-12">
                <Search size={20} color="#94a3b8" />
                <TextInput 
                    className="flex-1 ml-3 text-slate-700" 
                    placeholder="Buscar por cliente/fornecedor..." 
                    value={buscaFornecedor}
                    onChangeText={setBuscaFornecedor}
                />
            </View>
          </View>

          {/* Chips de Meses (Scroll Horizontal) */}
          <View className="flex-row items-center px-6 mt-2 mb-1">
              <Filter size={14} color="#64748b" className="mr-2" />
              <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider">Filtrar por Mês</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
              {MESES.map((mes) => {
                  const isSelected = mesSelecionado === mes.val;
                  return (
                      <TouchableOpacity 
                        key={mes.label} 
                        onPress={() => setMesSelecionado(mes.val)}
                        className={`mr-2 px-4 py-2 rounded-full border ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200'}`}
                      >
                          <Text className={`font-medium ${isSelected ? 'text-white' : 'text-slate-600'}`}>{mes.label}</Text>
                      </TouchableOpacity>
                  )
              })}
          </ScrollView>
      </View>

      {/* LISTA DE NOTAS */}
      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" className="mt-10" />
      ) : (
        <FlatList
          data={notas}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          contentContainerStyle={{ padding: 24, paddingBottom: Math.max(insets.bottom + 80, 100) }} // Protege a navegação
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center py-10 bg-white rounded-2xl border border-slate-100 border-dashed">
               <View className="bg-slate-50 p-4 rounded-full mb-3">
                 <Calendar size={28} color="#cbd5e1" />
               </View>
               <Text className="text-slate-500 font-bold mb-1">Nenhuma nota encontrada.</Text>
               <Text className="text-slate-400 text-xs text-center px-4">Tente alterar os filtros de mês ou buscar outro fornecedor.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const notaInfo = item.notas?.[0] || item || {}; // Adaptação para a estrutura do banco
            const status = notaInfo.status || 'PENDENTE';
            const isAutorizada = status === 'AUTORIZADA';
            
            return (
              <TouchableOpacity className="bg-white p-5 rounded-2xl mb-3 border border-slate-100 flex-row justify-between items-center shadow-sm">
                <View className="flex-row items-center flex-1">
                  <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${isAutorizada ? 'bg-green-50' : 'bg-amber-50'}`}>
                    <TrendingUp size={20} color={isAutorizada ? '#16a34a' : '#d97706'} />
                  </View>
                  <View className="flex-1 pr-2">
                    <Text className="font-bold text-slate-800 text-base" numberOfLines={1}>{item.cliente?.nome || 'Cliente Final'}</Text>
                    <Text className="text-slate-400 text-xs mt-0.5">
                       {new Date(item.createdAt).toLocaleDateString('pt-BR')} • {notaInfo.numero ? `Nº ${notaInfo.numero}` : 'Em Processamento'}
                    </Text>
                  </View>
                </View>
                <View className="items-end pl-2">
                  <Text className="font-bold text-slate-900 text-base">R$ {item.valor || '0,00'}</Text>
                  <View className={`mt-1 px-2 py-0.5 rounded-full ${isAutorizada ? 'bg-green-100' : 'bg-amber-100'}`}>
                    <Text className={`text-[10px] font-bold ${isAutorizada ? 'text-green-700' : 'text-amber-700'}`}>{status}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )
          }}
        />
      )}
    </SafeAreaView>
  );
}