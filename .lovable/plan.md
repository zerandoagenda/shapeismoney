# SHAPE IS MONEY — First Client Beta

## Objetivo
Fechar o fluxo operacional do primeiro aluno no projeto atual, sem alterar a identidade visual aprovada e sem introduzir recursos fora do escopo.

## O que será construído

### 1. Cockpit do aluno
- Organizar o detalhe administrativo em dados pessoais, plano, readiness, SIM Score, onboarding, protocolo, treino, nutrição, check-ins, adesão, histórico e notas internas.
- Adicionar a checklist **ALUNO · READINESS**, calculada exclusivamente com dados reais, com progresso de 0/6 a 6/6 e estado **READY FOR EXECUTION**.
- Permitir que a equipe altere o plano entre Free, Paid, Plus e Premium, registrando `plan.changed`.

### 2. Protocolo e treino
- Manter os seis estados do protocolo, registrar toda mudança na timeline e mostrar ao aluno o andamento enquanto ainda não houver publicação.
- Completar o editor manual de programas e treinos: objetivo, início, observações, exercícios da biblioteca, séries, repetições, carga inicial, descanso, RPE, observações e ordem.
- Permitir editar, duplicar, reordenar e remover treinos e exercícios sem apagar e recriar silenciosamente todo o programa.
- Publicar o treino separadamente do protocolo e registrar `training.published`.
- Garantir que somente programas publicados apareçam ao aluno; iniciar sessão, salvar execução progressiva e finalizar com duração, percentual, data e hora.

### 3. Nutrição revisada pela equipe
- Criar planos, refeições e itens alimentares com permissões privadas e publicação controlada.
- Adicionar ao cockpit o editor de objetivo, metas, água, orientações, refeições e alimentos, com edição, duplicação, ordem e remoção.
- Mostrar ao aluno apenas o plano publicado, sem valores de demonstração; quando ausente, mostrar que está sendo preparado.
- Registrar `nutrition.published`.

### 4. Dados reais e eventos
- Confirmar persistência progressiva de todas as respostas do onboarding e exibi-las no cockpit com rótulos claros.
- Manter o SIM Score determinístico existente como fonte exclusiva do baseline.
- Revisar dashboard, check-in e Money Brain para usar somente registros reais e regras verificáveis.
- Completar os eventos `user.created`, `onboarding.completed`, `baseline.completed`, `plan.changed`, `protocol.created`, `protocol.published`, `training.published`, `nutrition.published`, `workout.started`, `workout.completed` e `checkin.completed`.

### 5. Segurança e validação
- Preservar RLS: cada aluno acessa somente seus próprios dados; equipe autorizada acessa o cockpit administrativo.
- Validar uploads e dados privados sem ampliar acesso anônimo.
- Criar um aluno de teste, percorrer todo o golden path, atingir 6/6, executar treino, registrar check-in e confirmar atualização do dashboard.
- Testar isolamento tentando acessar dados do aluno de teste por outra conta.

## Detalhes técnicos
- Alterações de estrutura serão aplicadas por migration no Lovable Cloud, com grants e políticas em cada nova tabela.
- A carga inicial do exercício será persistida no item do treino; a execução real continuará no log da sessão.
- A publicação de protocolo, treino e nutrição será independente, permitindo readiness preciso.
- O teste criará dados de validação claramente identificados; quaisquer credenciais temporárias e acessos de bootstrap serão removidos após a verificação.

## Fora do escopo
Comunidade completa, marketplace, SIM Club, Food Scan, IA, análise de imagem, wearables, WhatsApp, n8n e pagamentos.
