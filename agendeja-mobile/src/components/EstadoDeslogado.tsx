import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePreferencias } from '../contexts/PreferenciasContext';
import Botao from './Botao';

interface EstadoDeslogadoProps {
  mensagem?: string;
}

export default function EstadoDeslogado({ mensagem }: EstadoDeslogadoProps) {
  const router = useRouter();
  const { cores, t } = usePreferencias();

  return (
    <View style={styles.container}>
      <Ionicons name="lock-closed-outline" size={56} color={cores.destaque} />
      <Text style={[styles.titulo, { color: cores.textoPrimario }]}>
        {t('Faça login para continuar', 'Sign in to continue')}
      </Text>
      <Text style={[styles.descricao, { color: cores.textoSecundario }]}>
        {mensagem ||
          t(
            'Agende e pague online, acompanhe seus compromissos e muito mais.',
            'Schedule and track your appointments online and much more.'
          )}
      </Text>
      <Botao
        titulo={t('Acessar', 'Sign in')}
        onPress={() => router.push('/login')}
        variante="primario"
        style={styles.botao}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 12,
  },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  descricao: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 20,
  },
  botao: {
    marginTop: 8,
    minWidth: 160,
  },
});
