export interface LoginResposta {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: string;
  clienteId: number;
}

export interface CadastroUsuarioDto {
  user: string;
  senha?: string;
  confirmarSenha?: string;
  nome: string;
  email: string;
  telefone: string;
}

export interface AlterarSenhaDto {
  userId: number;
  senhaAtual: string;
  novaSenha: string;
}
