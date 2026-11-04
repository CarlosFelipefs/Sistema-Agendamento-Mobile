import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePreferencias } from '../contexts/PreferenciasContext';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { clienteService } from '../services/clienteService';
import Botao from '../components/Botao';
import CampoTexto from '../components/CampoTexto';

export default function LoginScreen() {
  const router = useRouter();
  const { cores, t } = usePreferencias();
  const { entrar } = useAuth();

  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleLogin = async () => {
    setErro(null);

    const userLimpo = usuario.trim();
    if (!userLimpo || !senha) {
      setErro(t('Preencha usuário e senha.', 'Fill in both username and password.'));
      return;
    }

    setCarregando(true);
    try {
      const resposta = await authService.fazerLogin(userLimpo, senha);

      // Tenta buscar o cliente para obter o nome real, caso falhe usa o nome de usuário retornado
      let nomeExibicao = resposta.user || userLimpo;
      if (resposta.clienteId) {
        try {
          const cliente = await clienteService.buscarCliente(resposta.clienteId);
          if (cliente?.nome) {
            nomeExibicao = cliente.nome;
          }
        } catch {
          // Mantém nome original do usuário
        }
      }

      await entrar({
        token: resposta.access_token,
        nomeUsuario: nomeExibicao,
        clienteId: resposta.clienteId,
      });

      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    } catch (err: any) {
      setErro(err?.mensagem || t('Usuário ou senha incorretos.', 'Invalid username or password.'));
    } finally {
      setCarregando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: cores.fundo }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.cardWrapper}>
          <Text style={[styles.titulo, { color: cores.textoPrimario }]}>
            {t('Acessar Conta', 'Sign In')}
          </Text>
          <Text style={[styles.subtitulo, { color: cores.textoSecundario }]}>
            {t(
              'Entre com seu usuário e senha para continuar.',
              'Enter your credentials to continue.'
            )}
          </Text>

          {erro ? (
            <View style={[styles.erroBox, { backgroundColor: cores.superficie, borderColor: cores.perigo }]}>
              <Text style={[styles.erroTexto, { color: cores.perigo }]}>{erro}</Text>
            </View>
          ) : null}

          <CampoTexto
            rotulo={t('Usuário', 'Username')}
            valor={usuario}
            aoMudar={setUsuario}
            placeholder={t('Seu usuário', 'Your username')}
            autoCapitalize="none"
          />

          <CampoTexto
            rotulo={t('Senha', 'Password')}
            valor={senha}
            aoMudar={setSenha}
            placeholder={t('Sua senha', 'Your password')}
            secureTextEntry
            autoCapitalize="none"
          />

          <Botao
            titulo={t('Entrar', 'Sign In')}
            onPress={handleLogin}
            carregando={carregando}
            variante="primario"
            style={styles.botaoEntrar}
          />

          <View style={styles.rodape}>
            <Text style={[styles.textoRodape, { color: cores.textoSecundario }]}>
              {t('Não possui uma conta?', "Don't have an account?")}{' '}
            </Text>
            <Pressable onPress={() => router.push('/cadastro')} hitSlop={10}>
              <Text style={[styles.linkCadastro, { color: cores.destaque }]}>
                {t('Cadastre-se', 'Sign Up')}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  cardWrapper: {
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  subtitulo: {
    fontSize: 14,
    marginBottom: 24,
  },
  erroBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  erroTexto: {
    fontSize: 14,
  },
  botaoEntrar: {
    marginTop: 8,
    marginBottom: 20,
  },
  rodape: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  textoRodape: {
    fontSize: 14,
  },
  linkCadastro: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
