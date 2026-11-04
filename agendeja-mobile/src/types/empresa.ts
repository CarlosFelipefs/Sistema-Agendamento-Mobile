export interface Servico {
  id: number;
  nome: string;
  duracaoEmMinutos: number;
  preco: number;
  empresaId?: number;
}

export interface Profissional {
  id: number;
  nome: string;
  especialidade: string;
  empresaId?: number;
}

export interface Empresa {
  id: number;
  nome: string;
  endereco: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  latitude?: number;
  longitude?: number;
  telefone?: string;
  categoria?: string;
  distancia?: number;
  servicos?: Servico[];
  profissionais?: Profissional[];
}
