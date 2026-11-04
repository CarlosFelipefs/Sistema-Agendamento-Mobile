import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Agendamento } from '../types/agendamento';
import { usePreferencias } from '../contexts/PreferenciasContext';
import { formatarDataHora } from '../utils/datas';
import { STATUS_CORES } from '../constants/status';

interface AgendamentoCardProps {
  agendamento: Agendamento;
  aoVerDetalhes: () => void;
  aoAlterar?: () => void;
  aoCancelar?: () => void;
}

export default function AgendamentoCard({
  agendamento,
  aoVerDetalhes,
  aoAlterar,
  aoCancelar,
}: AgendamentoCardProps) {
  const { cores, t } = usePreferencias();

  const corStatusChave =
    STATUS_CORES[agendamento.status as keyof typeof STATUS_CORES] || 'textoTerciario';
  const corStatus = cores[corStatusChave as keyof typeof cores] || cores.textoTerciario;

  const podeModificar =
    agendamento.status !== 'Executado' && agendamento.status !== 'Cancelado';

  return (
    <View style={[styles.card, { backgroundColor: cores.cartao, borderColor: cores.borda }]}>
      <Pressable onPress={aoVerDetalhes} style={styles.conteudoPrincipal}>
        <View style={styles.cabecalho}>
          <Text style={[styles.servicoNome, { color: cores.textoPrimario }]} numberOfLines={1}>
            {agendamento.servicoNome || t('Serviço', 'Service')}
          </Text>
          <View style={[styles.tagStatus, { backgroundColor: cores.superficie, borderColor: corStatus }]}>
            <Text style={[styles.statusTexto, { color: corStatus }]}>
              {agendamento.status}
            </Text>
          </View>
        </View>

        {agendamento.empresaNome ? (
          <Text style={[styles.empresaNome, { color: cores.textoSecundario }]} numberOfLines={1}>
            🏢 {agendamento.empresaNome}
          </Text>
        ) : null}

        {agendamento.profissionalNome ? (
          <Text style={[styles.profissionalNome, { color: cores.textoSecundario }]} numberOfLines={1}>
            👤 {t('Profissional', 'Professional')}: {agendamento.profissionalNome}
          </Text>
        ) : null}

        <Text style={[styles.dataHora, { color: cores.textoTerciario }]}>
          📅 {formatarDataHora(agendamento.dataHora)}
        </Text>
      </Pressable>

      <View style={[styles.rodape, { borderTopColor: cores.borda }]}>
        <Pressable
          onPress={aoVerDetalhes}
          style={({ pressed }) => [
            styles.botaoAcao,
            { backgroundColor: pressed ? cores.botaoIconePressionado : 'transparent' },
          ]}
        >
          <Text style={[styles.textoAcao, { color: cores.destaque }]}>
            {t('Ver detalhes', 'View details')}
          </Text>
        </Pressable>

        {podeModificar && aoAlterar ? (
          <Pressable
            onPress={aoAlterar}
            style={({ pressed }) => [
              styles.botaoAcao,
              { backgroundColor: pressed ? cores.botaoIconePressionado : 'transparent' },
            ]}
          >
            <Text style={[styles.textoAcao, { color: cores.textoPrimario }]}>
              {t('Alterar', 'Change')}
            </Text>
          </Pressable>
        ) : null}

        {podeModificar && aoCancelar ? (
          <Pressable
            onPress={aoCancelar}
            style={({ pressed }) => [
              styles.botaoAcao,
              { backgroundColor: pressed ? cores.botaoIconePressionado : 'transparent' },
            ]}
          >
            <Text style={[styles.textoAcao, { color: cores.perigo }]}>
              {t('Cancelar', 'Cancel')}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  conteudoPrincipal: {
    padding: 16,
    gap: 6,
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  servicoNome: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  tagStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusTexto: {
    fontSize: 12,
    fontWeight: '600',
  },
  empresaNome: {
    fontSize: 14,
  },
  profissionalNome: {
    fontSize: 14,
  },
  dataHora: {
    fontSize: 13,
    marginTop: 2,
  },
  rodape: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  botaoAcao: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoAcao: {
    fontSize: 14,
    fontWeight: '600',
  },
});
