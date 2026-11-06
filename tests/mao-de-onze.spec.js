// Testes de mão de onze e mão de ferro (Breno — B5). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { test, expect } from 'vitest';
import { abrirJogo, screen, montarBaralho, cartasNaMao } from './helpers.js';

const BARALHO_MAO_ESPECIAL = montarBaralho(
  ['6E', '2E', '7E'],
  ['7C', '6C', 'QC'],
  ['3C', '3P', 'AP'],
  ['QE', 'JE', 'KE'],
  '4O',
);

async function abrirMaoEspecial(placar) {
  const user = await abrirJogo({ placar, baralho: BARALHO_MAO_ESPECIAL });
  await user.click(screen.getByTestId('btn-nova-partida'));
  return user;
}

test('TC-TR-25 Nós escolhe jogar a mão de onze por 3 pontos', async () => {
  const user = await abrirMaoEspecial('11-4');

  expect(screen.getByTestId('decisao-onze')).toBeVisible();
  expect(screen.getByTestId('btn-jogar-onze')).toHaveTextContent(/^Jogar$/i);
  expect(screen.getByTestId('btn-correr-onze')).toHaveTextContent(/^Correr$/i);
  const cartasDoParceiro = cartasNaMao('J3');
  expect(cartasDoParceiro).toHaveLength(3);
  for (const carta of cartasDoParceiro) expect(carta).toHaveAttribute('data-face', 'cima');

  await user.click(screen.getByTestId('btn-jogar-onze'));
  expect(screen.getByTestId('valor-mao')).toHaveTextContent(/^3$/);
});
