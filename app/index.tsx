import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center bg-slate-50">
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );
}