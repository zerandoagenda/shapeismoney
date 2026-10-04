# Shape Is Money — Auditoria do Core V1

Data: 04/10/2026  
Estado: Fase 1 concluída; nenhuma migration desta arquitetura foi executada.

## 1. Resumo executivo

O sistema atual possui uma base funcional relevante: autenticação e papéis, onboarding, anamnese versionada e analisada, Radar, biblioteca de exercícios, Training Evidence Bundle, geração de treino em draft, jobs, revisão/publicação humana, execução por série, Client 360, filas administrativas, Today Stack, Performance Strip, SIM Pulse, RLS e storage privado.

O Core V1 descrito no plano ainda não está completo. Os bloqueadores reais são:

1. Nutrition Engine estruturado e sua base autorizada de alimentos, regras e equivalências;
2. Review Engine automático compartilhado entre treino e alimentação;
3. disparo idempotente e realmente paralelo dos dois motores;
4. SLA oficial de 48 horas iniciado somente após todos os requisitos obrigatórios;
5. gate único de publicação do protocolo completo;
6. proteção offline do Workout Player;
7. Cycle Review vinculado ao ciclo atual;
8. inclusão formal do Radar convertido no gate de prontidão.

## 2. Matriz de cobertura

| Requisito crítico | Classificação | Evidência e conclusão |
| --- | --- | --- |
| Training Engine | **EXISTE** | `src/lib/training-architect.server.ts` cria apenas draft estruturado, usando a metodologia oficial e persistindo programa, treinos, exercícios e decisões. |
| Training Evidence Bundle | **EXISTE** | Agrega perfil, onboarding, anamnese, análise, SIM Score, ciclo, assessment, fotos, Perception, check-ins, revisões, sessões, dor, hábitos, biblioteca e Knowledge Base. |
| Biblioteca de exercícios | **EXISTE** | `exercise_library` contém aliases, equipamento, red flags, progressões, regressões e mídia. |
| Matching e `NEEDS_LIBRARY` | **EXISTE PARCIALMENTE** | O motor atual bloqueia corretamente quando o exercício não existe. Um caminho legado em `src/lib/training-intelligence.functions.ts` ainda descarta silenciosamente itens não mapeados e deve ser eliminado ou alinhado. |
| Versionamento de treino | **EXISTE PARCIALMENTE** | `workout_programs.version`, `parent_program_id` e campos de decisão existem, mas o fluxo ainda não incrementa versões nem apresenta comparação antes/depois. |
| Nutrition plans/meals/items | **EXISTE PARCIALMENTE** | Existem planos, refeições, itens, macros e publicação humana. Os itens usam nome e valores livres, sem vínculo obrigatório a uma base autorizada. |
| Nutrition jobs | **EXISTE PARCIALMENTE** | `nutrition_generation_jobs` registra estados, tentativas e erro, mas não há processor que gere um draft real. |
| Nutrition Engine | **PRECISA SER CRIADO** | Não existe equivalente a `generateTrainingDraftCore`; hoje a construção nutricional permanece manual. |
| Biblioteca alimentar | **PRECISA SER CRIADO** | Não existem `food_library`, valores por porção/base, restrições ou tags autorizadas. |
| Metodologia nutricional | **PRECISA SER CRIADO** | Não existe `nutrition_methodology_rules` versionada e aprovada. |
| Equivalências e substituições | **PRECISA SER CRIADO** | Não existem `food_equivalences` nem `substitution_groups`. |
| Meal templates | **PRECISA SER CRIADO** | As refeições atuais são instâncias de planos, não templates autorizados e reutilizáveis. |
| Versionamento de nutrição | **PRECISA SER CRIADO** | `nutrition_plans` não possui versão, plano pai nem snapshots comparáveis. |
| `NUTRITION_REVIEW_REQUIRED` | **PRECISA SER CRIADO** | Não existe estado ou flag equivalente no schema ou no código. |
| Orchestrator e eventos | **EXISTE** | Há entrada server-side, ativação única, eventos, tarefas, notificações e atualização dos jobs. |
| Idempotência dos motores | **EXISTE PARCIALMENTE** | Ativação, tarefas e notificações usam chaves únicas; jobs ainda usam leitura seguida de inserção e podem duplicar sob concorrência. |
| `READY_FOR_AI` | **CONFLITA COM A ARQUITETURA ATUAL** | O conceito está distribuído entre readiness, `training.ready_for_generation` e `TRAINING_GENERATION`; não existe um gate canônico conjunto que inclua Radar e nutrição. |
| Geração Training + Nutrition em paralelo | **CONFLITA COM A ARQUITETURA ATUAL** | O treino é processado; a nutrição apenas recebe um status passivo e aparece depois do treino no estágio operacional. |
| Review Engine | **PRECISA SER CRIADO** | Não existem `AUTOMATIC_REVIEW`, `AUTO_FIX` ou `FLAG_FOR_REVIEW`; hoje o draft segue diretamente para revisão humana. |
| Publicação exclusivamente humana | **EXISTE** | RLS e ações administrativas preservam aprovação/publicação manual. |
| Gate de publicação conjunta | **CONFLITA COM A ARQUITETURA ATUAL** | Treino, nutrição e protocolo possuem ações independentes; é possível publicar um sem os demais. |
| SLA de 48 horas | **CONFLITA COM A ARQUITETURA ATUAL** | `deliveryTarget()` usa três dias úteis e outra regra usa 72h/56h. O prazo começa antes do gate completo. |
| Marcos operacionais do SLA | **PRECISA SER CRIADO** | Faltam `requirements_completed_at`, `sla_started_at`, `sla_due_at`, `ai_started_at`, timestamps dos dois drafts, revisão, aprovação e publicação. |
| Estados NORMAL/ATTENTION/URGENT/OVERDUE | **PRECISA SER CRIADO** | Hoje existem somente variações de ON TRACK/AT RISK/OVERDUE, derivadas do prazo antigo. |
| Admin e Delivery Center | **EXISTE PARCIALMENTE** | Há filas, filtros, responsáveis, erros, retry e realtime. Falta visão conjunta por protocolo, trilhos separados e priorização oficial de 48h. |
| Client 360 | **EXISTE PARCIALMENTE** | Consolida grande parte dos dados e a performance semanal; ainda faltam evidências completas, flags, versões e histórico nutricional estruturado. |
| Today Stack | **EXISTE** | A Home atual já projeta ações reais do dia, sem nova fonte de verdade. |
| Performance Strip | **EXISTE** | Exibe execução, treinos, sequência e SIM Score de forma compacta. |
| SIM Pulse | **EXISTE** | Exibe tendência recente dos scores persistidos. |
| Action Stage | **EXISTE PARCIALMENTE** | A prioridade atual existe, mas ainda não cobre corretamente protocolo em construção, revisão pronta e próxima refeição real. |
| Alimentação no Today | **EXISTE PARCIALMENTE** | A ação aparece, porém sua conclusão está fixa como falsa e não deriva de execução alimentar persistida. |
| Workout Player | **EXISTE PARCIALMENTE** | Sessão, cronômetro persistente, séries, carga, reps, esforço, dor, descanso e conclusão existem; ainda mostra todos os exercícios, mantém navegação e não oferece `+30s`/pular como fluxo completo. |
| Proteção offline | **PRECISA SER CRIADO** | Não há fila local, retry automático ou reconciliação; uma falha de rede pode perder uma alteração ainda não gravada. |
| Dificuldade estruturada → Admin | **EXISTE PARCIALMENTE** | Dor e comentários existem; faltam categorias padronizadas como equipamento indisponível, carga inadequada e dificuldade técnica. |
| Evolução | **EXISTE** | Possui resumo, gráficos e leitura determinística compartilhada com o Admin. |
| Cycle Review | **PRECISA SER CRIADO** | Revisões semanal e mensal existem, mas nenhuma revisão é vinculada ao ciclo e às decisões manter/alterar/progredir/regredir/investigar. |
| Radar como requisito do cliente | **EXISTE PARCIALMENTE** | O Radar público possui `converted_user_id`, mas o readiness do Orchestrator não busca nem exige o Radar convertido. |
| PWA | **PRECISA SER CRIADO** | Não há manifest, service worker ou estratégia de cache segura. |
| Segurança, RLS e storage | **EXISTE** | As áreas auditadas usam grants, RLS, policies por dono/equipe e buckets privados. Qualquer tabela nova deverá repetir o mesmo padrão. |

