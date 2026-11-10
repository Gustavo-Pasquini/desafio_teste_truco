// Testes do baralho e da distribuição (Gustavo — G2). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
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

test('TC-TR-02 distribuição: 3 cartas para cada jogador e vira na mesa', async () => {
  await novaPartida();
  for (const j of JOGADORES) expect(cartasNaMao(j)).toHaveLength(3);
  expect(screen.getByTestId('vira')).toHaveAttribute('data-carta', expect.stringMatching(CODIGO));
  expect(screen.getByTestId('vez')).toHaveTextContent(/^J1$/);
});

test('TC-TR-03 baralho de 40 cartas: monte com 27 e sem 8, 9 ou 10 (20 partidas)', async () => {
  const user = await abrirJogo();
  for (let i = 0; i < 20; i++) {
    await user.click(screen.getByTestId('btn-nova-partida')); // o mesmo jogo distribui de novo
    expect(screen.getByTestId('monte-qtd')).toHaveTextContent(/^27$/);
    const cartas = cartasExibidas();
    expect(cartas).toHaveLength(13);
    for (const c of cartas) expect(c).toMatch(CODIGO);
  }
});

test('TC-TR-04 as 13 cartas à vista não se repetem (20 partidas)', async () => {
  const user = await abrirJogo();
  for (let i = 0; i < 20; i++) {
    await user.click(screen.getByTestId('btn-nova-partida')); // o mesmo jogo distribui de novo
    const cartas = cartasExibidas();
    expect(cartas).toHaveLength(13);
    expect(new Set(cartas).size).toBe(13);
  }
});
