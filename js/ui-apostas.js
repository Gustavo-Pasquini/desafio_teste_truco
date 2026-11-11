// Placar, valor da mão, botões de aposta, mão de onze e mensagem. Só desenha e escuta cliques.
import { NOME_PEDIDO, proximoValor, valorAtual, podeAumentar } from './apostas.js';
import { mensagemDeVitoria } from './placar.js';

/** Desenha o placar das duplas. */
export function desenharPlacar(tela, placar) {
  tela.placarNos.textContent = String(placar.nos);
  tela.placarEles.textContent = String(placar.eles);
}

/** Rótulos fixos dos botões de resposta e da mão de onze. */
export function rotularBotoes(tela) {
  tela.btnAceitar.textContent = 'Aceitar';
  tela.btnCorrer.textContent = 'Correr';
  tela.btnJogarOnze.textContent = 'Jogar';
  tela.btnCorrerOnze.textContent = 'Correr';
}

/** Valor da mão, botão de pedir truco, caixa de resposta, mão de onze e mensagem de fim. */
export function desenharApostas(tela, jogo) {
  const { estado } = jogo;
  tela.mensagem.textContent = estado.vencedor ? mensagemDeVitoria(estado.vencedor) : '';
  if (!estado.aposta) {
    tela.btnTruco.textContent = NOME_PEDIDO[3];
    tela.btnTruco.disabled = true;
    tela.resposta.hidden = true;
    tela.decisaoOnze.hidden = true;
    return;
  }
  const { aposta } = estado;
  tela.valorMao.textContent = String(valorAtual(aposta));
  tela.btnTruco.textContent = NOME_PEDIDO[proximoValor(aposta.valor)] ?? NOME_PEDIDO[12];
  tela.btnTruco.disabled = !jogo.podePedirTruco();

  const pendente = estado.vencedor ? null : aposta.pendente;
  tela.resposta.hidden = !pendente;
  if (pendente) {
    tela.resposta.dataset.dupla = pendente.responde;
    tela.btnAumentar.hidden = !podeAumentar(aposta);
    tela.btnAumentar.textContent = NOME_PEDIDO[proximoValor(pendente.valor)] ?? '';
  }

  const decidindo = estado.onze && !estado.onze.decidida && !estado.vencedor;
  tela.decisaoOnze.hidden = !decidindo;
  if (decidindo) tela.decisaoOnze.dataset.dupla = estado.onze.dupla;
}
