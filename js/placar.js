// Placar: fim da partida, mão de onze e mão de ferro.

export const PONTOS_PARA_VENCER = 12;
const ONZE = 11;

/** `?placar=11-4` → { nos: 11, eles: 4 }. Inválido ou ausente → 0 × 0. */
export function lerPlacar(texto) {
  const m = /^(\d+)-(\d+)$/.exec(texto ?? '');
  return m ? { nos: Number(m[1]), eles: Number(m[2]) } : { nos: 0, eles: 0 };
}

/** Dupla que venceu a partida (12 pontos ou mais), ou null. */
export function vencedorDaPartida(placar) {
  if (placar.nos >= PONTOS_PARA_VENCER) return 'nos';
  if (placar.eles >= PONTOS_PARA_VENCER) return 'eles';
  return null;
}

/**
 * Situação especial de uma mão, pelo placar no começo dela.
 * Mão de onze: só uma dupla tem 11 — ela decide se joga. Mão de ferro: as duas têm 11.
 */
export function situacaoDaMao(placar) {
  const nos = placar.nos === ONZE;
  const eles = placar.eles === ONZE;
  if (nos && eles) return { onze: null, ferro: true };
  if (nos || eles) return { onze: nos ? 'nos' : 'eles', ferro: false };
  return { onze: null, ferro: false };
}

const NOME_DUPLA = { nos: 'Nós', eles: 'Eles' };
export const mensagemDeVitoria = (dupla) => `${NOME_DUPLA[dupla]} venceram a partida!`;
