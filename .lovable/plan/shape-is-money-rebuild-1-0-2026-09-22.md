# Shape Is Money — Rebuild 1.0

## Objetivo
Transformar o projeto atual em um Executive Performance Operating System funcional, no qual dados viram contexto, decisão, prescrição, execução, evidência e ajuste. Preservar identidade oficial, usuários, históricos, vídeos, programas, avaliações e módulos úteis existentes.

## 1. Fundação de dados e segurança
- Criar anamnese versionada sem substituir o onboarding histórico: versões, status, seções completas, autoria e data de conclusão.
- Criar análise estruturada da anamnese com evidências rastreáveis, confiança, versão do modelo e informações ausentes.
- Formalizar histórico e interpretação dos cinco pilares, incluindo componentes, fontes, gargalo, avanço e próxima ação.
- Criar hábitos em construção, histórico diário, recomendações pendentes de aprovação, sinais comportamentais e comentários contextuais.
- Aplicar acesso privado por cliente, acesso operacional por papel, grants, RLS, índices, timestamps e auditoria em todas as novas tabelas.
- Manter papéis separados dos perfis e impedir alteração direta de plano como fluxo oficial.

## 2. Anamnese funcional
- Evoluir a calibração atual para as seções Identidade, Objetivos, Corpo, Treinamento, Limitações, Rotina, Recuperação, Nutrição e Performance Executiva.
- Manter salvamento progressivo e criar uma nova versão quando uma anamnese concluída for refeita.
- Finalizar por uma função autenticada que salva a versão, calcula o SIM Baseline, registra eventos e inicia automaticamente análise e Orchestrator.
- Criar no Client 360 a aba Anamnese, com status, atualização, leitura do OS, alertas e seções expansíveis em linguagem humana.
- Permitir “Ver dados que geraram esta leitura”, mostrando apenas evidências realmente usadas.

## 3. SIM Orchestrator real
- Consolidar os eventos oficiais em nomes canônicos e manter compatibilidade com os eventos atuais.
- Tornar ativação manual e futura confirmação de pagamento entradas equivalentes da mesma função `activateClientPlan`.
- Garantir idempotência para activation, protocol, cycle, jobs, drafts, tarefas, notificações e eventos por chaves operacionais únicas.
- Recalcular Experience State, Activation Journey, responsável, SLA e uma única Next Best Action após cada evento.
- Disparar automaticamente análise da anamnese, readiness, estratégia de ciclo e geração do draft quando os requisitos forem atendidos.
- Preservar falhas persistidas, mensagens compreensíveis e retry sem duplicar programa.

## 4. Training Intelligence
- Criar um único Training Evidence Bundle com perfil, plano, anamnese integral, análise, SIM Score, fotos/assessment quando disponíveis, Perception relevante, histórico, rotina, equipamento, limitações, recuperação, hábitos, aderência e biblioteca ativa.
- Alterar readiness: ativação paga e anamnese analisada são obrigatórias; fotos enriquecem o primeiro draft, mas não o bloqueiam quando há evidência suficiente.
- Implementar safety gate GREEN/YELLOW/RED sem diagnóstico: GREEN gera draft, YELLOW gera sinalizado para revisão, RED bloqueia e cria ação humana.
- Gerar automaticamente Cycle Strategy e draft usando Banco + Regras + Knowledge Base + metodologia oficial + `openai/gpt-6-astra`.
- Prescrever exclusivamente `exercise_id` ativo, validar todos os IDs e salvar explicações ligadas às evidências reais.
- Manter fluxo Draft → Human Review → Approved → Published; publicação nunca será automática.
- Permitir ao Bruno editar, trocar, remover, adicionar, regenerar parte, aprovar e publicar sem montar do zero.

## 5. Nutrition Intelligence
- Alimentar a produção nutricional com a mesma anamnese e sinais relevantes.
- Usar a metodologia nutricional existente quando localizada e validada; se ela não existir no projeto, manter o job explicitamente bloqueado em vez de inventar prescrição.
- Manter AI Draft → revisão humana → publicação, em paralelo ao treino, sem publicação automática.

