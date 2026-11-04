import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { PreferenciasProvider, usePreferencias } from '../contexts/PreferenciasContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootLayoutNav() {
  const { tema, cores, t, carregando: carregandoPref } = usePreferencias();
  const { carregando: carregandoAuth } = useAuth();

  useEffect(() => {
    if (!carregandoPref && !carregandoAuth) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [carregandoPref, carregandoAuth]);

  if (carregandoPref || carregandoAuth) {
    return null;
  }

  return (
    <>
      <StatusBar style={tema === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: cores.fundoBarra,
          },
          headerTintColor: cores.textoPrimario,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: cores.fundo,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="login"
          options={{
            headerShown: true,
            title: t('Entrar', 'Sign In'),
          }}
        />
        <Stack.Screen
          name="cadastro"
          options={{
            headerShown: true,
            title: t('Criar Conta', 'Sign Up'),
          }}
        />
        <Stack.Screen
          name="perfil"
          options={{
            headerShown: true,
            title: t('Meu Perfil', 'My Profile'),
          }}
        />
        <Stack.Screen
          name="empresa/[id]"
          options={{
            headerShown: true,
            title: t('Detalhes da Empresa', 'Business Details'),
          }}
        />
        <Stack.Screen
          name="agendar/[empresaId]"
          options={{
            headerShown: true,
            title: t('Novo Agendamento', 'New Appointment'),
          }}
        />
        <Stack.Screen
          name="agendamento/[id]"
          options={{
            headerShown: true,
            title: t('Alterar Agendamento', 'Edit Appointment'),
          }}
        />
        <Stack.Screen
          name="gestor/index"
          options={{
            headerShown: true,
            title: t('Cadastrar Empresa', 'Register Business'),
          }}
        />
        <Stack.Screen
          name="gestor/empresas"
          options={{
            headerShown: true,
            title: t('Empresas Cadastradas', 'Registered Businesses'),
          }}
        />
        <Stack.Screen
          name="gestor/empresa/[id]"
          options={{
            headerShown: true,
            title: t('Gerenciar Empresa', 'Manage Business'),
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PreferenciasProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </PreferenciasProvider>
    </SafeAreaProvider>
  );
}
