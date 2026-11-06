// Testes de turnos, vazas e empates (Gustavo — G4, G5). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
// Todos os baralhos usam a vira 4O (manilha = 5), e nenhum 5 aparece nas mãos: só cartas comuns.
import { test, expect } from 'vitest';
import { abrirJogo, screen, montarBaralho, jogar, jogarVaza, cartasNaMao } from './helpers.js';

const JOGADORES = ['J1', 'J2', 'J3', 'J4'];

async function comBaralho(baralho) {
  const user = await abrirJogo({ baralho });
  await user.click(screen.getByTestId('btn-nova-partida'));
  return user;
}
/** Nova mão distribuída: os 4 jogadores com 3 cartas de novo. */
function maosCompletas() {
  for (const j of JOGADORES) expect(cartasNaMao(j)).toHaveLength(3);
}

const BARALHO_TURNO = montarBaralho(['3O', '6E', '7E'], ['2O', '6C', '7C'], ['AO', '6P', '7P'], ['KO', 'QE', 'QC'], '4O');

test('TC-TR-09 só joga quem tem a vez', async () => {
  const user = await comBaralho(BARALHO_TURNO);
  expect(screen.getByTestId('vez')).toHaveTextContent(/^J1$/);
  await jogar(user, 'J2', '2O'); // fora da vez
  expect(screen.getByTestId('mesa').children).toHaveLength(0);
  expect(cartasNaMao('J2')).toHaveLength(3);
  expect(screen.getByTestId('vez')).toHaveTextContent(/^J1$/);
});

test('TC-TR-10 ordem de jogada: J1 → J2 → J3 → J4', async () => {
  const user = await comBaralho(BARALHO_TURNO);
  await jogar(user, 'J1', '3O');
  expect(screen.getByTestId('vez')).toHaveTextContent(/^J2$/);
  await jogar(user, 'J2', '2O');
  expect(screen.getByTestId('vez')).toHaveTextContent(/^J3$/);
  await jogar(user, 'J3', 'AO');
  expect(screen.getByTestId('vez')).toHaveTextContent(/^J4$/);
});

test('TC-TR-29 só a mão do jogador da vez fica virada para cima', async () => {
  const user = await comBaralho(BARALHO_TURNO);
  const faces = () => Object.fromEntries(JOGADORES.map((j) => [j, cartasNaMao(j).map((c) => c.getAttribute('data-face'))]));
  const cima = (n) => Array(n).fill('cima');
  const baixo = (n) => Array(n).fill('baixo');
  expect(faces()).toEqual({ J1: cima(3), J2: baixo(3), J3: baixo(3), J4: baixo(3) });
  await jogar(user, 'J1', '3O');
  expect(faces()).toEqual({ J1: baixo(2), J2: cima(3), J3: baixo(3), J4: baixo(3) });
});

// 1ª vaza: o 3C de J3 é a maior. 2ª vaza: o 3P de J3 de novo → Nós vence 2 vazas.
const BARALHO_J3_VENCE = montarBaralho(['6E', '2E', '7E'], ['7C', '6C', 'QC'], ['3C', '3P', 'AP'], ['QE', 'JE', 'KE'], '4O');

test('TC-TR-13 quem vence a vaza começa a próxima; duas vazas encerram a mão', async () => {
  const user = await comBaralho(BARALHO_J3_VENCE);
  await jogarVaza(user, { J1: '6E', J2: '7C', J3: '3C', J4: 'QE' });
  expect(screen.getByTestId('vaza-1')).toHaveTextContent('Nós');
  expect(screen.getByTestId('vez')).toHaveTextContent(/^J3$/);

  await jogarVaza(user, { J3: '3P', J4: 'JE', J1: '2E', J2: '6C' });
  expect(screen.getByTestId('placar-nos')).toHaveTextContent(/^1$/);
  expect(screen.getByTestId('placar-eles')).toHaveTextContent(/^0$/);
  maosCompletas(); // a 3ª vaza não foi jogada: já é a mão seguinte
});
