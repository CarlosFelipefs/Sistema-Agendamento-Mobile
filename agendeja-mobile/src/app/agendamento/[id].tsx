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
import { useAuth } from '../../contexts/AuthContext';
import { useExigirLogin } from '../../hooks/useExigirLogin';
import { agendamentoService } from '../../services/agendamentoService';
import { empresaService } from '../../services/empresaService';
import { Agendamento } from '../../types/agendamento';
import { Empresa, Servico, Profissional } from '../../types/empresa';
import { formatarPreco, formatarDuracao } from '../../utils/formatadores';
import { paraDataHoraServidor, lerDataHoraServidor, formatarDataHora } from '../../utils/datas';
import { mostrarMensagem } from '../../utils/dialogos';
import Botao from '../../components/Botao';
import ListaSelecionavel from '../../components/ListaSelecionavel';
import SeletorDataHora from '../../components/SeletorDataHora';
import SeletorAbas from '../../components/SeletorAbas';
import EstadoTela from '../../components/EstadoTela';

export default function EditarAgendamentoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { cores, t } = usePreferencias();
  const { clienteId } = useAuth();
  const { logado, carregando: checandoAuth } = useExigirLogin();

  const agendamentoId = Number(id);

  const [agendamentoOriginal, setAgendamentoOriginal] = useState<Agendamento | null>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);

  const [servicoEscolhido, setServicoEscolhido] = useState<Servico | null>(null);
  const [profissionalEscolhido, setProfissionalEscolhido] = useState<Profissional | null>(null);
  const [diaEscolhido, setDiaEscolhido] = useState<Date>(new Date());
  const [horarioEscolhido, setHorarioEscolhido] = useState<string | null>(null);
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([]);

  const [secaoAtiva, setSecaoAtiva] = useState<'dados' | 'horario'>('dados');
  const [carregando, setCarregando] = useState(true);
  const [carregandoOcupados, setCarregandoOcupados] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarOcupados = useCallback(
    async (idProf: number, dia: Date, idIgnorar: number) => {
      setCarregandoOcupados(true);
      try {
        const ocupados = await agendamentoService.listarOcupados(idProf, dia, idIgnorar);
        setHorariosOcupados(ocupados);
      } catch {
        setHorariosOcupados([]);
      } finally {
        setCarregandoOcupados(false);
      }
    },
    []
  );

  const carregarDadosCompletos = useCallback(async () => {
    if (isNaN(agendamentoId)) {
      setErro(t('Agendamento não encontrado.', 'Appointment not found.'));
      setCarregando(false);
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      const meusAgendamentos = await agendamentoService.listarMeus();
      const ag = meusAgendamentos.find((item) => item.id === agendamentoId);

      if (!ag) {
        setErro(t('Agendamento não encontrado.', 'Appointment not found.'));
        setCarregando(false);
        return;
      }

      setAgendamentoOriginal(ag);

      const emp = await empresaService.buscarPorId(ag.empresaId);
      setEmpresa(emp);

      const serv = emp.servicos?.find((s) => s.id === ag.idServico) || null;
      setServicoEscolhido(serv);

      const prof = emp.profissionais?.find((p) => p.id === ag.idProfissional) || null;
      setProfissionalEscolhido(prof);

      const dataObj = lerDataHoraServidor(ag.dataHora);
      setDiaEscolhido(dataObj);
      const hStr = `${dataObj.getHours().toString().padStart(2, '0')}:${dataObj
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
      setHorarioEscolhido(hStr);

      if (prof) {
        await carregarOcupados(prof.id, dataObj, ag.id);
      }
    } catch {
      setErro(t('Não foi possível carregar os dados.', 'Unable to load data.'));
    } finally {
      setCarregando(false);
    }
  }, [agendamentoId, carregarOcupados, t]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    carregarDadosCompletos();
  }, [carregarDadosCompletos]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleMudarProfissional = (novoProf: Profissional) => {
    setProfissionalEscolhido(novoProf);
    carregarOcupados(novoProf.id, diaEscolhido, agendamentoId);
  };

  const handleMudarDiaOuHorario = (novoDia: Date, novoHorario: string) => {
    setDiaEscolhido(novoDia);
    setHorarioEscolhido(novoHorario);
    if (profissionalEscolhido) {
      carregarOcupados(profissionalEscolhido.id, novoDia, agendamentoId);
    }
  };

  const handleSalvarAlteracao = async () => {
    if (
      !agendamentoOriginal ||
      !empresa ||
      !servicoEscolhido ||
      !profissionalEscolhido ||
      !horarioEscolhido ||
      !clienteId
    ) {
      setErro(t('Preencha todos os campos.', 'Please fill all fields.'));
      return;
    }

    setSalvando(true);
    setErro(null);

    const [h, m] = horarioEscolhido.split(':').map(Number);
    const dataHoraObj = new Date(diaEscolhido);
    dataHoraObj.setHours(h, m, 0, 0);

    const dataHoraServidor = paraDataHoraServidor(dataHoraObj);

    try {
      await agendamentoService.atualizar({
        id: agendamentoOriginal.id,
        idServico: servicoEscolhido.id,
        idProfissional: profissionalEscolhido.id,
        idCliente: clienteId,
        empresaId: empresa.id,
        dataHora: dataHoraServidor,
        status: agendamentoOriginal.status,
      });

      await mostrarMensagem(
        t('Sucesso!', 'Success!'),
        t('Agendamento alterado com sucesso!', 'Appointment updated successfully!')
      );

      router.back();
    } catch (err: any) {
      setErro(
        err?.mensagem ||
          t(
            'Não foi possível atualizar o agendamento.',
            'Unable to update the appointment.'
          )
      );
    } finally {
      setSalvando(false);
    }
  };

  if (checandoAuth || !logado) {
    return null;
  }

  if (carregando) {
    return (
      <View style={[styles.containerCentral, { backgroundColor: cores.fundo }]}>
        <ActivityIndicator size="large" color={cores.destaque} />
        <Text style={[styles.carregandoTexto, { color: cores.textoSecundario }]}>
          {t('Carregando agendamento...', 'Loading appointment...')}
        </Text>
      </View>
    );
  }

  if (erro && !agendamentoOriginal) {
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

  const servicos = empresa?.servicos || [];
  const profissionais = empresa?.profissionais || [];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: cores.fundo }]}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.conteudo}>
        <Text style={[styles.titulo, { color: cores.textoPrimario }]}>
          {t('Alterar Agendamento', 'Edit Appointment')}
        </Text>
        <Text style={[styles.subtitulo, { color: cores.textoSecundario }]}>
          {empresa?.nome} • {t('Atual', 'Current')}:{' '}
          {agendamentoOriginal ? formatarDataHora(agendamentoOriginal.dataHora) : ''}
        </Text>

        {erro ? (
          <View style={[styles.erroBox, { backgroundColor: cores.superficie, borderColor: cores.perigo }]}>
            <Text style={[styles.erroTexto, { color: cores.perigo }]}>{erro}</Text>
          </View>
        ) : null}

        <SeletorAbas
          abas={[
            { id: 'dados', titulo: t('Serviço e Profissional', 'Service & Staff') },
            { id: 'horario', titulo: t('Data e Horário', 'Date & Time') },
          ]}
          ativa={secaoAtiva}
          aoMudar={(idSecao) => setSecaoAtiva(idSecao as 'dados' | 'horario')}
        />

        {secaoAtiva === 'dados' ? (
          <View style={styles.blocoSecao}>
            <Text style={[styles.secaoTitulo, { color: cores.textoPrimario }]}>
              {t('Selecione o serviço', 'Select service')}
            </Text>
            <ListaSelecionavel
              itens={servicos}
              selecionadoId={servicoEscolhido?.id}
              aoSelecionar={(s) => setServicoEscolhido(s)}
              renderItem={(s, selecionado) => (
                <View style={styles.itemLista}>
                  <Text
                    style={[
                      styles.itemNome,
                      { color: selecionado ? cores.destaque : cores.textoPrimario },
                    ]}
                  >
                    {s.nome}
                  </Text>
                  <Text style={[styles.itemDetalhe, { color: cores.textoSecundario }]}>
                    {formatarPreco(s.preco)} • {formatarDuracao(s.duracaoEmMinutos)}
                  </Text>
                </View>
              )}
            />

            <Text style={[styles.secaoTitulo, { color: cores.textoPrimario, marginTop: 12 }]}>
              {t('Selecione o profissional', 'Select professional')}
            </Text>
            <ListaSelecionavel
              itens={profissionais}
              selecionadoId={profissionalEscolhido?.id}
              aoSelecionar={handleMudarProfissional}
              renderItem={(p, selecionado) => (
                <View style={styles.itemLista}>
                  <Text
                    style={[
                      styles.itemNome,
                      { color: selecionado ? cores.destaque : cores.textoPrimario },
                    ]}
                  >
                    {p.nome}
                  </Text>
                  <Text style={[styles.itemDetalhe, { color: cores.textoSecundario }]}>
                    {p.especialidade}
                  </Text>
                </View>
              )}
            />

            <Botao
              titulo={t('Avançar para horário', 'Next to time')}
              onPress={() => setSecaoAtiva('horario')}
              desabilitado={!servicoEscolhido || !profissionalEscolhido}
              variante="primario"
              style={styles.botaoSalvar}
            />
          </View>
        ) : (
          <View style={styles.blocoSecao}>
            {carregandoOcupados ? (
              <View style={styles.loadingHorarios}>
                <ActivityIndicator size="small" color={cores.destaque} />
                <Text style={[styles.loadingTexto, { color: cores.textoSecundario }]}>
                  {t('Verificando disponibilidade...', 'Checking availability...')}
                </Text>
              </View>
            ) : null}

            <SeletorDataHora
              dia={diaEscolhido}
              horario={horarioEscolhido}
              ocupados={horariosOcupados}
              aoMudar={handleMudarDiaOuHorario}
            />

            <View style={styles.resumoBox}>
              <Text style={[styles.resumoTexto, { color: cores.textoSecundario }]}>
                {servicoEscolhido?.nome} ({formatarPreco(servicoEscolhido?.preco || 0)}) com{' '}
                {profissionalEscolhido?.nome}
              </Text>
            </View>

            <View style={styles.linhaBotoes}>
              <Botao
                titulo={t('Voltar', 'Back')}
                onPress={() => setSecaoAtiva('dados')}
                variante="secundario"
                style={styles.botaoMeio}
                desabilitado={salvando}
              />
              <Botao
                titulo={t('Salvar Alterações', 'Save Changes')}
                onPress={handleSalvarAlteracao}
                carregando={salvando}
                desabilitado={!horarioEscolhido}
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
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 14,
    marginBottom: 16,
  },
  blocoSecao: {
    gap: 12,
    marginBottom: 24,
  },
  secaoTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemLista: {
    gap: 4,
  },
  itemNome: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  itemDetalhe: {
    fontSize: 13,
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
  resumoBox: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  resumoTexto: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  linhaBotoes: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  botaoMeio: {
    flex: 1,
  },
  botaoSalvar: {
    marginTop: 12,
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
