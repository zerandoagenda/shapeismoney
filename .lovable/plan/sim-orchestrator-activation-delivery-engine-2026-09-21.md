# SIM Orchestrator + Activation & Delivery Engine

## Objetivo
Transformar os módulos existentes em uma operação orientada por eventos: uma mudança de plano cria a ativação, calcula a etapa atual, distribui responsabilidades, abre tarefas e filas, prepara drafts permitidos e atualiza a experiência do cliente sem apagar seu histórico.

## 1. Fundação operacional
- Criar `client_activations` com uma ativação vigente por cliente, etapas oficiais, status, origem, prazo de três dias úteis e timestamps.
- Criar `training_generation_jobs` com pré-requisitos detalhados, tentativas, erro, ciclo e programa gerado.
- Adicionar tipos, índices, RLS, grants, auditoria e leitura do próprio cliente; escrita somente por funções autenticadas e equipe autorizada.
- Habilitar atualização em tempo real apenas nas tabelas necessárias: ativação, programas, nutrição, protocolos e notificações.
- Atualizar entitlements: Paid passa a incluir Perception Lab; Plus e Premium mantêm a progressão descrita sem reativar o Club.

## 2. SIM Orchestrator central
- Criar um serviço server-side único para receber os eventos oficiais e derivar `ClientOperationalStatus`.
- Implementar `activateClientPlan(clientId, plan, source, paymentReference?)` como a única entrada de upgrade/downgrade: plano, assinatura, evento, ativação, protocolo, relacionamento, responsável, tarefas, notificações e reavaliação imediata.
- Tornar o fluxo idempotente: repetir o mesmo evento não duplica protocolo, relacionamento, tarefa, job ou ativação.
- Preservar integralmente scores, fotos, avaliações, decisões, treino, nutrição, percepção, relacionamento e histórico em qualquer troca de plano.
- Criar avaliação determinística de prontidão: onboarding, baseline, 17 fotos, assessment aprovado, ciclo, biblioteca disponível e alertas de saúde.
- Definir uma única próxima ação, responsável e SLA para todas as telas.

## 3. Automação de treino com revisão humana
- Mover aprovação de assessment, geração de draft, aprovação e publicação para funções server-side que sempre notificam o Orchestrator.
- Ao aprovar o assessment, criar ciclo/estratégia draft quando ausente, montar evidências e criar/avançar o job de treino.
- Quando os requisitos essenciais estiverem completos, executar o Training Architect automaticamente e salvar somente um draft.
- Registrar estados `WAITING_PREREQUISITES → READY → GENERATING → DRAFT_READY/HUMAN_REVIEW → APPROVED → PUBLISHED`, incluindo falhas e retomada.
- Ao concluir o draft, criar tarefa prioritária “Revisar treino — [Nome]”, notificação para o responsável, evento CRM e entrada direta na fila.
- Manter “Gerar agora” e “Tentar novamente” como ações reais para retomada/regeneração; nunca publicar automaticamente.
- Após ativação paga, criar a operação manual de nutrição e sua tarefa, sem inventar prescrição automática.

## 4. Experiência do cliente
- Derivar cinco modos reais: `FREE_DISCOVERY`, `PAID_ACTIVATION`, `PAID_ACTIVE`, `PLUS_ACTIVE`, `PREMIUM_CONCIERGE`.
- Refazer somente o conteúdo da Home existente para mostrar headline, Activation Timeline 01–09, briefing e “O que você precisa fazer agora” conforme o estado real.
- Durante geração, mostrar etapas qualitativas da Training Intelligence sem porcentagem simulada; durante revisão, ocultar o draft; após publicação, mostrar “Seu protocolo está ativo” e “Começar treino”.
- Adaptar Money Brain à etapa da ativação, plano, treino, nutrição e próxima ação, evitando briefings de execução durante coleta/preparação.
- Assinar mudanças em tempo real e atualizar Home, treino, nutrição e protocolo sem novo login ou recarregamento manual.

## 5. Operação administrativa
- Tornar a CEO Home uma resposta direta a “O que preciso fazer agora?”, com contagens reais de novos clientes, pendências, geração, revisão, nutrição, publicação, atenção e SLA.
- Substituir o pipeline de protocolos pela Delivery Queue derivada das ativações, com filtros oficiais, tempo na etapa, responsável, SLA e CTA funcional.
- Reorganizar Training Intelligence em uma Training Queue com contadores e ações por estado; “Revisar” abre diretamente o draft do cliente.
- Simplificar o topo do Client 360 para uma barra operacional: plano, etapa, SLA, responsável e próxima ação, seguida dos atalhos reais solicitados.
- Refatorar o seletor atual de plano para chamar `activateClientPlan()`; nenhuma página poderá alterar `profiles.plan` diretamente.

## 6. Eventos integrados
Conectar ao Orchestrator os fluxos existentes de cadastro, onboarding, ativação/pagamento manual, fotos, assessment, ciclo, treino, nutrição, percepção, check-in, revisão semanal e reavaliação. Cada evento atualizará estado, próxima ação, tarefas, notificações e memória operacional de forma idempotente.

## 7. Validação final
- Testar um cliente Free com diagnóstico e upgrade manual para Paid: Home muda, ativação/protocolo/relacionamento/assinatura/tarefas surgem e os acessos corretos são liberados.
- Completar os pré-requisitos e validar job automático, AI draft, fila do Bruno, edição, aprovação, publicação e atualização imediata do cliente.
- Validar downgrade/upgrade sem perda de histórico, isolamento entre clientes, RLS, SLA e retomada de falhas.
- Auditar todos os CTAs de Activation, Delivery Queue, Training Queue e Client 360 em desktop e mobile.
- Registrar o cenário completo e evidências em um relatório interno de QA; qualquer dependência externa ou dado realmente ausente ficará explicitamente bloqueado, nunca simulado.

## Detalhes técnicos
- Funções internas usarão `createServerFn` autenticada; operações privilegiadas carregarão o cliente administrativo somente após validação de papel.
- O Orchestrator será server-only e reutilizável pelas funções atuais e por um futuro webhook de pagamento, sem duplicação de regra.
- A geração automática ocorrerá dentro do processamento autenticado do evento; falhas persistem no job e criam ação de retomada, sem operação manual escondida.
- Publicação inicial de treino continua protegida por aprovação humana e pelo guard já existente.
