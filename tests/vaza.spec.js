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
