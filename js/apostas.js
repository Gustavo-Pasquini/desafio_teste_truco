// Pedidos de truco: truco (3), seis (6), nove (9), doze (12).

/** Valores possíveis da mão, em ordem. */
const VALORES = [1, 3, 6, 9, 12];
/** Nome do pedido que leva a mão a cada valor. */
export const NOME_PEDIDO = { 3: 'Truco', 6: 'Seis', 9: 'Nove', 12: 'Doze' };

/** O valor seguinte ao `valor` (1 → 3 → 6 → 9 → 12), ou null depois do 12. */
export const proximoValor = (valor) => VALORES[VALORES.indexOf(valor) + 1] ?? null;
/** O valor anterior (é o que ganha quem pediu, se o outro correr). */
const valorAnterior = (valor) => VALORES[VALORES.indexOf(valor) - 1];

export const outraDupla = (dupla) => (dupla === 'nos' ? 'eles' : 'nos');

/**
 * Aposta de uma mão.
 * valor: quanto a mão vale agora; pendente: pedido esperando resposta;
 * ultimoPedido: dupla que fez o último pedido aceito (ela não pode aumentar de novo).
 */
export const criarAposta = (valor = 1) => ({ valor, pendente: null, ultimoPedido: null });

/** Valor mostrado na tela: o do pedido em andamento, se houver. */
export const valorAtual = (aposta) => aposta.pendente?.valor ?? aposta.valor;

/** A dupla `dupla` pode pedir o próximo valor? */
export const podePedir = (aposta, dupla) =>
  !aposta.pendente && aposta.ultimoPedido !== dupla && proximoValor(aposta.valor) !== null;

/** A dupla `dupla` pede o próximo valor; a outra dupla responde. */
export const pedir = (aposta, dupla) => ({
  ...aposta,
  pendente: { valor: proximoValor(aposta.valor), pedidoPor: dupla, responde: outraDupla(dupla) },
});

/** Quem respondeu aceita: a mão passa a valer o pedido. */
export const aceitar = (aposta) => ({ valor: aposta.pendente.valor, pendente: null, ultimoPedido: aposta.pendente.pedidoPor });

/** Quem respondeu aumenta: agora é a outra dupla que responde. */
export const aumentar = (aposta) => ({
  ...aposta,
  pendente: { valor: proximoValor(aposta.pendente.valor), pedidoPor: aposta.pendente.responde, responde: aposta.pendente.pedidoPor },
});

/** Quem respondeu corre: quem pediu ganha o valor anterior ao pedido. */
export const resultadoAoCorrer = (aposta) => ({ dupla: aposta.pendente.pedidoPor, pontos: valorAnterior(aposta.pendente.valor) });

/** Ainda dá para aumentar o pedido em andamento? (no Doze, não) */
export const podeAumentar = (aposta) => proximoValor(aposta.pendente.valor) !== null;
