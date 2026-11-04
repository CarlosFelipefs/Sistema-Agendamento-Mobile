/**
 * Decodificação de Claims de JWT sem dependência de bibliotecas externas.
 */

export interface ClaimsJwt {
  sub?: number;
  clienteId?: number;
  exp?: number;
  unique_name?: string;
  role?: string;
  nameid?: string;
  [key: string]: unknown;
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }

  if (typeof atob === 'function') {
    const raw = atob(base64);
    try {
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) {
        bytes[i] = raw.charCodeAt(i);
      }
      return new TextDecoder().decode(bytes);
    } catch {
      return decodeURIComponent(
        raw
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    }
  }

  // Fallback se atob não existir
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  base64 = base64.replace(/[^A-Za-z0-9+/=]/g, '');

  for (let i = 0; i < base64.length; ) {
    const enc1 = chars.indexOf(base64.charAt(i++));
    const enc2 = chars.indexOf(base64.charAt(i++));
    const enc3 = chars.indexOf(base64.charAt(i++));
    const enc4 = chars.indexOf(base64.charAt(i++));

    const chr1 = (enc1 << 2) | (enc2 >> 4);
    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const chr3 = ((enc3 & 3) << 6) | enc4;

    output += String.fromCharCode(chr1);
    if (enc3 !== 64) output += String.fromCharCode(chr2);
    if (enc4 !== 64) output += String.fromCharCode(chr3);
  }

  return decodeURIComponent(
    output
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

export function lerClaims(token: string): ClaimsJwt | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const partes = token.split('.');
    if (partes.length < 2) return null;

    const payloadJson = base64UrlDecode(partes[1]);
    const obj = JSON.parse(payloadJson);

    return {
      ...obj,
      sub: obj.sub ? Number(obj.sub) : undefined,
      clienteId: obj.clienteId ? Number(obj.clienteId) : undefined,
      exp: obj.exp ? Number(obj.exp) : undefined,
      unique_name: obj.unique_name || obj['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
    };
  } catch {
    return null;
  }
}
