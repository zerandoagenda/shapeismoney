# Master Product Rebuild — plano corrigido antes da execução

## Objetivo e regra de execução
Concluir o Core V1 do Shape Is Money com o fluxo real **compra → onboarding → Radar → anamnese → READY_FOR_AI → Orchestrator → Training + Nutrition em paralelo → Review Engine → revisão humana → publicação → Today → execução → check-in → evolução → Cycle Review → próximo protocolo**.

A execução fica dividida por gates: primeiro auditoria; depois apresentação da arquitetura e dos gaps reais; somente após essa revisão entram migrations aditivas e reconstrução das interfaces. O Today First já iniciado será tratado como implementação parcial a auditar, sem ampliar o redesign antes desse gate.

## Regras não negociáveis
- Preservar usuários, dados, identidade oficial, Radar, CRM, Client 360, vídeos, biblioteca, históricos, permissões, URLs e automações funcionais.
- Não apagar nem recriar entidades funcionais; migrations somente aditivas, com grants, RLS, índices e auditoria.
- Treino e alimentação são **Core V1** e devem ser entregues juntos em até **48 horas após todos os requisitos obrigatórios estarem completos**.
- IA gera somente drafts. Publicação de treino e alimentação continua exclusivamente humana.
- IA nunca inventa exercícios, calorias, macros, alimentos, equivalências, recomendações, diagnóstico ou causalidade.
- Dados insuficientes ou regra de segurança em alimentação resultam em `NUTRITION_REVIEW_REQUIRED`.
- O protocolo completo só é liberado quando todos os módulos obrigatórios estiverem aprovados e publicados.

## Fase 1 — Auditoria e contrato operacional
Classificar cada requisito crítico como **EXISTE**, **EXISTE PARCIALMENTE**, **PRECISA SER CRIADO** ou **CONFLITA COM A ARQUITETURA ATUAL**.

Auditar especificamente:
- Training Engine e Evidence Bundle;
- Nutrition Engine e metodologia nutricional;
- biblioteca de exercícios e matching;
- biblioteca alimentar, valores nutricionais, restrições, tags e equivalências;
- Orchestrator, eventos, idempotência e execução paralela;
- Review Engine e flags;
- SLA de 48 horas e marcos operacionais;
- versionamento de treino e alimentação;
- Workout Player, logs e proteção offline;
- Today Stack, Performance Strip, SIM Pulse e Action Stage;
- Admin, filas e priorização;
- Client 360, evolução e Cycle Review;
- segurança, RLS, storage e ações privilegiadas.

### Entrega obrigatória da Fase 1
Antes de qualquer migration ou nova interface, apresentar:
1. matriz de cobertura requisito por requisito;
2. arquitetura proposta reaproveitando as fontes atuais;
3. gaps reais e migrations estritamente necessárias;
4. conflitos de nomenclatura/estado e estratégia de compatibilidade;
5. riscos, dependências e critérios de aceite;
6. plano de migração sem perda de histórico.

## Fase 2 — Fundação do Core V1
Após aprovação da arquitetura, completar de forma aditiva apenas o que a auditoria confirmar como ausente.

### Nutrição estruturada
Se necessário, criar ou complementar:
- `food_library` com valores nutricionais autorizados, porção/unidade, restrições e tags;
- `nutrition_methodology_rules` versionadas e aprovadas;
- `food_equivalences` e `substitution_groups` com equivalências explícitas;
- meal templates estruturados;
- versões de plano alimentar;
- nutrition review flags e trilha de decisão.

O Nutrition Engine só poderá selecionar registros e regras autorizados. Ausência de cobertura segura gera revisão obrigatória, nunca preenchimento inventado.

### SLA oficial de 48 horas
Iniciar somente quando todos os requisitos obrigatórios estiverem completos e registrar:
- `requirements_completed_at`;
- `sla_started_at` e `sla_due_at`;
- `ai_started_at`;
- `training_draft_created_at`;
- `nutrition_draft_created_at`;
- `review_started_at`;
- `approved_at`;
- `published_at`.

Derivar estados **NORMAL**, **ATTENTION**, **URGENT** e **OVERDUE** e ordenar automaticamente as filas administrativas pelo prazo.

