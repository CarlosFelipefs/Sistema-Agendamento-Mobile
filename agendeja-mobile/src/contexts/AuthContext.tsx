import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { lerSessao, salvarSessao, limparSessao } from '../services/sessao';
import { registrarAoExpirarSessao } from '../services/api';

export interface ParametrosEntrar {
  token: string;
  nomeUsuario: string;
  clienteId?: number | null;
}

interface AuthContextData {
  token: string | null;
  nomeUsuario: string | null;
  clienteId: number | null;
  userId: number | null;
  logado: boolean;
  carregando: boolean;
  entrar: (dados: ParametrosEntrar | string, nomeOpcional?: string) => Promise<void>;
  sair: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [nomeUsuario, setNomeUsuario] = useState<string | null>(null);
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(true);

  const sair = useCallback(async () => {
    try {
      await limparSessao();
    } catch {
      // Ignora erro de limpeza
    } finally {
      setTokenState(null);
      setNomeUsuario(null);
      setClienteId(null);
      setUserId(null);
    }
  }, []);

  const carregarAuth = useCallback(async () => {
    try {
      const sessao = await lerSessao();
      if (sessao.token) {
        // Checar se o token expirou pelo claim exp
        if (sessao.exp) {
          const agoraSegundos = Math.floor(Date.now() / 1000);
          if (sessao.exp < agoraSegundos) {
            await sair();
            return;
          }
        }
        setTokenState(sessao.token);
        setNomeUsuario(sessao.nomeUsuario);
        setClienteId(sessao.clienteId);
        setUserId(sessao.userId);
      } else {
        await sair();
      }
    } catch {
      await sair();
    } finally {
      setCarregando(false);
    }
  }, [sair]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    carregarAuth();

    // Registra callback para expiração 401
    registrarAoExpirarSessao(async () => {
      await sair();
      try {
        router.replace('/login');
      } catch {
        // caso router ainda não esteja pronto
      }
    });

    return () => {
      registrarAoExpirarSessao(null);
    };
  }, [carregarAuth, sair]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const entrar = async (dados: ParametrosEntrar | string, nomeOpcional?: string) => {
    let tokenStr: string;
    let usuarioStr: string;
    let cId: number | null = null;

    if (typeof dados === 'string') {
      tokenStr = dados;
      usuarioStr = nomeOpcional || '';
    } else {
      tokenStr = dados.token;
      usuarioStr = dados.nomeUsuario;
      cId = dados.clienteId ?? null;
    }

    await salvarSessao({
      token: tokenStr,
      nomeUsuario: usuarioStr,
      clienteId: cId,
    });

    const sessaoAtualizada = await lerSessao();
    setTokenState(sessaoAtualizada.token);
    setNomeUsuario(sessaoAtualizada.nomeUsuario);
    setClienteId(sessaoAtualizada.clienteId);
    setUserId(sessaoAtualizada.userId);
  };

  const logado = !!token;

  return (
    <AuthContext.Provider
      value={{
        token,
        nomeUsuario,
        clienteId,
        userId,
        logado,
        carregando,
        entrar,
        sair,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
