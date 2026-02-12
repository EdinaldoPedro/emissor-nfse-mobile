import React from 'react';
import { View, Text } from 'react-native';

const STATUS_CONFIG: any = {
  'AUTORIZADA': { bg: 'bg-green-100', text: 'text-green-700', label: 'AUTORIZADA' },
  'CONCLUIDA': { bg: 'bg-green-100', text: 'text-green-700', label: 'AUTORIZADA' },
  'CANCELADA': { bg: 'bg-gray-100', text: 'text-gray-500', label: 'CANCELADA' },
  'PROCESSANDO': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'PROCESSANDO' },
  'ERRO_EMISSAO': { bg: 'bg-red-100', text: 'text-red-700', label: 'ERRO' },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || { bg: 'bg-slate-100', text: 'text-slate-600', label: status };

  return (
    <View className={`px-2 py-1 rounded-md self-start ${config.bg}`}>
      <Text className={`text-xs font-bold ${config.text}`}>{config.label}</Text>
    </View>
  );
}