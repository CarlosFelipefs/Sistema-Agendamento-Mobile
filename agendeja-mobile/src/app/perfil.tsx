import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { usePreferencias } from '../contexts/PreferenciasContext';
import { useAuth } from '../contexts/AuthContext';
import { useExigirLogin } from '../hooks/useExigirLogin';
import { clienteService } from '../services/clienteService';
import { authService } from '../services/authService';
import { mostrarMensagem } from '../utils/dialogos';
import SeletorAbas from '../components/SeletorAbas';
import CampoTexto from '../components/CampoTexto';
import Botao from '../components/Botao';
import EstadoTela from '../components/EstadoTela';

type AbaPerfil = 'dados' | 'seguranca';

export default function PerfilScreen() {
  const { cores, t } = usePreferencias();
  const { clienteId, userId } = useAuth();
  const { logado, carregando: checandoAuth } = useExigirLogin();

  const [abaAtiva, setAbaAtiva] = useState<AbaPerfil>('dados');

  // Estado Meus Dados
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [salvandoDados, setSalvandoDados] = useState(false);
  const [erroDados, setErroDados] = useState<string | null>(null);

  // Estado Segurança
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [salvandoSeguranca, setSalvandoSeguranca] = useState(false);
  const [erroSeguranca, setErroSeguranca] = useState<string | null>(null);

  const carregarPerfil = useCallback(async () => {
    if (!clienteId) {
      setCarregandoDados(false);
      return;
    }

    setCarregandoDados(true);
    setErroDados(null);

    try {
      const cliente = await clienteService.buscarCliente(clienteId);
      setNome(cliente.nome || '');
      setEmail(cliente.email || '');
      setTelefone(cliente.telefone || '');
    } catch {
      setErroDados(t('Não foi possível carregar seu perfil.', 'Unable to load your profile.'));
    } finally {
      setCarregandoDados(false);
    }
  }, [clienteId, t]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (logado) {
      carregarPerfil();
    }
  }, [logado, carregarPerfil]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSalvarMeusDados = async () => {
    if (!clienteId) return;

    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim();
    const telLimpo = telefone.trim();

    if (!nomeLimpo || nomeLimpo.length > 150) {
      setErroDados(t('Nome é obrigatório (máximo 150 caracteres).', 'Name is required (max 150 characters).'));
      return;
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailLimpo || !regexEmail.test(emailLimpo)) {
      setErroDados(t('E-mail inválido.', 'Invalid email address.'));
      return;
    }

    if (!telLimpo) {
      setErroDados(t('Telefone é obrigatório.', 'Phone number is required.'));
      return;
    }

    setSalvandoDados(true);
    setErroDados(null);

    try {
      await clienteService.atualizarCliente({
        id: clienteId,
        nome: nomeLimpo,
        email: emailLimpo,
        telefone: telLimpo,
      });

      await mostrarMensagem(
        t('Sucesso!', 'Success!'),
        t('Dados atualizados com sucesso!', 'Profile updated successfully!')
      );
    } catch (err: any) {
      setErroDados(err?.mensagem || t('Não foi possível salvar os dados.', 'Unable to save profile.'));
    } finally {
      setSalvandoDados(false);
    }
  };

  const handleAlterarSenha = async () => {
    if (!userId) {
      setErroSeguranca(t('Identificador de usuário não encontrado.', 'User identifier not found.'));
      return;
    }

    if (!senhaAtual || !novaSenha || !confirmarNovaSenha) {
      setErroSeguranca(t('Preencha todos os campos de senha.', 'Fill in all password fields.'));
      return;
    }

    if (novaSenha.length < 6) {
      setErroSeguranca(t('A nova senha deve ter pelo menos 6 caracteres.', 'New password must be at least 6 characters.'));
      return;
    }

    if (novaSenha !== confirmarNovaSenha) {
      setErroSeguranca(t('A nova senha e a confirmação não coincidem.', 'Passwords do not match.'));
      return;
    }

    setSalvandoSeguranca(true);
    setErroSeguranca(null);

    try {
      const respTexto = await authService.alterarSenha({
        userId,
        senhaAtual,
        novaSenha,
      });

      await mostrarMensagem(
        t('Sucesso!', 'Success!'),
        respTexto || t('Senha alterada com sucesso!', 'Password changed successfully!')
      );

      // Limpa os campos no sucesso
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarNovaSenha('');
    } catch (err: any) {
      setErroSeguranca(
        err?.mensagem || t('Não foi possível alterar a senha.', 'Unable to change password.')
      );
    } finally {
      setSalvandoSeguranca(false);
    }
  };

  if (checandoAuth || !logado) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: cores.fundo }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.conteudo}>
          <Text style={[styles.titulo, { color: cores.textoPrimario }]}>
            {t('Meu Perfil', 'My Profile')}
          </Text>

          <SeletorAbas
            abas={[
              { id: 'dados', titulo: t('Meus Dados', 'My Info') },
              { id: 'seguranca', titulo: t('Segurança', 'Security') },
            ]}
            ativa={abaAtiva}
            aoMudar={(idAba) => setAbaAtiva(idAba as AbaPerfil)}
          />

          {abaAtiva === 'dados' ? (
            carregandoDados ? (
              <View style={styles.carregandoContainer}>
                <ActivityIndicator size="large" color={cores.destaque} />
                <Text style={[styles.carregandoTexto, { color: cores.textoSecundario }]}>
                  {t('Carregando perfil...', 'Loading profile...')}
                </Text>
              </View>
            ) : erroDados && !nome ? (
              <EstadoTela
                icone="alert-circle-outline"
                texto={erroDados}
                acao={{
                  titulo: t('Tentar novamente', 'Try again'),
                  onPress: carregarPerfil,
                }}
              />
            ) : (
              <View style={styles.formulario}>
                {erroDados ? (
                  <View style={[styles.erroBox, { backgroundColor: cores.superficie, borderColor: cores.perigo }]}>
                    <Text style={[styles.erroTexto, { color: cores.perigo }]}>{erroDados}</Text>
                  </View>
                ) : null}

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

                <Botao
                  titulo={t('Salvar Dados', 'Save Info')}
                  onPress={handleSalvarMeusDados}
                  carregando={salvandoDados}
                  variante="primario"
                  style={styles.botaoAcao}
                />
              </View>
            )
          ) : (
            <View style={styles.formulario}>
              {erroSeguranca ? (
                <View style={[styles.erroBox, { backgroundColor: cores.superficie, borderColor: cores.perigo }]}>
                  <Text style={[styles.erroTexto, { color: cores.perigo }]}>{erroSeguranca}</Text>
                </View>
              ) : null}

              <CampoTexto
                rotulo={t('Senha Atual', 'Current Password')}
                valor={senhaAtual}
                aoMudar={setSenhaAtual}
                placeholder={t('Sua senha atual', 'Your current password')}
                secureTextEntry
                autoCapitalize="none"
              />

              <CampoTexto
                rotulo={t('Nova Senha', 'New Password')}
                valor={novaSenha}
                aoMudar={setNovaSenha}
                placeholder={t('Mínimo 6 caracteres', 'At least 6 characters')}
                secureTextEntry
                autoCapitalize="none"
              />

              <CampoTexto
                rotulo={t('Confirmar Nova Senha', 'Confirm New Password')}
                valor={confirmarNovaSenha}
                aoMudar={setConfirmarNovaSenha}
                placeholder={t('Repita a nova senha', 'Repeat new password')}
                secureTextEntry
                autoCapitalize="none"
              />

              <Botao
                titulo={t('Alterar Senha', 'Change Password')}
                onPress={handleAlterarSenha}
                carregando={salvandoSeguranca}
                variante="primario"
                style={styles.botaoAcao}
              />
            </View>
          )}
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
    padding: 16,
  },
  conteudo: {
    maxWidth: 550,
    width: '100%',
    alignSelf: 'center',
    gap: 16,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  formulario: {
    gap: 4,
  },
  carregandoContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  carregandoTexto: {
    fontSize: 14,
  },
  botaoAcao: {
    marginTop: 12,
    marginBottom: 20,
  },
  erroBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  erroTexto: {
    fontSize: 14,
  },
});
