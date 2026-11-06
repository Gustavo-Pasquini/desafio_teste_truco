// Testes de mão de onze e mão de ferro (Breno — B5). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { test, expect } from 'vitest';
import { abrirJogo, screen, montarBaralho, jogar, jogarVaza, cartasNaMao } from './helpers.js';

const BARALHO_MAO_ESPECIAL = montarBaralho(
  ['6E', '2E', '7E'],
  ['7C', '6C', 'QC'],
  ['3C', '3P', 'AP'],
  ['QE', 'JE', 'KE'],
  '4O',
);

async function abrirMaoEspecial(placar, baralho = BARALHO_MAO_ESPECIAL) {
  const user = await abrirJogo({ placar, baralho });
  await user.click(screen.getByTestId('btn-nova-partida'));
  return user;
}

test('TC-TR-25 Nós escolhe jogar a mão de onze por 3 pontos', async () => {
  const user = await abrirMaoEspecial('11-4');

  expect(screen.getByTestId('decisao-onze')).toBeVisible();
  expect(screen.getByTestId('decisao-onze')).toHaveAttribute('data-dupla', 'nos');
  expect(screen.getByTestId('btn-jogar-onze')).toHaveTextContent(/^Jogar$/i);
  expect(screen.getByTestId('btn-correr-onze')).toHaveTextContent(/^Correr$/i);
  const cartasDoParceiro = cartasNaMao('J3');
  expect(cartasDoParceiro).toHaveLength(3);
  for (const carta of cartasDoParceiro) expect(carta).toHaveAttribute('data-face', 'cima');
  for (const adversario of ['J2', 'J4']) {
    for (const carta of cartasNaMao(adversario)) expect(carta).toHaveAttribute('data-face', 'baixo');
  }

  await user.click(screen.getByTestId('btn-jogar-onze'));
  expect(screen.getByTestId('valor-mao')).toHaveTextContent(/^3$/);
  expect(screen.getByTestId('decisao-onze')).not.toBeVisible();
});

// Duas mãos fixas: as cartas da 2ª mão (J1 = 7E, KE, AO) só aparecem se a mão for redistribuída.
const BARALHO_DUAS_MAOS = [
  BARALHO_MAO_ESPECIAL,
  montarBaralho(['7E', 'KE', 'AO'], ['3E', '2C', 'QC'], ['6P', '7P', '3O'], ['QE', 'JE', '6C'], '4O'),
].join(',');

test('TC-TR-26 Nós corre da mão de onze e Eles ganha 1 ponto', async () => {
  const user = await abrirMaoEspecial('11-4', BARALHO_DUAS_MAOS);
  await user.click(screen.getByTestId('btn-correr-onze'));

  expect(screen.getByTestId('placar-eles')).toHaveTextContent(/^5$/);
  for (const jogador of ['J1', 'J2', 'J3', 'J4']) {
    expect(cartasNaMao(jogador)).toHaveLength(3);
  }
  expect(cartasNaMao('J1').map((c) => c.getAttribute('data-carta')).sort()).toEqual(['7E', 'AO', 'KE']); // é a 2ª mão
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

test('TC-TR-28 mão de ferro tem cartas fechadas e decide a partida', async () => {
  const user = await abrirMaoEspecial('11-11');

  const cartas = screen.getAllByTestId(/^carta-j[1-4]-\d$/);
  expect(cartas).toHaveLength(12);
  for (const carta of cartas) expect(carta).toHaveAttribute('data-face', 'baixo');
  const botaoTruco = screen.queryByTestId('btn-truco');
  expect(botaoTruco === null || botaoTruco.hidden || botaoTruco.disabled).toBe(true);
  expect(screen.getByTestId('valor-mao')).toHaveTextContent(/^1$/);

  await jogarVaza(user, { J1: '6E', J2: '7C', J3: '3C', J4: 'QE' });
  await jogarVaza(user, { J3: '3P', J4: 'JE', J1: '2E', J2: '6C' });
  expect(screen.getByTestId('placar-nos')).toHaveTextContent(/^12$/);
  expect(screen.getByTestId('mensagem')).toHaveTextContent(/^Nós venceram a partida!$/);
});

test('TC-TR-36 Eles decide sua mão de onze e pode correr', async () => {
  const user = await abrirMaoEspecial('4-11');

  expect(screen.getByTestId('decisao-onze')).toBeVisible();
  expect(screen.getByTestId('decisao-onze')).toHaveTextContent(/Eles/i);
  const cartasDoParceiro = cartasNaMao('J4');
  expect(cartasDoParceiro).toHaveLength(3);
  for (const carta of cartasDoParceiro) expect(carta).toHaveAttribute('data-face', 'cima');

  await user.click(screen.getByTestId('btn-correr-onze'));
  expect(screen.getByTestId('placar-nos')).toHaveTextContent(/^5$/);
});
