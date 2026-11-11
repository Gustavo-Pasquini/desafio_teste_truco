# desafio_teste_truco

**Truco paulista** — Truco paulista com 2 duplas (4 jogadores no mesmo computador): casos de teste de interface em JavaScript (Jest + Testing Library). O jogo é implementado a partir desses testes (TDD).

> 📋 O que cada integrante vai fazer, as regras do jogo e todos os casos de teste estão em **[PLANEJAMENTO.md](PLANEJAMENTO.md)**.

## Colaboradores

| Nome | RA | GitHub |
|---|---|---|
| Breno Bertaglia Nosima | 24113673-2 | [BrenoNosima](https://github.com/BrenoNosima) |
| Gustavo Mazeto Pasquini | 24183078-2 | [Gustavo-Pasquini](https://github.com/Gustavo-Pasquini) |

A divisão do trabalho (quem faz cada tarefa e cada caso de teste) está em [PLANEJAMENTO.md](PLANEJAMENTO.md).

## Como rodar

Requisitos: Node.js 18+.

```bash
npm install
npm test              # roda os testes de interface (todos verdes)
npm start             # jogar em http://localhost:8080
npm run verificar     # confere se cada teste falha pelo motivo certo e tem um ID do plano
```

## Funcionamento dos casos de teste

> ✅ **Fase GREEN liberada:** o jogo é implementado a partir dos testes, um caso por vez. `npm test` precisa ficar todo verde.

- **Tipo:** testes de interface, em JavaScript, com [Jest](https://jestjs.io) + [Testing Library](https://testing-library.com). Cada teste carrega o `index.html` (esqueleto da tela) num navegador simulado (jsdom), clica nos elementos como um jogador (`user-event`) e confere o que deveria aparecer na tela.
- **Metodologia (TDD):** cada caso foi escrito antes do código, um por vez (RED, commit `test:`); depois o jogo foi implementado para passar em um caso por vez (GREEN, commit `feat:`) e refatorado com tudo verde (`refactor:`). O passo a passo está em [`.claude/skills/tdd/SKILL.md`](.claude/skills/tdd/SKILL.md).
- **Onde ficam:** pasta `tests/`, um arquivo `*.spec.js` por grupo de regras. `tests/helpers.js` tem a função `abrirJogo(params)`, que monta a tela.
- **Como os elementos são encontrados:** pelo atributo `data-testid` de cada elemento da tela (contrato na seção 3 do PLANEJAMENTO.md).
- **Sem sorte nos testes:** a partida pode ser montada pela URL (por exemplo, a ordem das cartas/peças/minas), então cada teste sempre começa do mesmo cenário.
- **Rastreabilidade:** cada teste tem no título o ID do caso (`TC-..-NN`), igual à tabela do PLANEJAMENTO.md.
- **Como rodar:** `npm test` (todos), `npx jest tests/<arquivo>.spec.js` (um arquivo), `npm run verificar` (motivo da falha) e `npm run verificar:completo` (idem + TCs que faltam).

## Desenvolvimento com agentes de IA

O projeto está preparado para **Claude Code** e **Codex**. Os dois escrevem os testes um por vez e conferem o motivo de cada falha. Cada um tem a skill `tdd` e um hook que roda o verificador a cada edição. O Claude Code também tem sub-agentes separados para escrever e para revisar.

- Claude Code: `/tdd G2` · Codex: `$tdd G2` · depois, "go" escreve o próximo caso de teste.
- Detalhes, técnicas e fontes: [docs/TDD-COM-IA.md](docs/TDD-COM-IA.md).

### ID → arquivo → o que verifica

| ID | Arquivo | O que verifica |
|---|---|---|
| TC-TR-01 | `tests/distribuicao.spec.js` | Estado inicial do placar e botão de nova partida |
| TC-TR-02 | `tests/distribuicao.spec.js` | Distribuição de três cartas, vira e primeiro jogador |
| TC-TR-03 | `tests/distribuicao.spec.js` | Baralho de 40 cartas sem 8, 9 e 10 |
| TC-TR-04 | `tests/distribuicao.spec.js` | Ausência de cartas repetidas na distribuição |
| TC-TR-05 | `tests/manilha.spec.js` | Valor da manilha calculado a partir da vira |
| TC-TR-06 | `tests/manilha.spec.js` | Escala de força das cartas comuns |
| TC-TR-07 | `tests/manilha.spec.js` | Ordem dos naipes entre as manilhas |
| TC-TR-08 | `tests/manilha.spec.js` | Manilha vencendo o 3 |
| TC-TR-09 | `tests/vaza.spec.js` | Bloqueio de jogada fora da vez |
| TC-TR-10 | `tests/vaza.spec.js` | Ordem de jogada entre J1, J2, J3 e J4 |
| TC-TR-11 | `tests/vaza.spec.js` | Empate na primeira vaza e decisão pela segunda |
| TC-TR-12 | `tests/vaza.spec.js` | Vitória da primeira vaza seguida de empate |
| TC-TR-13 | `tests/vaza.spec.js` | Vencedor iniciando a vaza seguinte e encerramento em duas vazas |
| TC-TR-14 | `tests/vaza.spec.js` | Decisão da mão quando a terceira vaza empata |
| TC-TR-15 | `tests/vaza.spec.js` | Três empates sem pontuação |
| TC-TR-16 | `tests/apostas.spec.js` | Valor inicial da mão e disponibilidade do Truco |
| TC-TR-17 | `tests/apostas.spec.js` | Opções de resposta e bloqueio das cartas após pedir Truco |
| TC-TR-18 | `tests/apostas.spec.js` | Truco aceito valendo três pontos |
| TC-TR-19 | `tests/apostas.spec.js` | Fuga do Truco concedendo um ponto ao solicitante |
| TC-TR-20 | `tests/apostas.spec.js` | Sequência de aumentos até Doze |
| TC-TR-21 | `tests/apostas.spec.js` | Pontuação ao correr de Seis, Nove ou Doze |
| TC-TR-22 | `tests/apostas.spec.js` | Direito de aumentar reservado à dupla adversária |
| TC-TR-23 | `tests/placar.spec.js` | Fim da partida ao atingir 12 pontos |
| TC-TR-24 | `tests/placar.spec.js` | Reinício da partida após o fim |
| TC-TR-25 | `tests/mao-de-onze.spec.js` | Decisão de jogar a mão de onze |
| TC-TR-26 | `tests/mao-de-onze.spec.js` | Decisão de correr da mão de onze |
| TC-TR-27 | `tests/mao-de-onze.spec.js` | Proibição de Truco na mão de onze |
| TC-TR-28 | `tests/mao-de-onze.spec.js` | Cartas fechadas e regras da mão de ferro |
| TC-TR-29 | `tests/vaza.spec.js` | Apenas a mão do jogador da vez com cartas abertas |
| TC-TR-30 | `tests/manilha.spec.js` | Escala completa entre cartas comuns vizinhas |
| TC-TR-31 | `tests/manilha.spec.js` | Cada manilha vencendo a imediatamente mais fraca |
| TC-TR-32 | `tests/vaza.spec.js` | Cartas iguais da mesma dupla sem provocar empate |
| TC-TR-33 | `tests/vaza.spec.js` | Terceira vaza decidindo após dois empates |
| TC-TR-34 | `tests/vaza.spec.js` | Terceira vaza decidindo uma mão empatada em 1 a 1 |
| TC-TR-35 | `tests/placar.spec.js` | Fim da partida ao ultrapassar ou atingir 12 pontos |
| TC-TR-36 | `tests/mao-de-onze.spec.js` | Mão de onze da dupla Eles |
| TC-TR-37 | `tests/vaza.spec.js` | Rodízio do jogador que inicia cada mão |
| TC-TR-38 | `tests/vaza.spec.js` | Jogador inicial mantido após empate na vaza |
| TC-TR-39 | `tests/placar.spec.js` | Acúmulo do placar entre mãos |
