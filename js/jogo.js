// Estado da partida: placar, mãos, vez, vazas, apostas, mão de onze e de ferro.
import { prepararBaralho, distribuir, manilhaDe, CARTAS_POR_MAO, JOGADORES } from './baralho.js';
import { vencedorDaVaza, vencedorDaMao, duplaDe } from './vaza.js';
import * as apostas from './apostas.js';
import { situacaoDaMao, vencedorDaPartida } from './placar.js';

/**
 * Cria um jogo. As opções fixam o cenário dos parâmetros de URL, que valem só para a 1ª partida.
 * @param {{ baralhoFixo?: string[], placarInicial?: {nos:number, eles:number}, aleatorio?: () => number }} opcoes
 *   baralhoFixo: primeiras cartas de cada mão (13 por mão), na ordem J1, J2, J3, J4, vira.
 */
export function criarJogo({ baralhoFixo = [], placarInicial = { nos: 0, eles: 0 }, aleatorio = Math.random } = {}) {
  const estado = {
    placar: { nos: 0, eles: 0 },
    maos: [[], [], [], []],
    vira: null,
    manilha: null,
    monte: [],
    vez: null,
    mesa: [], // jogadas da vaza atual: { jogador, carta }
    vazas: [], // resultado de cada vaza da mão: 'nos' | 'eles' | 'empate'
    numeroDaMao: 0, // 0 = 1ª mão da partida
    aposta: null, // valor da mão e pedidos de truco (apostas.js)
    onze: null, // mão de onze: { dupla, decidida }
    ferro: false, // mão de ferro (11 × 11)
    vencedor: null, // dupla que venceu a partida
  };
  let partidas = 0; // os parâmetros de URL só valem para a 1ª partida
  let fixas = baralhoFixo;

  /**
   * Distribui a mão `estado.numeroDaMao`, usando as cartas fixas dela, se houver.
   * Rodízio: a 1ª mão começa com J1, a 2ª com J2, e assim por diante.
   */
  function distribuirMao() {
    const inicio = estado.numeroDaMao * CARTAS_POR_MAO;
    const { maos, vira, monte } = distribuir(prepararBaralho(fixas.slice(inicio, inicio + CARTAS_POR_MAO), aleatorio));
    const { onze, ferro } = situacaoDaMao(estado.placar);
    Object.assign(estado, {
      maos, vira, manilha: manilhaDe(vira), monte, vez: estado.numeroDaMao % JOGADORES, mesa: [], vazas: [],
      aposta: apostas.criarAposta(), onze: onze ? { dupla: onze, decidida: false } : null, ferro,
    });
  }

  function novaPartida() {
    const primeira = partidas === 0;
    partidas += 1;
    if (!primeira) fixas = [];
    Object.assign(estado, { placar: primeira ? { ...placarInicial } : { nos: 0, eles: 0 }, numeroDaMao: 0, vencedor: null });
    distribuirMao();
  }

  /** Soma pontos; se ninguém chegou a 12, distribui a próxima mão. */
  function pontuar(dupla, pontos) {
    if (dupla) estado.placar[dupla] += pontos;
    estado.vencedor = vencedorDaPartida(estado.placar);
    if (estado.vencedor) return;
    estado.numeroDaMao += 1;
    distribuirMao();
  }

  function fecharVaza() {
    const { resultado, jogador } = vencedorDaVaza(estado.mesa, estado.manilha);
    estado.vazas.push(resultado);
    // Quem venceu começa a próxima; depois de um empate, quem começou a vaza empatada.
    estado.vez = jogador ?? estado.mesa[0].jogador;
    estado.mesa = [];
    const mao = vencedorDaMao(estado.vazas);
    if (mao.terminou) pontuar(mao.vencedor, estado.aposta.valor);
  }

  /** Dá para jogar carta agora? (partida em andamento, sem pedido nem decisão de onze pendente) */
  const podeJogar = () =>
    estado.vez !== null && !estado.vencedor && !estado.aposta.pendente && !(estado.onze && !estado.onze.decidida);

  /** O jogador joga a carta de índice `indice` da mão. Fora da vez, nada acontece. */
  function jogarCarta(jogador, indice) {
    if (!podeJogar() || jogador !== estado.vez) return;
    const [carta] = estado.maos[jogador].splice(indice, 1);
    estado.mesa.push({ jogador, carta });
    if (estado.mesa.length === JOGADORES) fecharVaza();
    else estado.vez = (jogador + 1) % JOGADORES;
  }

  /** Sem truco na mão de onze nem na de ferro; a dupla que fez o último pedido não aumenta. */
  const podePedirTruco = () =>
    podeJogar() && !estado.onze && !estado.ferro && apostas.podePedir(estado.aposta, duplaDe(estado.vez));

  function pedirTruco() {
    if (podePedirTruco()) estado.aposta = apostas.pedir(estado.aposta, duplaDe(estado.vez));
  }

  /** Resposta ao pedido em andamento: 'aceitar', 'correr' ou 'aumentar'. */
  function responder(acao) {
    const { aposta } = estado;
    if (!aposta?.pendente || estado.vencedor) return;
    if (acao === 'aceitar') estado.aposta = apostas.aceitar(aposta);
    if (acao === 'aumentar' && apostas.podeAumentar(aposta)) estado.aposta = apostas.aumentar(aposta);
    if (acao === 'correr') {
      const { dupla, pontos } = apostas.resultadoAoCorrer(aposta);
      pontuar(dupla, pontos);
    }
  }

  /** Mão de onze: a dupla com 11 joga (vale 3) ou corre (a outra ganha 1). */
  function decidirOnze(jogar) {
    if (!estado.onze || estado.onze.decidida || estado.vencedor) return;
    if (jogar) {
      estado.onze.decidida = true;
      estado.aposta = apostas.criarAposta(3);
    } else {
      pontuar(apostas.outraDupla(estado.onze.dupla), 1);
    }
  }

  return { estado, novaPartida, jogarCarta, podeJogar, podePedirTruco, pedirTruco, responder, decidirOnze };
}
