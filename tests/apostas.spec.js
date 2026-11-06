// Testes de pedidos e aumentos (Breno — B2, B3). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { test, expect } from 'vitest';
import { abrirJogo, screen } from './helpers.js';

test('TC-TR-16 botão Truco disponível no início da mão', async () => {
  const user = await abrirJogo();
  await user.click(screen.getByTestId('btn-nova-partida'));

  expect(screen.getByTestId('valor-mao')).toHaveTextContent(/^1$/);
  expect(screen.getByTestId('btn-truco')).toHaveTextContent(/^Truco$/i);
  expect(screen.getByTestId('btn-truco')).toBeEnabled();
});
