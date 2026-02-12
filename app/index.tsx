import { Redirect } from 'expo-router';

export default function Index() {
  // Se o usuário cair aqui, mandamos direto para as abas
  return <Redirect href="/(tabs)" />;
}