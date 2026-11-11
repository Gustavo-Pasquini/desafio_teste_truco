// Desenha a mesa: mãos, vira, monte e jogador da vez. Só desenha e escuta cliques.
import { duplaDe } from './vaza.js';

export const nomeJogador = (indice) => `J${indice + 1}`;

const SIMBOLO = { O: '♦', E: '♠', C: '♥', P: '♣' };
/** Texto da carta para o jogador: '3♣'. */
export const rotuloCarta = (carta) => carta.slice(0, -1) + SIMBOLO[carta.slice(-1)];

/** Desenha a mão de um jogador como botões de carta, com a face para cima ou para baixo. */
function desenharMao(elMao, jogador, cartas, face, bloqueada) {
  elMao.replaceChildren(
    ...cartas.map((carta, i) => {
      const botao = document.createElement('button');
      botao.type = 'button';
      botao.className = 'carta';
      botao.dataset.testid = `carta-j${jogador + 1}-${i}`;
      botao.dataset.carta = carta;
      botao.dataset.face = face;
      botao.dataset.naipe = carta.slice(-1);
      botao.disabled = bloqueada;
      botao.textContent = face === 'cima' ? rotuloCarta(carta) : '';
      return botao;
    }),
  );
}

const NOME_RESULTADO = { nos: 'Nós', eles: 'Eles', empate: 'Empate' };

/** Cartas jogadas na vaza atual. */
function desenharJogadas(elMesa, jogadas) {
  elMesa.replaceChildren(
    ...jogadas.map(({ jogador, carta }) => {
      const el = document.createElement('div');
      el.className = 'carta';
      el.dataset.carta = carta;
      el.dataset.naipe = carta.slice(-1);
      el.textContent = `${nomeJogador(jogador)}: ${rotuloCarta(carta)}`;
      return el;
    }),
  );
}

/** Resultado de cada vaza: filhos vaza-1, vaza-2, vaza-3. */
function desenharVazas(elVazas, vazas) {
  elVazas.replaceChildren(
    ...vazas.map((resultado, i) => {
      const el = document.createElement('span');
      el.dataset.testid = `vaza-${i + 1}`;
      el.textContent = NOME_RESULTADO[resultado];
      return el;
    }),
  );
}

/** Chama `aoJogar(jogador, indice)` quando uma carta da mão é clicada. */
export function escutarCartas(tela, aoJogar) {
  tela.maos.forEach((elMao, jogador) => {
    elMao.addEventListener('click', (evento) => {
      const botao = evento.target.closest('button.carta');
      if (botao) aoJogar(jogador, [...elMao.children].indexOf(botao));
    });
  });
}

/**
 * Face das cartas de cada jogador. Normal: só a mão da vez para cima.
 * Mão de onze (antes da decisão): só a dupla que decide vê as próprias cartas e as do parceiro.
 * Mão de ferro: todas para baixo.
 */
function faceDe(jogador, estado) {
  if (estado.ferro) return 'baixo';
  if (estado.onze && !estado.onze.decidida) return duplaDe(jogador) === estado.onze.dupla ? 'cima' : 'baixo';
  return jogador === estado.vez ? 'cima' : 'baixo';
}

export function desenharMesa(tela, estado, podeJogar) {
  desenharJogadas(tela.mesa, estado.mesa);
  desenharVazas(tela.vazas, estado.vazas);
  estado.maos.forEach((cartas, jogador) =>
    desenharMao(tela.maos[jogador], jogador, cartas, faceDe(jogador, estado), !podeJogar));
  if (estado.vira) {
    tela.vira.dataset.carta = estado.vira;
    tela.vira.dataset.naipe = estado.vira.slice(-1);
    tela.vira.textContent = rotuloCarta(estado.vira);
  }
  tela.manilha.textContent = estado.manilha ?? '';
  tela.monteQtd.textContent = String(estado.monte.length);
  tela.vez.textContent = estado.vez === null ? '' : nomeJogador(estado.vez);
}
