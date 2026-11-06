// Testes do baralho e da distribuição (Gustavo — G2). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { test, expect } from 'vitest';
import { abrirJogo, screen, cartasNaMao } from './helpers.js';

const JOGADORES = ['J1', 'J2', 'J3', 'J4'];
// Valores do baralho de 40 cartas (sem 8, 9, 10) + naipe O/E/C/P
const CODIGO = /^(A|[2-7]|Q|J|K)[OECP]$/;

async function novaPartida() {
  const user = await abrirJogo();
  await user.click(screen.getByTestId('btn-nova-partida'));
  return user;
}
/** As 13 cartas à vista: 12 nas mãos + a vira. */
const cartasExibidas = () =>
  [...JOGADORES.flatMap((j) => cartasNaMao(j)), screen.getByTestId('vira')].map((c) => c.getAttribute('data-carta'));

test('TC-TR-01 tela inicial: placar 0 × 0 e botão Nova partida', async () => {
  await abrirJogo();
  expect(screen.getByTestId('placar-nos')).toHaveTextContent(/^0$/);
  expect(screen.getByTestId('placar-eles')).toHaveTextContent(/^0$/);
  expect(screen.getByTestId('btn-nova-partida')).toBeVisible();
});
