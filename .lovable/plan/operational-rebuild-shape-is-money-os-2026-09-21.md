# Operational Rebuild — Shape Is Money OS

## Objetivo
Transformar a estrutura já existente em uma operação orientada a decisões: Bruno vê apenas o que exige julgamento humano, o cliente recebe uma única próxima ação e o OS conduz automaticamente ativação, produção e entrega. A identidade visual, dados, históricos e módulos atuais serão preservados.

## 1. Admin em seis áreas
- Reduzir a navegação principal para **Hoje, Clientes, Produção, Biblioteca, Negócio e Configurações**.
- Criar as rotas `/admin/clients`, `/admin/production`, `/admin/library` e `/admin/business` como entradas consolidadas.
- Manter todas as rotas atuais acessíveis por tabs e links contextuais, sem remover Relationship, Training, Nutrition, Perception, Tasks, Members, SIM Select, Experiences ou Reports.
- Mover métricas financeiras e de uso para Negócio.

## 2. Hoje — atenção operacional
- Substituir o dashboard de KPIs por três blocos alimentados por dados reais:
  - **Precisa de você:** drafts de treino/nutrição, assessments, Perception, clientes em atenção e protocolos para publicar.
  - **OS trabalhando:** jobs de treino/nutrição, assessments e scans em processamento.
  - **Aguardando cliente:** onboarding, fotos, dados nutricionais e check-ins pendentes, com tempo, motivo e próxima ação.
- Cada contagem abrirá a fila já filtrada nos registros correspondentes.
- Estados vazios explicarão que não há ações, sem números simulados.

## 3. Delivery Center
- Evoluir a fila atual para `/admin/production`, com tabs: Todos, Novos, Aguardando cliente, Assessment, Treino, Nutrição, Perception, Revisão, Pronto para publicar, Ativos e Bloqueados.
- Exibir cliente, plano, produto, etapa, responsável, tempo, SLA, owner e CTA exato.
- Derivar a fila das ativações e jobs existentes; não criar uma segunda fonte de verdade.
- Adicionar retry idempotente, erro resumido e log cronológico por item.

## 4. SIM Orchestrator real
- Manter `activateClientPlan()` como única entrada oficial para mudança de plano, manual ou pagamento.
- Tornar a ativação integralmente idempotente: plano, histórico, assinatura, activation, Relationship, protocolo, pendências, evento e processamento usam chaves únicas.
- Centralizar `processClientActivation(clientId)` para avaliar dados já existentes, escolher etapa/owner/próxima ação e disparar trabalhos elegíveis.
- Chamar esse processamento após todos os marcos oficiais: onboarding, baseline, fotos, assessment, perception, treino, nutrição, protocolo, check-ins e reviews.
- Acrescentar log operacional durável e reconciliação segura para ativações travadas, jobs órfãos e publicações não refletidas.

## 5. Cycle Strategy e Training automáticos
- Quando os pré-requisitos estiverem completos e o assessment aprovado, criar automaticamente um **Cycle Strategy AI_DRAFT** com versão original, versão final, métricas, contingências e aprovação humana.
- Criar ou atualizar um único training job aberto; executar o Training Architect sem clique manual.
- Alterar a saída do arquiteto para usar `exercise_id` como chave primária, enviando ao modelo IDs, nomes canônicos, aliases e atributos da biblioteca.
- Se não houver exercício adequado, marcar `NEEDS_LIBRARY`, registrar a necessidade e enviar o item à fila — sem inventar equivalências.
- Ao concluir, criar task e notificação “Treino pronto para revisão”, abrindo o editor completo já preenchido.
- Publicação continua exclusivamente humana e atualiza activation, dashboard, notificação, timeline, CRM e Money Brain.

## 6. Nutrition Intelligence em paralelo
- Criar `nutrition_generation_jobs` com estados, tentativas, erros, datas, activation e plano produzido.
- Avaliar readiness nutricional de forma independente do treino.
- Gerar automaticamente apenas draft estruturado com Lovable AI, usando dados reais e metodologia disponível; nunca publicar automaticamente.
- Criar task/notificação de revisão e integrar status, retry e logs ao Delivery Center.

## 7. Exercise Library operacional
- Consolidar a biblioteca em `/admin/library/exercises` e preservar a rota atual como acesso compatível.
- Adicionar busca por nome/alias, filtros por movimento, músculo, equipamento, dificuldade e ativo/arquivado, com total real.
- Criar detalhe editável com todos os campos existentes e os campos de descrição, técnica e notas que faltarem.
- Implementar preview real de vídeo privado, upload, substituição e remoção usando o bucket existente.
- Ao renomear, salvar automaticamente o nome anterior como alias, preservando o mesmo `exercise_id` e todos os treinos históricos.
- Adicionar criação, arquivamento, importação CSV validada e edição em massa.
- PDF/text import continuará abrindo resolução de desconhecidos; mapear salva alias, criar novo exige validação humana.

## 8. Client 360 e visão do cliente
- Simplificar o topo para nome, plano, etapa, SLA, responsável e próxima ação.
- Reorganizar o conteúdo em Agora, Performance, Protocolo, Treino, Nutrição, Perception, Relacionamento e Histórico.
- Fazer “Agora” separar claramente Cliente, OS e Bruno.
- Adicionar **Ver experiência do cliente** em modo somente leitura, calculada para aquele cliente e sem assumir sua identidade ou permitir mutações.
- Preservar upgrade/downgrade pelo Orchestrator.

## 9. Fotos antes/depois
- Preservar cada captura em vez de substituir e apagar o arquivo anterior.
- Organizar fotos por assessment, protocolo, slot, versão e data, distinguindo baseline e reavaliações.
- Exibir comparação longitudinal privada no Client 360 com URLs temporárias.
- Manter todas as imagens inacessíveis a outros clientes e fora de páginas públicas.

## 10. Atualização, segurança e validação
- Reutilizar realtime já ativo e completar invalidação/refetch para activation, jobs, programas, nutrição, protocolos e notificações.
- Manter RLS, auditoria, papéis server-side, confirmação para publicação/arquivamento e nenhum segredo no navegador.
- Criar **ALUNO OS TEST** como conta descartável autorizada para o ensaio completo Free → Paid, sem alterar clientes reais.
- Validar Bruno: Hoje → fila filtrada → revisão com vídeos → edição → aprovação → publicação.
- Validar cliente: mudança imediata da Home, uma próxima ação, estado “Estamos trabalhando” e protocolo ativo após publicação.
- Validar biblioteca: criar, vídeo, renomear/alias, buscar, usar em Manual/AI/PDF, arquivar e confirmar histórico intacto.
- Executar typecheck, linter de segurança e testes desktop/mobile; registrar resultados e qualquer bloqueio externo honestamente.

## Detalhes técnicos
- Alterar o banco apenas por migrations, preservando enums/linhas existentes e adicionando grants, RLS, índices e auditoria.
- Reaproveitar `client_activations`, `training_generation_jobs`, `crm_events`, `admin_tasks`, `admin_notifications`, `cycle_strategies`, `exercise_library`, `assessments` e storage privado existentes.
- Não criar uma tabela de “production queue”; a fila será uma projeção das fontes operacionais oficiais.
- Chamadas AI permanecem server-side, com `openai/gpt-6-astra`, streaming, reasoning e revisão humana obrigatória.
- A reconciliação será idempotente e também executada ao abrir Hoje/Produção; o endpoint seguro ficará preparado para agendamento recorrente no ambiente publicado.
