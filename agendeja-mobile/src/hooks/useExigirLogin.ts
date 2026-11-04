import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export function useExigirLogin() {
  const { logado, carregando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!carregando && !logado) {
      router.replace('/login');
    }
  }, [logado, carregando, router]);

  return { logado, carregando };
}
