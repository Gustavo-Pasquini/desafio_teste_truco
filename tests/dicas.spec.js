// Testes das dicas de jogo (Gustavo — G6). Casos da seção 5 do PLANEJAMENTO.md.
// Modo somente testes: o jogo ainda não existe, então estes testes FALHAM de propósito.
import { abrirJogo, screen, montarBaralho, jogar, cartasNaMao } from './helpers.js';

async function comBaralho(baralho) {
  const user = await abrirJogo({ baralho });
  await user.click(screen.getByTestId('btn-nova-partida'));
  return user;
}

test('TC-TR-40 cartas que são manilha ficam destacadas', async () => {
  await comBaralho(montarBaralho(['5E', '6E', '7E'], ['5C', '6C', '7C'], ['AP', '2P', '3P'], ['KE', 'KC', 'KP'], '4O'));
  for (const [jogador, manilha] of [['J1', '5E'], ['J2', '5C']]) {
    const cartas = cartasNaMao(jogador);
    expect(cartas).toHaveLength(3);
    for (const carta of cartas) {
      const eManilha = carta.getAttribute('data-carta') === manilha;
      expect(carta.getAttribute('data-manilha') === 'true').toBe(eManilha);
    }
  }
});

test('TC-TR-41 a carta que está ganhando a vaza fica destacada', async () => {
  const user = await comBaralho(montarBaralho(['6E', '2E', '7E'], ['7C', '6C', 'QC'], ['3C', '3P', 'AP'], ['QE', 'JE', 'KE'], '4O'));
  for (const [jogador, carta, vencendo] of [['J1', '6E', '6E'], ['J2', '7C', '7C'], ['J3', '3C', '3C'], ['J4', 'QE', '3C']]) {
    await jogar(user, jogador, carta);
    const naMesa = [...screen.getByTestId('mesa').querySelectorAll('[data-carta]')];
    const destacadas = naMesa.filter((c) => c.getAttribute('data-vencendo') === 'true').map((c) => c.getAttribute('data-carta'));
    expect(destacadas).toEqual([vencendo]);
  }
});
