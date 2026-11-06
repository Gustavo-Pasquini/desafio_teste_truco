// Testes de mão de onze e mão de ferro (Breno — B5). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { test, expect } from 'vitest';
import { abrirJogo, screen, montarBaralho, jogar, cartasNaMao } from './helpers.js';

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

test('TC-TR-26 Nós corre da mão de onze e Eles ganha 1 ponto', async () => {
  const user = await abrirMaoEspecial('11-4');
  await user.click(screen.getByTestId('btn-correr-onze'));

  expect(screen.getByTestId('placar-eles')).toHaveTextContent(/^5$/);
  for (const jogador of ['J1', 'J2', 'J3', 'J4']) {
    expect(cartasNaMao(jogador)).toHaveLength(3);
  }
});

test('TC-TR-27 não permite Truco durante toda a mão de onze', async () => {
  const user = await abrirMaoEspecial('11-4');
  await user.click(screen.getByTestId('btn-jogar-onze'));

  const esperarTrucoIndisponivel = () => {
    const botao = screen.queryByTestId('btn-truco');
    expect(botao === null || botao.hidden || botao.disabled).toBe(true);
  };
  esperarTrucoIndisponivel();

  for (const [jogador, carta] of [
    ['J1', '6E'], ['J2', '7C'], ['J3', '3C'], ['J4', 'QE'],
    ['J3', '3P'], ['J4', 'JE'], ['J1', '2E'], ['J2', '6C'],
  ]) {
    await jogar(user, jogador, carta);
    esperarTrucoIndisponivel();
  }
});
