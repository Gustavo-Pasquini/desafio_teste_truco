# Planejamento — desafio_teste_truco

Truco paulista com **2 duplas (4 jogadores)**, jogável no navegador, com casos de teste de interface em JavaScript.

| Integrante | GitHub | Papel neste repositório |
|---|---|---|
| Gustavo Mazeto Pasquini (24183078-2) | Gustavo-Pasquini | Setup do projeto, baralho, vira/manilha, vazas e empates |
| Breno Bertaglia Nosima (24113673-2) | BrenoNosima | Pedidos de truco, placar, mão de onze/ferro, CI e documentação dos testes |

---

## 1. Regras que o jogo deve seguir (escopo)

- **Baralho de 40 cartas** (sem 8, 9, 10 e coringas): A, 2, 3, 4, 5, 6, 7, Q, J, K de ♦ ouros, ♠ espadas, ♥ copas e ♣ paus.
- **Jogadores:** J1, J2, J3, J4 jogam nessa ordem. **Dupla "Nós" = J1 + J3**, **Dupla "Eles" = J2 + J4**.
- **Distribuição:** 3 cartas para cada jogador; a 13ª carta é a **vira** (fica virada na mesa). Sobram 27 no monte.
- **Força das cartas comuns** (menor → maior): `4 < 5 < 6 < 7 < Q < J < K < A < 2 < 3`.
- **Manilha:** a carta logo acima da vira na sequência acima (circular: vira 3 → manilha 4). As 4 manilhas vencem qualquer carta comum.
- **Ordem das manilhas** (menor → maior): ♦ ouros (pica-fumo) < ♠ espadas (espadilha) < ♥ copas (copas) < ♣ paus (zap).
- **Vaza (rodada):** cada jogador joga 1 carta; vence a maior. Quem vence começa a próxima vaza.
- **Empate na vaza:** quando a maior carta de cada dupla tem a mesma força (cartas comuns de mesmo valor).
- **Quem ganha a mão** (melhor de 3 vazas):
  - quem vencer 2 vazas (a 3ª não é jogada se alguém já tem 2);
  - 1ª empatou → quem vencer a 2ª leva; se a 2ª também empatar, a 3ª decide;
  - 1ª teve vencedor e a 2ª ou 3ª empatou → leva quem venceu a 1ª;
  - as três empataram → ninguém pontua.
- **Valor da mão:** 1 ponto. **Truco** → 3, **Seis** → 6, **Nove** → 9, **Doze** → 12.
- **Resposta a um pedido:** Aceitar, Correr ou Aumentar. Só a dupla que **recebeu** o pedido pode aumentar. Correr dá à dupla que pediu o valor **anterior** (correr do truco = 1, do seis = 3, do nove = 6, do doze = 9).
- **Fim da partida:** a primeira dupla a chegar a **12 pontos** (ou mais) vence.
- **Mão de onze:** a dupla com 11 pontos vê as cartas do parceiro e decide **Jogar** (a mão vale 3) ou **Correr** (adversário ganha 1). Não existe truco na mão de onze.
- **Mão de ferro (11 × 11):** todos jogam com as cartas viradas para baixo, sem truco, vale 1; quem vencer a mão vence a partida.
- **Modo de jogo:** 4 pessoas no mesmo computador (hotseat). Só a mão do jogador da vez fica com as cartas para cima.

## 2. Stack, comandos e estrutura

