# Performance unificada por aluno

## Objetivo
Transformar os registros já existentes de cada aluno em uma leitura visual rápida para o administrador e uma visão simples, prática e motivadora para o próprio aluno.

## Admin — Client 360
- Consolidar SIM Score, check-ins diários, revisões semanais, sessões e cargas em um resumo único.
- Mostrar uma faixa de leitura imediata com estado atual, evolução, frequência, volume, esforço e alertas.
- Evoluir o gráfico semanal com legenda e indicadores mais fáceis de comparar.
- Organizar respostas completas, sessões e histórico de cargas em blocos expansíveis, mantendo a tela principal limpa.
- Manter tudo somente leitura e derivado dos registros persistidos do aluno.

## Aluno — Performance
- Recriar a página de Performance com resumo da semana, gráfico simples de evolução e cinco pilares.
- Mostrar linguagem prática: “como estou”, “o que melhorou” e “onde prestar atenção”.
- Exibir apenas dados do próprio aluno, sem linguagem interna do admin.
- Incluir estados vazios claros quando ainda não houver registros suficientes.

## Validação
- Testar com aluno que possui histórico e aluno com poucos dados.
- Conferir celular, tablet e desktop sem itens sobrepostos.
- Verificar carregamento, ausência de erros e leitura correta dos dados reais.

## Detalhes técnicos
- Reutilizar `weekly_reviews`, `daily_checkins`, `sim_scores`, `workout_sessions` e `exercise_set_logs`.
- Não alterar banco, cálculos oficiais, treino, permissões ou dados existentes.
- Extrair cálculos de performance para funções puras compartilhadas e cobrir as regras de leitura com testes pequenos.
