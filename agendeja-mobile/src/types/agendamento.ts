export interface Agendamento {
  id: number;
  idServico: number;
  idProfissional: number;
  idCliente: number;
  empresaId: number;
  dataHora: string;
  status: string;
  servicoNome?: string;
  profissionalNome?: string;
  empresaNome?: string;
}

export interface CriarAgendamentoDto {
  idServico: number;
  idProfissional: number;
  empresaId: number;
  dataHora: string;
  status: string;
}

export interface AtualizarAgendamentoDto {
  id: number;
  idServico: number;
  idProfissional: number;
  idCliente: number;
  empresaId: number;
  dataHora: string;
  status: string;
}
