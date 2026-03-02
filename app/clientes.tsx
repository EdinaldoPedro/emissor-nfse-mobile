import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Search, Plus, User, Building, MapPin } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import api from '../services/api';

export default function Clientes() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

  const fetchClientes = async () => {
    try {
      const res = await api.get('/clientes');
      // Dependendo de como seu backend retorna, pode ser res.data ou res.data.data
      setClientes(res.data.data || res.data || []);
    } catch (error) {
      console.log("Erro ao buscar clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchClientes();
    }, [])
  );

  // Filtro local rápido pelo nome ou documento
  const clientesFiltrados = clientes.filter(c => 
    c.nome?.toLowerCase().includes(busca.toLowerCase()) || 
    c.documento?.includes(busca)
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      {/* HEADER */}
      <View className="px-6 py-4 bg-white border-b border-slate-200 flex-row items-center justify-between">
        <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 -ml-2 rounded-full active:bg-slate-100">
            <ArrowLeft size={24} color="#334155" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-slate-800">Meus Clientes</Text>
        </View>
      </View>

      {/* BARRA DE BUSCA */}
      <View className="px-6 py-4 bg-white shadow-sm border-b border-slate-100 mb-2">
        <View className="flex-row items-center bg-slate-100 border border-slate-200 rounded-xl px-4 h-12">
            <Search size={20} color="#94a3b8" />
            <TextInput 
                className="flex-1 ml-3 text-slate-700" 
                placeholder="Buscar por nome ou CPF/CNPJ..." 
                value={busca}
                onChangeText={setBusca}
            />
        </View>
      </View>

      {/* LISTA DE CLIENTES */}
      {loading ? (
        <ActivityIndicator size="large" color="#9333ea" className="mt-10" />
      ) : (
        <FlatList
          data={clientesFiltrados}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          contentContainerStyle={{ padding: 24, paddingBottom: Math.max(insets.bottom + 80, 100) }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center py-10">
              <User color="#cbd5e1" size={48} className="mb-4" />
              <Text className="text-slate-400 font-medium text-center">Nenhum cliente encontrado.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isPessoaJuridica = item.documento?.length > 14;
            return (
              <TouchableOpacity 
                onPress={() => Alert.alert("Detalhes", "Tela de edição de cliente em breve.")}
                className="bg-white p-5 rounded-2xl mb-3 border border-slate-100 shadow-sm flex-row items-center"
              >
                <View className="w-12 h-12 bg-purple-50 rounded-full items-center justify-center mr-4">
                  {isPessoaJuridica ? <Building color="#9333ea" size={24} /> : <User color="#9333ea" size={24} />}
                </View>
                <View className="flex-1">
                  <Text className="text-slate-800 font-bold text-base mb-1" numberOfLines={1}>{item.nome || item.razaoSocial}</Text>
                  <Text className="text-slate-500 text-xs font-mono">{item.documento}</Text>
                  {item.cidade && (
                     <View className="flex-row items-center mt-1">
                         <MapPin size={12} color="#94a3b8" />
                         <Text className="text-slate-400 text-xs ml-1">{item.cidade}/{item.uf}</Text>
                     </View>
                  )}
                </View>
              </TouchableOpacity>
            )
          }}
        />
      )}

      {/* BOTÃO FLUTUANTE (FAB) PARA ADICIONAR */}
      <View style={{ position: 'absolute', bottom: Math.max(insets.bottom + 20, 24), right: 24 }}>
          <TouchableOpacity 
            onPress={() => Alert.alert("Novo Cliente", "Formulário de cadastro em breve.")}
            className="w-14 h-14 bg-purple-600 rounded-full items-center justify-center shadow-lg shadow-purple-300"
          >
              <Plus color="white" size={28} />
          </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}