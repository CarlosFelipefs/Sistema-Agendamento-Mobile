import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePreferencias } from '../../contexts/PreferenciasContext';
import { useExigirLogin } from '../../hooks/useExigirLogin';
import { empresaService } from '../../services/empresaService';
import { agendamentoService } from '../../services/agendamentoService';
import { Empresa, Servico, Profissional } from '../../types/empresa';
import { formatarPreco, formatarDuracao } from '../../utils/formatadores';
import { paraDataHoraServidor, formatarDataHora } from '../../utils/datas';
import { mostrarMensagem } from '../../utils/dialogos';
import Botao from '../../components/Botao';
import ListaSelecionavel from '../../components/ListaSelecionavel';
import SeletorDataHora from '../../components/SeletorDataHora';
import EstadoTela from '../../components/EstadoTela';

type EtapaAgendamento = 'profissional' | 'horario' | 'confirmar';

export default function AgendarScreen() {
  const { empresaId, servicoId } = useLocalSearchParams<{
    empresaId: string;
    servicoId?: string;
  }>();

  const router = useRouter();
  const { cores, t } = usePreferencias();
  const { logado, carregando: checandoAuth } = useExigirLogin();

  const [etapa, setEtapa] = useState<EtapaAgendamento>('profissional');
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [servico, setServico] = useState<Servico | null>(null);
  const [profissionalEscolhido, setProfissionalEscolhido] = useState<Profissional | null>(null);

  const [diaEscolhido, setDiaEscolhido] = useState<Date>(new Date());
  const [horarioEscolhido, setHorarioEscolhido] = useState<string | null>(null);
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);

  const [carregandoDados, setCarregandoDados] = useState(true);
  const [carregandoOcupados, setCarregandoOcupados] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const empId = Number(empresaId);
  const servId = servicoId ? Number(servicoId) : null;

  const carregarDadosIniciais = useCallback(async () => {
    if (isNaN(empId)) {
      setErro(t('Empresa inválida.', 'Invalid business.'));
      setCarregandoDados(false);
      return;
    }

    setCarregandoDados(true);
    setErro(null);

    try {
      const emp = await empresaService.buscarPorId(empId);
      setEmpresa(emp);

      if (servId) {
        const s = emp.servicos?.find((item) => item.id === servId);
        if (s) {
          setServico(s);
        } else {
          setErro(t('Serviço não encontrado.', 'Service not found.'));
        }
      } else {
        setErro(t('Nenhum serviço selecionado.', 'No service selected.'));
      }
    } catch {
      setErro(t('Não foi possível carregar os dados.', 'Unable to load data.'));
    } finally {
      setCarregandoDados(false);
    }
  }, [empId, servId, t]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    carregarDadosIniciais();
  }, [carregarDadosIniciais]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const carregarOcupados = useCallback(
    async (prof: Profissional, d: Date) => {
      setCarregandoOcupados(true);
      try {
        const ocupados = await agendamentoService.listarOcupados(prof.id, d);
        setHorariosOcupados(ocupados);
      } catch {
        setHorariosOcupados([]);
      } finally {
        setCarregandoOcupados(false);
      }
    },
    []
  );

  const handleMudarDiaOuHorario = (novoDia: Date, novoHorario: string) => {
    setDiaEscolhido(novoDia);
    setHorarioEscolhido(novoHorario);
    if (profissionalEscolhido) {
      carregarOcupados(profissionalEscolhido, novoDia);
    }
  };

  const handleAvancarParaHorario = () => {
    if (!profissionalEscolhido) return;
    setEtapa('horario');
    carregarOcupados(profissionalEscolhido, diaEscolhido);
  };

  const handleAvancarParaConfirmar = () => {
    if (!horarioEscolhido) return;
    setEtapa('confirmar');
  };

  const handleConfirmarAgendamento = async () => {
    if (!empresa || !servico || !profissionalEscolhido || !horarioEscolhido) {
      return;
    }

    setSalvando(true);
    setErro(null);

    const [h, m] = horarioEscolhido.split(':').map(Number);
    const dataHoraObj = new Date(diaEscolhido);
    dataHoraObj.setHours(h, m, 0, 0);

    const dataHoraIsoSemZ = paraDataHoraServidor(dataHoraObj);

    try {
      await agendamentoService.criar({
        empresaId: empresa.id,
        idServico: servico.id,
        idProfissional: profissionalEscolhido.id,
        dataHora: dataHoraIsoSemZ,
        status: 'Pendente',
      });

      await mostrarMensagem(
        t('Sucesso!', 'Success!'),
        t('Agendamento realizado com sucesso!', 'Appointment scheduled successfully!')
      );

      // Limpar pilha de modal/agendamento e navegar para meus agendamentos
      if (router.canDismiss()) {
        router.dismissAll();
      }
      router.navigate('/agendamentos');
    } catch (err: any) {
      const msg =
        err?.mensagem ||
        t(
          'Não foi possível agendar. O horário pode ter sido ocupado por outra pessoa; escolha outro.',
          'Unable to book. The time slot may already have been taken; please choose another.'
        );
      setErro(msg);
      // Volta à etapa 2 de escolha de horário e recarrega os horários ocupados
      setEtapa('horario');
      if (profissionalEscolhido) {
        carregarOcupados(profissionalEscolhido, diaEscolhido);
      }
    } finally {
      setSalvando(false);
    }
  };

  if (checandoAuth || !logado) {
    return null;
  }

  if (carregandoDados) {
    return (
      <View style={[styles.containerCentral, { backgroundColor: cores.fundo }]}>
        <ActivityIndicator size="large" color={cores.destaque} />
        <Text style={[styles.carregandoTexto, { color: cores.textoSecundario }]}>
          {t('Preparando agendamento...', 'Preparing appointment...')}
        </Text>
      </View>
    );
  }

  if (erro && !empresa) {
    return (
      <View style={[styles.containerCentral, { backgroundColor: cores.fundo }]}>
        <EstadoTela
          icone="alert-circle-outline"
          texto={erro}
          acao={{
            titulo: t('Voltar', 'Go back'),
            onPress: () => router.back(),
          }}
        />
      </View>
    );
  }

  const profissionais = empresa?.profissionais || [];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: cores.fundo }]}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.conteudo}>
        {/* Indicador de passos */}
        <View style={styles.passosContainer}>
          <View
            style={[
              styles.passoItem,
              etapa === 'profissional' && styles.passoItemAtivo,
              { borderColor: cores.destaque },
            ]}
          >
            <Text
              style={[
                styles.passoNumero,
                { color: etapa === 'profissional' ? cores.destaque : cores.textoTerciario },
              ]}
            >
              1. {t('Profissional', 'Staff')}
            </Text>
          </View>

          <View
            style={[
              styles.passoItem,
              etapa === 'horario' && styles.passoItemAtivo,
              { borderColor: cores.destaque },
            ]}
          >
            <Text
              style={[
                styles.passoNumero,
                { color: etapa === 'horario' ? cores.destaque : cores.textoTerciario },
              ]}
            >
              2. {t('Horário', 'Time')}
            </Text>
          </View>

          <View
            style={[
              styles.passoItem,
              etapa === 'confirmar' && styles.passoItemAtivo,
              { borderColor: cores.destaque },
            ]}
          >
            <Text
              style={[
                styles.passoNumero,
                { color: etapa === 'confirmar' ? cores.destaque : cores.textoTerciario },
              ]}
            >
              3. {t('Confirmar', 'Confirm')}
            </Text>
          </View>
        </View>

        {erro ? (
          <View style={[styles.erroBox, { backgroundColor: cores.superficie, borderColor: cores.perigo }]}>
            <Text style={[styles.erroTexto, { color: cores.perigo }]}>{erro}</Text>
          </View>
        ) : null}

        {/* Etapa 1: Escolha de Profissional */}
        {etapa === 'profissional' && (
          <View style={styles.blocoEtapa}>
            <Text style={[styles.etapaTitulo, { color: cores.textoPrimario }]}>
              {t('Selecione o profissional', 'Select a professional')}
            </Text>
            {servico ? (
              <Text style={[styles.etapaSubtitulo, { color: cores.textoSecundario }]}>
                {t('Para o serviço', 'For service')}: {servico.nome} ({formatarPreco(servico.preco)})
              </Text>
            ) : null}

            {profissionais.length === 0 ? (
              <EstadoTela
                icone="people-outline"
                texto={t(
                  'Nenhum profissional disponível nesta empresa.',
                  'No professionals available at this business.'
                )}
              />
            ) : (
              <ListaSelecionavel
                itens={profissionais}
                selecionadoId={profissionalEscolhido?.id}
                aoSelecionar={(p) => setProfissionalEscolhido(p)}
                renderItem={(item, selecionado) => (
                  <View style={styles.itemProfissional}>
                    <Text
                      style={[
                        styles.nomeProfissional,
                        { color: selecionado ? cores.destaque : cores.textoPrimario },
                      ]}
                    >
                      {item.nome}
                    </Text>
                    <Text style={[styles.especialidadeProfissional, { color: cores.textoSecundario }]}>
                      {item.especialidade}
                    </Text>
                  </View>
                )}
              />
            )}

            <Botao
              titulo={t('Selecionar horário', 'Select time')}
              onPress={handleAvancarParaHorario}
              desabilitado={!profissionalEscolhido || profissionais.length === 0}
              variante="primario"
              style={styles.botaoAvancar}
            />
          </View>
        )}

        {/* Etapa 2: Escolha de Data e Horário */}
        {etapa === 'horario' && (
          <View style={styles.blocoEtapa}>
            <View style={styles.cabecalhoEtapaComVoltar}>
              <Text style={[styles.etapaTitulo, { color: cores.textoPrimario }]}>
                {t('Escolha o dia e horário', 'Choose date and time')}
              </Text>
            </View>

            {carregandoOcupados ? (
              <View style={styles.loadingHorarios}>
                <ActivityIndicator size="small" color={cores.destaque} />
                <Text style={[styles.loadingTexto, { color: cores.textoSecundario }]}>
                  {t('Verificando horários disponíveis...', 'Checking available times...')}
                </Text>
              </View>
            ) : null}

            <SeletorDataHora
              dia={diaEscolhido}
              horario={horarioEscolhido}
              ocupados={horariosOcupados}
              aoMudar={handleMudarDiaOuHorario}
            />

            <View style={styles.linhaBotoes}>
              <Botao
                titulo={t('Voltar', 'Back')}
                onPress={() => setEtapa('profissional')}
                variante="secundario"
                style={styles.botaoMeio}
              />
              <Botao
                titulo={t('Revisar agendamento', 'Review booking')}
                onPress={handleAvancarParaConfirmar}
                desabilitado={!horarioEscolhido}
                variante="primario"
                style={styles.botaoMeio}
              />
            </View>
          </View>
        )}

        {/* Etapa 3: Resumo e Confirmação */}
        {etapa === 'confirmar' && (
          <View style={styles.blocoEtapa}>
            <Text style={[styles.etapaTitulo, { color: cores.textoPrimario }]}>
              {t('Confirme seu agendamento', 'Confirm your booking')}
            </Text>

            <View style={[styles.resumoCard, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
              <View style={styles.resumoLinha}>
                <Text style={[styles.resumoRotulo, { color: cores.textoSecundario }]}>
                  {t('Estabelecimento', 'Business')}:
                </Text>
                <Text style={[styles.resumoValor, { color: cores.textoPrimario }]}>
                  {empresa?.nome}
                </Text>
              </View>

              <View style={styles.resumoLinha}>
                <Text style={[styles.resumoRotulo, { color: cores.textoSecundario }]}>
                  {t('Serviço', 'Service')}:
                </Text>
                <Text style={[styles.resumoValor, { color: cores.textoPrimario }]}>
                  {servico?.nome} ({formatarDuracao(servico?.duracaoEmMinutos || 0)})
                </Text>
              </View>

              <View style={styles.resumoLinha}>
                <Text style={[styles.resumoRotulo, { color: cores.textoSecundario }]}>
                  {t('Profissional', 'Staff')}:
                </Text>
                <Text style={[styles.resumoValor, { color: cores.textoPrimario }]}>
                  {profissionalEscolhido?.nome} ({profissionalEscolhido?.especialidade})
                </Text>
              </View>

              <View style={styles.resumoLinha}>
                <Text style={[styles.resumoRotulo, { color: cores.textoSecundario }]}>
                  {t('Data e Hora', 'Date & Time')}:
                </Text>
                <Text style={[styles.resumoValor, { color: cores.textoPrimario }]}>
                  {(() => {
                    const [h, m] = (horarioEscolhido || '00:00').split(':').map(Number);
                    const d = new Date(diaEscolhido);
                    d.setHours(h, m, 0, 0);
                    return formatarDataHora(d);
                  })()}
                </Text>
              </View>

              <View style={[styles.resumoLinha, styles.linhaTotal, { borderTopColor: cores.borda }]}>
                <Text style={[styles.resumoRotuloTotal, { color: cores.textoPrimario }]}>
                  {t('Valor total', 'Total price')}:
                </Text>
                <Text style={[styles.resumoValorTotal, { color: cores.sucesso }]}>
                  {formatarPreco(servico?.preco || 0)}
                </Text>
              </View>
            </View>

            <View style={styles.linhaBotoes}>
              <Botao
                titulo={t('Alterar horário', 'Change time')}
                onPress={() => setEtapa('horario')}
                variante="secundario"
                style={styles.botaoMeio}
                desabilitado={salvando}
              />
              <Botao
                titulo={t('Confirmar Agendamento', 'Confirm Booking')}
                onPress={handleConfirmarAgendamento}
                carregando={salvando}
                variante="primario"
                style={styles.botaoMeio}
              />
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerCentral: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  carregandoTexto: {
    fontSize: 15,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  conteudo: {
    maxWidth: 700,
    width: '100%',
    alignSelf: 'center',
  },
  passosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  passoItem: {
    flex: 1,
    paddingVertical: 8,
    borderBottomWidth: 2,
    alignItems: 'center',
  },
  passoItemAtivo: {
    borderBottomWidth: 3,
  },
  passoNumero: {
    fontSize: 13,
    fontWeight: '600',
  },
  blocoEtapa: {
    gap: 16,
  },
  etapaTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  etapaSubtitulo: {
    fontSize: 14,
    marginTop: -8,
  },
  cabecalhoEtapaComVoltar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemProfissional: {
    gap: 4,
  },
  nomeProfissional: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  especialidadeProfissional: {
    fontSize: 14,
  },
  botaoAvancar: {
    marginTop: 8,
  },
  loadingHorarios: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  loadingTexto: {
    fontSize: 13,
  },
  linhaBotoes: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    marginBottom: 24,
  },
  botaoMeio: {
    flex: 1,
  },
  resumoCard: {
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  resumoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  resumoRotulo: {
    fontSize: 14,
  },
  resumoValor: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'right',
  },
  linhaTotal: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 4,
  },
  resumoRotuloTotal: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resumoValorTotal: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  erroBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  erroTexto: {
    fontSize: 14,
  },
});
