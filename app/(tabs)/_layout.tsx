import React from 'react';
import { Tabs } from 'expo-router';
import { Home, PlusCircle, FileText } from 'lucide-react-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  // Calcula a altura da barra e o padding inferior dinamicamente
  // O valor 60 é a altura base do botão. Somamos com o tamanho da barra do celular.
  const tabBarHeight = 65 + Math.max(insets.bottom, 10);
  const paddingBottom = Math.max(insets.bottom, 10);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb', // Azul 600
        tabBarInactiveTintColor: '#94a3b8', // Slate 400
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 5, // Sombra no Android
          height: tabBarHeight,
          paddingBottom: paddingBottom,
          paddingTop: 10,
          backgroundColor: '#ffffff',
        },
        tabBarLabelStyle: {
          fontWeight: '600',
          fontSize: 10,
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      
      {/* Botão de Destaque para Emitir */}
      <Tabs.Screen
        name="emitir"
        options={{
          title: 'Emitir',
          tabBarIcon: ({ focused }) => (
            <View className={`items-center justify-center -mt-5 p-3 rounded-full shadow-lg ${focused ? 'bg-blue-600' : 'bg-blue-500'}`}>
                <PlusCircle size={30} color="white" />
            </View>
          ),
          tabBarLabel: () => null, // Esconde o texto para dar destaque ao ícone
        }}
      />

      <Tabs.Screen
        name="notas"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ color }) => <FileText size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}