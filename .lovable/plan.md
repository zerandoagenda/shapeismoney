# SHAPE IS MONEY — Training Intelligence 1.0

## Objetivo
Implementar o sistema oficial de treino com decisão como unidade central, unificando PDF, criação manual e AI Draft.
## Escopo funcional
- Um único modelo de ciclo, programa, sessões, exercícios prescritos, decisões e histórico para PDF, Manual e AI Draft.
- Revisão humana obrigatória antes de qualquer publicação.
- Execução do aluno orientada pela ação do dia, com logs por série, dor, progressão e check-in.
- Cockpit operacional com fila RED/YELLOW/GREEN e métricas clicáveis.
- Protocolo fotográfico SIM_INITIAL_17 configurável, vídeos técnicos privados e reavaliação longitudinal.
- Base de conhecimento metodológica separada de PDFs individuais.

## Segurança e governança
- Fotos, vídeos, PDFs, dor, saúde e restrições permanecem privados.
- Escrita de prescrição e aprovação restrita à equipe; publicação exige aprovação.
- Toda mudança relevante registra autor, antes/depois, motivo e evidências.
- A inteligência cria somente drafts; nunca diagnostica nem toma decisão clínica.

## Implementação técnica
- Estender entidades existentes de treino para preservar compatibilidade e histórico.
- Criar cycle_strategy, priorities, decision_log, imports, avaliações, fotos, vídeos, pain flags e logs normalizados.
- Usar storage privado para PDFs, fotos e vídeos, com URLs temporárias.
- Executar parsing e Training Architect no servidor com openai/gpt-6-astra via streaming.
- Aplicar regra determinística de progressão e classificação de atenção/check-in.
- Migrar a tela atual do cliente e o cockpit individual para os novos fluxos sem alterar a identidade visual.

## Validação
- Caso PDF: upload → estrutura → revisão → draft → aprovação → publicação → execução.
- Caso manual: criação → draft → publicação → execução.
- Caso AI: contexto → razões → edição → aprovação → publicação → execução.
- Confirmar histórico compartilhado, progressão, check-in, fila, decisão, reavaliação, privacidade e mobile.
