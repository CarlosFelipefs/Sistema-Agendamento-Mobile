import { requisicao } from './api';
import { Empresa } from '../types/empresa';

export const empresaService = {
  listarTodas: async (): Promise<Empresa[]> => {
    return requisicao<Empresa[]>('/Empresa', {
      metodo: 'GET',
      autenticado: false,
    });
  },

  buscarPorId: async (id: number): Promise<Empresa> => {
    return requisicao<Empresa>(`/Empresa/${id}`, {
      metodo: 'GET',
      autenticado: false,
    });
  },

  listarProximas: async (latitude: number, longitude: number, raioKm = 5): Promise<Empresa[]> => {
    return requisicao<Empresa[]>(
      `/Empresa/proximas?latitude=${latitude}&longitude=${longitude}&raioKm=${raioKm}`,
      {
        metodo: 'GET',
        autenticado: false,
      }
    );
  },

  filtrarPorNome: async (nome: string): Promise<Empresa[]> => {
    return requisicao<Empresa[]>(`/Empresa/filtrar/${encodeURIComponent(nome)}`, {
      metodo: 'GET',
      autenticado: false,
    });
  },

  filtrarPorCidade: async (cidade: string): Promise<Empresa[]> => {
    return requisicao<Empresa[]>(`/Empresa/filtrar/cidade?cidade=${encodeURIComponent(cidade)}`, {
      metodo: 'GET',
      autenticado: false,
    });
  },

  cadastrarEmpresa: async (empresa: Omit<Empresa, 'id' | 'distancia'>): Promise<Empresa> => {
    return requisicao<Empresa>('/Empresa', {
      metodo: 'POST',
      corpo: empresa,
      autenticado: false,
    });
  },

  atualizarEmpresa: async (empresa: Empresa): Promise<void> => {
    return requisicao<void>('/Empresa', {
      metodo: 'PUT',
      corpo: empresa,
      autenticado: false,
    });
  },

  excluirEmpresa: async (id: number): Promise<{ message?: string }> => {
    return requisicao<{ message?: string }>(`/Empresa/deletar/${id}`, {
      metodo: 'DELETE',
      autenticado: false,
    });
  },
};
