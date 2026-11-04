import { Alert, Platform } from 'react-native';

export interface OpcoesConfirmar {
  confirmar?: string;
  cancelar?: string;
  destrutivo?: boolean;
}

export function mostrarMensagem(titulo: string, mensagem?: string): Promise<void> {
  return new Promise((resolve) => {
    if (Platform.OS === 'web') {
      const texto = mensagem ? `${titulo}\n\n${mensagem}` : titulo;
      window.alert(texto);
      resolve();
    } else {
      Alert.alert(titulo, mensagem, [{ text: 'OK', onPress: () => resolve() }], {
        cancelable: true,
        onDismiss: () => resolve(),
      });
    }
  });
}

export function confirmar(
  titulo: string,
  mensagem?: string,
  opcoes?: OpcoesConfirmar
): Promise<boolean> {
  const textoConfirmar = opcoes?.confirmar ?? 'OK';
  const textoCancelar = opcoes?.cancelar ?? 'Cancelar';

  return new Promise((resolve) => {
    if (Platform.OS === 'web') {
      const texto = mensagem ? `${titulo}\n\n${mensagem}` : titulo;
      const resultado = window.confirm(texto);
      resolve(resultado);
    } else {
      Alert.alert(
        titulo,
        mensagem,
        [
          {
            text: textoCancelar,
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: textoConfirmar,
            style: opcoes?.destrutivo ? 'destructive' : 'default',
            onPress: () => resolve(true),
          },
        ],
        {
          cancelable: true,
          onDismiss: () => resolve(false),
        }
      );
    }
  });
}
