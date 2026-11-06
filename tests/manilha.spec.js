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

// Vira 4O → manilha 5. Comuns: 3 (J1) > 2 (J2) > A (J3) > K (J4).
const BARALHO_COMUNS = montarBaralho(['3O', '6E', '7E'], ['2O', '6C', '7C'], ['AO', '6P', '7P'], ['KO', 'QE', 'QC'], '4O');

test('TC-TR-06 força das cartas comuns: 3 > 2 > A > K', async () => {
  const user = await comBaralho(BARALHO_COMUNS);
  await jogarVaza(user, { J1: '3O', J2: '2O', J3: 'AO', J4: 'KO' });
  expect(screen.getByTestId('vaza-1')).toHaveTextContent('Nós');
});
