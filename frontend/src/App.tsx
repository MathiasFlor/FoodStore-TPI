import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { AppRouter } from '@/routes/AppRouter';

export default function App() {
  const checkSession = useAuthStore((state) => state.checkSession);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  return <AppRouter />;
}