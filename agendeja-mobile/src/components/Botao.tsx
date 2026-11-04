import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { usePreferencias } from '../contexts/PreferenciasContext';

export type VarianteBotao = 'primario' | 'secundario' | 'perigo' | 'alerta';

interface BotaoProps {
  titulo: string;
  onPress: () => void;
  variante?: VarianteBotao;
  carregando?: boolean;
  desabilitado?: boolean;
  style?: StyleProp<ViewStyle>;
  textoStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

export default function Botao({
  titulo,
  onPress,
  variante = 'primario',
  carregando = false,
  desabilitado = false,
  style,
  textoStyle,
  accessibilityLabel,
}: BotaoProps) {
  const { cores } = usePreferencias();

  const obterEstiloFundo = (pressed: boolean) => {
    if (desabilitado) {
      return { backgroundColor: cores.borda, opacity: 0.6 };
    }

    switch (variante) {
      case 'secundario':
        return {
          backgroundColor: pressed ? cores.botaoIconePressionado : cores.botaoIcone,
          borderWidth: 1,
          borderColor: cores.borda,
        };
      case 'perigo':
        return {
          backgroundColor: pressed ? '#B91C1C' : cores.perigo,
        };
      case 'alerta':
        return {
          backgroundColor: pressed ? '#D97706' : cores.alerta,
        };
      case 'primario':
      default:
        return {
          backgroundColor: pressed ? cores.destaqueFoco : cores.destaque,
        };
    }
  };

  const obterCorTexto = () => {
    if (desabilitado) {
      return cores.textoTerciario;
    }
    if (variante === 'secundario') {
      return cores.textoPrimario;
    }
    return '#FFFFFF';
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={desabilitado || carregando}
      accessibilityLabel={accessibilityLabel || titulo}
      accessibilityRole="button"
      accessibilityState={{ disabled: desabilitado || carregando }}
      style={({ pressed }) => [
        styles.botao,
        obterEstiloFundo(pressed),
        style,
      ]}
    >
      {carregando ? (
        <ActivityIndicator size="small" color={obterCorTexto()} />
      ) : (
        <Text style={[styles.texto, { color: obterCorTexto() }, textoStyle]}>
          {titulo}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    minHeight: 44,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  texto: {
    fontSize: 16,
    fontWeight: '600',
  },
});
