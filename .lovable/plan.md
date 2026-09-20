# Shape Is Money Beta 01 — Golden Path funcional

## Objetivo
Transformar a experiência visual aprovada em um produto utilizável por 5–10 alunos reais, eliminando números fictícios e fechando o fluxo entre aluno, Bruno e dados de performance.

## Entrega

### 1. Base segura e integridade
- Completar relacionamentos e validações necessárias para perfis, respostas, scores, check-ins, protocolos, programas e sessões, preservando RLS e acesso por função.
- Adicionar armazenamento privado para foto de perfil e políticas de acesso do proprietário/equipe autorizada.
- Manter todo dado de aluno isolado; nenhuma página administrativa substituirá as políticas do banco.
- Registrar eventos reais: `onboarding.completed`, `protocol.published`, `workout.completed` e `checkin.completed`.

### 2. Calibração e SIM Score V0
- Expandir o onboarding para contexto executivo e 15 perguntas pontuáveis, em etapas curtas e mobile-first.
- Salvar cada resposta e a etapa atual progressivamente; restaurar a calibração ao retornar.
- Atualizar no perfil os dados pessoais e profissionais coletados.
- Criar `src/lib/sim-score.ts` com normalização 1–5 → 0–100, reversão da pergunta de desconforto, médias dos cinco pilares, score total, ponto forte, gargalo, prioridade e recomendação determinísticos.
- Ao concluir, gravar um novo registro histórico em `sim_scores` e o evento de CRM, sem IA e sem valores fixos.

### 3. Diagnóstico e carteira de performance
- Carregar o último score real no diagnóstico, com os cinco pilares, ponto forte, gargalo, prioridade e recomendação.
- Exibir um estado vazio elegante quando ainda não houver baseline.
- Reconstruir o dashboard com score e histórico reais, médias de check-ins em 7/30 dias, sessões, programa publicado e adesão.
- Substituir as barras demonstrativas por evolução baseada em `sim_scores.created_at`; um único registro será apresentado como `Baseline`.
- Gerar o Daily Brief por regras transparentes sobre sono, adesão e frequência de registros; sem dados suficientes, não haverá insight inventado.
- Usar saudação e horário reais do navegador sem causar divergência de renderização.

### 4. Check-ins reais
- Corrigir escalas diárias: sono, energia, estresse e hidratação em 1–5; dor em 0–5, com extremos visíveis.
- Salvar o check-in do dia, registrar CRM e atualizar automaticamente os dados do dashboard.
- Criar revisão semanal funcional com treinos previstos/realizados e as dez dimensões 1–5, usando o início da semana como chave.

### 5. Treino publicado e execução
- Centralizar permissões em `useEntitlement(feature)` e apresentar `LockedFeature` quando o plano não liberar treino.
- Carregar apenas programas publicados e seus treinos/exercícios; sem programa, mostrar o status real do protocolo e sua timeline.
- Criar sessão ao iniciar, registrar progressivamente carga, repetições, RPE e conclusão por exercício.
- Ao finalizar, calcular duração e percentual concluído, gravar o histórico e emitir `workout.completed`.

### 6. Operação administrativa
- Trocar os KPIs e listas demonstrativos por agregações reais de alunos, scores, check-ins, sessões e protocolos.
- Tornar a busca de alunos funcional e criar `/admin/students/$studentId` com perfil, idade, empresa/cargo, plano, score, pilares, onboarding, check-ins, adesão, sessões, alertas, protocolo e notas internas.
- Permitir criar e avançar o protocolo pela timeline operacional.
- Criar editor manual para programa, treinos e exercícios: busca na biblioteca, inclusão, remoção, ordem, séries, repetições, descanso, RPE e observação.
- Manter rascunho invisível ao aluno; publicar somente por ação explícita, atualizando protocolo/programa e CRM.

### 7. Perfil, navegação e refinamentos pedidos
- Tornar o perfil editável e usar foto real privada ou iniciais reais; remover o avatar `SM` e métricas fictícias.
- Exibir Administração no menu somente para funções staff, mantendo o bloqueio da rota.
- Remover `Scene 01`, `Scene 02` etc., o ano/horários fixos e reduzir bordas excessivas da home sem alterar sua direção visual, cenas ou logo oficial.
- Remover metas nutricionais fictícias; enquanto não houver estrutura de dados real, mostrar somente o estado vazio adequado.

## Arquitetura técnica
- Leituras e mutações privadas serão feitas com a sessão autenticada e protegidas por RLS; operações administrativas exigirão função staff validada.
- Funções de cálculo e agregação ficarão separadas da interface para testes determinísticos.
- Consultas serão agrupadas em módulos próprios para evitar lógica duplicada entre dashboard, diagnóstico e administração.
- Mudanças estruturais serão aplicadas por migração; os tipos gerados serão atualizados depois.

## Validação
- Testar cálculo unitário dos cinco pilares, score total, reversão de dor, empates e regras de prioridade.
- Validar em desktop e celular cadastro → retomada/conclusão do onboarding → diagnóstico → dashboard → check-in → treino.
- Validar fluxo administrativo: abrir aluno, criar protocolo/programa, editar treino, publicar e acompanhar execução.
- Executar o cenário com dois alunos diferentes e confirmar isolamento dos dados, incluindo tentativas de acessar o identificador do outro aluno.
- Confirmar que nenhuma tela privada exibe números demonstrativos quando não existe dado real.

## Fora desta iteração
Marketplace, Club, Scan Food, análise de imagem, WhatsApp, n8n, pagamentos, comunidade completa, IA de treino/nutrição e integrações com wearables.