## 3. Arquitetura proposta

```text
COMPRA / ATIVAÇÃO
        ↓
ONBOARDING + RADAR VINCULADO + ANAMNESE ANALISADA + DADOS OBRIGATÓRIOS
        ↓
READINESS GATE ÚNICO
        ↓ requirements_completed_at / sla_started_at / sla_due_at (+48h)
READY_FOR_AI
        ↓
SIM ORCHESTRATOR — execução idempotente por activation + cycle
        ├── TRAINING ENGINE  → training job  → draft versionado
        └── NUTRITION ENGINE → nutrition job → draft versionado
                         ↓
                 REVIEW ENGINE
          AUTO_FIX seguro / FLAG_FOR_REVIEW
                         ↓
                   HUMAN REVIEW
                         ↓
            GATE DE PUBLICAÇÃO CONJUNTA
                         ↓
                       TODAY
          treino + refeições + check-in + hábitos
                         ↓
             EXECUÇÃO / EVIDÊNCIA PERSISTIDA
                         ↓
                 EVOLUÇÃO / CYCLE REVIEW
                         ↓
                 PRÓXIMO PROTOCOLO EM DRAFT
```

### Princípios de implementação

- Manter `client_activations`, os dois jobs, programas, sessões, logs, planos nutricionais e eventos como fontes atuais.
- Criar um readiness compartilhado, sem substituir o readiness de treino abruptamente.
- Chamar os dois motores com `Promise.allSettled`, preservando status, erro e retry independentes.
- Usar lock/idempotency key persistente por ativação+ciclo+motor antes de habilitar paralelismo.
- Review Engine determinístico roda antes da revisão humana; nunca publica.
- Publicação completa ocorre em operação server-side atômica somente quando treino e alimentação estiverem aprovados.
- Today e Client 360 apenas projetam dados persistidos; não criam estados diários paralelos.

