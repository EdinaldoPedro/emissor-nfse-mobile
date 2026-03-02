import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle, FileText, DollarSign, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import SearchableSelect from '../../components/SearchableSelect';
import { formatCurrency } from '../../utils/format';

export default function EmitirNota() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Estados do Formulário
  const [cliente, setCliente] = useState<any>(null);
  const [servico, setServico] = useState<any>(null); // Se você tiver lista de serviços
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');

  // Busca Clientes na API
  const searchClientes = async (query: string) => {
    try {
      // Ajuste a rota conforme seu backend (ex: /clientes?search=...)
      const res = await api.get(`/clientes?q=${query}`);
      return res.data.data || res.data; 
    } catch (error) {
      console.log("Erro ao buscar clientes", error);
      return [];
    }
  };

  const handleEmitir = async () => {
    if (!cliente || !valor || !descricao) {
      return Alert.alert("Campos Obrigatórios", "Preencha cliente, valor e descrição.");
    }

    setLoading(true);
    try {
      // Payload simplificado para o backend
      const payload = {
        clienteId: cliente.id,
        servicoDescricao: descricao,
        valor: parseFloat(valor.replace(',', '.')), // Converte "100,50" para 100.50
        // Adicione outros campos fixos ou necessários aqui (ex: codigoServico: '01.01')
      };

      await api.post('/notas', payload);
      
      Alert.alert("Sucesso!", "Nota Fiscal emitida com sucesso.", [
        { text: "OK", onPress: () => router.push('/(tabs)/notas') } // Vai para o histórico
      ]);
      
      // Limpar formulário
      setCliente(null);
      setValor('');
      setDescricao('');

    } catch (error: any) {
      Alert.alert("Erro na Emissão", error.response?.data?.message || "Não foi possível emitir a nota.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      
      {/* HEADER */}
      <View className="px-6 py-4 bg-white border-b border-slate-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-800">Nova Nota Fiscal</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView className="p-6">
          
          {/* SEÇÃO 1: CLIENTE */}
          <View className="mb-6">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
                <User size={16} color="#2563eb" />
              </View>
              <Text className="text-lg font-bold text-slate-800">Tomador do Serviço</Text>
            </View>

            <SearchableSelect 
              label="Cliente"
              placeholder="Buscar por nome ou CPF/CNPJ..."
              value={cliente}
              onChange={setCliente}
              onSearch={searchClientes}
              itemLabel={(item) => item.nome || item.razaoSocial}
            />
            
            {!cliente && (
               <TouchableOpacity onPress={() => Alert.alert("Em breve", "Tela de cadastro rápido de cliente.")}>
                 <Text className="text-blue-600 font-bold text-right text-sm">+ Novo Cliente</Text>
               </TouchableOpacity>
            )}
          </View>

          {/* SEÇÃO 2: SERVIÇO E VALOR */}
          <View className="mb-6">
            <View className="flex-row items-center mb-4">
              <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                <DollarSign size={16} color="#16a34a" />
              </View>
              <Text className="text-lg font-bold text-slate-800">Valores e Serviço</Text>
            </View>

            {/* Input Valor */}
            <View className="mb-4">
              <Text className="text-slate-600 font-semibold mb-2 text-xs uppercase tracking-wider">Valor do Serviço (R$)</Text>
              <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 h-14">
                <Text className="text-slate-400 font-bold mr-2">R$</Text>
                <TextInput 
                  className="flex-1 text-slate-900 font-bold text-xl h-full"
                  placeholder="0,00"
                  keyboardType="numeric"
                  value={valor}
                  onChangeText={setValor}
                />
              </View>
            </View>

            {/* Input Descrição */}
            <View className="mb-4">
              <Text className="text-slate-600 font-semibold mb-2 text-xs uppercase tracking-wider">Descrição do Serviço</Text>
              <View className="bg-white border border-slate-200 rounded-xl p-4 h-32">
                <TextInput 
                  className="flex-1 text-slate-900 text-base leading-5"
                  placeholder="Ex: Desenvolvimento de software referente ao mês de..."
                  multiline
                  textAlignVertical="top"
                  value={descricao}
                  onChangeText={setDescricao}
                />
              </View>
            </View>
          </View>

          {/* BOTÃO EMITIR */}
          <TouchableOpacity 
            onPress={handleEmitir}
            disabled={loading}
            className={`bg-blue-600 h-16 rounded-2xl items-center justify-center mb-10 shadow-lg shadow-blue-300 flex-row ${loading ? 'opacity-70' : ''}`}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <CheckCircle color="white" size={24} className="mr-2" />
                <Text className="text-white font-bold text-xl ml-2">Emitir Nota</Text>
              </>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}