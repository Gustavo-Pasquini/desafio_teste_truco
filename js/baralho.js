// Cartas do truco paulista: baralho de 40, embaralhar e distribuir.
// Código de uma carta = valor + naipe (ex.: '3P' = 3 de paus).

/** Valores das cartas comuns, da mais fraca para a mais forte. */
export const ESCALA = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];
/** Naipes: ouros, espadas, copas, paus. */
export const NAIPES = ['O', 'E', 'C', 'P'];

export const CARTAS_POR_JOGADOR = 3;
export const JOGADORES = 4;
/** Cartas tiradas do baralho em cada mão: 3 por jogador + a vira. */
export const CARTAS_POR_MAO = CARTAS_POR_JOGADOR * JOGADORES + 1;

export const valorDe = (carta) => carta.slice(0, -1);
export const naipeDe = (carta) => carta.slice(-1);

/** As 40 cartas (sem 8, 9, 10 e coringas). */
export function criarBaralho() {
  return ESCALA.flatMap((valor) => NAIPES.map((naipe) => valor + naipe));
}

/** Nova lista com as cartas em ordem aleatória (Fisher–Yates). */
export function embaralhar(cartas, aleatorio = Math.random) {
  const resultado = [...cartas];
  for (let i = resultado.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
  }
  return resultado;
}

/**
 * Baralho completo para uma mão: as cartas `fixas` primeiro (na ordem dada) e o resto embaralhado.
 * Sem fixas, é só o baralho embaralhado.
 */
export function prepararBaralho(fixas = [], aleatorio = Math.random) {
  const usadas = new Set(fixas);
  return [...fixas, ...embaralhar(criarBaralho().filter((c) => !usadas.has(c)), aleatorio)];
}

/** Dá 3 cartas para J1, J2, J3, J4 (nessa ordem, em blocos) e vira a 13ª. */
export function distribuir(baralho) {
  const maos = [];
  for (let j = 0; j < JOGADORES; j++) {
    maos.push(baralho.slice(j * CARTAS_POR_JOGADOR, (j + 1) * CARTAS_POR_JOGADOR));
  }
  const vira = baralho[CARTAS_POR_MAO - 1];
  return { maos, vira, monte: baralho.slice(CARTAS_POR_MAO) };
}

/** Valor da manilha: o logo acima da vira na escala, circular (vira 3 → manilha 4). */
export function manilhaDe(vira) {
  const i = ESCALA.indexOf(valorDe(vira));
  return ESCALA[(i + 1) % ESCALA.length];
}

/**
 * Força de uma carta, dada a manilha. Comuns: posição na escala (naipe não importa).
 * Manilhas: acima de qualquer comum, na ordem ouros < espadas < copas < paus.
 */
export function forca(carta, manilha) {
  if (valorDe(carta) === manilha) return ESCALA.length + NAIPES.indexOf(naipeDe(carta));
  return ESCALA.indexOf(valorDe(carta));
}
