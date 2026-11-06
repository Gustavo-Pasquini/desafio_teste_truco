// Testes de vira, manilha e força das cartas (Gustavo — G3). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { test, expect } from 'vitest';
import { abrirJogo, screen, montarBaralho, jogarVaza } from './helpers.js';

async function comBaralho(baralho) {
  const user = await abrirJogo({ baralho });
  await user.click(screen.getByTestId('btn-nova-partida'));
  return user;
}

// Mãos fixas sem nenhuma carta de ouros, para a vira (sempre de ouros) não repetir.
const MAOS_SEM_OUROS = [['AE', '2E', '3E'], ['AC', '2C', '3C'], ['AP', '2P', '3P'], ['KE', 'KC', 'KP']];

test.each([
  ['4', '5'], ['5', '6'], ['6', '7'], ['7', 'Q'], ['Q', 'J'],
  ['J', 'K'], ['K', 'A'], ['A', '2'], ['2', '3'], ['3', '4'],
])('TC-TR-05 vira %s → manilha %s', async (vira, manilha) => {
  await comBaralho(montarBaralho(...MAOS_SEM_OUROS, `${vira}O`));
  expect(screen.getByTestId('manilha')).toHaveTextContent(new RegExp(`^${manilha}$`));
});

// Vira 4O → manilha 5. Duas vazas, com o 3 nunca na 1ª nem na última posição:
// 1ª: K (J1) · A (J2) · 3 (J3) · 2 (J4) → Nós.  2ª (J3 começa): K (J3) · 3 (J4) · 2 (J1) · A (J2) → Eles.
// Um jogo que desse a vaza à 1ª carta, à última carta ou ao A erraria em pelo menos uma.
const BARALHO_COMUNS = montarBaralho(['KO', '2O', '6E'], ['AO', 'AE', '6C'], ['3O', 'KE', '6P'], ['2E', '3E', '7C'], '4O');

test('TC-TR-06 força das cartas comuns: 3 > 2 > A > K', async () => {
  const user = await comBaralho(BARALHO_COMUNS);
  await jogarVaza(user, { J1: 'KO', J2: 'AO', J3: '3O', J4: '2E' });
  expect(screen.getByTestId('vaza-1')).toHaveTextContent('Nós');
  await jogarVaza(user, { J3: 'KE', J4: '3E', J1: '2O', J2: 'AE' });
  expect(screen.getByTestId('vaza-2')).toHaveTextContent('Eles');
});

// Vira 4O → as quatro manilhas (5) na mesma vaza: ♦ J1 < ♠ J2 < ♥ J3 < ♣ J4 (zap).
const BARALHO_MANILHAS = montarBaralho(['5O', '6E', '7E'], ['5E', '6C', '7C'], ['5C', '6P', '7P'], ['5P', 'QE', 'QC'], '4O');

test('TC-TR-07 ordem das manilhas: ouros < espadas < copas < paus (zap)', async () => {
  const user = await comBaralho(BARALHO_MANILHAS);
  await jogarVaza(user, { J1: '5O', J2: '5E', J3: '5C', J4: '5P' });
  expect(screen.getByTestId('vaza-1')).toHaveTextContent('Eles');
});

// Vira 4O → 5O (J2) é a manilha mais fraca, mas vence os dois 3 da dupla Nós.
const BARALHO_MANILHA_X_3 = montarBaralho(['3P', '6E', '7E'], ['5O', '6C', '7C'], ['3C', '6P', '7P'], ['4E', 'QE', 'QC'], '4O');

test('TC-TR-08 a manilha mais fraca vence o 3', async () => {
  const user = await comBaralho(BARALHO_MANILHA_X_3);
  await jogarVaza(user, { J1: '3P', J2: '5O', J3: '3C', J4: '4E' });
  expect(screen.getByTestId('vaza-1')).toHaveTextContent('Eles');
});
