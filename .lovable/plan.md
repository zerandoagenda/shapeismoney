# ADMIN 3.0 — CEO Performance Cockpit

## Objetivo
Transformar o admin atual em um cockpit operacional completo para o Admin Master responder, com dados reais: como está o negócio, quais clientes exigem atenção, onde há oportunidades e o que precisa acontecer hoje. A identidade visual aprovada permanece intacta.

## 1. Fundação segura de operação
- Criar dados estruturados para acompanhamento financeiro manual, tarefas, leitura de notificações e auditoria administrativa.
- Manter `SIM Score` como indicador de performance pessoal e criar `Client Health Index` separado, calculado por regras documentadas a partir de atividade real.
- Registrar uso real dos módulos por membro para medir abertura, visualização e conclusão sem fabricar eventos retroativos.
- Criar histórico imutável de ações administrativas: autor, ação, entidade, momento e metadados seguros.
- Preservar RLS e mover mutações administrativas sensíveis para funções autenticadas, incluindo publicação, plano, notas, tarefas e revisão.

## 2. Permissões e acesso integral
- Garantir acesso completo ao `admin_master` em todas as áreas e ações.
- Preparar a matriz: Admin Master, Coach, Nutrition, Support, Content e Analyst, preservando funções existentes compatíveis.
- Ocultar menus sem permissão e repetir a autorização no servidor; esconder a interface não será tratado como segurança.
- Manter Bruno como Admin Master, sem alterar suas credenciais.

## 3. Nova experiência administrativa
- Reorganizar a navegação em Overview, Portfolio, Operations, Intelligence, Content e Management.
- Adicionar busca global por cliente, email, empresa, telefone e protocolo.
- Adicionar `Cmd/Ctrl + K` com busca e atalhos reais.
- Adicionar notificações derivadas de alertas reais, com abertura do cliente relacionado e estado “lida”.
- Manter todas as funções essenciais disponíveis em tablet e mobile, priorizando desktop.

## 4. CEO Overview
- Cabeçalho Command Center, data atual e saudação contextual.
- `CEO Daily Brief` baseado somente na operação atual, sempre com fonte e janela de tempo.
- `Today's Priorities` clicável: SLA, ausência de check-in, queda de adesão, publicação pendente, scans e tarefas do dia.
- `Business Health`: clientes por plano, novos 30D, ativos 7D/30D, onboarding, SLA, adesões e retenção/cancelamentos quando houver base.
- `Revenue — Manual Financial Tracking`: MRR, ARR, receita 30D, planos, assinaturas, upgrades, downgrades e cancelamentos. Métricas sem base mostrarão estado vazio específico.
- Gráficos reais com tooltip e filtros de período.

## 5. Client Portfolio e Operations
- Evoluir a carteira com foto, contexto profissional, plano, SIM Score e variação, adesão, última atividade, protocolo, Health Index, risco e próxima ação.
- Implementar filtros funcionais por período, plano, saúde, país, protocolo, início e Premium/não Premium.
- Criar pipeline clicável: New Client, Onboarding, Assessment, Protocol Build, Review, Ready, Active e Reassessment.
- Calcular SLA de protocolo em até três dias úteis, com `On Track`, `SLA Risk` e `Overdue`.
- Criar visões operacionais de Training, Nutrition e Perception com números clicáveis e listas correspondentes.

## 6. Cockpit individual do cliente
- Refatorar a página atual sem remover editores existentes.
- Cabeçalho com identidade, plano, tempo como cliente, status, SIM Score, Client Health, protocolo e próxima ação.
- Abas: Overview, Performance, Training, Nutrition, Perception, Check-ins, Members, Activity e Notes.
- Performance real em 7D/30D/90D para cinco pilares, sono, energia, estresse, hidratação, treinos e adesão.
- Exibir dados executivos autorrelatados separadamente e com linguagem não causal.
- Integrar CRM, notas internas, tarefas e trilha de auditoria no mesmo cliente.

## 7. Intelligence e relatórios
- `Product Intelligence`: ativos, uso de Training, Nutrition, Perception, Members, SIM Select e Money Brain, começando a contar apenas eventos reais registrados.
- `Performance Portfolio`: médias dos cinco pilares e evolução por período/coorte.
- Visões operacionais: Highest Adherence, Biggest Improvement, Needs Attention e Newest Clients, sem ranking público ou linguagem competitiva.
- `Money Brain — Executive Intelligence` por regras, com base/fonte explícita em cada insight.
- `Reports`: Business, Client Performance, Operations e Engagement com filtros e exportação CSV.
- Exportar CSV de clientes, performance agregada, protocolos e check-ins respeitando permissões.

## 8. Conteúdo e curadoria operacional
- Members: métricas reais, criação/edição, tipos texto/vídeo/PDF/áudio, publicar, despublicar e arquivar com confirmação.
- SIM Select: parceiros, benefícios, acessos e expirações; adicionar, editar e desabilitar ambos.
- Perception: estados operacionais, revisão, score médio e sinais agregados apenas das categorias permitidas.
- Preservar Experiences e integrá-la à navegação e inteligência de uso.

## 9. Qualidade de ações e formulários
- Todo controle visível terá ação real, rota válida ou estado desabilitado “Em breve”.
- Formulários terão validação, envio único, carregamento, sucesso e erro.
- Exclusão, despublicação e cancelamentos terão confirmação.
- Estados vazios serão contextuais; nenhum gráfico ou número usará placeholder como dado.
- Remover controles duplicados e corrigir destinos que hoje parecem disponíveis, mas estão bloqueados.

## 10. Validação final
- Validar migrações, grants, RLS e linter de segurança.
- Testar Admin Master e pelo menos um papel restrito para confirmar acesso e menus.
- Testar desktop, tablet e mobile.
- Percorrer Login → CEO Overview → Portfolio → Client Cockpit → Protocol → Training → Nutrition → Perception → Members → SIM Select → CRM → Tasks → Reports → Settings.
- Auditar todos os CTAs e registrar internamente label, ação/rota, sucesso e erro.
- Validar exportações, filtros, busca, command palette, notificações e ausência de números fictícios.

## Decisões técnicas
- Financeiro será identificado como rastreamento manual; nenhuma integração de pagamento será simulada.
- Retenção e churn só aparecem quando os registros manuais fornecerem base suficiente.
- Client Health será determinístico, explicável e orientado ao uso do produto; não altera o SIM Score.
- Métricas anteriores ao início do rastreamento de uso permanecerão indisponíveis em vez de serem estimadas.
- A implementação será dividida em componentes menores e funções autenticadas para evitar ampliar o arquivo monolítico atual do cliente.
