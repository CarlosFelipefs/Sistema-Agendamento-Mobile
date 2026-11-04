import { requisicao } from './api';
import { Cliente } from '../types/cliente';

export const clienteService = {
  buscarCliente: async (id: number): Promise<Cliente> => {
    return requisicao<Cliente>(`/Cliente/${id}`, {
      metodo: 'GET',
    });
  },

  atualizarCliente: async (cliente: Cliente): Promise<void> => {
    return requisicao<void>('/Cliente', {
      metodo: 'PUT',
      corpo: cliente,
    });
  },
};
