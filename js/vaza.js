// Quem vence a vaza.
import { forca } from './baralho.js';

/** Dupla do jogador (0 = J1 … 3 = J4): J1 e J3 são 'nos'; J2 e J4, 'eles'. */
export const duplaDe = (jogador) => (jogador % 2 === 0 ? 'nos' : 'eles');

/**
 * Vencedor de uma vaza completa.
 * @param {{ jogador: number, carta: string }[]} jogadas na ordem em que foram jogadas
 * @param {string} manilha valor da manilha
 * @returns {{ resultado: 'nos'|'eles'|'empate', jogador: number|null }}
 *   jogador: quem jogou a maior carta (o primeiro, se a dupla tiver duas iguais); null no empate.
 */
export function vencedorDaVaza(jogadas, manilha) {
  // Maior carta de cada dupla (a primeira jogada, se a dupla tiver duas iguais).
  const maior = {};
  for (const jogada of jogadas) {
    const dupla = duplaDe(jogada.jogador);
    if (!maior[dupla] || forca(jogada.carta, manilha) > forca(maior[dupla].carta, manilha)) maior[dupla] = jogada;
  }
  const { nos, eles } = maior;
  const forcaNos = forca(nos.carta, manilha);
  const forcaEles = forca(eles.carta, manilha);
  if (forcaNos === forcaEles) return { resultado: 'empate', jogador: null };
  const melhor = forcaNos > forcaEles ? nos : eles;
  return { resultado: duplaDe(melhor.jogador), jogador: melhor.jogador };
}

/**
 * Vencedor da mão (melhor de 3) a partir dos resultados das vazas já jogadas.
 * @param {('nos'|'eles'|'empate')[]} vazas
 * @returns {{ terminou: boolean, vencedor: 'nos'|'eles'|null }} vencedor null = ninguém pontua
 */
export function vencedorDaMao(vazas) {
  for (const dupla of ['nos', 'eles']) {
    if (vazas.filter((v) => v === dupla).length >= 2) return { terminou: true, vencedor: dupla };
  }
  // 1ª empatou: quem vencer a 2ª leva.
  if (vazas.length >= 2 && vazas[0] === 'empate' && vazas[1] !== 'empate') return { terminou: true, vencedor: vazas[1] };
  // 1ª teve vencedor e uma das seguintes empatou: leva quem venceu a 1ª.
  if (vazas[0] !== 'empate' && vazas.slice(1).includes('empate')) return { terminou: true, vencedor: vazas[0] };
  // Três vazas jogadas: decide a 3ª (se as três empataram, ninguém leva).
  if (vazas.length === 3) return { terminou: true, vencedor: vazas[2] === 'empate' ? null : vazas[2] };
  return { terminou: false, vencedor: null };
}
