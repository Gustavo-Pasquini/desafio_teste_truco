// Ponto de entrada do jogo: lê a URL, encontra os elementos da tela e inicia o jogo.
// Roda ao ser importado (sem DOMContentLoaded), como os testes esperam.
import { criarJogo } from './jogo.js';
import { lerPlacar } from './placar.js';
import { desenharMesa, escutarCartas } from './ui-mesa.js';
import { desenharPlacar, desenharApostas, rotularBotoes } from './ui-apostas.js';

const porId = (id) => document.querySelector(`[data-testid="${id}"]`);

const tela = {
  novaPartida: porId('btn-nova-partida'),
  placarNos: porId('placar-nos'),
  placarEles: porId('placar-eles'),
  vira: porId('vira'),
  manilha: porId('manilha'),
  monteQtd: porId('monte-qtd'),
  vez: porId('vez'),
  maos: [1, 2, 3, 4].map((j) => porId(`mao-j${j}`)),
  mesa: porId('mesa'),
  vazas: porId('vazas'),
  valorMao: porId('valor-mao'),
  btnTruco: porId('btn-truco'),
  resposta: porId('resposta'),
  btnAceitar: porId('btn-aceitar'),
  btnCorrer: porId('btn-correr'),
  btnAumentar: porId('btn-aumentar'),
  decisaoOnze: porId('decisao-onze'),
  btnJogarOnze: porId('btn-jogar-onze'),
  btnCorrerOnze: porId('btn-correr-onze'),
  mensagem: porId('mensagem'),
};

const params = new URLSearchParams(location.search);
/** `?baralho=3P,2O,...`: códigos de carta separados por vírgula. */
const lerBaralho = (texto) => (texto ? texto.split(',').map((c) => c.trim()).filter(Boolean) : []);

// Os parâmetros de URL valem só para a 1ª partida (a do 1º clique em Nova partida).
const jogo = criarJogo({ baralhoFixo: lerBaralho(params.get('baralho')), placarInicial: lerPlacar(params.get('placar')) });

function desenhar() {
  desenharMesa(tela, jogo.estado, jogo.podeJogar());
  desenharPlacar(tela, jogo.estado.placar);
  desenharApostas(tela, jogo);
}

/** Liga um botão a uma ação do jogo e redesenha. */
const aoClicar = (botao, acao) => botao.addEventListener('click', () => { acao(); desenhar(); });

tela.novaPartida.textContent = 'Nova partida';
rotularBotoes(tela);
aoClicar(tela.novaPartida, () => jogo.novaPartida());
aoClicar(tela.btnTruco, () => jogo.pedirTruco());
aoClicar(tela.btnAceitar, () => jogo.responder('aceitar'));
aoClicar(tela.btnCorrer, () => jogo.responder('correr'));
aoClicar(tela.btnAumentar, () => jogo.responder('aumentar'));
aoClicar(tela.btnJogarOnze, () => jogo.decidirOnze(true));
aoClicar(tela.btnCorrerOnze, () => jogo.decidirOnze(false));
escutarCartas(tela, (jogador, indice) => {
  jogo.jogarCarta(jogador, indice);
  desenhar();
});
desenhar();
