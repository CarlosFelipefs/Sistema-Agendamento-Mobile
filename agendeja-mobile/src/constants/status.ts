export type StatusAgendamento = 'Pendente' | 'Executado' | 'Cancelado';

export const STATUS_CORES = {
  Pendente: 'destaque',
  Executado: 'sucesso',
  Cancelado: 'textoTerciario',
} as const;
