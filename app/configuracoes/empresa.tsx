import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, TextInput, 
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Switch
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  ArrowLeft, Building, MapPin, CheckCircle, ShieldAlert, 
  BookOpen, Search, Settings, Hash, Briefcase, UploadCloud, X, Lock
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import api from '../../services/api';

export default function MinhaEmpresa() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [buscandoCnpj, setBuscandoCnpj] = useState(false);

  const [isCadastroMode, setIsCadastroMode] = useState(false);
  const [empresa, setEmpresa] = useState<any>(null);

  // Campos Básicos
  const [documento, setDocumento] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [codigoIbge, setCodigoIbge] = useState('');
  
  // Campos Fiscais
  const [inscricaoMunicipal, setInscricaoMunicipal] = useState('');
  const [regimeTributario, setRegimeTributario] = useState('SIMPLES_NACIONAL');
  const [ambiente, setAmbiente] = useState('HOMOLOGACAO');
  const [serieDPS, setSerieDPS] = useState('1');
  const [ultimoDPS, setUltimoDPS] = useState('');
  const [cnaes, setCnaes] = useState<any[]>([]);

  // Estados do Certificado
  const [certificadoArquivo, setCertificadoArquivo] = useState('');
  const [certificadoNome, setCertificadoNome] = useState('');
  const [certificadoSenha, setCertificadoSenha] = useState('');
  const [deletarCertificado, setDeletarCertificado] = useState(false);

  useEffect(() => {
    async function loadEmpresa() {
      try {
        const res = await api.get('/perfil');
        const dados = res.data;
        setEmpresa(dados);
        
        if (!dados.cadastroCompleto || !dados.documento) {
            setIsCadastroMode(true);
        } else {
            setIsCadastroMode(false);
            setDocumento(dados.documento || '');
            setRazaoSocial(dados.razaoSocial || '');
            setNomeFantasia(dados.nomeFantasia || '');
            setCep(dados.cep || '');
            setLogradouro(dados.logradouro || '');
            setNumero(dados.numero || '');
            setBairro(dados.bairro || '');
            setCidade(dados.cidade || '');
            setUf(dados.uf || '');
            setCodigoIbge(dados.codigoIbge || '');
            
            setInscricaoMunicipal(dados.inscricaoMunicipal || '');
            setRegimeTributario(dados.regimeTributario || 'SIMPLES_NACIONAL');
            setAmbiente(dados.ambiente || 'HOMOLOGACAO');
            setSerieDPS(dados.serieDPS || '1');
            setUltimoDPS(dados.ultimoDPS ? String(dados.ultimoDPS) : '');
            
            // Tratamento robusto para os CNAEs (suporta o formato da API web)
            if (dados.atividades && Array.isArray(dados.atividades) && dados.atividades.length > 0) {
                setCnaes(dados.atividades);
            } else if (dados.cnaes && Array.isArray(dados.cnaes) && dados.cnaes.length > 0) {
                setCnaes(dados.cnaes);
            } else {
                setCnaes([]);
            }
        }
      } catch (error) {
        Alert.alert("Erro", "Não foi possível carregar os dados da empresa.");
      } finally {
        setLoading(false);
      }
    }
    loadEmpresa();
  }, []);

  const buscarDadosCNPJ = async () => {
      const cnpjLimpo = documento.replace(/\D/g, '');
      if (cnpjLimpo.length !== 14) return Alert.alert("Atenção", "Digite um CNPJ válido com 14 números.");
      
      setBuscandoCnpj(true);
      try {
          const res = await api.get(`/external/cnpj?cnpj=${cnpjLimpo}`);
          const data = res.data;
          
          setRazaoSocial(data.razaoSocial || '');
          setNomeFantasia(data.nomeFantasia || data.razaoSocial || '');
          setCep(data.cep || '');
          setLogradouro(data.logradouro || '');
          setNumero(data.numero || '');
          setBairro(data.bairro || '');
          setCidade(data.cidade || '');
          setUf(data.uf || '');
          
          if (data.cnaes || data.atividades) {
              setCnaes(data.cnaes || data.atividades);
          }
      } catch (error) {
          Alert.alert("Erro", "CNPJ não encontrado na base de dados.");
      } finally {
          setBuscandoCnpj(false);
      }
  };

  const selecionarCertificado = async () => {
      try {
          // O Android bloqueia ficheiros se formos muito restritos. O *//* permite clicar.
          const result = await DocumentPicker.getDocumentAsync({
              type: '*/*', 
              copyToCacheDirectory: true,
          });

          if (result.canceled) return;
          
          const file = result.assets[0];
          
          // Validação manual da extensão do ficheiro
          if (!file.name.toLowerCase().endsWith('.pfx') && !file.name.toLowerCase().endsWith('.p12')) {
              Alert.alert("Formato Inválido", "Por favor, selecione um ficheiro de certificado digital válido (.pfx ou .p12).");
              return;
          }

          // Converte o arquivo para Base64
          const base64 = await FileSystem.readAsStringAsync(file.uri, { encoding: FileSystem.EncodingType.Base64 });
          
          setCertificadoArquivo(base64);
          setCertificadoNome(file.name);
          setDeletarCertificado(false); 
      } catch (error) {
          Alert.alert("Erro de Leitura", "Não foi possível processar o ficheiro selecionado do seu smartphone.");
      }
  };

  const cancelarNovoCertificado = () => {
      setCertificadoArquivo('');
      setCertificadoNome('');
      setCertificadoSenha('');
  };

  const handleSalvar = async () => {
    if (!documento || !razaoSocial) return Alert.alert("Atenção", "Preencha ao menos o CNPJ e a Razão Social.");

    if (certificadoArquivo && !certificadoSenha) {
        return Alert.alert("Atenção", "Por favor, digite a senha do certificado que acabou de selecionar.");
    }

    setSaving(true);
    try {
      const payload: any = { 
        documento, razaoSocial, nomeFantasia, cep, logradouro, numero, bairro, cidade, uf, codigoIbge,
        inscricaoMunicipal,
        regimeTributario,
        ambiente,
        serieDPS,
        ultimoDPS: ultimoDPS ? parseInt(ultimoDPS) : undefined,
        cnaes: cnaes
      };

      if (deletarCertificado) {
          payload.deletarCertificado = true;
      } else if (certificadoArquivo && certificadoSenha) {
          payload.certificadoArquivo = certificadoArquivo;
          payload.certificadoSenha = certificadoSenha;
      }

      await api.put('/perfil', payload);
      
      Alert.alert("Sucesso", "Configurações da empresa atualizadas!", [
          { text: "OK", onPress: () => router.replace('/(tabs)') } 
      ]);
    } catch (error: any) {
      const msg = error.response?.data?.error || "Não foi possível salvar os dados. Se enviou um certificado, verifique a senha.";
      Alert.alert("Erro", msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
      return (
          <SafeAreaView className="flex-1 bg-slate-50 justify-center items-center">
              <ActivityIndicator size="large" color="#0891b2" />
          </SafeAreaView>
      );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      
      <View className="px-6 py-4 bg-white border-b border-slate-200 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 -ml-2 rounded-full active:bg-slate-100">
          <ArrowLeft size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-800">Minha Empresa</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
          <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
            
            {isCadastroMode ? (
                // === MODO CADASTRO ===
                <View className="mb-8">
                    <View className="bg-cyan-50 p-5 rounded-2xl border border-cyan-200 mb-6 flex-row items-center">
                        <Building color="#0891b2" size={28} className="mr-4" />
                        <Text className="text-cyan-800 text-sm flex-1 leading-5 font-medium">
                            Conclua o cadastro da sua empresa para liberar a emissão de notas fiscais.
                        </Text>
                    </View>

                    <Text className="text-slate-800 font-bold text-lg mb-4">Dados Principais</Text>
                    
                    <View className="space-y-4">
                        <View>
                            <Text className="text-slate-700 font-medium mb-1.5 ml-1 text-sm">CNPJ</Text>
                            <View className="flex-row items-center bg-white border border-slate-300 rounded-xl px-4 h-14 focus:border-cyan-500">
                                <TextInput 
                                    className="flex-1 text-slate-900 font-bold tracking-widest" 
                                    value={documento} onChangeText={setDocumento} keyboardType="numeric" 
                                    placeholder="00000000000000"
                                />
                                <TouchableOpacity onPress={buscarDadosCNPJ} disabled={buscandoCnpj} className="bg-cyan-100 p-2 rounded-lg">
                                    {buscandoCnpj ? <ActivityIndicator size="small" color="#0891b2" /> : <Search size={20} color="#0891b2" />}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View>
                            <Text className="text-slate-700 font-medium mb-1.5 ml-1 text-sm">Razão Social</Text>
                            <TextInput className="bg-white border border-slate-300 rounded-xl px-4 h-14 text-slate-900" value={razaoSocial} onChangeText={setRazaoSocial} />
                        </View>

                        <View>
                            <Text className="text-slate-700 font-medium mb-1.5 ml-1 text-sm">Nome Fantasia</Text>
                            <TextInput className="bg-white border border-slate-300 rounded-xl px-4 h-14 text-slate-900" value={nomeFantasia} onChangeText={setNomeFantasia} />
                        </View>
                    </View>

                    <Text className="text-slate-800 font-bold text-lg mt-8 mb-4">Endereço</Text>
                    <View className="space-y-4">
                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <Text className="text-slate-700 font-medium mb-1.5 ml-1 text-sm">CEP</Text>
                                <TextInput className="bg-white border border-slate-300 rounded-xl px-4 h-14 text-slate-900" value={cep} onChangeText={setCep} keyboardType="numeric" />
                            </View>
                            <View className="flex-[2]">
                                <Text className="text-slate-700 font-medium mb-1.5 ml-1 text-sm">Cidade / UF</Text>
                                <TextInput className="bg-slate-100 border border-slate-300 rounded-xl px-4 h-14 text-slate-600" value={`${cidade} - ${uf}`} editable={false} />
                            </View>
                        </View>
                        <View className="flex-row gap-4">
                            <View className="flex-[3]">
                                <Text className="text-slate-700 font-medium mb-1.5 ml-1 text-sm">Logradouro</Text>
                                <TextInput className="bg-white border border-slate-300 rounded-xl px-4 h-14 text-slate-900" value={logradouro} onChangeText={setLogradouro} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-slate-700 font-medium mb-1.5 ml-1 text-sm">Nº</Text>
                                <TextInput className="bg-white border border-slate-300 rounded-xl px-4 h-14 text-slate-900" value={numero} onChangeText={setNumero} />
                            </View>
                        </View>
                    </View>
                </View>

            ) : (

                // === MODO CONFIGURAÇÕES ===
                <View className="mb-8">
                    
                    {/* CARD VISUAL DA EMPRESA */}
                    <View className="bg-cyan-600 rounded-3xl p-6 shadow-lg shadow-cyan-200 mb-8 overflow-hidden relative">
                        <View className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500 rounded-full opacity-30" />
                        
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center backdrop-blur-sm border border-white/30">
                                <Building color="white" size={28} />
                            </View>
                            <View className="bg-cyan-700/50 px-3 py-1 rounded-full border border-cyan-500">
                                <Text className="text-cyan-50 font-bold text-xs">{regimeTributario.replace('_', ' ')}</Text>
                            </View>
                        </View>
                        
                        <Text className="text-cyan-100 text-xs font-bold uppercase tracking-wider mb-1">Razão Social</Text>
                        <Text className="text-white font-bold text-xl mb-4 leading-tight">{razaoSocial}</Text>

                        <View>
                            <Text className="text-cyan-100 text-xs font-bold uppercase tracking-wider mb-1">CNPJ</Text>
                            <Text className="text-white font-mono text-base">{documento}</Text>
                        </View>
                    </View>

                    {/* CONFIGURAÇÕES FISCAIS */}
                    <Text className="text-slate-800 font-bold text-lg mb-4 flex-row items-center">
                        <Settings size={20} color="#334155" className="mr-2" /> Configurações de Emissão
                    </Text>
                    
                    <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-8 space-y-4">
                        <View>
                            <Text className="text-slate-700 font-bold mb-1.5 text-xs uppercase tracking-wider">Inscrição Municipal (IM)</Text>
                            <View className="flex-row items-center bg-slate-50 border border-slate-300 rounded-xl px-4 h-14 focus:border-cyan-500">
                                <BookOpen size={20} color="#94a3b8" />
                                <TextInput className="flex-1 ml-3 text-slate-900 font-bold" value={inscricaoMunicipal} onChangeText={setInscricaoMunicipal} keyboardType="numeric" placeholder="Apenas números" />
                            </View>
                        </View>

                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <Text className="text-slate-700 font-bold mb-1.5 text-xs uppercase tracking-wider">Série DPS</Text>
                                <View className="flex-row items-center bg-slate-50 border border-slate-300 rounded-xl px-4 h-14">
                                    <Hash size={20} color="#94a3b8" />
                                    <TextInput className="flex-1 ml-2 text-slate-900 font-bold" value={serieDPS} onChangeText={setSerieDPS} keyboardType="numeric" />
                                </View>
                            </View>
                            <View className="flex-1">
                                <Text className="text-slate-700 font-bold mb-1.5 text-xs uppercase tracking-wider">Último DPS</Text>
                                <TextInput className="bg-slate-50 border border-slate-300 rounded-xl px-4 h-14 text-slate-900 font-bold" value={ultimoDPS} onChangeText={setUltimoDPS} keyboardType="numeric" placeholder="Ex: 100" />
                            </View>
                        </View>

                        <View className="pt-2">
                            <View className="flex-row justify-between items-center bg-slate-100 p-3 rounded-xl border border-slate-200">
                                <View>
                                    <Text className="text-slate-800 font-bold text-sm">Ambiente de Emissão</Text>
                                    <Text className="text-slate-500 text-xs mt-0.5">{ambiente === 'PRODUCAO' ? 'Notas com valor fiscal' : 'Apenas para testes'}</Text>
                                </View>
                                <Switch 
                                    value={ambiente === 'PRODUCAO'} 
                                    onValueChange={(val) => setAmbiente(val ? 'PRODUCAO' : 'HOMOLOGACAO')}
                                    trackColor={{ false: "#cbd5e1", true: "#0891b2" }}
                                    thumbColor="#ffffff"
                                />
                            </View>
                        </View>
                    </View>

                    {/* UPLOAD DE CERTIFICADO */}
                    <Text className="text-slate-800 font-bold text-lg mb-4 flex-row items-center">
                        <Lock size={20} color="#334155" className="mr-2" /> Certificado Digital (A1)
                    </Text>
                    <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-8">
                        
                        {empresa?.temCertificado && !deletarCertificado && !certificadoArquivo ? (
                            <View>
                                <View className="flex-row items-center mb-4">
                                    <View className="w-12 h-12 bg-green-50 rounded-xl items-center justify-center mr-4">
                                        <CheckCircle color="#16a34a" size={24} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-slate-800 font-bold text-base">Certificado Ativo</Text>
                                        <Text className="text-slate-500 text-xs">Vence em: {new Date(empresa.vencimentoCertificado).toLocaleDateString()}</Text>
                                    </View>
                                </View>
                                <View className="flex-row gap-3">
                                    <TouchableOpacity onPress={selecionarCertificado} className="flex-1 bg-slate-100 py-3 rounded-xl items-center border border-slate-200">
                                        <Text className="text-slate-700 font-bold text-sm">Substituir</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setDeletarCertificado(true)} className="flex-1 bg-red-50 py-3 rounded-xl items-center border border-red-100">
                                        <Text className="text-red-600 font-bold text-sm">Remover</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View>
                                {deletarCertificado && (
                                    <View className="bg-red-50 p-3 rounded-lg mb-4 border border-red-200">
                                        <Text className="text-red-700 text-xs text-center font-bold">O certificado atual será excluído ao salvar.</Text>
                                    </View>
                                )}

                                {!certificadoArquivo ? (
                                    <TouchableOpacity onPress={selecionarCertificado} className="border-2 border-dashed border-cyan-300 bg-cyan-50 rounded-xl p-6 items-center">
                                        <UploadCloud color="#0891b2" size={32} className="mb-2" />
                                        <Text className="text-cyan-800 font-bold text-base">Selecionar arquivo .pfx</Text>
                                        <Text className="text-cyan-600 text-xs text-center mt-1">Clique para procurar no seu smartphone.</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View className="bg-cyan-50 p-4 rounded-xl border border-cyan-200">
                                        <View className="flex-row items-center justify-between mb-4">
                                            <View className="flex-row items-center flex-1 pr-4">
                                                <ShieldAlert color="#0891b2" size={20} className="mr-2" />
                                                <Text className="text-cyan-900 font-bold text-sm" numberOfLines={1}>{certificadoNome}</Text>
                                            </View>
                                            <TouchableOpacity onPress={cancelarNovoCertificado} className="p-1 bg-cyan-100 rounded-full">
                                                <X color="#0891b2" size={16} />
                                            </TouchableOpacity>
                                        </View>
                                        <View className="flex-row items-center bg-white border border-cyan-300 rounded-xl px-4 h-12 focus:border-cyan-500">
                                            <Lock size={18} color="#94a3b8" />
                                            <TextInput 
                                                className="flex-1 ml-3 text-slate-900" 
                                                placeholder="Senha do Certificado" 
                                                secureTextEntry
                                                value={certificadoSenha}
                                                onChangeText={setCertificadoSenha}
                                            />
                                        </View>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>

                    {/* ATIVIDADES E CNAES (Agora renderizado corretamente) */}
                    <Text className="text-slate-800 font-bold text-lg mb-4 flex-row items-center">
                        <Briefcase size={20} color="#334155" className="mr-2" /> Atividades (CNAE)
                    </Text>
                    <View className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-8">
                        {cnaes.length === 0 ? (
                            <Text className="text-slate-400 text-sm text-center py-4">Nenhum CNAE registrado. Busque o CNPJ para atualizar.</Text>
                        ) : (
                            cnaes.map((cnae, index) => (
                                <View key={cnae.codigo || index} className={`py-3 ${index !== cnaes.length - 1 ? 'border-b border-slate-100' : ''}`}>
                                    <View className="flex-row items-start justify-between">
                                        <Text className="text-slate-800 font-bold text-sm">{cnae.codigo}</Text>
                                        {cnae.principal && (
                                            <View className="bg-cyan-100 px-2 py-0.5 rounded text-[10px] ml-2">
                                                <Text className="text-cyan-700 font-bold text-[10px]">PRINCIPAL</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text className="text-slate-500 text-xs mt-1 leading-4">{cnae.descricao}</Text>
                                </View>
                            ))
                        )}
                    </View>

                    {/* ENDEREÇO (Leitura) */}
                    <Text className="text-slate-800 font-bold text-lg mb-4">Endereço Fiscal</Text>
                    <View className="bg-slate-100 p-5 rounded-2xl border border-slate-200 flex-row items-start">
                        <MapPin color="#64748b" size={20} className="mr-3 mt-1" />
                        <View className="flex-1">
                            <Text className="text-slate-700 font-medium leading-5">{logradouro}, {numero}</Text>
                            <Text className="text-slate-500 mt-1">{bairro} - {cidade}/{uf}</Text>
                            <Text className="text-slate-500 mt-1">CEP: {cep}</Text>
                        </View>
                    </View>
                </View>
            )}

          </ScrollView>
      </KeyboardAvoidingView>

      {/* RODAPÉ E BOTÃO DE SALVAR - RESPIRO DO S24 ULTRA */}
      <View 
        className="px-6 pt-4 bg-white border-t border-slate-200 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]"
        style={{ paddingBottom: Math.max(insets.bottom + 24, 40) }}
      >
        <TouchableOpacity 
            onPress={handleSalvar}
            disabled={saving}
            className={`bg-cyan-600 h-16 rounded-2xl items-center justify-center flex-row shadow-lg shadow-cyan-300 active:bg-cyan-700 ${saving ? 'opacity-70' : ''}`}
        >
            {saving ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Salvar Configurações</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}