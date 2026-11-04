/**
 * Tratamento de erros das respostas do back-end ASP.NET.
 */

export class ApiError extends Error {
  status: number;
  mensagem: string;

  constructor(status: number, mensagem: string) {
    super(mensagem);
    this.name = 'ApiError';
    this.status = status;
    this.mensagem = mensagem;
  }
}

interface ErroValidacaoItem {
  propertyName?: string;
  errorMessage?: string;
}

interface ErroResultadoObjeto {
  isValid?: boolean;
  errors?: ErroValidacaoItem[];
}

interface ErroMensagemSimples {
  message?: string;
}

/**
 * Extrai a mensagem de erro da resposta HTTP de acordo com os formatos do back-end
 */
export function extrairMensagem(status: number, dados: unknown, mensagemPadrao?: string): string {
  if (typeof dados === 'string' && dados.trim().length > 0) {
    return dados;
  }

  if (dados && typeof dados === 'object') {
    // Caso 1: Array de erros [{ propertyName, errorMessage }]
    if (Array.isArray(dados)) {
      const mensagens = dados
        .map((item) => (item as ErroValidacaoItem)?.errorMessage)
        .filter(Boolean) as string[];
      if (mensagens.length > 0) {
        return mensagens.join('\n');
      }
    }

    // Caso 2: Objeto com errors: [{ propertyName, errorMessage }]
    const objComErrors = dados as ErroResultadoObjeto;
    if (Array.isArray(objComErrors.errors) && objComErrors.errors.length > 0) {
      const mensagens = objComErrors.errors
        .map((e) => e.errorMessage)
        .filter(Boolean) as string[];
      if (mensagens.length > 0) {
        return mensagens.join('\n');
      }
    }

    // Caso 3: Objeto com { message: string }
    const objComMessage = dados as ErroMensagemSimples;
    if (typeof objComMessage.message === 'string' && objComMessage.message.trim().length > 0) {
      return objComMessage.message;
    }
  }

  if (mensagemPadrao) {
    return mensagemPadrao;
  }

  if (status === 401) {
    return 'Sessão expirada ou não autorizada. Faça login novamente.';
  }
  if (status === 404) {
    return 'Recurso não encontrado.';
  }
  if (status >= 500) {
    return 'Erro interno do servidor. Tente novamente mais tarde.';
  }

  return 'Ocorreu um erro ao processar sua requisição.';
}
