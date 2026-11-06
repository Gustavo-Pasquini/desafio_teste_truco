// Testes de placar e fim da partida (Breno — B4). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { test, expect } from 'vitest';
import { abrirJogo, screen, montarBaralho, jogarVaza } from './helpers.js';

// Vira 4O (manilha 5, ausente das mãos). J3 vence as duas primeiras vazas para Nós.
const BARALHO_NOS_VENCE = montarBaralho(
  ['6E', '2E', '7E'],
  ['7C', '6C', 'QC'],
  ['3C', '3P', 'AP'],
  ['QE', 'JE', 'KE'],
  '4O',
);

async function vencerTrucoComNos(placar) {
  const user = await abrirJogo({ placar, baralho: BARALHO_NOS_VENCE });
  await user.click(screen.getByTestId('btn-nova-partida'));
  await user.click(screen.getByTestId('btn-truco'));
  await user.click(screen.getByTestId('btn-aceitar'));
  await jogarVaza(user, { J1: '6E', J2: '7C', J3: '3C', J4: 'QE' });
  await jogarVaza(user, { J3: '3P', J4: 'JE', J1: '2E', J2: '6C' });
  return user;
}

test('TC-TR-23 Nós vence a partida ao chegar a 12 pontos', async () => {
  await vencerTrucoComNos('9-5');

  expect(screen.getByTestId('placar-nos')).toHaveTextContent(/^12$/);
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Nós venceram a partida!$/);
  const cartas = screen.getAllByTestId(/^carta-j[1-4]-\d$/);
  expect(cartas.length).toBeGreaterThan(0);
  for (const carta of cartas) expect(carta).toBeDisabled();
});
