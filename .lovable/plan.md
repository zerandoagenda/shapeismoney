# Beta Full Access + Relationship OS

## Objetivo
Transformar o projeto atual em uma operação privada utilizável por Bruno e pelos primeiros alunos, preservando integralmente a identidade visual e os módulos já existentes. O acesso beta será amplo dentro de cada escopo, sem reduzir privacidade, revisão humana ou segurança.

## 1. Acesso beta centralizado
- Evoluir os papéis existentes para incluir `relationship`, `specialist`, `beta_member` e `member`, preservando compatibilidade com `student`, `nutritionist`, `support`, `manager`, `admin` e `analyst` já usados.
- Criar um `PermissionService` único para módulos, ações, dados de clientes, edição, publicação e administração.
- Ativar `BETA_FULL_ACCESS` de forma central: `admin_master` libera todo o backoffice; `beta_member` libera todo recurso de membro que realmente exista.
- Manter planos e entitlements para o futuro, mas retirar bloqueios e CTAs de upgrade para Beta Members.
- Garantir Bruno como `admin_master` e classificar os primeiros alunos reais como `beta_member`, sem ampliar o acesso deles a dados de terceiros.

## 2. Fundação do Relationship OS
- Criar entidades auditáveis para estado de relacionamento, fases da jornada, alertas com dono/SLA, diagnósticos dos 5 INs, evidências, intervenções PRISMA, compromissos, contatos, marcos/First Wins e timeline.
- Adicionar configurações de SLA por produto e regras para impedir alertas sem responsável/prazo e interações encerradas sem resultado ou próxima ação.
- Aplicar permissões de menor privilégio por papel e atribuição de cliente; `admin_master` terá alcance global autorizado.
- Manter fotos e vídeos privados, usando links temporários e trilha de auditoria.

## 3. Relationship Command Center
- Criar a área administrativa `Relationship` com “Who needs us today?”, priorização diária, SLA, Early Experience dos primeiros 14 dias e KPI principal `Invisible Clients = 0`.
- Exibir cobertura, clientes com responsável/próxima ação, contatos dentro do SLA, compromissos ativos/vencidos, casos críticos, First Wins e distribuições de jornada, estado, atenção e 5 INs.
- Tornar cada linha acionável e abrir o Client 360 correto.

## 4. Client 360 e condução humana
- Expandir a ficha atual para reunir identidade, jornada, comportamento, hipótese dos 5 INs com evidência/confiança, atenção/SLA, performance, treino, nutrição, percepção, relacionamento e timeline.
- Implementar `Plan Intervention`: objetivo de conversa, contexto PRISMA, perguntas possíveis, menor próximo passo e revisão; sempre como rascunho sujeito à edição e aprovação humana.
- Implementar compromissos, contatos, notas tipadas, próximas ações e reconhecimento de First Win.
- Bloquear linguagem depreciativa definida no briefing e nunca apresentar hipótese comportamental como diagnóstico ou identidade.

## 5. Experiência completa do membro
- Reorganizar a navegação desktop/mobile para expor todos os recursos de membro já funcionais: Home, Performance, SIM Score, treino, nutrição, check-ins, revisão semanal, Perception, Money Brain, Members, protocolos, experiências, SIM Select, perfil, progresso, histórico e avaliações.
- Criar páginas operacionais consolidadas para histórico, documentos/protocolos, compromissos compartilhados e avaliações usando dados existentes.
- Para recursos pedidos mas ainda sem implementação real — como Community completa, revisão mensal e Food Log — mostrar somente um estado honesto “Em desenvolvimento”, sem controle falso.

## 6. Backoffice completo
- Ampliar navegação e páginas administrativas para Relationship, Onboarding, Nutrition, Community, CRM, Notifications, Users, Roles, Permissions e Audit Logs.
- Conectar cada tela a dados reais, com estados vazios contextuais, carregamento, sucesso e erro.
- Exigir confirmação em ações destrutivas e registrar mudanças administrativas relevantes na auditoria.

## 7. Zero botões mortos
- Inventariar todas as rotas e controles visíveis da landing, autenticação, onboarding, membro e admin.
- Corrigir destino, ação, persistência e feedback de cada controle; remover aparência clicável quando não houver ação real.
- Substituir bloqueios por plano pelo serviço central, sem desbloquear funcionalidades inexistentes.

## 8. Validação e aceite
- Testar Bruno como `admin_master` em todas as áreas administrativas solicitadas.
- Testar um aluno real como `beta_member` em todo o ecossistema próprio, sem paywall e sem acesso cruzado.
- Validar RLS, papéis especializados, storage privado, confirmações e auditoria.
- Executar walkthrough desktop/mobile e gerar o relatório interno `BETA ACCESS QA` com rota, papel, ação, resultado esperado e status; somente marcar como concluído quando todos os casos executáveis passarem.

## Detalhes técnicos
- Alterações de banco serão feitas apenas por migration versionada, com `GRANT` antes de RLS em todas as novas tabelas.
- O serviço de permissões terá uma camada compartilhada de regras e verificações server-side para operações sensíveis; a interface não será a barreira de segurança.
- As sugestões de estado, IN, atenção e PRISMA serão determinísticas inicialmente e armazenadas como hipóteses com evidência/confiança. A arquitetura aceitará `AI_DRAFT → HUMAN_REVIEW → APPROVE → EXECUTE`, sem envio automático sensível.
- O trabalho será incremental sobre o design system, shell, cockpit, tarefas, notificações, auditoria, Training Intelligence e Money Brain existentes.
