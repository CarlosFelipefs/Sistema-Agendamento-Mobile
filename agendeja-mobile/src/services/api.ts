import { obterToken } from './sessao';
import { ApiError, extrairMensagem } from '../utils/erros';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5253';

type CallbackExpiracaoSessao = () => void;
let aoExpirarSessaoCallback: CallbackExpiracaoSessao | null = null;

export function registrarAoExpirarSessao(fn: CallbackExpiracaoSessao | null) {
  aoExpirarSessaoCallback = fn;
}

export interface OpcoesRequisicao {
  metodo?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  corpo?: unknown;
  autenticado?: boolean;
  headers?: Record<string, string>;
  mensagemErroPadrao?: string;
}

export async function requisicao<T>(
  caminho: string,
  opcoes: OpcoesRequisicao = {}
): Promise<T> {
  const {
    metodo = 'GET',
    corpo,
    autenticado = true,
    headers: headersCustomizados = {},
    mensagemErroPadrao,
  } = opcoes;

  // Garante que o caminho inicie com /api se não vier com
  const caminhoFormatado = caminho.startsWith('/api')
    ? caminho
    : `/api${caminho.startsWith('/') ? caminho : `/${caminho}`}`;

  const url = `${API_BASE_URL}${caminhoFormatado}`;

  const headers: Record<string, string> = {
    ...headersCustomizados,
  };

  if (corpo !== undefined && corpo !== null) {
    headers['Content-Type'] = 'application/json';
  }

  let tokenUtilizado: string | null = null;
  if (autenticado) {
    tokenUtilizado = await obterToken();
    if (tokenUtilizado) {
      headers['Authorization'] = `Bearer ${tokenUtilizado}`;
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  let resposta: Response;
  try {
    resposta = await fetch(url, {
      method: metodo,
      headers,
      body: corpo !== undefined && corpo !== null ? JSON.stringify(corpo) : undefined,
      signal: controller.signal,
    });
  } catch (erro: any) {
    if (erro?.name === 'AbortError') {
      throw new ApiError(0, 'Tempo limite de conexão esgotado. Tente novamente.');
    }
    throw new ApiError(0, 'Não foi possível conectar ao servidor. Verifique sua conexão.');
  } finally {
    clearTimeout(timeoutId);
  }

  // Tratamento de 401
  if (resposta.status === 401) {
    // Se a requisição enviou token e não é o login em si, aciona callback de expiração
    if (tokenUtilizado && !caminho.includes('/Seguranca/login')) {
      if (aoExpirarSessaoCallback) {
        aoExpirarSessaoCallback();
      }
    }
  }

  // 204 No Content
  if (resposta.status === 204) {
    return undefined as unknown as T;
  }

  const contentType = resposta.headers.get('content-type') || '';
  let dadosResposta: unknown;

  if (contentType.includes('application/json')) {
    try {
      dadosResposta = await resposta.json();
    } catch {
      dadosResposta = null;
    }
  } else {
    try {
      dadosResposta = await resposta.text();
    } catch {
      dadosResposta = null;
    }
  }

  if (!resposta.ok) {
    const mensagem = extrairMensagem(resposta.status, dadosResposta, mensagemErroPadrao);
    throw new ApiError(resposta.status, mensagem);
  }

  return dadosResposta as T;
}

// Manter apiFetch por compatibilidade temporária se ainda houver referências
export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const token = await obterToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options?.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${path}`;
  return fetch(url, {
    ...options,
    headers,
  });
}
