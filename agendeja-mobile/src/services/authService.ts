import { requisicao } from './api';
import { LoginResposta, CadastroUsuarioDto, AlterarSenhaDto } from '../types/auth';

export const authService = {
  fazerLogin: async (user: string, senha: string): Promise<LoginResposta> => {
    return requisicao<LoginResposta>('/Seguranca/login', {
      metodo: 'POST',
      corpo: { user, senha },
      autenticado: false,
    });
  },

  cadastrarUsuario: async (dto: CadastroUsuarioDto): Promise<unknown> => {
    return requisicao<unknown>('/User/register', {
      metodo: 'POST',
      corpo: dto,
      autenticado: false,
    });
  },

  alterarSenha: async (dto: AlterarSenhaDto): Promise<string> => {
    return requisicao<string>('/User/alterar-senha', {
      metodo: 'PUT',
      corpo: dto,
      autenticado: false,
    });
  },
};
