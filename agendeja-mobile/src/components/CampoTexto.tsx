import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { usePreferencias } from '../contexts/PreferenciasContext';

interface CampoTextoProps extends Omit<TextInputProps, 'onChangeText' | 'value'> {
  rotulo: string;
  valor: string;
  aoMudar: (texto: string) => void;
  erro?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export default function CampoTexto({
  rotulo,
  valor,
  aoMudar,
  erro,
  containerStyle,
  ...propsRestantes
}: CampoTextoProps) {
  const { cores } = usePreferencias();

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.rotulo, { color: cores.textoPrimario }]}>{rotulo}</Text>
      <TextInput
        value={valor}
        onChangeText={aoMudar}
        placeholderTextColor={cores.textoTerciario}
        style={[
          styles.input,
          {
            backgroundColor: cores.superficie,
            color: cores.textoPrimario,
            borderColor: erro ? cores.perigo : cores.borda,
          },
        ]}
        {...propsRestantes}
      />
      {erro ? <Text style={[styles.erro, { color: cores.perigo }]}>{erro}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  rotulo: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  erro: {
    fontSize: 12,
    marginTop: 4,
  },
});
