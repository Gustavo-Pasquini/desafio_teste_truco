# desafio_teste_truco

Desafio de testes: casos de teste para testar o **truco paulista**, com **2 duplas** (4 jogadores), com **casos de teste em JavaScript para testar JavaScript** (Jest + Testing Library).

## Colaboradores

| Nome | RA | GitHub | Parte no trabalho |
|---|---|---|---|
| Breno Bertaglia Nosima | 24113673-2 | [BrenoNosima](https://github.com/BrenoNosima) | Tarefas B1–B5: CI, documentação dos testes e 16 casos de teste |
| Gustavo Mazeto Pasquini | 24183078-2 | [Gustavo-Pasquini](https://github.com/Gustavo-Pasquini) | Tarefas G1–G6: estrutura do projeto e 25 casos de teste |

As contribuições de cada um aparecem em **Insights → Contributors** e nos commits. A divisão das tarefas e as regras completas estão em [PLANEJAMENTO.md](PLANEJAMENTO.md).

## Como rodar

Requisitos: Node.js 18 ou superior.

```bash
npm install
npm test                    # roda todos os casos de teste (Jest)
npm run verificar           # confere o motivo de cada falha e o ID de cada teste
npm run verificar:completo  # idem + confere que todo caso do plano tem teste
npx jest tests/<arquivo>.spec.js -t "TC-XX-NN"   # um caso só
```

## Funcionamento dos casos de teste

**Situação atual:** somente os casos de teste. O jogo ainda não está implementado, então **todos os testes falham de propósito**, pelo motivo certo (o comportamento ainda não existe). O `npm run verificar` confere isso.

- **Ferramentas:** [Jest](https://jestjs.io) roda os testes; [Testing Library](https://testing-library.com) (`@testing-library/dom`, `user-event` e `jest-dom`) simula o jogador; o [jsdom](https://github.com/jsdom/jsdom) faz o papel do navegador, sem precisar abrir um.
- **Testes de interface:** cada teste abre o `index.html` do jogo pela função `abrirJogo(params)` de `tests/helpers.js`, clica como um jogador e confere o que aparece na tela. Os testes não chamam funções internas do jogo.
- **Elementos da tela:** encontrados pelo atributo `data-testid` (contrato na seção 3 do PLANEJAMENTO.md).
- **Sem depender de sorte:** o cenário (cartas, minas, peças, frota, puzzle) é montado por parâmetros de URL, então cada teste começa sempre do mesmo jeito. O tempo usa relógio falso (`jest.useFakeTimers()`).
- **Rastreabilidade:** cada teste tem no título o ID do caso (`TC-..-NN`), o mesmo da tabela abaixo e da seção 5 do PLANEJAMENTO.md.
- **Metodologia:** TDD, um caso de teste por vez: escrever, rodar, ver falhar pelo motivo certo e fazer o commit `test:`.
- **Integração contínua:** o GitHub Actions roda `npm ci` e `npm run verificar` em todo push e Pull Request.

## Casos de teste (41)

| ID | Cenário | Arquivo | Resultado esperado | Autor |
|---|---|---|---|---|
| TC-TR-01 | Tela inicial | `tests/distribuicao.spec.js` | `placar-nos` = 0, `placar-eles` = 0, `btn-nova-partida` visível | Gustavo |
| TC-TR-02 | Distribuição | `tests/distribuicao.spec.js` | Cada `mao-jN` tem 3 cartas; `vira` tem `data-carta` preenchido; `vez` = J1 | Gustavo |
| TC-TR-03 | Baralho de 40 cartas | `tests/distribuicao.spec.js` | `monte-qtd` = 27; nenhuma carta com valor 8, 9 ou 10 | Gustavo |
| TC-TR-04 | Cartas não repetem | `tests/distribuicao.spec.js` | As 13 cartas exibidas (12 nas mãos + vira) são todas diferentes | Gustavo |
| TC-TR-05 | Manilha a partir da vira (parametrizado) | `tests/manilha.spec.js` | `manilha` = 5, 6, 7, Q, J, K, A, 2, 3, 4 respectivamente | Gustavo |
| TC-TR-06 | Força das cartas comuns | `tests/manilha.spec.js` | `vaza-1` = Nós e `vaza-2` = Eles (o 3 vence sem ser a 1ª nem a última carta; o A não é a maior) | Gustavo |
| TC-TR-07 | Ordem das manilhas | `tests/manilha.spec.js` | `vaza-1` = Eles (zap de J4 vence) | Gustavo |
| TC-TR-08 | Manilha vence o 3 | `tests/manilha.spec.js` | `vaza-1` = Nós e `vaza-2` = Eles (a manilha vence o 3 sem ser a 1ª nem a última carta) | Gustavo |
| TC-TR-09 | Só joga quem tem a vez | `tests/vaza.spec.js` | Nada muda em `mesa`; `vez` continua J1 | Gustavo |
| TC-TR-10 | Ordem de jogada | `tests/vaza.spec.js` | `vez` = J2; depois J3; depois J4 | Gustavo |
| TC-TR-11 | Empate na 1ª vaza | `tests/vaza.spec.js` | `vaza-1` = Empate; mão para Eles; `placar-eles` = 1 | Gustavo |
| TC-TR-12 | Ganha a 1ª e empata a 2ª | `tests/vaza.spec.js` | Mão para Nós; `placar-nos` = 1; 3ª vaza não é jogada | Gustavo |
| TC-TR-13 | Vencedor da vaza começa a próxima / 2 vazas encerram a mão | `tests/vaza.spec.js` | `vez` = J3; Nós vence a 2ª → `placar-nos` = 1, nova mão distribuída, sem 3ª vaza | Gustavo |
| TC-TR-14 | 1ª Nós, 2ª Eles, 3ª empata | `tests/vaza.spec.js` | Mão para Nós | Gustavo |
| TC-TR-15 | Três empates | `tests/vaza.spec.js` | Ninguém pontua (placar 0 × 0); nova mão | Gustavo |
| TC-TR-16 | Botão truco | `tests/apostas.spec.js` | `valor-mao` = 1; `btn-truco` com texto "Truco" habilitado para o jogador da vez | Breno |
| TC-TR-17 | Pedir truco | `tests/apostas.spec.js` | `resposta` aparece para a dupla Eles com Aceitar, Correr e Aumentar ("Seis"); cartas ficam bloqueadas até responder | Breno |
| TC-TR-18 | Aceitar truco | `tests/apostas.spec.js` | `valor-mao` = 3; `placar-nos` = 3 | Breno |
| TC-TR-19 | Correr do truco | `tests/apostas.spec.js` | `placar-nos` = 1; nova mão distribuída | Breno |
| TC-TR-20 | Aumentos | `tests/apostas.spec.js` | `valor-mao` passa por 3, 6, 9, 12; no Doze não existe `btn-aumentar` | Breno |
| TC-TR-21 | Correr de um aumento (parametrizado) | `tests/apostas.spec.js` | Quem pediu ganha 3 / 6 / 9 | Breno |
| TC-TR-22 | Quem pediu não aumenta | `tests/apostas.spec.js` | `btn-truco` desabilitado para Nós; habilitado ("Seis") para a dupla Eles | Breno |
| TC-TR-23 | Fim da partida | `tests/placar.spec.js` | `placar-nos` = 12; `mensagem` = "Nós venceram a partida!"; cartas bloqueadas | Breno |
| TC-TR-24 | Nova partida após o fim | `tests/placar.spec.js` | Placar 0 × 0, mãos distribuídas | Breno |
| TC-TR-25 | Mão de onze — jogar | `tests/mao-de-onze.spec.js` | `decisao-onze` aparece; cartas de J3 com `data-face="cima"` para J1; clicar Jogar → `valor-mao` = 3 | Breno |
| TC-TR-26 | Mão de onze — correr | `tests/mao-de-onze.spec.js` | `placar-eles` = 5; nova mão | Breno |
| TC-TR-27 | Sem truco na mão de onze | `tests/mao-de-onze.spec.js` | `btn-truco` oculto ou desabilitado durante toda a mão | Breno |
| TC-TR-28 | Mão de ferro | `tests/mao-de-onze.spec.js` | Todas as cartas com `data-face="baixo"`; sem `btn-truco`; `valor-mao` = 1; quem vence a mão vence a partida | Breno |
| TC-TR-29 | Só a mão da vez para cima | `tests/vaza.spec.js` | Antes: cartas de J1 `data-face="cima"`, de J2–J4 `"baixo"`. Depois: J2 `"cima"`, J1, J3 e J4 `"baixo"` | Gustavo |
| TC-TR-30 | Escala completa das comuns (parametrizado) | `tests/manilha.spec.js` | `vaza-1` = Eles em todos os pares | Gustavo |
| TC-TR-31 | Cada manilha vence a mais fraca (parametrizado) | `tests/manilha.spec.js` | `vaza-1` = Nós nos três pares | Gustavo |
| TC-TR-32 | Cartas iguais na mesma dupla não empatam | `tests/vaza.spec.js` | `vaza-1` = Nós (não "Empate") | Gustavo |
| TC-TR-33 | 1ª e 2ª empatam: a 3ª decide | `tests/vaza.spec.js` | `placar-eles` = 1, `placar-nos` = 0 | Gustavo |
| TC-TR-34 | 1-1: a 3ª decide | `tests/vaza.spec.js` | `placar-eles` = 1, `placar-nos` = 0 | Gustavo |
| TC-TR-35 | Fim passando de 12 (parametrizado) | `tests/placar.spec.js` | 13 × 5 e "Nós venceram a partida!" · 5 × 12 e "Eles venceram a partida!" | Breno |
| TC-TR-36 | Mão de onze da dupla Eles | `tests/mao-de-onze.spec.js` | `decisao-onze` aparece para Eles; cartas de J4 visíveis para J2; Correr → `placar-nos` = 5 | Breno |
| TC-TR-37 | Rodízio de quem começa a mão | `tests/vaza.spec.js` | No início `vez` = J1; a 2ª mão começa com `vez` = J2; a 3ª, com J3 | Gustavo |
| TC-TR-38 | Quem começa depois de empate | `tests/vaza.spec.js` | `vaza-1` = Empate; `vez` = J2 (quem começou a vaza empatada) | Gustavo |
| TC-TR-39 | Placar acumula entre mãos | `tests/placar.spec.js` | `placar-nos` = 1 e `placar-eles` = 1 | Breno |
| TC-TR-40 | Manilhas destacadas | `tests/dicas.spec.js` | 5E e 5C com `data-manilha="true"`; as outras sem | Gustavo |
| TC-TR-41 | Carta vencendo | `tests/dicas.spec.js` | Na mesa, a carta vencendo passa por 6E → 7C → 3C e continua 3C depois do QE | Gustavo |

## Estrutura

```
index.html                esqueleto da tela (elementos da seção 3)
js/main.js                ponto de entrada do jogo
tests/helpers.js          abrirJogo(), cenários fixos e atalhos
tests/*.spec.js           casos de teste
scripts/verificar-testes.mjs  verificador (npm run verificar e CI)
PLANEJAMENTO.md           regras, contrato, tarefas e casos de teste
docs/                     matriz de cobertura e TDD com IA
```
