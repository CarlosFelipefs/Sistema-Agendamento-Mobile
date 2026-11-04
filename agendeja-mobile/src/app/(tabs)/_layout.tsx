import { Tabs } from 'expo-router';
import { usePreferencias } from '../../contexts/PreferenciasContext';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';

export default function TabsLayout() {
  const { cores, idioma } = usePreferencias();

  return (
    <Tabs
      screenOptions={{
        header: () => <Header />,
        tabBarStyle: {
          backgroundColor: cores.fundoBarra,
          borderTopColor: cores.borda,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: cores.destaque,
        tabBarInactiveTintColor: cores.textoSecundario,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: idioma === 'br' ? 'Início' : 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="buscar"
        options={{
          title: idioma === 'br' ? 'Buscar' : 'Search',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="agendamentos"
        options={{
          title: idioma === 'br' ? 'Agendar' : 'Book',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
