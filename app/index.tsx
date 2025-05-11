import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { session } = useAuth();
  return <Redirect href={session ? '/(tabs)' : '/login'} />;
}