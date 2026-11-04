import { requisicao } from './api';
import { ApiError } from '../utils/erros';
import { lerDataHoraServidor, mesmoDia } from '../utils/datas';
import {
  Agendamento,
  CriarAgendamentoDto,
  AtualizarAgendamentoDto,
} from '../types/agendamento';

export const agendamentoService = {
  listarMeus: async (): Promise<Agendamento[]> => {
    try {
      const res = await requisicao<Agendamento[]>('/Agendamento/cliente', {
        metodo: 'GET',
        autenticado: true,
      });
      return Array.isArray(res) ? res : [];
    } catch (erro: any) {
      // 404 no endpoint de agendamentos por cliente significa lista vazia
      if (erro instanceof ApiError && erro.status === 404) {
        return [];
      }
      throw erro;
    }
  },

  listarTodos: async (): Promise<Agendamento[]> => {
    return requisicao<Agendamento[]>('/Agendamento', {
      metodo: 'GET',
      autenticado: true,
    });
  },

  buscarPorId: async (id: number): Promise<Agendamento> => {
    return requisicao<Agendamento>(`/Agendamento/${id}`, {
      metodo: 'GET',
      autenticado: true,
    });
  },

  criar: async (dto: CriarAgendamentoDto): Promise<Agendamento> => {
    return requisicao<Agendamento>('/Agendamento', {
      metodo: 'POST',
      corpo: dto,
      autenticado: true,
      mensagemErroPadrao:
        'Não foi possível agendar. O horário pode ter sido ocupado por outra pessoa; escolha outro.',
    });
  },

  atualizar: async (dto: AtualizarAgendamentoDto): Promise<void> => {
    return requisicao<void>('/Agendamento', {
      metodo: 'PUT',
      corpo: dto,
      autenticado: true,
    });
  },

  cancelar: async (id: number): Promise<{ message?: string }> => {
    return requisicao<{ message?: string }>(`/Agendamento/deletar/${id}`, {
      metodo: 'DELETE',
      autenticado: true,
    });
  },

  /**
   * Baixa os agendamentos e filtra horários ocupados para um profissional em determinado dia.
   * Retorna array de strings de horários, ex: ['08:00', '14:30'].
   * Se agendamentoIdIgnorar for fornecido (edição), não considera o próprio agendamento.
   */
  listarOcupados: async (
    idProfissional: number,
    dia: Date,
    agendamentoIdIgnorar?: number
  ): Promise<string[]> => {
    try {
      const todos = await agendamentoService.listarTodos();
      const ocupados: string[] = [];

      for (const ag of todos) {
        if (agendamentoIdIgnorar && ag.id === agendamentoIdIgnorar) {
          continue;
        }
        if (ag.idProfissional === idProfissional) {
          const dataAg = lerDataHoraServidor(ag.dataHora);
          if (mesmoDia(dataAg, dia)) {
            const hora = dataAg.getHours().toString().padStart(2, '0');
            const minuto = dataAg.getMinutes().toString().padStart(2, '0');
            ocupados.push(`${hora}:${minuto}`);
          }
        }
      }

      return ocupados;
    } catch {
      return [];
    }
  },
};
