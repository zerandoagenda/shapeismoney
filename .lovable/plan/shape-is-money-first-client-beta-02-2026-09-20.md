# SHAPE IS MONEY — First Client Beta 02

## Objetivo
Transformar a área autenticada atual em um ecossistema único de **Executive Performance Concierge**, preservando integralmente a identidade visual aprovada, o logotipo oficial, o fluxo operacional existente e um único perfil por usuário.

## Experiência do membro

### 1. Navegação e Member Home
- Reorganizar a navegação desktop em **Overview, Performance, Treino, Nutrição, Perception Lab, Money Brain, Members, SIM Select e Perfil**, com divisões editoriais discretas.
- No mobile, manter **Home, Treino, Performance, Members e Perfil** visíveis e abrir os demais módulos por um menu funcional.
- Transformar `/dashboard` na entrada de member club: identificação do membro, SIM Score real, protocolo, treino do dia, check-in, Daily Brief, próximo marco e uma composição editorial de acessos conforme o plano.
- Preservar a estética quiet luxury, reduzir densidade visual e reutilizar os materiais, fontes, cores e movimentos já aprovados.

### 2. Performance e Money Brain
- Criar uma área de Performance com histórico real de SIM Score, check-ins, adesão, sessões e marcos, sem métricas fictícias.
- Centralizar o motor de regras do Money Brain para cruzar apenas dados existentes de onboarding, score, check-ins, treino, nutrição e Perception Scan.
- Mostrar um Daily Brief explicável, incluindo quais sinais reais sustentam a leitura; quando os dados forem insuficientes, informar isso explicitamente.
- Preparar a abstração futura de Training Agent e Nutrition Agent como estados “aguardando metodologia”, sem geração automática.

## Perception Lab

### 3. Fluxo privado do Perception Scan
- Criar a jornada de contexto, intenção de comunicação múltipla, guia visual e upload de frente, perfil, costas e imagem profissional/social opcional.
- Aceitar somente imagens válidas, com limites de formato/tamanho, consentimento explícito e aviso de privacidade.
- Guardar as imagens em bucket privado, organizadas por usuário e scan; retenção até exclusão manual, conforme definido.
- Permitir histórico, reabertura e comparação entre scans, com referências de entrada, 30, 60 e 90 dias baseadas nas datas reais.

### 4. Análise multimodal
- Implementar a análise exclusivamente no servidor usando Lovable AI, com uma abstração de provider/model para permitir troca futura sem alterar o produto.
- Usar o modelo multimodal padrão `openai/gpt-6-astra`; “Gemini” permanecerá uma opção futura na configuração até existir um identificador exato aprovado.
- Enviar somente URLs assinadas temporárias das imagens privadas e o contexto declarado pelo membro; nunca expor credenciais ou acessar a IA pelo navegador.
- Aplicar um prompt de segurança baseado no Mapa da Percepção Humana, limitado a sinais visíveis e linguagem probabilística. Proibir diagnóstico, beleza, personalidade, riqueza, competência e atributos sensíveis.
- Validar a resposta estruturada antes de persistir: coherence score, cinco subscores, pontos positivos, fricções, prioridade, próxima ação, cinco camadas e plano observável de sete dias.
- Exibir estado cinematográfico de processamento e mensagens reais de erro. Somente falhas transitórias terão tentativas limitadas.

### 5. Relatório e revisão
- Criar o Perception Report com índice interno de coerência visual, subscores, achados por camada e plano de sete dias.
- Permitir marcar ações como concluídas sem alterar o relatório original.
- No cockpit do aluno, incluir scans, imagens autorizadas, análise, observação interna, solicitação de novo scan e revisão pela equipe.
- Estados: `processing`, `ai_completed`, `reviewed` e um estado técnico de falha recuperável, sem apresentar resultado parcial como concluído.

## Members

### 6. Biblioteca editorial
- Criar **Briefings, Protocols, Sessions, Playbooks, Experiences e Archive** como uma biblioteca de private members club, não como LMS ou grade de streaming.
- Suportar texto, vídeo, áudio, PDF e aula por metadados e arquivos privados quando aplicável.
- Criar e publicar uma seleção inicial de SIM Briefings inspirada nos temas fornecidos, com conteúdo editorial original e sem afirmações médicas.
- Registrar visualização de conteúdo e aplicar acesso por plano.

