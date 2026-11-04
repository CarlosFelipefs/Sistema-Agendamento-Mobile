import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { usePreferencias } from '../contexts/PreferenciasContext';

export interface AbaItem {
  id: string;
  titulo: string;
}

interface SeletorAbasProps {
  abas: AbaItem[];
  ativa: string;
  aoMudar: (id: string) => void;
}

export default function SeletorAbas({ abas, ativa, aoMudar }: SeletorAbasProps) {
  const { cores } = usePreferencias();

  return (
    <View style={[styles.container, { borderBottomColor: cores.borda }]}>
      {abas.map((aba) => {
        const estaAtiva = aba.id === ativa;
        return (
          <Pressable
            key={aba.id}
            onPress={() => aoMudar(aba.id)}
            style={[
              styles.aba,
              estaAtiva && [styles.abaAtiva, { borderBottomColor: cores.destaque }],
            ]}
          >
            <Text
              style={[
                styles.titulo,
                {
                  color: estaAtiva ? cores.destaque : cores.textoSecundario,
                  fontWeight: estaAtiva ? '700' : '500',
                },
              ]}
            >
              {aba.titulo}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: 16,
    width: '100%',
  },
  aba: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  abaAtiva: {
    borderBottomWidth: 2,
    marginBottom: -1,
  },
  titulo: {
    fontSize: 15,
  },
});
