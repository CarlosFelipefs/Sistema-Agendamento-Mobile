/**
 * Utilitários para manipulação de data e hora com o back-end ASP.NET.
 * Regra: Enviar sempre no formato local "YYYY-MM-DDTHH:mm:00" sem sufixo "Z" ou timezone,
 * e ler removendo qualquer "Z" ou offset antes de construir a data local.
 */

function preencherZero(n: number): string {
  return n.toString().padStart(2, '0');
}

/**
 * Converte um objeto Date para o formato ISO sem fuso horário: "YYYY-MM-DDTHH:mm:00"
 */
export function paraDataHoraServidor(d: Date): string {
  const ano = d.getFullYear();
  const mes = preencherZero(d.getMonth() + 1);
  const dia = preencherZero(d.getDate());
  const hora = preencherZero(d.getHours());
  const minuto = preencherZero(d.getMinutes());
  return `${ano}-${mes}-${dia}T${hora}:${minuto}:00`;
}

/**
 * Lê a string de datahora do servidor removendo frações de segundos, Z ou offsets,
 * montando um Date correspondente aos componentes literais locais.
 */
export function lerDataHoraServidor(s: string): Date {
  if (!s) return new Date();
  // Remove frações e sufixo Z ou offset (+00:00, -03:00)
  const limpa = s.replace(/Z|[+-]\d{2}:\d{2}$/i, '').split('.')[0];
  const [dataPart, horaPart] = limpa.split('T');
  if (!dataPart) return new Date(s);

  const [ano, mes, dia] = dataPart.split('-').map(Number);
  const [hora, minuto, segundo] = (horaPart || '00:00:00').split(':').map(Number);

  return new Date(ano, (mes || 1) - 1, dia || 1, hora || 0, minuto || 0, segundo || 0);
}

/**
 * Formata para "dd/MM/yyyy às HH:mm"
 */
export function formatarDataHora(s: string | Date): string {
  const d = typeof s === 'string' ? lerDataHoraServidor(s) : s;
  const dia = preencherZero(d.getDate());
  const mes = preencherZero(d.getMonth() + 1);
  const ano = d.getFullYear();
  const hora = preencherZero(d.getHours());
  const minuto = preencherZero(d.getMinutes());
  return `${dia}/${mes}/${ano} às ${hora}:${minuto}`;
}

/**
 * Formata para "dd/MM/yyyy"
 */
export function formatarData(s: string | Date): string {
  const d = typeof s === 'string' ? lerDataHoraServidor(s) : s;
  const dia = preencherZero(d.getDate());
  const mes = preencherZero(d.getMonth() + 1);
  const ano = d.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

/**
 * Verifica se duas datas caem no mesmo dia (ano, mês e dia)
 */
export function mesmoDia(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Devolve uma lista com os próximos n dias a partir de hoje
 */
export function proximosDias(n: number): Date[] {
  const dias: Date[] = [];
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  for (let i = 0; i < n; i++) {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() + i);
    dias.push(d);
  }
  return dias;
}
