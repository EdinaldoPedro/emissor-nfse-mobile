import React from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { X, Search, Check } from 'lucide-react-native';

interface SearchableSelectProps {
  label: string;
  value: any;
  onChange: (item: any) => void;
  onSearch: (text: string) => Promise<any[]>;
  placeholder?: string;
  itemLabel: (item: any) => string;
}

export default function SearchableSelect({ label, value, onChange, onSearch, placeholder, itemLabel }: SearchableSelectProps) {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');
  const [results, setResults] = React.useState<any[]>([]);

  const handleSearch = async (text: string) => {
    setSearchText(text);
    if (text.length > 2) {
      setLoading(true);
      try {
        const data = await onSearch(text);
        setResults(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View className="mb-4">
      <Text className="text-slate-600 font-semibold mb-2 text-xs uppercase tracking-wider">{label}</Text>
      <TouchableOpacity 
        onPress={() => setModalVisible(true)}
        className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 h-14"
      >
        <Text className={`flex-1 text-base ${value ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
          {value ? itemLabel(value) : placeholder || 'Selecione...'}
        </Text>
        <Search size={20} color="#94a3b8" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-slate-50 pt-6">
          <View className="flex-row items-center justify-between px-4 pb-4 border-b border-slate-200">
            <Text className="text-lg font-bold text-slate-800">Selecionar {label}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 bg-slate-200 rounded-full">
              <X size={20} color="#475569" />
            </TouchableOpacity>
          </View>

          <View className="p-4">
            <View className="flex-row items-center bg-white border border-slate-300 rounded-xl px-4 h-12 mb-2">
              <Search size={20} color="#94a3b8" />
              <TextInput 
                className="flex-1 ml-3 text-base"
                placeholder="Digite para buscar..."
                value={searchText}
                onChangeText={handleSearch}
                autoFocus
              />
            </View>
            <Text className="text-xs text-slate-400 text-center">Digite pelo menos 3 letras</Text>
          </View>

          {loading ? (
            <ActivityIndicator className="mt-10" size="large" color="#2563eb" />
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item, index) => item.id?.toString() || index.toString()}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  onPress={() => {
                    onChange(item);
                    setModalVisible(false);
                  }}
                  className="bg-white p-4 mb-3 rounded-xl border border-slate-100 shadow-sm flex-row items-center justify-between"
                >
                  <View>
                    <Text className="font-bold text-slate-800">{itemLabel(item)}</Text>
                    {item.documento && <Text className="text-slate-500 text-xs">{item.documento}</Text>}
                  </View>
                  {value?.id === item.id && <Check size={20} color="#2563eb" />}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                searchText.length > 2 ? (
                  <Text className="text-center text-slate-400 mt-10">Nenhum resultado encontrado.</Text>
                ) : null
              }
            />
          )}
        </View>
      </Modal>
    </View>
  );
}