import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Empresa } from '../types/empresa';
import { usePreferencias } from '../contexts/PreferenciasContext';
import { Ionicons } from '@expo/vector-icons';
import { formatarDistancia } from '../utils/formatadores';

interface EmpresaCardProps {
  empresa: Empresa;
  onPress: () => void;
  telaGrande?: boolean;
}

export default function EmpresaCard({ empresa, onPress, telaGrande }: EmpresaCardProps) {
  const { cores } = usePreferencias();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        telaGrande && styles.cardGrande,
        {
          backgroundColor: cores.cartao,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.fotoPlaceholder,
          { backgroundColor: cores.superficie, borderColor: cores.bordaImagem },
        ]}
      >
        <Ionicons name="business" size={24} color={cores.textoTerciario} />
      </View>

      <View style={styles.conteudo}>
        <Text style={[styles.nome, { color: cores.textoPrimario }]} numberOfLines={1}>
          {empresa.nome}
        </Text>
        <Text style={[styles.endereco, { color: cores.textoSecundario }]} numberOfLines={1}>
          {empresa.endereco}
        </Text>
        {empresa.distancia !== undefined && (
          <Text style={[styles.distancia, { color: cores.textoTerciario }]}>
            📍 {formatarDistancia(empresa.distancia)}
          </Text>
        )}
      </View>

      <Text style={[styles.seta, { color: cores.sucesso }]}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    minHeight: 44,
  },
  cardGrande: {
    width: '48%',
  },
  fotoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  conteudo: {
    flex: 1,
    gap: 4,
  },
  nome: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  endereco: {
    fontSize: 14,
  },
  distancia: {
    fontSize: 12,
  },
  seta: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
