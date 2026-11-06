// Helpers dos testes de interface (tarefa G1). Contrato: seção 3 do PLANEJAMENTO.md.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, vi } from 'vitest';
import { screen, within } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

// Caminho a partir da raiz (no ambiente jsdom, `new URL(..., import.meta.url)` não funciona com o fs).
const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
const corpo = html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];

/**
 * Abre o jogo como um jogador abriria a página.
 * @param {Record<string,string>} params parâmetros de URL da seção 3 (cenário fixo)
 * @param {object} opcoesUser repassado a userEvent.setup (ex.: { advanceTimers: vi.advanceTimersByTime })
 * @returns user do user-event, para clicar como o jogador
 */
export async function abrirJogo(params = {}, opcoesUser = {}) {
  window.history.replaceState({}, '', '/?' + new URLSearchParams(params));
  document.body.innerHTML = corpo;
  vi.resetModules();
  await import('../js/main.js');
  return userEvent.setup(opcoesUser);
}

/** Clique direito como o jogador faria. */
export async function cliqueDireito(user, elemento) {
  await user.pointer({ keys: '[MouseRight]', target: elemento });
}

export { screen, within };

/** Monta o parâmetro `baralho`: 3 cartas de J1, J2, J3, J4 e a vira. */
export const montarBaralho = (j1, j2, j3, j4, vira) => [...j1, ...j2, ...j3, ...j4, vira].join(',');

/** Cartas na mão de 'J1'…'J4'. */
export const cartasNaMao = (jogador) => {
  const j = jogador.toLowerCase();
  return within(screen.getByTestId(`mao-${j}`)).queryAllByTestId(new RegExp(`^carta-${j}-\\d$`));
};

/** O jogador clica na carta de código `codigo` (ex.: '3P') da própria mão. */
export async function jogar(user, jogador, codigo) {
  const carta = cartasNaMao(jogador).find((c) => c.getAttribute('data-carta') === codigo);
  expect(carta, `a carta ${codigo} não está na mão de ${jogador}`).toBeDefined();
  await user.click(carta);
}

/**
 * Joga uma vaza inteira: lê `vez` antes de cada jogada e joga a carta combinada para aquele jogador.
 * Assim o teste não depende de quem começa a vaza. Ex.: { J1: '3O', J2: '2O', J3: 'AO', J4: 'KO' }
 */
export async function jogarVaza(user, cartas) {
  for (let i = 0; i < 4; i++) {
    const vez = screen.getByTestId('vez').textContent.trim();
    expect(cartas[vez], `é a vez de "${vez}", mas a vaza não tem carta para ele`).toBeDefined();
    await jogar(user, vez, cartas[vez]);
  }
}