## 4. Migrations estritamente necessárias

### 4.1 Nutrição estruturada

Criar, com grants, RLS, índices e auditoria:

- `food_library`;
- `nutrition_methodology_rules`;
- `substitution_groups`;
- `food_equivalences`;
- `meal_templates` e `meal_template_items`;
- `nutrition_plan_versions`;
- `nutrition_review_flags`.

Complementar de forma aditiva:

- `nutrition_meal_items.food_id` e `substitution_group_id`, mantendo os campos atuais para preservar histórico;
- `nutrition_plans.version` e `parent_plan_id`;
- status de job/flag para `NUTRITION_REVIEW_REQUIRED` sem apagar estados atuais.

### 4.2 Orquestração e SLA

Adicionar a `client_activations`:

- `requirements_completed_at`;
- `sla_started_at`;
- `sla_due_at`;
- `ai_started_at`;
- `training_draft_created_at`;
- `nutrition_draft_created_at`;
- `review_started_at`;
- `approved_at`;
- `published_at`.

Adicionar chaves idempotentes/índices únicos aos jobs para impedir duas gerações concorrentes do mesmo motor, ativação e ciclo.

### 4.3 Review e ciclo

- Persistir revisões e flags de treino e nutrição com versões e resolução humana.
- Criar Cycle Review vinculada a `cycle_strategies`, sem reutilizar incorretamente chaves semanais/mensais.
- Registrar a decisão final e o vínculo do próximo ciclo/protocolo.

## 5. Estratégia de compatibilidade

### SLA

- A regra aprovada de **48 horas corridas** substitui a regra antiga de três dias úteis.
- O SLA começa somente quando o readiness conjunto estiver completo.
- `target_delivery_at` permanece temporariamente e espelha `sla_due_at`, evitando quebrar telas e integrações existentes.
- Ativações abertas serão recalculadas sem prorrogar prazos mais curtos já existentes; ativações concluídas preservam o histórico original.
- Alunos veem somente a previsão de entrega; estados e contagem operacional permanecem no Admin.

### Estados e eventos

