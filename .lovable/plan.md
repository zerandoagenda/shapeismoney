# Central do Agente de Treino

## Objetivo
Criar no admin uma central única para elaborar treinos, permitindo escolher o aluno e iniciar o trabalho por quatro caminhos: **Agente de IA**, **PDF**, **texto** ou **montagem manual**. Todos os caminhos devem terminar no mesmo rascunho editável, com aprovação humana obrigatória antes da publicação.

## Experiência administrativa
- Adicionar a aba **Agente de Treino** na navegação administrativa.
- Criar uma tela própria com:
  - seleção e busca do aluno;
  - resumo dos dados disponíveis e pendências do aluno;
  - escolha visual entre IA, PDF, texto e manual;
  - estado atual do ciclo, geração, revisão e publicação;
  - acesso aos rascunhos e programas anteriores.
- Após selecionar o aluno, manter o fluxo na mesma central, sem obrigar o admin a procurar controles espalhados no Client 360.

## Quatro formas de criação

### 1. Agente de IA
- Usar a **SIM Training Intelligence Spec v1.0** anexada como metodologia oficial completa da base de conhecimento.
- Reunir onboarding, SIM Score, avaliação aprovada, protocolo fotográfico, ciclo, prioridades, dor/restrições, agenda, equipamentos, check-ins, histórico de treino e biblioteca de exercícios.
- Antes de gerar, mostrar o que está disponível, o que está ausente e qualquer bloqueio de segurança.
- Produzir um rascunho estruturado com decisão, evidências, prioridades, divisão semanal, exercícios, séries, repetições, esforço, descanso, progressão, alternativas, semana mínima, contingência, viagem e gatilhos de revisão.
- Nunca aprovar ou publicar automaticamente.

### 2. Importação por PDF
- Reutilizar o upload privado e a extração já existentes.
- Mostrar o conteúdo estruturado para revisão e exigir o mapeamento de exercícios não reconhecidos.
- Preservar o arquivo original, autoria, data, aluno e rastreabilidade.

### 3. Importação por texto
- Adicionar um campo amplo para colar uma prescrição, observações ou rotina completa.
- Estruturar o texto com as mesmas regras do PDF, sem inventar exercícios ou dados ausentes.
- Mostrar exercícios não reconhecidos para mapeamento antes de salvar.
- Registrar a origem como `TEXT_IMPORT` para diferenciar de IA, PDF e manual.

### 4. Montagem manual
- Trazer o editor manual existente para a central, preservando exercícios, ordem, séries, repetições, carga inicial, esforço, descanso, notas, duplicação e reorganização.
- Permitir salvar rascunho, editar, aprovar e publicar no mesmo fluxo.

## Metodologia e segurança
- Incorporar o conteúdo integral do documento anexado como referência principal ativa, substituindo o resumo curto hoje existente.
- Aplicar a sequência obrigatória: **Dado → Evidência → Interpretação → Prioridade → Decisão → Prescrição → Execução → Resposta → Reavaliação**.
- Considerar os cinco eixos: Construção, Capacidade, Governo, Percepção e Execução.
- Bloquear geração quando houver sinal vermelho ou ausência dos requisitos essenciais; sinal amarelo exige revisão conservadora.
- Não diagnosticar, prescrever medicamentos/hormônios ou criar causalidade clínica.
- Usar apenas exercícios da biblioteca; nenhuma equivalência silenciosa.
- Registrar sugestão original, edição final, responsável, motivo e decisão no histórico.

## Dados e integração
- Reutilizar ciclos, prioridades, programas, treinos, exercícios, decisões, importações, jobs e auditoria existentes.
- Ampliar a origem dos programas/importações para incluir `TEXT_IMPORT` e guardar o texto original com segurança.
- Manter PDF, texto, manual e IA convergindo nas mesmas entidades de programa e treino.
- Atualizar filas e estados operacionais após geração, aprovação e publicação.

## Validação
- Testar os quatro caminhos com um aluno autorizado sem publicar automaticamente.
- Confirmar bloqueios por dados insuficientes, dor/sinal vermelho e exercícios não mapeados.
- Confirmar edição, aprovação, rejeição e publicação com auditoria.
- Validar navegação e uso em desktop e celular.
- Rodar verificação de tipos, segurança do banco e teste real do agente, preservando mensagens claras para indisponibilidade, créditos ou erros.

## Detalhes técnicos
- Nova rota administrativa dedicada e link no menu existente.
- Funções protegidas no servidor para estruturação por texto e geração por IA.
- Modelo oficial mantido em `openai/gpt-6-astra`, com saída estruturada e raciocínio obrigatório.
- Arquivos e prompts continuam privados; alunos recebem somente a versão publicada e apropriada para execução.
