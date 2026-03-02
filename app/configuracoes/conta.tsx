import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, User, Mail, Phone, Lock, Save, Briefcase, CreditCard, TrendingUp, Calendar, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function MinhaConta() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cargo, setCargo] = useState('');
  const [cpf, setCpf] = useState('');
  
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');

  const [planoDetalhado, setPlanoDetalhado] = useState<any>(null);
  const [planoCiclo, setPlanoCiclo] = useState('MENSAL');

  useEffect(() => {
    async function carregarPerfil() {
        try {
            const res = await api.get('/perfil');
            setNome(res.data.nome || '');
            setTelefone(res.data.telefone || '');
            setCargo(res.data.cargo || '');
            setCpf(res.data.cpf || '');
            
            setPlanoDetalhado(res.data.planoDetalhado);
            setPlanoCiclo(res.data.planoCiclo || 'MENSAL');
        } catch (error) {
            console.log("Erro ao carregar perfil detalhado");
        }
    }
    carregarPerfil();
  }, []);

  const handleSalvar = async () => {
    if (!nome) return Alert.alert("Atenção", "O nome não pode ficar vazio.");
    
    setLoading(true);
    try {
      await api.put('/perfil', { nome, telefone, cargo });

      if (senhaAtual && novaSenha) {
          await api.post('/auth/trocar-senha', { senhaAtual, novaSenha });
          setSenhaAtual('');
          setNovaSenha('');
      }

      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
    } catch (error: any) {
      Alert.alert("Erro", error.response?.data?.error || "Não foi possível salvar os dados.");
    } finally {
      setLoading(false);
    }
  };

  const isIlimitado = planoDetalhado?.limiteEmissoes === 0;
  const percentUso = isIlimitado ? 0 : Math.min(100, ((planoDetalhado?.usoEmissoes || 0) / (planoDetalhado?.limiteEmissoes || 1)) * 100);
  const dataFimFormatada = planoDetalhado?.dataFim ? new Date(planoDetalhado.dataFim).toLocaleDateString() : 'Vitalício / Recorrente';
  const isAtivo = planoDetalhado?.status === 'ATIVO';

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <View className="px-6 py-4 bg-white border-b border-slate-200 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 -ml-2 rounded-full active:bg-slate-100">
          <ArrowLeft size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-800">Meu Perfil</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
          
          <View className="items-center mb-8">
            <View className="w-24 h-24 bg-violet-100 rounded-full items-center justify-center mb-4 border-4 border-white shadow-sm">
                <Text className="text-violet-600 text-3xl font-bold">{nome?.charAt(0) || 'U'}</Text>
            </View>
            <Text className="text-xl font-bold text-slate-800">{nome}</Text>
            <View className="bg-violet-100 px-3 py-1 rounded-full mt-2">
                <Text className="text-violet-700 text-xs font-bold uppercase">{user?.role || 'Usuário'}</Text>
            </View>
          </View>

          <View className="mb-8">
              <Text className="text-slate-800 font-bold text-lg mb-4">Minha Assinatura</Text>
              
              <View className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <View className="h-1 bg-gradient-to-r from-blue-500 to-violet-500" />
                  
                  <View className="p-5">
                      <View className="flex-row justify-between items-center mb-2">
                          <View className="flex-row items-center">
                              <CreditCard size={16} color="#94a3b8" className="mr-2" />
                              <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider">Plano Atual</Text>
                          </View>
                          <View className={`px-2 py-1 rounded-md ${isAtivo ? 'bg-green-100' : 'bg-red-100'}`}>
                              <Text className={`text-[10px] font-bold uppercase ${isAtivo ? 'text-green-700' : 'text-red-700'}`}>
                                  {planoDetalhado?.status || 'INATIVO'}
                              </Text>
                          </View>
                      </View>

                      <View className="mb-4">
                          <Text className="text-2xl font-black text-slate-800">{planoDetalhado?.nome || 'Carregando...'}</Text>
                          <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest">{planoCiclo}</Text>
                      </View>

                      <View className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                          <View className="flex-row justify-between items-center mb-2">
                              <View className="flex-row items-center">
                                  <TrendingUp size={14} color="#64748b" className="mr-1.5" />
                                  <Text className="text-slate-600 text-xs font-bold">Emissões</Text>
                              </View>
                              <Text className="text-slate-800 text-xs font-bold">
                                  {planoDetalhado?.usoEmissoes || 0} / {isIlimitado ? '∞' : planoDetalhado?.limiteEmissoes || 0}
                              </Text>
                          </View>
                          
                          {!isIlimitado && (
                              <View className="h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
                                  <View style={{ width: `${percentUso}%` }} className={`h-full rounded-full ${percentUso > 80 ? 'bg-red-500' : 'bg-blue-500'}`} />
                              </View>
                          )}

                          <View className="flex-row items-center">
                              <Calendar size={14} color="#94a3b8" className="mr-1.5" />
                              <Text className="text-slate-500 text-xs">Expira em: <Text className="font-bold text-slate-700">{dataFimFormatada}</Text></Text>
                          </View>
                      </View>

                      {/* BOTÃO ALTERADO: Agora exibe apenas um alerta */}
                      <TouchableOpacity 
                          onPress={() => Alert.alert("Em breve", "A alteração de planos diretamente pelo aplicativo estará disponível nas próximas atualizações. Por enquanto, utilize o painel Web para fazer o upgrade.")}
                          className="bg-blue-50 py-3 rounded-xl border border-blue-200 items-center justify-center flex-row active:bg-blue-100"
                      >
                          <Sparkles size={16} color="#2563eb" className="mr-2" />
                          <Text className="text-blue-600 font-bold text-sm">Trocar de Plano</Text>
                      </TouchableOpacity>
                  </View>
              </View>
          </View>

          <View className="mb-8">
            <Text className="text-slate-800 font-bold text-lg mb-4">Informações Pessoais</Text>

            <View className="space-y-4">
                <View>
                    <Text className="text-slate-500 font-medium mb-1.5 ml-1 text-sm">Email (Acesso)</Text>
                    <View className="flex-row items-center bg-slate-100 border border-slate-200 rounded-xl px-4 h-14 opacity-70">
                        <Mail size={20} color="#64748b" />
                        <TextInput className="flex-1 ml-3 text-slate-500 font-medium" value={user?.email} editable={false} />
                    </View>
                </View>

                <View>
                    <Text className="text-slate-500 font-medium mb-1.5 ml-1 text-sm">CPF</Text>
                    <View className="flex-row items-center bg-slate-100 border border-slate-200 rounded-xl px-4 h-14 opacity-70">
                        <CreditCard size={20} color="#64748b" />
                        <TextInput className="flex-1 ml-3 text-slate-500 font-medium" value={cpf} editable={false} />
                    </View>
                </View>

                <View>
                    <Text className="text-slate-700 font-medium mb-1.5 ml-1 text-sm">Nome Completo</Text>
                    <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 h-14 focus:border-violet-500">
                        <User size={20} color="#64748b" />
                        <TextInput className="flex-1 ml-3 text-slate-900 font-medium" value={nome} onChangeText={setNome} />
                    </View>
                </View>

                <View>
                    <Text className="text-slate-700 font-medium mb-1.5 ml-1 text-sm">Telefone/WhatsApp</Text>
                    <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 h-14 focus:border-violet-500">
                        <Phone size={20} color="#64748b" />
                        <TextInput className="flex-1 ml-3 text-slate-900 font-medium" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />
                    </View>
                </View>

                <View>
                    <Text className="text-slate-700 font-medium mb-1.5 ml-1 text-sm">Cargo na Empresa</Text>
                    <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 h-14 focus:border-violet-500">
                        <Briefcase size={20} color="#64748b" />
                        <TextInput className="flex-1 ml-3 text-slate-900 font-medium" value={cargo} onChangeText={setCargo} placeholder="Ex: Sócio Administrador" />
                    </View>
                </View>
            </View>
          </View>

          <View className="mb-10">
            <Text className="text-slate-800 font-bold text-lg mb-4">Alterar Senha</Text>
            <View className="space-y-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <Text className="text-slate-500 text-sm mb-2">Preencha apenas se quiser criar uma nova senha de acesso.</Text>
                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 h-14 focus:border-violet-500">
                    <Lock size={20} color="#94a3b8" />
                    <TextInput className="flex-1 ml-3 text-slate-900" placeholder="Senha Atual" secureTextEntry value={senhaAtual} onChangeText={setSenhaAtual} />
                </View>
                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 h-14 focus:border-violet-500">
                    <Lock size={20} color="#94a3b8" />
                    <TextInput className="flex-1 ml-3 text-slate-900" placeholder="Nova Senha" secureTextEntry value={novaSenha} onChangeText={setNovaSenha} />
                </View>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      <View className="px-6 pt-4 bg-white border-t border-slate-100" style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
        <TouchableOpacity onPress={handleSalvar} disabled={loading} className={`bg-violet-600 h-14 rounded-xl items-center justify-center flex-row shadow-lg shadow-violet-200 ${loading ? 'opacity-70' : ''}`}>
            {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                    <Save color="white" size={20} className="mr-2" />
                    <Text className="text-white font-bold text-lg">Salvar Perfil</Text>
                </>
            )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}