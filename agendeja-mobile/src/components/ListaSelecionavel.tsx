import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { usePreferencias } from '../contexts/PreferenciasContext';

interface ItemComId {
  id: number | string;
}

interface ListaSelecionavelProps<T extends ItemComId> {
  itens: T[];
  selecionadoId?: number | string | null;
  aoSelecionar: (item: T) => void;
  renderItem: (item: T, selecionado: boolean) => React.ReactNode;
}

export default function ListaSelecionavel<T extends ItemComId>({
  itens,
  selecionadoId,
  aoSelecionar,
  renderItem,
}: ListaSelecionavelProps<T>) {
  const { cores } = usePreferencias();

  return (
    <View style={styles.container}>
      {itens.map((item) => {
        const selecionado = item.id === selecionadoId;
        return (
          <Pressable
            key={item.id.toString()}
            onPress={() => aoSelecionar(item)}
            style={({ pressed }) => [
              styles.itemContainer,
              {
                backgroundColor: selecionado
                  ? cores.superficie
                  : pressed
                  ? cores.cartao
                  : cores.cartao,
                borderColor: selecionado ? cores.destaque : cores.borda,
                borderWidth: selecionado ? 2 : 1,
              },
            ]}
          >
            {renderItem(item, selecionado)}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    width: '100%',
  },
  itemContainer: {
    borderRadius: 8,
    padding: 14,
    minHeight: 44,
    justifyContent: 'center',
  },
});
