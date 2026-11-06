# Matriz regra → casos de teste — Truco

| # | Regra (seção 1) | TCs | Situação |
|---|---|---|---|
| 1 | 40 cartas, sem 8, 9 e 10 | 03 | ✅ |
| 2 | Duplas: Nós = J1 + J3, Eles = J2 + J4 | 06–08, 11–15 | ✅ |
| 3 | 3 cartas para cada um + vira; 27 no monte; sem repetir | 02, 03, 04 | ✅ |
| 4 | Força das comuns `4 < 5 < 6 < 7 < Q < J < K < A < 2 < 3` | 06 (só 3 > 2 > A > K) | ⚠️ falta o meio da escala → **TC-TR-30** |
| 5 | Manilha = carta acima da vira (circular) | 05 (10 viras) | ✅ |
| 6 | Manilha vence qualquer comum | 08 | ✅ |
| 7 | Ordem das manilhas ♦ < ♠ < ♥ < ♣ | 07 (zap jogado por último) | ⚠️ não separa ♦/♠/♥, e a regra "a última carta vence" passa → **TC-TR-31** |
| 8 | Vence a maior; o vencedor começa a próxima vaza | 06, 08, 13 | ✅ |
| 9 | Empate = maior carta de cada dupla com a mesma força | 11, 12, 14, 15 | ⚠️ não testa cartas iguais **na mesma dupla** (não é empate) → **TC-TR-32** |
| 10 | Mão: 2 vazas; empates (1ª, 2ª, 3ª, três) | 11–15 | ❌ faltam "empate, empate, a 3ª decide" e "1-1, a 3ª decide" → **TC-TR-33, 34** |
| 11 | Valor 1 / 3 / 6 / 9 / 12 | 13, 18, 20 | ✅ |
| 12 | Aceitar, correr, aumentar; só quem recebeu aumenta; correr dá o valor anterior | 17–22 | ✅ |
| 13 | Fim com **12 ou mais** | 23 (exatamente 12, só Nós) | ⚠️ falta passar de 12 e Eles vencer → **TC-TR-35** |
| 14 | Mão de onze (ver o parceiro, jogar = 3, correr = +1, sem truco) | 25–27 (só Nós com 11) | ✅ (com triangulação para Eles → **TC-TR-36**) |
| 15 | Mão de ferro | 28 | ✅ |
| 16 | Hotseat: só a mão da vez para cima | 29 | ✅ |
| 17 | Placar acumula ao longo das mãos | — | ❌ → **TC-TR-39** |
| 18 | **Quem começa a mão seguinte** | — | decidido (seção 1) → **TC-TR-37** |
| 19 | **Quem começa a vaza depois de um empate** | — | decidido (seção 1) → **TC-TR-38** |

### TCs novos — Truco

| ID | Dono / tarefa | Cenário | Parâmetros / passos | Resultado esperado |
|---|---|---|---|---|
| TC-TR-30 | Gustavo / G3 | Escala completa das comuns (parametrizado) | Para cada par vizinho da escala (4<5, 5<6, 6<7, 7<Q, Q<J, J<K, K<A, A<2, 2<3), com uma vira que não deixe nenhuma das duas virar manilha: J1 joga a menor, J2 a maior, J3 e J4 a carta mais fraca possível | `vaza-1` = Eles em todos os pares |
| TC-TR-31 | Gustavo / G3 | Cada manilha vence a mais fraca (parametrizado) | Vira 4. Pares 5♠ × 5♦, 5♥ × 5♠, 5♣ × 5♥: J1 joga a **mais forte**, J2 a mais fraca, J3 e J4 cartas comuns | `vaza-1` = Nós nos três pares |
| TC-TR-32 | Gustavo / G5 | Cartas iguais na mesma dupla não empatam | Vira 4. J1 3O, J2 2O, J3 3E, J4 2E | `vaza-1` = Nós (não "Empate") |
| TC-TR-33 | Gustavo / G5 | 1ª e 2ª empatam: a 3ª decide | Vira 4. Empate, empate, Eles vence a 3ª | `placar-eles` = 1, `placar-nos` = 0 |
| TC-TR-34 | Gustavo / G5 | 1-1: a 3ª decide | Vira 4. Nós, Eles, Eles | `placar-eles` = 1, `placar-nos` = 0 |
| TC-TR-35 | Breno / B4 | Fim passando de 12 (parametrizado) | `?placar=10-5`, truco aceito, Nós vence · `?placar=5-9`, truco aceito, Eles vence | 13 × 5 e "Nós venceram a partida!" · 5 × 12 e "Eles venceram a partida!" |
| TC-TR-36 | Breno / B5 | Mão de onze da dupla Eles | `?placar=4-11` | `decisao-onze` aparece para Eles, cartas de J4 visíveis para J2; Correr → `placar-nos` = 5 |
| TC-TR-37 | Gustavo / G4 | Quem começa a mão seguinte | Jogar a 1ª mão até o fim | `vez` = J2, se a regra for "o rodízio passa para o próximo" |
| TC-TR-38 | Gustavo / G5 | Quem começa depois de empate | 1ª vaza empatada | `vez` = o jogador definido na regra |
| TC-TR-39 | Breno / B4 | Placar acumula entre mãos | `baralho` com 26 cartas (2 mãos): Nós vence a 1ª mão, Eles vence a 2ª | 1 × 1 |

**Para que serve:** se o código dos jogos vai ser gerado só a partir dos testes, cada regra da seção 1 do PLANEJAMENTO.md tem um teste que a obriga a existir?

**Legenda**
- ✅ coberta, com exemplo suficiente para não dar para "decorar";
- ⚠️ coberta, mas com um exemplo só ou de forma parcial;
- ❌ sem teste;
- ❓ a regra não está definida no plano e precisa de uma decisão de vocês.

## Decisões tomadas

- Quem começa a mão seguinte: **rodízio**, J1 → J2 → J3 → J4 → J1.
- Quem começa a vaza depois de um empate: **quem começou a vaza empatada**.

Mantenha esta matriz atualizada: todo TC novo entra na linha da regra que ele cobre. Uma regra sem TC não vai existir no jogo gerado.
