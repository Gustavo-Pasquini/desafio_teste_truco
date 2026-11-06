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

// Duas mãos fixas (26 cartas). Mão 1 (começa J1): Nós vence as 2 vazas.
// Mão 2 (pelo rodízio, começa J2): Eles vence as 2 vazas. A mão 3 deve começar com J3.
const BARALHO_RODIZIO = [
  montarBaralho(['6E', '2E', '7E'], ['7C', '6C', 'QC'], ['3C', '3P', 'AP'], ['QE', 'JE', 'KE'], '4O'),
  montarBaralho(['7E', 'KE', 'AO'], ['3E', '2C', 'QC'], ['6P', '7P', '3O'], ['QE', 'JE', '6C'], '4O'),
].join(',');

test('TC-TR-37 rodízio: cada mão começa com o próximo jogador', async () => {
  const user = await comBaralho(BARALHO_RODIZIO);
  expect(screen.getByTestId('vez')).toHaveTextContent(/^J1$/);
  await jogarVaza(user, { J1: '6E', J2: '7C', J3: '3C', J4: 'QE' });
  await jogarVaza(user, { J3: '3P', J4: 'JE', J1: '2E', J2: '6C' });
  expect(screen.getByTestId('placar-nos')).toHaveTextContent(/^1$/);
  expect(screen.getByTestId('vez')).toHaveTextContent(/^J2$/); // mão 2
  await jogarVaza(user, { J2: '3E', J3: '6P', J4: 'QE', J1: '7E' });
  await jogarVaza(user, { J2: '2C', J3: '7P', J4: 'JE', J1: 'KE' });
  expect(screen.getByTestId('placar-eles')).toHaveTextContent(/^1$/);
  expect(screen.getByTestId('vez')).toHaveTextContent(/^J3$/); // mão 3
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

// 1ª vaza: 3O (Nós) × 3E (Eles) são as maiores → empate. 2ª vaza: o AP de J2 vence.
const BARALHO_EMPATE_1A = montarBaralho(['3O', '6E', '7E'], ['3E', 'AP', 'QC'], ['6P', '7P', 'JE'], ['QE', 'KE', '6C'], '4O');

test('TC-TR-11 empate na 1ª vaza: quem vence a 2ª leva a mão', async () => {
  const user = await comBaralho(BARALHO_EMPATE_1A);
  await jogarVaza(user, { J1: '3O', J2: '3E', J3: '6P', J4: 'QE' });
  expect(screen.getByTestId('vaza-1')).toHaveTextContent('Empate');
  await jogarVaza(user, { J1: '6E', J2: 'AP', J3: '7P', J4: 'KE' });
  expect(screen.getByTestId('placar-eles')).toHaveTextContent(/^1$/);
  expect(screen.getByTestId('placar-nos')).toHaveTextContent(/^0$/);
});

// 1ª vaza: 3O de J1 vence. 2ª vaza: 2E (Eles, sai antes) × 2O (Nós, sai depois) → empate.
// A ordem importa: um jogo que desempatasse pela 1ª ou pela última carta jogada erraria aqui.
const BARALHO_EMPATE_2A = montarBaralho(['3O', '6E', '7E'], ['7C', '2E', '6C'], ['QP', '2O', 'JE'], ['QE', 'KE', '6P'], '4O');

test('TC-TR-12 vence a 1ª e empata a 2ª: leva quem venceu a 1ª', async () => {
  const user = await comBaralho(BARALHO_EMPATE_2A);
  await jogarVaza(user, { J1: '3O', J2: '7C', J3: 'QP', J4: 'QE' });
  expect(screen.getByTestId('vaza-1')).toHaveTextContent('Nós');
  await jogarVaza(user, { J1: '6E', J2: '2E', J3: '2O', J4: 'KE' });
  expect(screen.getByTestId('placar-nos')).toHaveTextContent(/^1$/);
  expect(screen.getByTestId('placar-eles')).toHaveTextContent(/^0$/);
  maosCompletas(); // a 3ª vaza não é jogada
});

// 1ª: 3O (Nós) vence · 2ª: AP (Eles) vence · 3ª: 2O (Nós) × 2E (Eles) → empate.
const BARALHO_EMPATE_3A = montarBaralho(['3O', '6E', '2O'], ['7C', 'AP', '2E'], ['QP', '7P', 'JE'], ['QE', 'KE', '6P'], '4O');

test('TC-TR-14 1ª Nós, 2ª Eles, 3ª empata: leva quem venceu a 1ª', async () => {
  const user = await comBaralho(BARALHO_EMPATE_3A);
  await jogarVaza(user, { J1: '3O', J2: '7C', J3: 'QP', J4: 'QE' });
  await jogarVaza(user, { J1: '6E', J2: 'AP', J3: '7P', J4: 'KE' });
  await jogarVaza(user, { J1: '2O', J2: '2E', J3: 'JE', J4: '6P' });
  expect(screen.getByTestId('placar-nos')).toHaveTextContent(/^1$/);
  expect(screen.getByTestId('placar-eles')).toHaveTextContent(/^0$/);
});

// As três vazas empatam: 3O × 3E, 2O × 2E, AO × AE (J3 e J4 jogam cartas menores).
const BARALHO_TRES_EMPATES = montarBaralho(['3O', '2O', 'AO'], ['3E', '2E', 'AE'], ['4P', '6P', '7P'], ['4C', '6C', '7C'], '4O');

test('TC-TR-15 três empates: ninguém pontua', async () => {
  const user = await comBaralho(BARALHO_TRES_EMPATES);
  await jogarVaza(user, { J1: '3O', J2: '3E', J3: '4P', J4: '4C' });
  await jogarVaza(user, { J1: '2O', J2: '2E', J3: '6P', J4: '6C' });
  await jogarVaza(user, { J1: 'AO', J2: 'AE', J3: '7P', J4: '7C' });
  expect(screen.getByTestId('placar-nos')).toHaveTextContent(/^0$/);
  expect(screen.getByTestId('placar-eles')).toHaveTextContent(/^0$/);
  maosCompletas(); // nova mão distribuída
});

// Os dois 3 são da dupla Nós (J1 e J3): não é empate, porque a maior de Eles é um 2.
const BARALHO_IGUAIS_NA_DUPLA = montarBaralho(['3O', '6E', '7E'], ['2O', '6C', '7C'], ['3E', '6P', '7P'], ['2E', 'QE', 'QC'], '4O');

test('TC-TR-32 cartas iguais na mesma dupla não empatam', async () => {
  const user = await comBaralho(BARALHO_IGUAIS_NA_DUPLA);
  await jogarVaza(user, { J1: '3O', J2: '2O', J3: '3E', J4: '2E' });
  expect(screen.getByTestId('vaza-1')).toHaveTextContent('Nós');
});
