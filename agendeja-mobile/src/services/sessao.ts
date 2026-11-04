import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { lerClaims, ClaimsJwt } from '../utils/jwt';

const TOKEN_KEY = 'user_token';
const NOME_KEY = 'user_name';
const CLIENTE_ID_KEY = 'user_cliente_id';

export interface SessaoArmazenada {
  token: string | null;
  nomeUsuario: string | null;
  clienteId: number | null;
  userId: number | null;
  exp: number | null;
}

export async function salvarToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

export async function obterToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function removerToken(): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

export async function salvarSessao(dados: {
  token: string;
  nomeUsuario: string;
  clienteId?: number | null;
}): Promise<void> {
  await salvarToken(dados.token);
  await AsyncStorage.setItem(NOME_KEY, dados.nomeUsuario);
  if (dados.clienteId !== undefined && dados.clienteId !== null) {
    await AsyncStorage.setItem(CLIENTE_ID_KEY, dados.clienteId.toString());
  } else {
    await AsyncStorage.removeItem(CLIENTE_ID_KEY);
  }
}

export async function lerSessao(): Promise<SessaoArmazenada> {
  try {
    const token = await obterToken();
    const nomeUsuario = await AsyncStorage.getItem(NOME_KEY);
    const clienteIdStr = await AsyncStorage.getItem(CLIENTE_ID_KEY);
    let clienteId = clienteIdStr ? Number(clienteIdStr) : null;

    let userId: number | null = null;
    let exp: number | null = null;

    if (token) {
      const claims: ClaimsJwt | null = lerClaims(token);
      if (claims) {
        if (claims.sub) userId = claims.sub;
        if (!clienteId && claims.clienteId) clienteId = claims.clienteId;
        if (claims.exp) exp = claims.exp;
      }
    }

    return {
      token,
      nomeUsuario,
      clienteId: clienteId || null,
      userId,
      exp,
    };
  } catch {
    return {
      token: null,
      nomeUsuario: null,
      clienteId: null,
      userId: null,
      exp: null,
    };
  }
}

export async function limparSessao(): Promise<void> {
  await removerToken();
  await AsyncStorage.multiRemove([NOME_KEY, CLIENTE_ID_KEY]);
}
