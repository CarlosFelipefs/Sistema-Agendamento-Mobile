/**
 * Utilitários para formatação de valores, textos e números.
 */

/**
 * Formata distância em km ou metros
 */
export function formatarDistancia(distanciaKm?: number): string {
  if (distanciaKm === undefined || distanciaKm === null) {
    return '';
  }
  if (distanciaKm < 1) {
    return `${Math.round(distanciaKm * 1000)} m`;
  }
  return `${distanciaKm.toFixed(1)} km`;
}

/**
 * Formata número em moeda brasileira BRL (R$ 35,00)
 */
export function formatarPreco(valor: number): string {
  if (typeof valor !== 'number' || isNaN(valor)) {
    return 'R$ 0,00';
  }
  return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}

/**
 * Formata duração em minutos para exibição
 */
export function formatarDuracao(minutos: number): string {
  if (!minutos) return '0 min';
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const rest = minutos % 60;
  if (rest === 0) return `${horas}h`;
  return `${horas}h ${rest}min`;
}

/**
 * Remove todos os caracteres não numéricos de uma string
 */
export function somenteDigitos(s: string): string {
  return (s || '').replace(/\D/g, '');
}

/**
 * Gera saudação com base na hora atual ('Bom dia', 'Boa tarde', 'Boa noite')
 */
export function obterSaudacao(idioma: 'br' | 'en' = 'br'): string {
  const hora = new Date().getHours();
  if (idioma === 'en') {
    if (hora < 12) return 'Good morning';
    if (hora < 18) return 'Good afternoon';
    return 'Good evening';
  }
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

/**
 * Formata a data de hoje por extenso
 */
export function formatarDataExtenso(idioma: 'br' | 'en' = 'br'): string {
  const agora = new Date();
  if (idioma === 'en') {
    return agora.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }
  return agora.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}
