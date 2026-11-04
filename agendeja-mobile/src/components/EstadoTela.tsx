import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePreferencias } from '../contexts/PreferenciasContext';
import Botao from './Botao';

interface EstadoTelaProps {
  icone?: keyof typeof Ionicons.glyphMap;
  texto: string;
  subtexto?: string;
  carregando?: boolean;
  acao?: {
    titulo: string;
    onPress: () => void;
  };
}

export default function EstadoTela({
  icone,
  texto,
  subtexto,
  carregando = false,
  acao,
}: EstadoTelaProps) {
  const { cores } = usePreferencias();

  return (
    <View style={styles.container}>
      {carregando ? (
        <ActivityIndicator size="large" color={cores.destaque} />
      ) : icone ? (
        <Ionicons name={icone} size={48} color={cores.textoTerciario} />
      ) : null}

      <Text style={[styles.texto, { color: cores.textoPrimario }]}>{texto}</Text>

      {subtexto ? (
        <Text style={[styles.subtexto, { color: cores.textoSecundario }]}>{subtexto}</Text>
      ) : null}

      {acao && !carregando ? (
        <Botao
          titulo={acao.titulo}
          onPress={acao.onPress}
          variante="primario"
          style={styles.botao}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    gap: 12,
    width: '100%',
  },
  texto: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtexto: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 400,
  },
  botao: {
    marginTop: 8,
  },
});
