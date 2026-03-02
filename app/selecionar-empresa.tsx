import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Building, ArrowRight, LogOut } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function SelecionarEmpresa() {
  const { user, selecionarEmpresa, signOut } = useAuth();
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEmpresas() {
      try {
        // Busca as empresas vinculadas a este contador
        const response = await api.get('/contador/vinculo');
        
        // Mapeia o retorno do backend (depende de como seu backend envia)
        // Geralmente retorna um array de vínculos onde vem a empresa junto
        const lista = response.data.data || response.data;
        const empresasFiltradas = lista.map((v: any) => v.empresa || v);
        
        setEmpresas(empresasFiltradas);
      } catch (error) {
        console.log("Erro ao buscar empresas vinculadas:", error);
      } finally {
        setLoading(false);
      }
    }
    loadEmpresas();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />
      
      <View className="px-6 pt-6 pb-4 flex-row justify-between items-center border-b border-slate-200">
        <View>
            <Text className="text-slate-500 font-medium">Painel do Contador</Text>
            <Text className="text-2xl font-bold text-slate-900">Selecione o Cliente</Text>
        </View>
        <TouchableOpacity onPress={signOut} className="p-3 bg-red-50 rounded-full">
            <LogOut color="#ef4444" size={20} />
        </TouchableOpacity>
      </View>

      <View className="flex-1 p-6">
        <Text className="text-slate-600 mb-4">
          Olá, {user?.nome?.split(' ')[0]}. Escolha qual empresa você deseja gerenciar agora:
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" className="mt-10" />
        ) : (
          <FlatList
            data={empresas}
            keyExtractor={(item, index) => item?.id || index.toString()}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="items-center justify-center py-10">
                <Building color="#cbd5e1" size={48} className="mb-4" />
                <Text className="text-slate-400 font-medium text-center">
                  Você ainda não possui clientes vinculados.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity 
                onPress={() => selecionarEmpresa(item.id)}
                className="bg-white p-5 rounded-2xl mb-4 border border-slate-100 flex-row items-center shadow-sm"
              >
                <View className="w-12 h-12 bg-blue-50 rounded-xl items-center justify-center mr-4">
                  <Building color="#2563eb" size={24} />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-800 font-bold text-lg mb-1" numberOfLines={1}>
                    {item?.razaoSocial || 'Empresa Sem Nome'}
                  </Text>
                  <Text className="text-slate-400 text-xs">CNPJ: {item?.documento || 'Não informado'}</Text>
                </View>
                <ArrowRight color="#94a3b8" size={20} />
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}