# Planejamento — desafio_teste_truco

Truco paulista com **2 duplas (4 jogadores)**: **casos de teste de interface em JavaScript**. O jogo em si não é implementado por enquanto (fase GREEN desativada); os testes ficam falhando pelo motivo certo.

| Integrante | GitHub | Papel neste repositório |
|---|---|---|
| Gustavo Mazeto Pasquini (24183078-2) | Gustavo-Pasquini | Setup do projeto e testes de: baralho, vira/manilha, vazas e empates |
| Breno Bertaglia Nosima (24113673-2) | BrenoNosima | Testes de: pedidos de truco, placar, mão de onze/ferro; CI e documentação dos testes |

---

## 1. Regras do jogo (o que os testes verificam)

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
| Entrega atual | **Somente os casos de teste** (`tests/`). O código do jogo não é implementado até segunda ordem (ver [docs/FASE-GREEN.md](docs/FASE-GREEN.md)) |
| Executor dos testes | [Vitest](https://vitest.dev) |
| Testes de interface | [Testing Library](https://testing-library.com) (`@testing-library/dom` + `@testing-library/user-event` + `@testing-library/jest-dom`), em JavaScript |
| "Navegador" dos testes | [jsdom](https://github.com/jsdom/jsdom) (`environment: 'jsdom'` no `vitest.config.js`). Não precisa baixar navegador |
| Esqueleto da tela | `index.html` com os elementos da seção 3 **vazios** + `js/main.js` vazio. É só o "molde" que os testes abrem |
| Node | 18 ou superior |
| CI | GitHub Actions rodando `npm ci` e `npm run verificar` em todo push e Pull Request |

Dependências de desenvolvimento (tarefa G1): `vitest`, `@vitest/ui`, `jsdom`, `@testing-library/dom`, `@testing-library/user-event`, `@testing-library/jest-dom`.

Comandos que o projeto deve ter (`package.json` da tarefa G1):

```bash
npm install                 # instala dependências (não baixa navegador)
npm test                    # roda os testes (vitest run) — por enquanto TODOS falham, de propósito
npm run verificar           # confere se cada teste falha pelo motivo certo e tem um ID do plano
npm run verificar:completo  # idem + acusa TCs do plano que ainda não têm teste (usar na entrega)
npm run test:ui             # interface visual do Vitest no navegador (vitest --ui)
```

```json
"scripts": {
  "test": "vitest run",
  "test:ui": "vitest --ui",
  "verificar": "node scripts/verificar-testes.mjs",
  "verificar:completo": "node scripts/verificar-testes.mjs --completo"
}
```

### Por que os testes ficam falhando

A fase GREEN (implementar o jogo) está **desativada até segunda ordem**. Então cada teste é escrito a partir da especificação (seções 1, 3 e 5) e precisa **falhar pelo motivo certo**:

- ✅ **Motivo certo:** a asserção não bate ou o elemento não existe, porque o jogo ainda não faz aquilo. Por exemplo, `AssertionError`, `Unable to find an element by: [data-testid="carta-j1-0"]` ou `expect(element).toHaveTextContent()`.
- ❌ **Motivo errado:** erro no próprio teste, como `TypeError`, `ReferenceError`, import quebrado ou arquivo que não carrega.
- ❌ **Teste passando:** se passa com a tela vazia, ele não testa nada. Reescreva-o para conferir o comportamento da seção 5.

O `scripts/verificar-testes.mjs` (já no repositório) faz essa conferência sozinho; o CI e o hook dos agentes usam ele.

### Esqueleto da tela (`index.html`, tarefa G1)

- Tem os elementos **fixos** da seção 3, cada um com seu `data-testid`, **sem texto, sem valor e sem atributos de estado** (`data-estado`, `disabled`, `hidden`). Senão algum teste passaria sem o jogo existir.
- Elementos criados pelo jogo (células, cartas, peças, casas) **não** entram no esqueleto.
- Carrega `<script type="module" src="js/main.js"></script>`; `js/main.js` fica só com um comentário até a fase GREEN.

### Como um teste abre o jogo — `tests/helpers.js` (tarefa G1)

```js
// tests/helpers.js
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

// Caminho a partir da raiz (no ambiente jsdom, `new URL(..., import.meta.url)` não funciona com o fs).
const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
const corpo = html.match(/<body[^>]*>([\s\S]*)<\/body>/)[1];

export async function abrirJogo(params = {}, opcoesUser = {}) {
  window.history.replaceState({}, '', '/?' + new URLSearchParams(params)); // parâmetros da seção 3
  document.body.innerHTML = corpo;          // mesmo HTML do jogo
  vi.resetModules();                        // cada teste começa um jogo novo
  await import('../js/main.js');            // vazio por enquanto; na fase GREEN, inicia o jogo
  return userEvent.setup(opcoesUser);       // "user" para clicar como um jogador
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

### Regras para os testes

- Os testes **só** acessam o jogo pelo que o usuário vê/clica: `screen.getByTestId(...)`, `getByRole(...)` e `user.click`, `user.dblClick`, `user.pointer(...)`. Nada de importar `js/*.js` ou chamar funções internas.
- Clique direito: `await user.pointer({ keys: '[MouseRight]', target: elemento })`. Clique duplo: `await user.dblClick(elemento)`.
- O jsdom **não lê CSS**. Esconder/mostrar se confere pelo atributo `hidden` (`toBeVisible()`); bloqueio, pelo `disabled` (`toBeDisabled()`).
- Tempo (cronômetro): `vi.useFakeTimers()` no teste, `abrirJogo(params, { advanceTimers: vi.advanceTimersByTime })` e `vi.advanceTimersByTime(2000)` para "esperar" 2 s sem esperar de verdade.
- Todo elemento que um teste usa tem `data-testid` (lista na seção 3). Se precisar de um novo, adicione na seção 3 no mesmo PR.
- Aleatoriedade é controlada por **parâmetros de URL** (seção 3). Um teste nunca depende de sorte.
- Cada caso de teste da seção 5 vira um `test('TC-XX-NN ...')` com o **mesmo ID no título** (o verificador exige).
- Proibido `test.skip`, `test.todo` e `.only` (o verificador acusa).

### Arquivos para agentes de IA (já estão no repositório; ver [docs/TDD-COM-IA.md](docs/TDD-COM-IA.md))

```
AGENTS.md                        instruções para qualquer agente (Codex lê sozinho)
CLAUDE.md                        Claude Code: carrega o AGENTS.md + sub-agentes
.agents/skills/tdd/SKILL.md      skill tdd para o Codex        ($tdd G2)
.claude/skills/tdd/SKILL.md      skill tdd para o Claude Code  (/tdd G2) — cópia idêntica
.claude/agents/                  sub-agentes: escritor-de-testes, revisor-tdd
.claude/settings.json            hook do Claude Code
.codex/hooks.json                hook do Codex (aprovar uma vez com /hooks)
scripts/verificar-testes.mjs     verificador (npm run verificar, CI e hook)
scripts/hooks/rodar-testes.mjs   o hook: roda o verificador após editar tests/
docs/TDD-COM-IA.md               técnicas de TDD com IA usadas aqui e fontes
docs/FASE-GREEN.md               o que fazer quando a implementação for liberada
```

Estrutura de pastas e dono de cada arquivo.

> ⚠️ Os arquivos de `js/` (fora o `main.js` vazio) e o `css/` são da **fase GREEN, desativada até segunda ordem**: ninguém os cria agora. A divisão fica pronta para quando ela for liberada ([docs/FASE-GREEN.md](docs/FASE-GREEN.md)).

```
desafio_teste_truco/
├── index.html              G1  esqueleto: elementos fixos da seção 3, vazios
├── js/main.js              G1  vazio (na fase GREEN: lê a URL e inicia o jogo)
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

> ⚠️ **Modo atual: somente testes.** A fase GREEN (implementar o jogo) está desativada até segunda ordem. As tarefas abaixo são de **escrever os casos de teste**; o código do jogo não é feito. Cada teste fica **falhando pelo motivo certo**. Quando a implementação for liberada: [docs/FASE-GREEN.md](docs/FASE-GREEN.md).

Cada tarefa segue o mesmo ciclo, **um caso de teste por vez**:

1. Escrever o teste do TC só a partir da especificação (seções 1, 3 e 5), sem código do jogo.
2. Rodar só ele (`npx vitest run tests/<arquivo>.spec.js -t "TC-XX-NN"`) e conferir que **falha pelo motivo certo**: asserção ou elemento não encontrado, e não erro do próprio teste.
3. `npm run verificar` sem problemas → commit `test: TC-XX-NN <cenário>`.
4. No fim da tarefa: revisão, atualizar a tabela de testes do README e abrir o Pull Request; o outro integrante revisa.

Cada integrante é **dono de arquivos de teste diferentes** (coluna "Arquivos"). Assim, depois da G1, os dois trabalham em paralelo sem conflito. `tests/helpers.js` é da G1: se precisar mudar, combine antes e faça um commit pequeno e separado.

**Usando agentes de IA (Claude Code ou Codex):** os dois seguem a skill `tdd` (lida pelo [`AGENTS.md`](AGENTS.md)). Para começar uma tarefa: `/tdd G2` no Claude Code ou `$tdd G2` no Codex; depois, "go" escreve o próximo TC. Como e por que funciona: [docs/TDD-COM-IA.md](docs/TDD-COM-IA.md). Cada integrante roda o agente na própria máquina, com o próprio `git config`, para os commits saírem no nome de quem fez.

### Gustavo

| Tarefa | Branch | Arquivos | Casos de teste |
|---|---|---|---|
| **G1** Setup: `package.json`, `vitest.config.js` (`environment: 'jsdom'`), `js/main.js` vazio, `.gitignore`, `index.html` esqueleto (elementos fixos da seção 3 **vazios**, sem texto nem atributos de estado), `tests/helpers.js` com `abrirJogo(params)` | `gustavo/g1-setup` | index.html, js/main.js, config, tests/helpers.js | — |
| **G2** Baralho de 40 cartas e distribuição | `gustavo/g2-distribuicao` | tests/distribuicao.spec.js | TC-TR-01 a 04 |
| **G3** Vira e manilha | `gustavo/g3-manilha` | tests/manilha.spec.js | TC-TR-05 a 08 |
| **G4** Turnos e vencedor da vaza | `gustavo/g4-vaza` | tests/vaza.spec.js | TC-TR-09, 10, 13 |
| **G5** Empates e vencedor da mão | `gustavo/g5-empates` | tests/vaza.spec.js | TC-TR-11, 12, 14, 15 |

### Breno

| Tarefa | Branch | Arquivos | Casos de teste |
|---|---|---|---|
| **B1** CI no GitHub Actions (`npm ci`, `npm run verificar`) + tabela de testes no README | `breno/b1-ci-readme` | .github/workflows, README.md | — |
| **B2** Pedido de truco e respostas | `breno/b2-truco` | tests/apostas.spec.js | TC-TR-16 a 19 |
| **B3** Seis, nove e doze | `breno/b3-aumentos` | tests/apostas.spec.js | TC-TR-20 a 22 |
| **B4** Placar e fim da partida | `breno/b4-placar` | tests/placar.spec.js | TC-TR-23, 24 |
| **B5** Mão de onze e mão de ferro | `breno/b5-mao-de-onze` | tests/mao-de-onze.spec.js | TC-TR-25 a 28 |

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

> Os testes de vaza usam `jogarVaza()` (`tests/helpers.js`), que lê `vez` antes de cada jogada. Assim não dependem de quem começa a vaza depois de um empate, regra que a seção 1 não define.
>
> Os baralhos exatos de TC-TR-06 a 15 ficam como constantes nomeadas em cada `*.spec.js` (ex.: `const BARALHO_EMPATE_1A = '3O,3E,...'`) com um comentário explicando a jogada.

## 6. Fluxo de trabalho no Git

Para o professor enxergar a contribuição dos dois, **cada um commita da própria conta**:

1. **Gustavo** cria o repositório e adiciona `BrenoNosima` como colaborador (Settings → Collaborators). **Breno** aceita o convite.
2. Cada um configura o Git com o e-mail **cadastrado na própria conta do GitHub** (senão o commit não conta como contribuição):
   ```bash
   git config user.name "Seu Nome"
   git config user.email "email-da-sua-conta@exemplo.com"
   ```
3. Ninguém commita direto na `main`. Uma branch por tarefa: `gustavo/g2-...`, `breno/b2-...`, etc.
4. Mensagens no padrão Conventional Commits, em português: `test:`, `docs:`, `chore:`, `ci:`. Commits pequenos: um caso de teste por commit.
5. Pull Request para `main` → o **outro** integrante revisa e aprova → merge com **"Create a merge commit"** (não usar *squash*, para manter todos os commits de cada autor no histórico).
6. Antes de abrir o PR: `git pull origin main` e `npm run verificar` sem problemas (os testes falham de propósito; o que não pode é teste passando ou falhando por erro do próprio teste). O CI precisa estar verde no PR.
7. Ordem: **G1 entra primeiro** (estrutura do projeto). Depois disso as tarefas G e B podem andar em paralelo.

Conferir no fim: aba **Insights → Contributors** do repositório deve mostrar os dois.

## 7. Definição de pronto

O desafio só está pronto para entrega quando:

- [ ] Todos os casos de teste da seção 5 escritos em `tests/`, com o ID no título
- [ ] `npm run verificar:completo` sem problemas: todos os TCs têm teste, e todos **falham pelo motivo certo** (a fase GREEN está desativada)
- [ ] Nenhum código do jogo em `js/` (só o `js/main.js` vazio)
- [ ] README com: colaboradores, como rodar, **funcionamento dos casos de teste** (tabela ID → arquivo → o que verifica) — tarefa B1
- [ ] CI (GitHub Actions rodando `npm run verificar`) verde na `main` — tarefa B1
- [ ] Commits dos dois integrantes aparecendo em Insights → Contributors
- [ ] Nome do repositório exatamente `desafio_teste_truco`
