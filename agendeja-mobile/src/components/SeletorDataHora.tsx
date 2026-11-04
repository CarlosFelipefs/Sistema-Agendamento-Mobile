import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { usePreferencias } from '../contexts/PreferenciasContext';
import { TURNOS, DIAS_DISPONIVEIS } from '../constants/agenda';
import { proximosDias, mesmoDia } from '../utils/datas';

interface SeletorDataHoraProps {
  dia: Date;
  horario: string | null;
  ocupados: string[];
  aoMudar: (dia: Date, horario: string) => void;
}

export default function SeletorDataHora({
  dia,
  horario,
  ocupados,
  aoMudar,
}: SeletorDataHoraProps) {
  const { cores, idioma } = usePreferencias();
  const listaDias = proximosDias(DIAS_DISPONIVEIS);
  const hoje = new Date();

  const ehHorarioPassado = (hStr: string, diaSelecionado: Date) => {
    if (!mesmoDia(diaSelecionado, hoje)) return false;
    const [h, m] = hStr.split(':').map(Number);
    const horaAtual = hoje.getHours();
    const minutoAtual = hoje.getMinutes();
    if (h < horaAtual) return true;
    if (h === horaAtual && m <= minutoAtual) return true;
    return false;
  };

  const formatarDiaSemana = (d: Date) => {
    return d.toLocaleDateString(idioma === 'en' ? 'en-US' : 'pt-BR', {
      weekday: 'short',
    }).replace('.', '');
  };

  return (
    <View style={styles.container}>
      {/* Faixa horizontal de 14 dias */}
      <Text style={[styles.subtitulo, { color: cores.textoPrimario }]}>
        {idioma === 'en' ? 'Select day' : 'Selecione o dia'}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollDias}
      >
        {listaDias.map((d, index) => {
          const selecionado = mesmoDia(d, dia);
          return (
            <Pressable
              key={index}
              onPress={() => aoMudar(d, horario || '')}
              style={[
                styles.diaCard,
                {
                  backgroundColor: selecionado ? cores.destaque : cores.cartao,
                  borderColor: selecionado ? cores.destaque : cores.borda,
                },
              ]}
            >
              <Text
                style={[
                  styles.diaSemana,
                  { color: selecionado ? '#FFFFFF' : cores.textoSecundario },
                ]}
              >
                {formatarDiaSemana(d)}
              </Text>
              <Text
                style={[
                  styles.diaNumero,
                  { color: selecionado ? '#FFFFFF' : cores.textoPrimario },
                ]}
              >
                {d.getDate()}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Horários divididos por turno */}
      <Text style={[styles.subtitulo, { color: cores.textoPrimario }]}>
        {idioma === 'en' ? 'Select time' : 'Selecione o horário'}
      </Text>

      {Object.entries(TURNOS).map(([chave, turno]) => {
        const tituloTurno = idioma === 'en' ? turno.tituloEn : turno.titulo;

        return (
          <View key={chave} style={styles.blocoTurno}>
            <Text style={[styles.tituloTurno, { color: cores.textoSecundario }]}>
              {tituloTurno}
            </Text>
            <View style={styles.gradeHorarios}>
              {turno.horarios.map((h) => {
                const ocupado = ocupados.includes(h);
                const passou = ehHorarioPassado(h, dia);
                const desabilitado = ocupado || passou;
                const selecionado = horario === h;

                return (
                  <Pressable
                    key={h}
                    disabled={desabilitado}
                    onPress={() => aoMudar(dia, h)}
                    style={({ pressed }) => [
                      styles.horarioCard,
                      {
                        backgroundColor: desabilitado
                          ? cores.fundo
                          : selecionado
                          ? cores.destaque
                          : pressed
                          ? cores.superficie
                          : cores.cartao,
                        borderColor: selecionado
                          ? cores.destaque
                          : desabilitado
                          ? cores.borda
                          : cores.borda,
                        opacity: desabilitado ? 0.4 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.textoHorario,
                        {
                          color: selecionado
                            ? '#FFFFFF'
                            : desabilitado
                            ? cores.textoTerciario
                            : cores.textoPrimario,
                          textDecorationLine: desabilitado ? 'line-through' : 'none',
                        },
                      ]}
                    >
                      {h}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    width: '100%',
  },
  subtitulo: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollDias: {
    gap: 8,
    paddingVertical: 4,
  },
  diaCard: {
    width: 64,
    height: 72,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  diaSemana: {
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  diaNumero: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  blocoTurno: {
    gap: 8,
  },
  tituloTurno: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  gradeHorarios: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  horarioCard: {
    width: '30%',
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoHorario: {
    fontSize: 15,
    fontWeight: '600',
  },
});
