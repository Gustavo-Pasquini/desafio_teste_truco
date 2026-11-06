// Testes de pedidos e aumentos (Breno — B2, B3). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { test, expect } from 'vitest';
import { abrirJogo, screen, montarBaralho, jogar, jogarVaza, cartasNaMao } from './helpers.js';

// Vira 4O (manilha 5, ausente das mãos). J3 vence as duas primeiras vazas com 3C e 3P.
const BARALHO_NOS_VENCE = montarBaralho(
  ['6E', '2E', '7E'],
  ['7C', '6C', 'QC'],
  ['3C', '3P', 'AP'],
  ['QE', 'JE', 'KE'],
  '4O',
);

test('TC-TR-16 botão Truco disponível no início da mão', async () => {
  const user = await abrirJogo();
  await user.click(screen.getByTestId('btn-nova-partida'));

  expect(screen.getByTestId('valor-mao')).toHaveTextContent(/^1$/);
  expect(screen.getByTestId('btn-truco')).toHaveTextContent(/^Truco$/i);
  expect(screen.getByTestId('btn-truco')).toBeEnabled();
  expect(screen.getByTestId('resposta')).not.toBeVisible(); // nenhum pedido ainda
  expect(screen.getByTestId('decisao-onze')).not.toBeVisible(); // não é mão de onze
});

test('TC-TR-17 pedir Truco exibe respostas para Eles e bloqueia as cartas', async () => {
  const user = await abrirJogo();
  await user.click(screen.getByTestId('btn-nova-partida'));
  expect(screen.getByTestId('resposta')).not.toBeVisible(); // só aparece depois do pedido
  await user.click(screen.getByTestId('btn-truco'));

  expect(screen.getByTestId('resposta')).toBeVisible();
  expect(screen.getByTestId('resposta')).toHaveAttribute('data-dupla', 'eles');
  expect(screen.getByTestId('btn-aceitar')).toHaveTextContent(/^Aceitar$/i);
  expect(screen.getByTestId('btn-correr')).toHaveTextContent(/^Correr$/i);
  expect(screen.getByTestId('btn-aumentar')).toHaveTextContent(/^Seis$/i);

  const cartas = screen.getAllByTestId(/^carta-j[1-4]-\d$/);
  expect(cartas).toHaveLength(12);
  for (const carta of cartas) expect(carta).toHaveAttribute('disabled');
});

test('TC-TR-18 aceitar Truco faz a mão valer 3 pontos', async () => {
  const user = await abrirJogo({ baralho: BARALHO_NOS_VENCE });
  await user.click(screen.getByTestId('btn-nova-partida'));
  await user.click(screen.getByTestId('btn-truco'));
  await user.click(screen.getByTestId('btn-aceitar'));

  expect(screen.getByTestId('valor-mao')).toHaveTextContent(/^3$/);
  await jogarVaza(user, { J1: '6E', J2: '7C', J3: '3C', J4: 'QE' });
  await jogarVaza(user, { J3: '3P', J4: 'JE', J1: '2E', J2: '6C' });
  expect(screen.getByTestId('placar-nos')).toHaveTextContent(/^3$/);
});

// Duas mãos fixas: as cartas da 2ª mão (J1 = 7E, KE, AO) só aparecem se a mão for redistribuída.
const BARALHO_DUAS_MAOS = [
  BARALHO_NOS_VENCE,
  montarBaralho(['7E', 'KE', 'AO'], ['3E', '2C', 'QC'], ['6P', '7P', '3O'], ['QE', 'JE', '6C'], '4O'),
].join(',');

test('TC-TR-19 correr do Truco dá 1 ponto a Nós e distribui nova mão', async () => {
  const user = await abrirJogo({ baralho: BARALHO_DUAS_MAOS });
  await user.click(screen.getByTestId('btn-nova-partida'));
  await user.click(screen.getByTestId('btn-truco'));
  await user.click(screen.getByTestId('btn-correr'));

  expect(screen.getByTestId('placar-nos')).toHaveTextContent(/^1$/);
  for (const jogador of ['J1', 'J2', 'J3', 'J4']) {
    expect(cartasNaMao(jogador)).toHaveLength(3);
  }
  expect(cartasNaMao('J1').map((c) => c.getAttribute('data-carta')).sort()).toEqual(['7E', 'AO', 'KE']); // é a 2ª mão
});

test('TC-TR-20 aumentos levam a mão de Truco até Doze', async () => {
  const user = await abrirJogo();
  await user.click(screen.getByTestId('btn-nova-partida'));

  await user.click(screen.getByTestId('btn-truco'));
  expect(screen.getByTestId('valor-mao')).toHaveTextContent(/^3$/);

  await user.click(screen.getByTestId('btn-aumentar'));
  expect(screen.getByTestId('valor-mao')).toHaveTextContent(/^6$/);
  expect(screen.getByTestId('btn-aumentar')).toHaveTextContent(/^Nove$/i);

  await user.click(screen.getByTestId('btn-aumentar'));
  expect(screen.getByTestId('valor-mao')).toHaveTextContent(/^9$/);
  expect(screen.getByTestId('btn-aumentar')).toHaveTextContent(/^Doze$/i);

  await user.click(screen.getByTestId('btn-aumentar'));
  expect(screen.getByTestId('valor-mao')).toHaveTextContent(/^12$/);
  expect(screen.queryByTestId('btn-aumentar')).not.toBeInTheDocument();

  await user.click(screen.getByTestId('btn-aceitar'));
  expect(screen.getByTestId('valor-mao')).toHaveTextContent(/^12$/);
});

test.each([
  { pedido: 'Seis', aumentos: 1, placar: 'placar-eles', pontos: 3 },
  { pedido: 'Nove', aumentos: 2, placar: 'placar-nos', pontos: 6 },
  { pedido: 'Doze', aumentos: 3, placar: 'placar-eles', pontos: 9 },
])('TC-TR-21 correr do $pedido dá $pontos pontos a quem aumentou', async ({ aumentos, placar, pontos }) => {
  const user = await abrirJogo();
  await user.click(screen.getByTestId('btn-nova-partida'));
  await user.click(screen.getByTestId('btn-truco'));

  for (let i = 0; i < aumentos; i++) {
    await user.click(screen.getByTestId('btn-aumentar'));
  }
  await user.click(screen.getByTestId('btn-correr'));

  expect(screen.getByTestId(placar)).toHaveTextContent(new RegExp(`^${pontos}$`));
});

test('TC-TR-22 somente a dupla que recebeu o Truco pode pedir Seis', async () => {
  const user = await abrirJogo({ baralho: BARALHO_NOS_VENCE });
  await user.click(screen.getByTestId('btn-nova-partida'));
  await user.click(screen.getByTestId('btn-truco'));
  await user.click(screen.getByTestId('btn-aceitar'));

  expect(screen.getByTestId('vez')).toHaveTextContent(/^J1$/);
  expect(screen.getByTestId('btn-truco')).toBeDisabled();

  await jogar(user, 'J1', '6E');
  expect(screen.getByTestId('vez')).toHaveTextContent(/^J2$/);
  expect(screen.getByTestId('btn-truco')).toHaveTextContent(/^Seis$/i);
  expect(screen.getByTestId('btn-truco')).toBeEnabled();
});