- `READY_FOR_AI` será o gate canônico novo.
- Eventos atuais permanecem como aliases durante a transição.
- Estados existentes de jobs não serão renomeados; novos estados serão adicionados apenas quando necessários.
- O estágio único da ativação continuará existindo como resumo, enquanto treino e alimentação terão trilhos próprios nos jobs.

### Histórico

- Nenhum plano, programa, sessão, série, refeição, foto, score ou decisão existente será apagado.
- Novas FKs em itens nutricionais serão inicialmente opcionais para permitir leitura do histórico legado.
- Novos ajustes geram versão filha; nunca alteram silenciosamente a versão aprovada/publicada anterior.

## 6. Mudanças que não exigem migration inicialmente

- Centralizar cálculo e apresentação do SLA em uma regra compartilhada.
- Transformar a prioridade atual em Action Stage completo.
- Derivar conclusão alimentar de registros persistidos.
- Tornar o player um exercício por vez e ocultar a navegação durante a sessão.
- Adicionar `+30s`, pular e última carga usando dados existentes.
- Criar fila local idempotente para séries, preservando a chave única sessão+exercício+série.
- Reutilizar a leitura determinística atual na Evolução e no Client 360.

## 7. Riscos e dependências

1. **Metodologia nutricional autorizada:** o engine não pode produzir um draft seguro antes de existirem regras e alimentos aprovados pelo profissional responsável.
2. **Dados alimentares:** valores nutricionais precisam de fonte autorizada e versionada; não podem ser preenchidos pela IA.
3. **Concorrência:** habilitar os dois motores sem lock persistente pode duplicar jobs e drafts.
4. **Publicação parcial:** manter os três botões independentes permite liberar um protocolo incompleto.
5. **SLA legado:** mudar apenas a tela deixaria cálculos divergentes no Orchestrator e na saúde do cliente.
6. **Radar convertido:** o vínculo existe, mas precisa de regra clara para clientes sem Radar convertido ou com Radar anterior à compra.
7. **Offline:** o início da sessão também precisa de chave criada pelo cliente; proteger apenas os sets não evita sessão duplicada.
8. **PWA e privacidade:** cache não poderá armazenar respostas autenticadas ou mídia privada de forma compartilhada.

## 8. Critérios de aceite por gate

### Fundação

- Nenhuma migration remove ou reinterpreta histórico existente.
- Toda tabela nova possui grants, RLS, policies, índices e auditoria.
- Biblioteca e metodologia nutricional só expõem conteúdo ativo/aprovado ao engine.

### Readiness e SLA

- SLA não começa com qualquer requisito obrigatório ausente.
- `sla_due_at` é exatamente 48 horas após `sla_started_at`.
- Admin deriva NORMAL/ATTENTION/URGENT/OVERDUE de uma única regra.
- Aluno vê apenas “Previsão de liberação: até [data/hora]”.

### Engines e review

- Training e Nutrition são iniciados juntos e não se bloqueiam mutuamente.
- Repetir o mesmo evento não duplica job, draft ou versão.
- Exercício inexistente gera `NEEDS_LIBRARY`.
- Cobertura nutricional insuficiente gera `NUTRITION_REVIEW_REQUIRED`.
- Review Engine não toma decisões clínicas e nunca publica.

### Publicação e execução

- Protocolo completo só publica após os dois módulos aprovados.
- Workout Player recupera sessão, tempo e séries após navegação/reabertura.
- Queda e retorno de rede não perde nem duplica série.
- Today atualiza treino, alimentação e check-in a partir dos registros reais.

### Validação final

- Fluxo descartável completo: ativação → onboarding → Radar → anamnese → dois drafts → review → aprovação → publicação → Today → treino → alimentação → check-in → Evolução → Cycle Review.
- Isolamento entre alunos, papéis, RLS, storage privado, retries e histórico passam sem falhas.
- Aluno validado em 390×844, 393×852 e 430×932; Admin em 1280 e 1440, com tablet funcional.

## 9. Gate de decisão

A próxima execução segura é a Fundação do Core V1: schema nutricional autorizado, marcos de SLA, idempotência dos jobs e contrato do Review Engine. Somente depois devem ser ativados o Nutrition Engine, o paralelismo e o gate de publicação conjunta.