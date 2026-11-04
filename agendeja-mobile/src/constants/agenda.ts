export const HORARIOS_PADRAO = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '18:00',
  '18:30',
  '19:00',
  '19:30',
  '20:00',
] as const;

export const TURNOS = {
  manha: {
    titulo: 'Manhã',
    tituloEn: 'Morning',
    horarios: ['08:00', '08:30', '09:00', '09:30', '10:00'],
  },
  tarde: {
    titulo: 'Tarde',
    tituloEn: 'Afternoon',
    horarios: ['13:00', '13:30', '14:00', '14:30', '15:00'],
  },
  noite: {
    titulo: 'Noite',
    tituloEn: 'Evening',
    horarios: ['18:00', '18:30', '19:00', '19:30', '20:00'],
  },
} as const;

export const DIAS_DISPONIVEIS = 14;
export const MIN_CARACTERES_BUSCA = 4;
