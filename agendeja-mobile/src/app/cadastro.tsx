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
import { authService } from '../services/authService';
import { mostrarMensagem } from '../utils/dialogos';
import Botao from '../components/Botao';
import CampoTexto from '../components/CampoTexto';

export default function CadastroScreen() {
  const router = useRouter();
  const { cores, t } = usePreferencias();

  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const validarFormulario = (): string | null => {
    if (!usuario.trim() || usuario.trim().length < 3) {
      return t(
        'O usuário deve ter pelo menos 3 caracteres.',
        'Username must be at least 3 characters long.'
      );
    }
    if (!senha || senha.length < 6) {
      return t(
        'A senha deve ter pelo menos 6 caracteres.',
        'Password must be at least 6 characters long.'
      );
    }
    if (senha !== confirmarSenha) {
      return t('As senhas não coincidem.', 'Passwords do not match.');
    }
    if (!nome.trim()) {
      return t('O nome é obrigatório.', 'Full name is required.');
    }
    const emailLimpo = email.trim();
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailLimpo || !regexEmail.test(emailLimpo)) {
      return t(
        'Informe um endereço de e-mail válido.',
        'Please enter a valid email address.'
      );
    }
    if (!telefone.trim()) {
      return t('O telefone é obrigatório.', 'Phone number is required.');
    }
    return null;
  };

  const handleCadastro = async () => {
    setErro(null);
    const validacaoErro = validarFormulario();
    if (validacaoErro) {
      setErro(validacaoErro);
      return;
    }

    setCarregando(true);
    try {
      await authService.cadastrarUsuario({
        user: usuario.trim(),
        senha,
        confirmarSenha,
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
      });

      await mostrarMensagem(
        t('Sucesso!', 'Success!'),
        t('Cadastro realizado com sucesso!', 'Registration completed successfully!')
      );

      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/login');
      }
    } catch (err: any) {
      setErro(
        err?.mensagem ||
          t('Não foi possível realizar o cadastro.', 'Unable to complete registration.')
      );
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
            {t('Criar Conta', 'Create Account')}
          </Text>
          <Text style={[styles.subtitulo, { color: cores.textoSecundario }]}>
            {t(
              'Preencha os dados abaixo para se cadastrar.',
              'Fill in the fields below to sign up.'
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
            placeholder={t('Mínimo 3 caracteres', 'At least 3 characters')}
            autoCapitalize="none"
          />

          <CampoTexto
            rotulo={t('Nome Completo', 'Full Name')}
            valor={nome}
            aoMudar={setNome}
            placeholder={t('Seu nome completo', 'Your full name')}
          />

          <CampoTexto
            rotulo={t('E-mail', 'Email')}
            valor={email}
            aoMudar={setEmail}
            placeholder="exemplo@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <CampoTexto
            rotulo={t('Telefone', 'Phone')}
            valor={telefone}
            aoMudar={setTelefone}
            placeholder="(00) 00000-0000"
            keyboardType="phone-pad"
          />

          <CampoTexto
            rotulo={t('Senha', 'Password')}
            valor={senha}
            aoMudar={setSenha}
            placeholder={t('Mínimo 6 caracteres', 'At least 6 characters')}
            secureTextEntry
            autoCapitalize="none"
          />

          <CampoTexto
            rotulo={t('Confirmar Senha', 'Confirm Password')}
            valor={confirmarSenha}
            aoMudar={setConfirmarSenha}
            placeholder={t('Repita a senha', 'Repeat password')}
            secureTextEntry
            autoCapitalize="none"
          />

          <Botao
            titulo={t('Cadastrar', 'Sign Up')}
            onPress={handleCadastro}
            carregando={carregando}
            variante="primario"
            style={styles.botaoCadastrar}
          />

          <View style={styles.rodape}>
            <Text style={[styles.textoRodape, { color: cores.textoSecundario }]}>
              {t('Já possui uma conta?', 'Already have an account?')}{' '}
            </Text>
            <Pressable onPress={() => router.push('/login')} hitSlop={10}>
              <Text style={[styles.linkLogin, { color: cores.destaque }]}>
                {t('Entrar', 'Sign In')}
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
    padding: 20,
    paddingTop: 10,
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
    marginBottom: 20,
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
  botaoCadastrar: {
    marginTop: 8,
    marginBottom: 20,
  },
  rodape: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 20,
  },
  textoRodape: {
    fontSize: 14,
  },
  linkLogin: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
