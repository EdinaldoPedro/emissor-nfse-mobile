import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import { ChevronRight, CheckCircle, Users, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function EmitirScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Dados do Formulário
  const [clientes, setClientes] = useState<any[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<any>(null);
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [cnaes, setCnaes] = useState<any[]>([]);
  const [selectedCnae, setSelectedCnae] = useState<string>('');

  // Controle de Modal de Cliente
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Carrega Clientes
      const resClientes = await api.get('/clientes');
      setClientes(resClientes.data || []);

      // Carrega Perfil para pegar os CNAEs da empresa
      const resPerfil = await api.get('/perfil');
      const listaCnaes = resPerfil.data.atividades || [];
      setCnaes(listaCnaes);
      
      // Seleciona o CNAE principal automaticamente
      const principal = listaCnaes.find((c: any) => c.principal);
      if (principal) setSelectedCnae(principal.codigo);
      else if(listaCnaes.length > 0) setSelectedCnae(listaCnaes[0].codigo);

    } catch (error) {
      console.error("Erro ao carregar dados iniciais", error);
    }
  };

  const handleEmitir = async () => {
    if (!selectedCliente || !valor || !descricao || !selectedCnae) {
      return Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
    }

    setLoading(true);
    try {
      // Payload igual ao do Next.js
      await api.post('/notas', {
        clienteId: selectedCliente.id,
        valor: valor.replace(',', '.'), // Aceita vírgula
        descricao: descricao,
        codigoCnae: selectedCnae,
        // Campos opcionais simplificados para o MVP Mobile
        issRetido: false, 
        aliquota: 0
      });

      Alert.alert('Sucesso!', 'Nota enviada para processamento.', [
        { text: 'OK', onPress: () => {
            // Reset form
            setStep(1);
            setValor('');
            setDescricao('');
            setSelectedCliente(null);
            router.push('/(tabs)/notas'); // Vai para a lista ver o status
        }}
      ]);
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.error || 'Falha na emissão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      
      {/* Header do Wizard */}
      <View className="px-6 py-4 bg-white border-b border-slate-100">
        <Text className="text-xl font-bold text-slate-800">Nova Emissão</Text>
        <View className="flex-row mt-4">
            <View className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <View className="w-2" />
            <View className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        
        {/* PASSO 1: DADOS BÁSICOS */}
        {step === 1 && (
            <View className="space-y-6">
                
                {/* Seletor de Cliente */}
                <View>
                    <Text className="text-sm font-bold text-slate-500 mb-2 uppercase">Tomador (Cliente)</Text>
                    <TouchableOpacity 
                        onPress={() => setModalVisible(true)}
                        className="bg-white border border-slate-300 rounded-xl p-4 flex-row justify-between items-center"
                    >
                        {selectedCliente ? (
                            <View>
                                <Text className="font-bold text-slate-800 text-base">{selectedCliente.nome}</Text>
                                <Text className="text-slate-500 text-xs">{selectedCliente.documento}</Text>
                            </View>
                        ) : (
                            <Text className="text-slate-400">Selecione um cliente...</Text>
                        )}
                        <Users size={20} color="#64748b" />
                    </TouchableOpacity>
                </View>

                {/* Valor */}
                <View>
                    <Text className="text-sm font-bold text-slate-500 mb-2 uppercase">Valor do Serviço (R$)</Text>
                    <TextInput 
                        className="bg-white border border-slate-300 rounded-xl p-4 text-xl font-bold text-slate-800"
                        placeholder="0,00"
                        keyboardType="numeric"
                        value={valor}
                        onChangeText={setValor}
                    />
                </View>

                {/* Descrição */}
                <View>
                    <Text className="text-sm font-bold text-slate-500 mb-2 uppercase">Descrição do Serviço</Text>
                    <TextInput 
                        className="bg-white border border-slate-300 rounded-xl p-4 text-slate-700 h-32"
                        placeholder="Descreva o serviço prestado..."
                        multiline
                        textAlignVertical="top"
                        value={descricao}
                        onChangeText={setDescricao}
                    />
                </View>

                <TouchableOpacity 
                    onPress={() => setStep(2)}
                    className="bg-blue-600 rounded-xl py-4 items-center mt-4 active:bg-blue-700"
                >
                    <View className="flex-row items-center">
                        <Text className="text-white font-bold text-lg mr-2">Revisar</Text>
                        <ChevronRight color="white" size={20} />
                    </View>
                </TouchableOpacity>
            </View>
        )}

        {/* PASSO 2: REVISÃO E ENVIO */}
        {step === 2 && (
             <View className="space-y-6">
                <View className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <View>
                        <Text className="text-xs text-slate-400 font-bold uppercase">Cliente</Text>
                        <Text className="text-lg font-bold text-slate-800">{selectedCliente?.nome}</Text>
                    </View>
                    
                    <View>
                        <Text className="text-xs text-slate-400 font-bold uppercase">Valor</Text>
                        <Text className="text-2xl font-bold text-green-600">R$ {valor}</Text>
                    </View>

                    <View>
                        <Text className="text-xs text-slate-400 font-bold uppercase">Serviço (CNAE Principal)</Text>
                        <Text className="text-sm text-slate-600">{selectedCnae || 'Padrão'}</Text>
                        <Text className="text-sm text-slate-600 italic mt-1">"{descricao}"</Text>
                    </View>
                </View>

                <TouchableOpacity 
                    onPress={handleEmitir}
                    disabled={loading}
                    className="bg-green-600 rounded-xl py-4 items-center mt-4 active:bg-green-700 shadow-lg"
                >
                     {loading ? (
                         <Text className="text-white font-bold text-lg">Processando...</Text>
                     ) : (
                        <View className="flex-row items-center">
                            <CheckCircle color="white" size={20} />
                            <Text className="text-white font-bold text-lg ml-2">Confirmar Emissão</Text>
                        </View>
                     )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setStep(1)} disabled={loading} className="py-4 items-center">
                    <Text className="text-slate-500 font-bold">Voltar e Editar</Text>
                </TouchableOpacity>
             </View>
        )}
      </ScrollView>

      {/* Modal Seleção de Cliente */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-slate-50">
            <View className="p-4 bg-white border-b border-slate-200 flex-row justify-between items-center">
                <Text className="text-lg font-bold">Selecione o Cliente</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <X size={24} color="#64748b" />
                </TouchableOpacity>
            </View>
            <ScrollView className="p-4">
                {clientes.map(cliente => (
                    <TouchableOpacity 
                        key={cliente.id} 
                        className="bg-white p-4 mb-2 rounded-xl border border-slate-200"
                        onPress={() => {
                            setSelectedCliente(cliente);
                            setModalVisible(false);
                        }}
                    >
                        <Text className="font-bold text-slate-800">{cliente.nome}</Text>
                        <Text className="text-xs text-slate-500">{cliente.documento}</Text>
                    </TouchableOpacity>
                ))}
                {clientes.length === 0 && (
                    <Text className="text-center text-slate-400 mt-10">Nenhum cliente encontrado. Cadastre no site.</Text>
                )}
            </ScrollView>
        </View>
      </Modal>

    </SafeAreaView>
  );
}