## Fase 3 — Orchestrator, Engines e Review Engine
- O estado `READY_FOR_AI` dispara o Orchestrator de forma idempotente.
- Disparar **Training Engine** e **Nutrition Engine** em paralelo, cada um com job, tentativas, erro e resultado próprios.
- O Training Engine usa exclusivamente exercícios reais da biblioteca; itens sem correspondência entram em `NEEDS_LIBRARY`.
- O Nutrition Engine usa exclusivamente biblioteca, metodologia, equivalências e regras autorizadas; casos inseguros entram em `NUTRITION_REVIEW_REQUIRED`.
- O Review Engine valida os dois drafts antes da revisão profissional, com `AUTO_FIX` apenas para correções determinísticas seguras e `FLAG_FOR_REVIEW` para decisões humanas.
- Versionar drafts e mostrar comparação antes/depois em pedidos de ajuste.
- Manter o fluxo **DRAFT → AUTOMATIC_REVIEW → HUMAN_REVIEW → APPROVED → PUBLISHED** sem autopublicação.

## Fase 4 — Command Center e Client 360
- Mostrar separadamente o estado de **Treino**, **Alimentação**, **Revisão** e **SLA restante**.
- Priorizar protocolos por SLA e destacar NORMAL, ATTENTION, URGENT e OVERDUE.
- Cada alerta deve abrir diretamente a pendência, draft, flag ou decisão correspondente.
- Consolidar no Client 360 anamnese, Radar, evidências, treino, alimentação, check-ins, execução, cargas, alertas, versões e histórico.
- Preservar os gráficos e leituras determinísticas já existentes.

## Fase 5 — Today First e Action Stage
Reconstruir a experiência do aluno como app nativo premium de execução diária, sem usar o dashboard tradicional como base visual.

- Primeiro viewport responde “O que eu preciso fazer agora?”.
- **Action Stage** ocupa a área principal e muda entre treino, próxima refeição, check-in, protocolo em construção e revisão pronta.
- **Today Stack** organiza as próximas ações reais do dia.
- **Performance Strip** mostra execução, treinos, sequência e SIM Score de forma compacta.
- **SIM Pulse** mostra tendência minimalista, sem competir com a ação atual.
- Alimentação aparece contextualmente no Today e sua conclusão atualiza o dia imediatamente.
- No mobile: sem sidebar, sem dashboard convencional, sem grade de cards iguais, sem excesso de métricas, bordas ou dourado.
- Para protocolo em construção, o aluno vê apenas estado real e “Previsão de liberação: até [data/hora]”, sem contagem regressiva operacional.

## Fase 6 — Workout Player
- Tratar o treino ativo como um produto imersivo e ocultar a navegação inferior.
- Mostrar um exercício por vez, vídeo, instrução, última carga, série atual, repetições e RIR/RPE aplicável.
- Usar números grandes, alvos de toque amplos e operação confortável com uma mão.
- Persistir cada série imediatamente e iniciar descanso automático com `+30s` e `Pular`.
- Avançar por série e exercício sem perder contexto.
- Registrar dificuldade padronizada e encaminhar ao Admin.
- Finalizar com duração, séries, volume, percepção, RPE e comentário.
- Manter fila local idempotente para sincronizar registros após queda de conexão.

## Fase 7 — Alimentação orientada à execução
- Dar à alimentação o mesmo nível de experiência do treino.
- Exibir refeições do dia, próxima refeição, itens prescritos e progresso.
- Permitir concluir refeição e registrar “Fiz diferente”.
- Oferecer substituições somente por equivalências reais e autorizadas.
- Atualizar Today, Admin e evidências de execução em tempo real.
- Evitar aparência de planilha ou aplicativo de contagem obsessiva.

## Fase 8 — Evolução, ciclo e robustez
- Evolução: SIM Score, cinco pilares, Radar inicial/atual, execução, corpo, fotos privadas, progressão e marcos reais.
- Cycle Review: manter, alterar, progredir, regredir ou investigar; próximo ciclo volta para draft e revisão.
- Perfil organiza áreas secundárias sem esconder a alimentação diária.
- Completar PWA, safe areas, acessibilidade, redução de movimento, loading, erro, retry, lazy loading e telemetria necessária.

## Validação obrigatória
- Fluxo descartável completo do Core V1, incluindo geração paralela de treino e alimentação, flags, revisão humana e publicação conjunta.
- Confirmar que o SLA não começa antes dos requisitos completos e que vence exatamente 48 horas depois.
- Confirmar que aluno não vê countdown interno, apenas previsão de liberação.
- Confirmar retry sem duplicidade, isolamento entre alunos, papéis, RLS, storage privado e histórico preservado.
- Testar falhas de biblioteca, `NEEDS_LIBRARY`, `NUTRITION_REVIEW_REQUIRED`, erro e retomada.
- Testar treino offline e sincronização sem perder ou duplicar séries.
- Validar aluno em 390×844, 393×852 e 430×932; Admin em 1280px e 1440px, com tablet funcional.
- Não declarar Core V1 concluído enquanto treino, alimentação, revisão, publicação e execução ponta a ponta não estiverem validados.