| Item | Escolha |
|---|---|
| Jogo | HTML + CSS + JavaScript puro (ES Modules), sem framework. Ponto de entrada: `js/main.js` |
| Executor dos testes | [Vitest](https://vitest.dev) |
| Testes de interface | [Testing Library](https://testing-library.com) (`@testing-library/dom` + `@testing-library/user-event` + `@testing-library/jest-dom`), em JavaScript |
| "Navegador" dos testes | [jsdom](https://github.com/jsdom/jsdom) (`environment: 'jsdom'` no `vitest.config.js`). Não precisa baixar navegador |
| Servidor para jogar | `http-server` (`npm start`) |
| Node | 18 ou superior |
| CI | GitHub Actions rodando `npm ci` e `npm test` em todo push e Pull Request |

Dependências de desenvolvimento (tarefa G1): `vitest`, `@vitest/ui`, `jsdom`, `@testing-library/dom`, `@testing-library/user-event`, `@testing-library/jest-dom`, `http-server`, `@stryker-mutator/core`, `@stryker-mutator/vitest-runner`.

Comandos que o projeto deve ter (criados na tarefa G1):

```bash
npm install          # instala dependências (não baixa navegador)
npm start            # abre o jogo em http://localhost:8080 para jogar
npm test             # roda todos os testes uma vez (vitest run)
npm run test:watch   # roda de novo a cada arquivo salvo (vitest)
npm run test:ui      # interface visual do Vitest no navegador (vitest --ui)
npm run mutacao      # teste de mutação: os testes percebem quando o código é estragado? (stryker run)
```

`stryker.config.json` (tarefa G1):

```json
{
  "testRunner": "vitest",
  "vitest": { "configFile": "vitest.config.js" },
  "mutate": ["js/**/*.js", "!js/main.js"],
  "reporters": ["clear-text", "progress", "html"]
}
```

Como um teste abre o jogo — `tests/helpers.js` (tarefa G1):

```js
// tests/helpers.js
import { readFileSync } from 'node:fs';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const corpo = html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];

export async function abrirJogo(params = {}) {
  window.history.replaceState({}, '', '/?' + new URLSearchParams(params)); // parâmetros da seção 3
  document.body.innerHTML = corpo;          // mesmo HTML do jogo
  vi.resetModules();                        // cada teste começa um jogo novo
  await import('../js/main.js');            // main.js lê location.search e inicia o jogo
  return userEvent.setup();                 // "user" para clicar como um jogador
}
```

Exemplo de caso de teste:

```js
import { test, expect } from 'vitest';
import { screen } from '@testing-library/dom';
import { abrirJogo } from './helpers.js';

test('TC-XX-01 exemplo', async () => {
  const user = await abrirJogo({ /* parâmetros */ });
  await user.click(screen.getByTestId('btn-nova-partida'));
  expect(screen.getByTestId('mensagem')).toHaveTextContent('...');
});
```

Regras para os testes:

- Os testes **só** acessam o jogo pelo que o usuário vê/clica: `screen.getByTestId(...)`, `getByRole(...)` e `user.click`, `user.dblClick`, `user.pointer(...)`. Nada de chamar funções internas do jogo.
- Clique direito: `await user.pointer({ keys: '[MouseRight]', target: elemento })`. Clique duplo: `await user.dblClick(elemento)`.
- O jsdom **não lê CSS**. Para esconder/mostrar algo use o atributo `hidden`; para bloquear botão, `disabled`. Assim `toBeVisible()` e `toBeDisabled()` funcionam.
- Tempo (cronômetro): `vi.useFakeTimers()` no teste, `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })` e `vi.advanceTimersByTime(2000)` para "esperar" 2 s sem esperar de verdade.
- `main.js` inicia o jogo assim que é importado e não usa `DOMContentLoaded` (o `index.html` carrega com `<script type="module" src="js/main.js">`, que já roda depois do HTML).
- Todo elemento que um teste usa tem `data-testid` (lista na seção 3). Se precisar de um novo, adicione na seção 3 no mesmo PR.
- Aleatoriedade é controlada por **parâmetros de URL** (seção 3). Um teste nunca depende de sorte.
- Cada caso de teste da seção 5 vira um `test('TC-XX-NN ...')` com o **mesmo ID no título**, para ser rastreável na saída do Vitest.


Arquivos para agentes de IA (já estão no repositório; ver [docs/TDD-COM-IA.md](docs/TDD-COM-IA.md)):

```
AGENTS.md                        instruções para qualquer agente (Codex lê sozinho)
CLAUDE.md                        Claude Code: carrega o AGENTS.md + sub-agentes
.agents/skills/tdd/SKILL.md      skill tdd para o Codex        ($tdd G2)
.claude/skills/tdd/SKILL.md      skill tdd para o Claude Code  (/tdd G2) — cópia idêntica
.claude/agents/                  sub-agentes: escritor-de-testes, implementador, revisor-tdd
.claude/settings.json            hook do Claude Code
.codex/hooks.json                hook do Codex (aprovar uma vez com /hooks)
scripts/hooks/rodar-testes.mjs   o hook: roda npm test após editar js/ ou tests/
docs/TDD-COM-IA.md               técnicas de TDD com IA usadas aqui e fontes
```

Estrutura de pastas e dono de cada arquivo:

```
desafio_teste_truco/
├── index.html              G1
├── css/estilo.css          G1 (cada um estiliza a própria parte)
├── js/main.js              G1  ponto de entrada: lê a URL e inicia o jogo
├── js/baralho.js           Gustavo  cartas, embaralhar, distribuir, vira, manilha, força
├── js/vaza.js              Gustavo  vencedor da vaza, empates, vencedor da mão
├── js/jogo.js              Gustavo  estado da partida, turnos, soma o valor da mão para a dupla vencedora
├── js/ui-mesa.js           Gustavo  renderiza mãos, mesa, vira, vez
├── js/apostas.js           Breno    truco/seis/nove/doze, aceitar, correr, aumentar
├── js/placar.js            Breno    fim da partida (12 pontos), mão de onze, mão de ferro
├── js/ui-apostas.js        Breno    botões de aposta, diálogo de resposta, placar
├── tests/helpers.js        G1
├── tests/distribuicao.spec.js   Gustavo
├── tests/manilha.spec.js        Gustavo
├── tests/vaza.spec.js           Gustavo
├── tests/apostas.spec.js        Breno
├── tests/placar.spec.js         Breno
├── tests/mao-de-onze.spec.js    Breno
├── .github/workflows/testes.yml Breno
├── vitest.config.js        G1
└── package.json            G1
```

## 3. Contrato de interface (o que os testes usam)

### Elementos (`data-testid`)

| data-testid | O que é |
|---|---|
| `btn-nova-partida` | Começa uma partida nova (zera placar e distribui) |
| `placar-nos` / `placar-eles` | Pontos de cada dupla (só o número) |
| `valor-mao` | Quanto vale a mão atual (1, 3, 6, 9, 12) |
| `vira` | A carta virada. Atributo `data-carta` (ex.: `7O`) |
| `manilha` | Texto com o valor da manilha (ex.: `Q`) |
| `monte-qtd` | Quantidade de cartas no monte |
| `vez` | Jogador da vez (`J1`…`J4`) |
| `mao-j1` … `mao-j4` | Mão de cada jogador |
| `carta-j1-0` … `carta-j4-2` | Cada carta na mão. Atributos `data-carta` e `data-face="cima"\|"baixo"` |
| `mesa` | Cartas jogadas na vaza atual |
| `vazas` | Resultado de cada vaza. Filhos `vaza-1`…`vaza-3` com texto `Nós`, `Eles` ou `Empate` |
| `btn-truco` | Pede truco / seis / nove / doze (o texto muda conforme o valor) |
| `resposta` | Caixa de resposta ao pedido. Contém `btn-aceitar`, `btn-correr`, `btn-aumentar` |
| `decisao-onze` | Caixa da mão de onze. Contém `btn-jogar-onze`, `btn-correr-onze` |
| `mensagem` | Avisos (ex.: "Nós venceram a partida!") |

### Código das cartas

Valor + naipe: `A 2 3 4 5 6 7 Q J K` + `O` (ouros) `E` (espadas) `C` (copas) `P` (paus). Ex.: `3P` = 3 de paus, `QO` = dama de ouros.

### Parâmetros de URL (para os testes não dependerem de sorte)

| Parâmetro | Exemplo | Efeito |
|---|---|---|
| `baralho` | `?baralho=3P,2O,AO,KO,4E,5E,6E,7E,QE,JE,KE,AE,4O` | Fixa as primeiras cartas: 3 para J1, 3 para J2, 3 para J3, 3 para J4 e a 13ª é a vira. O resto do baralho é embaralhado. Também fixa as mãos seguintes se forem passadas mais 13, 26… cartas |
| `placar` | `?placar=11-4` | Começa com Nós 11 × Eles 4 |

## 4. Divisão de tarefas

Cada tarefa segue o mesmo ciclo (TDD), e os **dois tipos de commit precisam existir**:

1. Escrever os casos de teste da tarefa (vão falhar) → commit `test: TC-XX-NN ...`
2. Implementar o mínimo para passar → commit `feat: ...`
3. Refatorar se precisar, rodar `npm test` inteiro → commit `refactor:` / `fix:`
4. Abrir Pull Request; o outro integrante revisa.

Cada integrante é **dono de arquivos diferentes** (coluna "Arquivos"). Assim, depois da G1, os dois trabalham em paralelo sem conflito. Se precisar mexer num arquivo do outro, combine antes e faça um commit pequeno e separado.

**Usando agentes de IA (Claude Code ou Codex):** os dois seguem a skill `tdd` (lida pelo [`AGENTS.md`](AGENTS.md)). Para começar uma tarefa: `/tdd G2` no Claude Code ou `$tdd G2` no Codex; depois, "go" faz o próximo TC. Como e por que funciona: [docs/TDD-COM-IA.md](docs/TDD-COM-IA.md). Cada integrante roda o agente na própria máquina, com o próprio `git config`, para os commits saírem no nome de quem fez.

### Gustavo

| Tarefa | Branch | Arquivos | Casos de teste |
|---|---|---|---|
| **G1** Setup: `package.json`, `vitest.config.js` (`environment: 'jsdom'`), `js/main.js`, `.gitignore`, `index.html` com todos os `data-testid` da seção 3 (vazios), `tests/helpers.js` com `abrirJogo(params)` e um teste "a página abre" | `gustavo/g1-setup` | index.html, css, config, helpers | — |
| **G2** Baralho de 40 cartas e distribuição | `gustavo/g2-distribuicao` | baralho.js, ui-mesa.js | TC-TR-01 a 04 |
| **G3** Vira e manilha | `gustavo/g3-manilha` | baralho.js | TC-TR-05 a 08 |
| **G4** Turnos e vencedor da vaza | `gustavo/g4-vaza` | vaza.js, jogo.js | TC-TR-09, 10, 13 |
| **G5** Empates e vencedor da mão | `gustavo/g5-empates` | vaza.js | TC-TR-11, 12, 14, 15 |

### Breno

| Tarefa | Branch | Arquivos | Casos de teste |
|---|---|---|---|
| **B1** CI no GitHub Actions (`npm ci`, `npm test`) + tabela de testes no README | `breno/b1-ci-readme` | .github/workflows, README.md | — |
| **B2** Pedido de truco e respostas | `breno/b2-truco` | apostas.js, ui-apostas.js | TC-TR-16 a 19 |
| **B3** Seis, nove e doze | `breno/b3-aumentos` | apostas.js | TC-TR-20 a 22 |
| **B4** Placar e fim da partida | `breno/b4-placar` | placar.js, ui-apostas.js | TC-TR-23, 24 |
| **B5** Mão de onze e mão de ferro | `breno/b5-mao-de-onze` | placar.js, apostas.js | TC-TR-25 a 28 |

## 5. Casos de teste (interface)

Todos começam com `abrirJogo({ ... })` e clique em `btn-nova-partida`, salvo quando dito outro.

### Gustavo — distribuição, manilha e vazas

| ID | Cenário | Parâmetros / passos | Resultado esperado |
|---|---|---|---|
| TC-TR-01 | Tela inicial | Abrir a página sem clicar em nada | `placar-nos` = 0, `placar-eles` = 0, `btn-nova-partida` visível |
| TC-TR-02 | Distribuição | Nova partida | Cada `mao-jN` tem 3 cartas; `vira` tem `data-carta` preenchido; `vez` = J1 |
| TC-TR-03 | Baralho de 40 cartas | Repetir Nova partida 20 vezes, juntando os `data-carta` exibidos | `monte-qtd` = 27; nenhuma carta com valor 8, 9 ou 10 |
| TC-TR-04 | Cartas não repetem | Repetir 20 vezes | As 13 cartas exibidas (12 nas mãos + vira) são todas diferentes |
| TC-TR-05 | Manilha a partir da vira (parametrizado) | `baralho` com vira 4, 5, 6, 7, Q, J, K, A, 2, 3 | `manilha` = 5, 6, 7, Q, J, K, A, 2, 3, 4 respectivamente |
| TC-TR-06 | Força das cartas comuns | `?baralho=3O,…` com vira 4 (manilha 5). J1 joga 3, J2 joga 2, J3 joga A, J4 joga K | `vaza-1` = Nós |
| TC-TR-07 | Ordem das manilhas | Vira 4. J1 joga 5O, J2 joga 5E, J3 joga 5C, J4 joga 5P | `vaza-1` = Eles (zap de J4 vence) |
| TC-TR-08 | Manilha vence o 3 | Vira 4. J1 joga 3P, J2 joga 5O, J3 joga 3C, J4 joga 4E | `vaza-1` = Eles |
| TC-TR-09 | Só joga quem tem a vez | Clicar uma carta de J2 quando `vez` = J1 | Nada muda em `mesa`; `vez` continua J1 |
| TC-TR-10 | Ordem de jogada | J1 joga | `vez` = J2; depois J3; depois J4 |
| TC-TR-11 | Empate na 1ª vaza | J1 3O, J2 3E (maiores empatam), J3 e J4 cartas menores; 2ª vaza vencida por Eles | `vaza-1` = Empate; mão para Eles; `placar-eles` = 1 |
| TC-TR-12 | Ganha a 1ª e empata a 2ª | Nós vence a 1ª; 2ª empata | Mão para Nós; `placar-nos` = 1; 3ª vaza não é jogada |
| TC-TR-13 | Vencedor da vaza começa a próxima / 2 vazas encerram a mão | J3 vence a 1ª | `vez` = J3; Nós vence a 2ª → `placar-nos` = 1, nova mão distribuída, sem 3ª vaza |
| TC-TR-14 | 1ª Nós, 2ª Eles, 3ª empata | Baralho montado para isso | Mão para Nós |
| TC-TR-15 | Três empates | Baralho montado com as três vazas empatadas | Ninguém pontua (placar 0 × 0); nova mão |

### Breno — apostas, placar, mão de onze e de ferro

| ID | Cenário | Parâmetros / passos | Resultado esperado |
|---|---|---|---|
| TC-TR-16 | Botão truco | Nova partida | `valor-mao` = 1; `btn-truco` com texto "Truco" habilitado para o jogador da vez |
| TC-TR-17 | Pedir truco | J1 clica `btn-truco` | `resposta` aparece para a dupla Eles com Aceitar, Correr e Aumentar ("Seis"); cartas ficam bloqueadas até responder |
| TC-TR-18 | Aceitar truco | J1 pede, Eles aceitam, Nós vencem a mão | `valor-mao` = 3; `placar-nos` = 3 |
| TC-TR-19 | Correr do truco | J1 pede, Eles correm | `placar-nos` = 1; nova mão distribuída |
| TC-TR-20 | Aumentos | Truco → Seis → Nove → Doze, aceitando o último | `valor-mao` passa por 3, 6, 9, 12; no Doze não existe `btn-aumentar` |
| TC-TR-21 | Correr de um aumento (parametrizado) | Correr no Seis / Nove / Doze | Quem pediu ganha 3 / 6 / 9 |
| TC-TR-22 | Quem pediu não aumenta | Nós pede truco, Eles aceitam, volta a vez de um jogador de Nós | `btn-truco` desabilitado para Nós; habilitado ("Seis") para a dupla Eles |
| TC-TR-23 | Fim da partida | `?placar=9-5`, truco aceito, Nós vence a mão | `placar-nos` = 12; `mensagem` = "Nós venceram a partida!"; cartas bloqueadas |
| TC-TR-24 | Nova partida após o fim | Depois do TC-TR-23, clicar `btn-nova-partida` | Placar 0 × 0, mãos distribuídas |
| TC-TR-25 | Mão de onze — jogar | `?placar=11-4` | `decisao-onze` aparece; cartas de J3 com `data-face="cima"` para J1; clicar Jogar → `valor-mao` = 3 |
| TC-TR-26 | Mão de onze — correr | `?placar=11-4`, clicar Correr | `placar-eles` = 5; nova mão |
| TC-TR-27 | Sem truco na mão de onze | `?placar=11-4`, Jogar | `btn-truco` oculto ou desabilitado durante toda a mão |
| TC-TR-28 | Mão de ferro | `?placar=11-11` | Todas as cartas com `data-face="baixo"`; sem `btn-truco`; `valor-mao` = 1; quem vence a mão vence a partida |

> Os baralhos exatos de TC-TR-06 a 15 ficam como constantes nomeadas em cada `*.spec.js` (ex.: `const BARALHO_EMPATE_1A = '3O,3E,...'`) com um comentário explicando a jogada.

## 6. Fluxo de trabalho no Git

Para o professor enxergar a contribuição dos dois, **cada um commita da própria conta**:

1. **Gustavo** cria o repositório e adiciona `BrenoNosima` como colaborador (Settings → Collaborators). **Breno** aceita o convite.
2. Cada um configura o Git com o e-mail **cadastrado na própria conta do GitHub** (senão o commit não conta como contribuição):
   ```bash
   git config user.name "Seu Nome"
   git config user.email "email-da-sua-conta@exemplo.com"
   ```
3. Ninguém commita direto na `main`. Uma branch por tarefa: `gustavo/g2-distribuicao`, `breno/b2-truco`, etc.
4. Mensagens no padrão Conventional Commits, em português: `test:`, `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `ci:`. Commits pequenos (um caso de teste ou uma regra por commit).
5. Pull Request para `main` → o **outro** integrante revisa e aprova → merge com **"Create a merge commit"** (não usar *squash*, para manter todos os commits de cada autor no histórico).
6. Antes de abrir o PR: `git pull origin main`, `npm test` verde. O CI precisa estar verde no PR.
7. Ordem: **G1 entra primeiro** (estrutura do projeto). Depois disso as tarefas G e B podem andar em paralelo.

Conferir no fim: aba **Insights → Contributors** do repositório deve mostrar os dois.

## 7. Definição de pronto

O desafio só está pronto para entrega quando:

- [ ] Todos os casos de teste da seção 5 implementados em `tests/` e passando com `npm test`
- [ ] Jogo jogável do início ao fim com `npm start`, sem erros no console
- [ ] README com: colaboradores, como rodar, **funcionamento dos casos de teste** (tabela ID → arquivo → o que verifica) — tarefa B1
- [ ] CI (GitHub Actions) verde na `main` — tarefa B1
- [ ] Commits dos dois integrantes aparecendo em Insights → Contributors
- [ ] Nome do repositório exatamente `desafio_teste_truco`
