# Shape Is Money OS — Primeira entrega V1

## Objetivo
Entregar o núcleo utilizável para validação com alunos reais, com experiência mobile-first, ambiente do aluno e ambiente administrativo, mantendo os demais módulos preparados sem simular funcionalidades inexistentes.

## Experiência visual
- Traduzir a referência oficial em uma interface de quiet luxury: preto profundo, marfim, café, vinho fechado, cinza mineral e dourado envelhecido apenas em detalhes.
- Combinar tipografia editorial serifada com interface sans-serif legível e indicadores de aparência financeira.
- Usar composição arquitetônica, espaço negativo, linhas finas, textura discreta e animações contidas.
- Não incorporar a imagem de referência diretamente; ela orientará linguagem, contraste e atmosfera.

## Entrega funcional
1. **Acesso e perfil**
   - Cadastro por email e Google, login, logout, sessão persistente e recuperação de senha.
   - Perfil completo e editável, com foto privada e dados pessoais, profissionais e corporais protegidos.
   - Confirmação de email preservada; após cadastro, mostrar instrução clara para confirmar o endereço.

2. **Base de dados e segurança**
   - Perfis, funções separadas, planos, permissões, onboarding, scores, check-ins, treinos, exercícios, protocolos e eventos de CRM.
   - Dados privados por padrão e regras por proprietário; administradores acessam somente conforme função validada no servidor.
   - Planos Free, Pago, Plus e Premium com permissões configuráveis, sem duplicar a aplicação.

3. **Estrutura principal**
   - Navegação do aluno otimizada para celular e layout amplo no desktop.
   - Navegação administrativa separada e controlada por função.
   - Estados de carregamento, vazio, erro, sucesso, bloqueado e “em breve”.

4. **Jornada do aluno**
   - Onboarding cinematográfico de uma pergunta por tela, salvando respostas progressivamente.
   - Diagnóstico inicial explicável, com SIM Score e os cinco pilares.
   - Dashboard como carteira de performance: evolução, Capital Físico, tendências e insight baseado nos dados registrados.
   - Check-in diário rápido e revisão semanal.
   - Treino de hoje, programa, exercícios, registro de carga/repetições/esforço e histórico.
   - Nutrição básica, Network e Money Brain aparecem apenas no nível funcional previsto nesta entrega; recursos futuros ficam bloqueados ou “em breve”.

5. **Jornada administrativa**
   - Visão geral com indicadores essenciais.
   - Lista e detalhe de alunos, filtros e alertas de adesão.
   - Protocolos com timeline e estados operacionais.
   - Gerador de treino em rascunho editável, sempre exigindo aprovação antes da publicação.
   - Visualização da experiência do aluno em modo somente leitura.
   - Eventos de CRM para cadastro, onboarding, protocolos, treinos e check-ins.

## Regras do SIM Score
- Score de 0 a 100 composto pelos cinco pilares, calculado por regras simples e transparentes a partir do onboarding e check-ins.
- Exibir ponto forte, gargalo, prioridade, coerência e primeira recomendação.
- Separar dados objetivos de autorrelatos e nunca inferir diagnóstico médico ou causalidade financeira.

## Arquitetura técnica
- Rotas públicas para entrada e recuperação; área autenticada para aluno; área administrativa com controle adicional por função.
- Componentes reutilizáveis para métricas, scores, gráficos, bloqueios, planos, timeline, check-ins, usuários, insights, treinos, exercícios e tabelas.
- Validação de entradas na interface e no servidor.
- Uploads de perfil e imagens em armazenamento privado.
- Estrutura de IA desacoplada por provedor; nesta entrega, geração de protocolo permanece como rascunho controlado e não publica automaticamente.

## Limite desta entrega
- Funcionais: acesso, perfil, onboarding, diagnóstico, dashboard, check-ins, treino, biblioteca inicial, visão administrativa, alunos, protocolos, rascunho de treino, eventos e permissões.
- Estruturais: Nutrição avançada, Scan Food, Perception Scan, Network completo, Marketplace, Club, SIM 90 completo, relatório de 90 dias e automações externas.
- WhatsApp, pagamentos e publicações automáticas por IA não serão conectados nesta etapa.

## Validação
- Testar cadastro, confirmação pendente, login, recuperação e logout.
- Confirmar isolamento dos dados entre usuários e bloqueio das páginas administrativas.
- Testar onboarding até o diagnóstico, check-in, registro de treino e publicação administrativa de protocolo.
- Revisar visualmente desktop e celular, incluindo textos, navegação, estados vazios e ausência de sobreposições.
