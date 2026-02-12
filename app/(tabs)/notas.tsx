import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/format';
import StatusBadge from '../../components/StatusBadge';
import { FileText, Search } from 'lucide-react-native';

export default function NotasScreen() {
  const [notas, setNotas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotas = async () => {
    try {
      // Sua rota GET /api/notas retorna { data: [...], meta: ... }
      const res = await api.get('/notas?limit=20');
      setNotas(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotas();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotas();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: any }) => {
    // No seu backend a venda tem: { cliente: { nome... }, notas: [...], valor, status }
    const notaFiscal = item.notas?.[0]; // Pega a primeira nota vinculada à venda
    const numeroNota = notaFiscal?.numero;

    return (
      <View className="bg-white p-4 mb-3 rounded-xl border border-slate-200 shadow-sm">
        <View className="flex-row justify-between items-start mb-2">
          <View>
            <Text className="font-bold text-slate-800 text-lg">{item.cliente?.nome || 'Consumidor'}</Text>
            <Text className="text-xs text-slate-500 font-mono">
              {numeroNota ? `Nota #${numeroNota}` : 'Processando...'}
            </Text>
          </View>
          <Text className="font-bold text-slate-800 text-lg">{formatCurrency(item.valor)}</Text>
        </View>

        <View className="flex-row justify-between items-center mt-2 border-t border-slate-100 pt-2">
            <Text className="text-xs text-slate-400">{formatDate(item.createdAt)}</Text>
            <StatusBadge status={item.status} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 px-4 pt-4">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-2xl font-bold text-slate-800">Histórico</Text>
        <TouchableOpacity onPress={() => fetchNotas()} className="p-2 bg-white rounded-full border border-slate-200">
            <Search size={20} color="#64748b"/>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" className="mt-10" />
      ) : (
        <FlatList
          data={notas}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View className="items-center mt-20">
              <FileText size={48} color="#cbd5e1" />
              <Text className="text-slate-400 mt-4 font-bold">Nenhuma nota emitida</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}