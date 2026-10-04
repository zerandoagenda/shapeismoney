# Master Product Rebuild — auditoria e execução por fases

## Objetivo
Evoluir o produto atual para a experiência **Today First**, preservando usuários, dados, Radar, CRM, biblioteca, vídeos, treinos, permissões, URLs e automações que já funcionam. A execução será incremental, com validação funcional ao final de cada fase e sem substituir dados reais por demonstrações.

## O que será preservado
- Identidade oficial, linguagem quiet luxury e ativos atuais.
- Autenticação, papéis, planos, RLS, storage privado e trilhas de auditoria.
- Radar da Performance, Client 360, Orchestrator, Training Intelligence, biblioteca de exercícios, programas, cargas e histórico.
- Publicação exclusivamente humana de treino e nutrição.
- Regra de não inventar exercícios, dados nutricionais, diagnóstico ou causalidade.

## Fase 1 — Auditoria e contrato operacional
- Mapear cada requisito do documento para: existente, parcial, ausente ou incompatível.
- Consolidar nomes oficiais de eventos e estados sem duplicar tabelas ou quebrar eventos atuais.
- Fechar os gaps já identificados de segurança, versionamento, idempotência e ações feitas diretamente pelo navegador.
- Definir critérios verificáveis por fase e registrar bloqueios reais.

## Fase 2 — Experiência Today First
- Reduzir a navegação móvel para **Hoje, Treino, Evolução e Perfil**, mantendo áreas secundárias acessíveis pelo Perfil/Meu Plano.
- Reconstruir Hoje em torno de uma única prioridade atual, Today Stack, agenda restante, Performance Strip, direção e SIM Pulse expansível.
- Derivar prioridade, horários e conclusão de treino, hábitos, check-in e alimentação apenas de registros persistidos.
- Adicionar “Falar com a equipe” como ação contextual real.
- Preservar estados de calibração e protocolo em construção com prazos vindos da ativação.

## Fase 3 — Workout Player
- Entrar em modo treino imersivo, removendo navegação durante a sessão.
- Exibir um exercício por vez, progresso, vídeo/instrução, última execução e entradas grandes para carga e repetições.
- Persistir cada série imediatamente; iniciar descanso automático com +30s e pular.
- Registrar dificuldades padronizadas e encaminhá-las ao Admin.
- Finalizar com duração, séries, volume, percepção da sessão, RPE e comentário; atualizar Hoje e Admin.
- Criar proteção local e sincronização posterior para evitar perda de séries em conexão instável.

## Fase 4 — Alimentação orientada à execução
- Reorganizar a tela publicada por refeições do dia, próxima refeição e conclusão, sem aparência de planilha.
- Permitir “Fiz diferente” e registro rápido.
- Só habilitar substituições quando houver alimentos e equivalências estruturadas e revisadas; caso contrário, manter estado honesto e bloqueado.
- Integrar conclusão das refeições ao Today Stack e aos eventos de execução.

## Fase 5 — Evolução e Perfil
- Expandir Evolução com SIM Score, cinco pilares, comparação Radar inicial/atual, execução, corpo, fotos privadas, progressão de exercícios e marcos reais.
- Organizar Perfil como índice simples para protocolo, Radar, alimentação, hábitos, medidas, fotos, anamnese, avaliações, histórico, documentos, equipe e configurações.
- Reutilizar a leitura determinística compartilhada entre aluno e equipe.

## Fase 6 — Engines, revisão e novos ciclos
- Manter o Evidence Bundle como entrada única de treino e completar os campos faltantes de histórico, dor, rotina, hábitos e execução.
- Criar Review Engine determinístico antes da revisão humana, com `AUTO_FIX` apenas para correções seguras e `FLAG_FOR_REVIEW` para decisões.
- Completar revisão de draft com contexto, flags, edição, pedido de ajuste à IA e comparação antes/depois versionada.
- Implementar Cycle Review com manter, alterar, progredir, regredir ou investigar; o próximo ciclo permanece Draft → Review → Publish.
- Manter Nutrition Engine bloqueado até existir metodologia e base estruturada de alimentos/equivalências autorizadas.

## Fase 7 — Command Center e Client 360
- Evoluir Hoje do Admin para priorizar queda de execução, relatos problemáticos, revisões e SLA real de 48 horas após os requisitos completos.
- Consolidar a fila de protocolos sobre ativações/jobs existentes, sem nova fonte de verdade.
- Completar Client 360 com cabeçalho compacto, visão geral, alimentação, Radar, check-ins, anamnese e histórico; preservar o gráfico e cargas já implantados.
- Levar cada alerta diretamente à decisão ou revisão correspondente.

## Fase 8 — App, telemetria e robustez
- Preparar instalação PWA, ícone, splash, safe areas e navegação standalone.
- Completar eventos de produto solicitados, sem dados pessoais desnecessários.
- Expor DAU, WAU, aderência, conclusão, abandono, duração e retenção a partir dos eventos reais.
- Garantir loading, erro, retry, acessibilidade, redução de movimento, alvos de toque e lazy loading de mídia.

## Validação obrigatória
- Testar aluno em 390×844, 393×852 e 430×932; Admin em 1280px e 1440px, com tablet funcional.
- Executar o fluxo descartável: cadastro → onboarding/anamnese/Radar → Orchestrator → drafts → revisão → publicação → treino/séries → alimentação → check-in → evolução → novo ciclo.
- Confirmar retry sem duplicidade, isolamento entre alunos, papéis, URLs privadas, histórico preservado e ausência de botões sem ação.
- Não declarar conclusão enquanto houver bloqueios não validados; documentá-los de forma explícita.

## Detalhes técnicos
- Reutilizar entidades atuais (`client_activations`, jobs, programas, sessões, set logs, planos nutricionais, Radar, eventos e notificações) antes de qualquer migration aditiva.
- Funções internas sensíveis permanecem autenticadas e server-side; privilégios administrativos só após validação de papel.
- Cronômetros e progresso continuam derivados de registros persistidos; cache local será apenas uma fila temporária de sincronização.
- Alterações de schema serão aditivas, com grants, RLS, índices e auditoria na mesma migration.
- A implementação será entregue na ordem acima; cada fase deve ficar funcional antes da próxima.
