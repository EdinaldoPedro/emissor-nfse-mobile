import { Tabs } from 'expo-router';
import { Home, PlusCircle, FileText, User, Menu } from 'lucide-react-native';
import { View, Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Removemos o cabeçalho padrão de todas as telas
        tabBarActiveTintColor: '#2563eb', // Azul 600
        tabBarInactiveTintColor: '#94a3b8', // Slate 400
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 5, // Sombra no Android
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
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
          tabBarIcon: ({ color, focused }) => (
            <View className={`items-center justify-center -mt-4 p-3 rounded-full shadow-lg ${focused ? 'bg-blue-600' : 'bg-blue-500'}`}>
                <PlusCircle size={30} color="white" />
            </View>
          ),
          tabBarLabel: () => null, // Esconde o texto "Emitir" para dar destaque ao ícone
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