## 6. Experiência do cliente
- Reorganizar a navegação para Hoje, Meu Plano, Hábitos, Check-in, Evolução, Percepção, SIM Network, SIM Select e Perfil, sem expor linguagem operacional.
- Refazer a Home conforme `FREE_DISCOVERY`, `ACTIVATION` e `ACTIVE_PROTOCOL`, sempre com uma ação principal e estados reais.
- Exibir a jornada 01–09, processamento qualitativo sem porcentagens fictícias e atualização em tempo real.
- Criar explicação clicável para Construção, Capacidade, Governo, Percepção e Execução, com score, evolução, componentes, gargalo, avanço e recomendação.
- Reaproveitar treino publicado, vídeos privados, carga por série e cronômetro persistente; adicionar comentário contextual para a equipe.
- Evolução e Percepção mostrarão apenas dados existentes, com estados vazios editoriais quando não houver histórico.

## 7. Hábitos, sinais e comentários
- Criar a experiência “Hábitos em construção” com meta, frequência, período, pilar, sequência atual/melhor e calendário real.
- Recomendações do OS ficam pendentes até Bruno aprovar, editar ou ignorar.
- Gerar sinais comportamentais descritivos, sem diagnóstico psicológico.
- Adicionar “Falar com a equipe” em treino, nutrição, hábito, check-in e Perception; cada comentário cria alerta acionável no Admin.

## 8. Admin do Bruno
- Manter as seis áreas principais já implantadas: Hoje, Clientes, Produção, Biblioteca, Negócio e Configurações.
- Completar Hoje com comentários, alertas, drafts e falhas clicáveis em “Precisa de você”, além de processos e pendências do cliente.
- Completar Clientes e Client 360 com Agora, Anamnese, Protocolo, Treino, Nutrição, Hábitos, Percepção, Evolução, Relacionamento e Histórico.
- Em Agora, separar claramente “Cliente precisa”, “OS está” e “Bruno precisa”.
- Completar Exercise Library com detalhe, vídeo dentro da tela, identidade estável, aliases e campos técnicos já existentes.

## 9. Realtime, consistência e CTAs
- Atualizar automaticamente plano, activation, análise, treino, nutrição, hábitos, comentários, notificações e protocolo.
- Substituir mutações críticas feitas diretamente no navegador por funções autenticadas e auditáveis.
- Auditar todos os CTAs das telas alteradas: cada um deve navegar, salvar, abrir, executar ou confirmar uma ação real.
- Remover números demonstrativos e manter estados vazios explícitos.

## 10. Validação ponta a ponta
- Criar um cliente descartável “SIM TEST CLIENT” separado dos clientes reais.
- Validar FREE → baseline → upgrade PAID → activation → anamnese → análise automática → evidence bundle → cycle strategy → geração automática → fila de revisão → edição → aprovação → publicação → execução → retorno dos dados ao Admin.
- Validar vídeo, renomeação sem mudança de `exercise_id`, persistência após novo login, falha e retry sem duplicidade, PAID → PLUS → PREMIUM sem perda de histórico.
- Validar isolamento entre clientes, papéis administrativos, desktop e celular, erros de console/rede e segurança do banco.
- Registrar evidências e bloqueios honestos em relatório interno. A implementação só termina com o fluxo funcional validado, não apenas com telas presentes.

## Ordem de entrega
1. Migração segura e funções centrais.
2. Anamnese completa e análise automática.
3. Evidence Bundle, safety/readiness, Cycle Strategy e autogeração.
4. Hábitos, comentários e sinais.
5. Experiência do cliente e cinco pilares.
6. Admin, Biblioteca e revisão humana.
7. Realtime, auditoria de CTAs e E2E completo.

## Detalhes técnicos
- Funções internas usarão `createServerFn` autenticada; privilégios administrativos serão carregados apenas após validar o papel.
- Chamadas de IA ficam server-side, sempre em streaming, com raciocínio habilitado, `store: false`, histórico explícito e erros seguros exibidos.
- O modelo de texto permanece literalmente `openai/gpt-6-astra`.
- Operações automáticas terão chaves idempotentes persistidas; retry reaproveita o mesmo job e nunca publica sozinho.
- Nenhuma alteração apagará dados ou substituirá programas publicados silenciosamente.