### 7. Experiences e The Club
- Criar listagem editorial de próximas experiências, plano mínimo e lista de interesse, sem venda ou pagamento.
- Mostrar **The Club** como ambiente futuro bloqueado com a mensagem definida, sem implementar sua operação.

## SIM Select

### 8. Curadoria e benefícios
- Criar coleções editoriais para Performance, Nutrition, Recovery, Style, Technology, Travel e Experiences.
- Criar parceiro, manifesto, motivo da seleção, benefício, plano mínimo, período e link externo, sem carrinho, preço, promoção ou “comprar agora”.
- Criar o selo tipográfico discreto **SIM Approved**.
- Publicar a seleção inicial pedida. O exemplo SOLDIER poderá aparecer com os dados fornecidos; cupom e link permanecerão ausentes até serem informados, evitando inventar benefícios.
- Registrar abertura de parceiro e de benefício.

## Administração

### 9. Operação completa
- Expandir a navegação administrativa para Overview, Clients, Protocols, Training, Nutrition, Perception, Performance, Members, SIM Select, Experiences, CRM, Money Brain e Settings.
- Criar gestão funcional de conteúdo, experiências, parceiros, benefícios e coleções, com publicação, ativação, ordenação, plano mínimo e upload privado/público conforme o tipo do ativo.
- Criar AI Configuration somente informativa e segura: provider, modelo e status; nunca exibir chaves.
- Manter Training Agent e Nutrition Agent como “Awaiting methodology”.
- Atualizar o cockpit do aluno com Perception e readiness de oito itens: cadastro, plano, baseline, protocolo, treino, nutrição, scan concluído e primeiro check-in. Em 8/8, mostrar **FULL SYSTEM ACTIVE**.

## Dados e segurança

### 10. Estrutura de dados
- Adicionar tabelas de scans, imagens, achados, ações, observações/revisões e solicitações de novo scan.
- Adicionar tabelas de conteúdos Members, arquivos, visualizações, experiências e interesses.
- Adicionar tabelas de coleções, parceiros e benefícios do SIM Select.
- Reutilizar `profiles.id` como `user_id` em todo dado pessoal; não criar perfil paralelo.
- Adicionar os entitlements `can_access_member_library` e `can_access_premium_library`, além dos acessos necessários para Perception Lab, SIM Select e Experiences.
- Incluir os conteúdos iniciais e coleções na migration para que a primeira publicação já tenha dados reais.

### 11. RLS, arquivos e auditoria
- Aplicar grants e RLS em todas as novas tabelas: membro vê apenas seus scans, ações e interesses; conteúdos ativos respeitam plano; equipe autorizada administra.
- Criar buckets privados para scans e arquivos restritos; capas editoriais públicas serão servidas apenas quando não contiverem dados pessoais.
- Restringir eventos de CRM a operações verificadas no servidor ou triggers, eliminando a possibilidade de um membro forjar eventos arbitrários.
- Registrar `perception.scan.created`, `perception.scan.completed`, `perception.scan.reviewed`, `content.viewed`, `select.partner.opened`, `select.benefit.opened` e `experience.interest.created`.
- Corrigir no mesmo escopo os riscos já identificados de histórico alterável, notas de outros membros da equipe e permissões administrativas excessivamente amplas nas novas operações.

## Conteúdo e imagens
- Criar imagens editoriais originais e coerentes para as capas iniciais, sem copiar marcas ou usar símbolos de luxo óbvios.
- Não inventar cupons, links comerciais, agenda, preço ou promessas de parceiros/experiências; campos não fornecidos permanecem vazios ou indisponíveis.

## Validação obrigatória
- Executar análise real com o gateway após integrar a IA e confirmar o relatório persistido.
- Validar desktop e mobile, menu móvel, estados bloqueados, carregamento e redução de movimento.
- Testar dois membros: uploads privados, isolamento de scans/imagens/ações, acessos por plano e bloqueio do cockpit administrativo.
- Percorrer o fluxo do primeiro cliente até **8/8 FULL SYSTEM ACTIVE**, incluindo scan, relatório, briefing, SIM Select, treino, nutrição, check-in e Daily Brief atualizado.
- Rodar verificação de tipos, linter do banco e inspeção final de rotas e metadados.

## Fora do escopo
Pagamentos, carrinho, comunidade completa, operação do The Club, venda de experiências, WhatsApp, n8n, wearables, Food Scan, análise médica, metodologia automática de treino ou nutrição e qualquer compartilhamento automático de dados privados.
