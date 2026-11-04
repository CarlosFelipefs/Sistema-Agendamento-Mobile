import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Modal,
  Pressable,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePreferencias } from '../../contexts/PreferenciasContext';
import { useAuth } from '../../contexts/AuthContext';
import { agendamentoService } from '../../services/agendamentoService';
import { Agendamento } from '../../types/agendamento';
import { formatarDataHora } from '../../utils/datas';
import { confirmar, mostrarMensagem } from '../../utils/dialogos';
import AgendamentoCard from '../../components/AgendamentoCard';
import EstadoDeslogado from '../../components/EstadoDeslogado';
import EstadoTela from '../../components/EstadoTela';
import Botao from '../../components/Botao';
import Footer from '../../components/Footer';

export default function AgendamentosScreen() {
  const router = useRouter();
  const { cores, t } = usePreferencias();
  const { logado, carregando: checandoAuth } = useAuth();

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [recarregando, setRecarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState<Agendamento | null>(null);

  const carregarAgendamentos = useCallback(async (isRefresh = false) => {
    if (!logado) return;

    if (isRefresh) {
      setRecarregando(true);
    } else {
      setCarregando(true);
    }
    setErro(null);

    try {
      const dados = await agendamentoService.listarMeus();
      setAgendamentos(dados);
    } catch (err: any) {
      setErro(
        err?.mensagem ||
          t('Não foi possível carregar os agendamentos.', 'Unable to load appointments.')
      );
    } finally {
      setCarregando(false);
      setRecarregando(false);
    }
  }, [logado, t]);

  useFocusEffect(
    useCallback(() => {
      if (logado) {
        carregarAgendamentos();
      }
    }, [logado, carregarAgendamentos])
  );

  const handleCancelar = async (agendamento: Agendamento) => {
    const querCancelar = await confirmar(
      t('Cancelar agendamento?', 'Cancel appointment?'),
      t(
        'Essa ação não pode ser desfeita e liberará o horário.',
        'This action cannot be undone and will release the time slot.'
      ),
      {
        confirmar: t('Sim, cancelar', 'Yes, cancel'),
        cancelar: t('Não', 'No'),
        destrutivo: true,
      }
    );

    if (!querCancelar) return;

    try {
      await agendamentoService.cancelar(agendamento.id);
      setAgendamentos((lista) => lista.filter((item) => item.id !== agendamento.id));
      await mostrarMensagem(
        t('Cancelado', 'Cancelled'),
        t('Agendamento cancelado com sucesso.', 'Appointment cancelled successfully.')
      );
    } catch {
      await mostrarMensagem(
        t('Erro', 'Error'),
        t('Não foi possível cancelar o agendamento.', 'Could not cancel appointment.')
      );
    }
  };

  const handleVerDetalhes = (agendamento: Agendamento) => {
    setAgendamentoSelecionado(agendamento);
    setModalDetalhesAberto(true);
  };

  const handleAlterar = (agendamento: Agendamento) => {
    router.push({
      pathname: '/agendamento/[id]',
      params: { id: agendamento.id },
    });
  };

  if (checandoAuth) {
    return null;
  }

  if (!logado) {
    return (
      <View style={[styles.container, { backgroundColor: cores.fundo }]}>
        <EstadoDeslogado />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: cores.fundo }]}>
      <FlatList
        data={agendamentos}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={recarregando}
            onRefresh={() => carregarAgendamentos(true)}
            colors={[cores.destaque]}
            tintColor={cores.destaque}
          />
        }
        ListHeaderComponent={
          <View style={styles.cabecalho}>
            <View style={styles.topoLinha}>
              <Text style={[styles.titulo, { color: cores.textoPrimario }]}>
                {t('Meus Agendamentos', 'My Appointments')}
              </Text>
              <Botao
                titulo={t('+ Novo', '+ New')}
                onPress={() => router.push('/buscar')}
                variante="secundario"
                style={styles.botaoNovo}
              />
            </View>
            <Text style={[styles.subtitulo, { color: cores.textoSecundario }]}>
              {t(
                'Acompanhe seus horários agendados e gerencie seus compromissos.',
                'Keep track of your scheduled times and manage your appointments.'
              )}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <AgendamentoCard
            agendamento={item}
            aoVerDetalhes={() => handleVerDetalhes(item)}
            aoAlterar={() => handleAlterar(item)}
            aoCancelar={() => handleCancelar(item)}
          />
        )}
        ListEmptyComponent={
          carregando ? (
            <EstadoTela
              carregando
              texto={t('Carregando seus agendamentos...', 'Loading your appointments...')}
            />
          ) : erro ? (
            <EstadoTela
              icone="alert-circle-outline"
              texto={erro}
              acao={{
                titulo: t('Tentar novamente', 'Try again'),
                onPress: () => carregarAgendamentos(),
              }}
            />
          ) : (
            <EstadoTela
              icone="calendar-outline"
              texto={t('Nenhum agendamento encontrado', 'No appointments found')}
              subtexto={t(
                'Você ainda não possui horários agendados. Encontre um estabelecimento e agende agora!',
                'You have no appointments yet. Find a business and book now!'
              )}
              acao={{
                titulo: t('Fazer novo agendamento', 'Book new appointment'),
                onPress: () => router.push('/buscar'),
              }}
            />
          )
        }
        ListFooterComponent={<Footer />}
      />

      {/* Modal de Detalhes do Agendamento */}
      <Modal
        visible={modalDetalhesAberto}
        transparent
        animationType="fade"
        onRequestClose={() => setModalDetalhesAberto(false)}
      >
        <Pressable style={styles.modalFundo} onPress={() => setModalDetalhesAberto(false)}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: cores.cartao, borderColor: cores.borda },
            ]}
          >
            <View style={styles.modalCabecalho}>
              <Text style={[styles.modalTitulo, { color: cores.textoPrimario }]}>
                {t('Detalhes do Agendamento', 'Appointment Details')}
              </Text>
              <Pressable onPress={() => setModalDetalhesAberto(false)} hitSlop={10}>
                <Ionicons name="close" size={24} color={cores.textoSecundario} />
              </Pressable>
            </View>

            {agendamentoSelecionado && (
              <View style={styles.modalCorpo}>
                <View style={styles.detalheLinha}>
                  <Text style={[styles.detalheRotulo, { color: cores.textoSecundario }]}>
                    {t('Serviço', 'Service')}:
                  </Text>
                  <Text style={[styles.detalheValor, { color: cores.textoPrimario }]}>
                    {agendamentoSelecionado.servicoNome || '-'}
                  </Text>
                </View>

                <View style={styles.detalheLinha}>
                  <Text style={[styles.detalheRotulo, { color: cores.textoSecundario }]}>
                    {t('Estabelecimento', 'Business')}:
                  </Text>
                  <Text style={[styles.detalheValor, { color: cores.textoPrimario }]}>
                    {agendamentoSelecionado.empresaNome || '-'}
                  </Text>
                </View>

                <View style={styles.detalheLinha}>
                  <Text style={[styles.detalheRotulo, { color: cores.textoSecundario }]}>
                    {t('Profissional', 'Staff')}:
                  </Text>
                  <Text style={[styles.detalheValor, { color: cores.textoPrimario }]}>
                    {agendamentoSelecionado.profissionalNome || '-'}
                  </Text>
                </View>

                <View style={styles.detalheLinha}>
                  <Text style={[styles.detalheRotulo, { color: cores.textoSecundario }]}>
                    {t('Data e Hora', 'Date & Time')}:
                  </Text>
                  <Text style={[styles.detalheValor, { color: cores.textoPrimario }]}>
                    {formatarDataHora(agendamentoSelecionado.dataHora)}
                  </Text>
                </View>

                <View style={styles.detalheLinha}>
                  <Text style={[styles.detalheRotulo, { color: cores.textoSecundario }]}>
                    {t('Status', 'Status')}:
                  </Text>
                  <Text style={[styles.detalheValor, { color: cores.destaque }]}>
                    {agendamentoSelecionado.status}
                  </Text>
                </View>
              </View>
            )}

            <Botao
              titulo={t('Fechar', 'Close')}
              onPress={() => setModalDetalhesAberto(false)}
              variante="secundario"
              style={styles.modalBotaoFechar}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  cabecalho: {
    marginBottom: 20,
    gap: 6,
  },
  topoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitulo: {
    fontSize: 14,
  },
  botaoNovo: {
    minHeight: 38,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  modalFundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  modalCabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCorpo: {
    gap: 10,
  },
  detalheLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 8,
  },
  detalheRotulo: {
    fontSize: 14,
  },
  detalheValor: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  modalBotaoFechar: {
    marginTop: 8,
  },
});
