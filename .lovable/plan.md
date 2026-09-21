# Vídeos de exercícios, registro por série e cronômetro persistente

## Objetivo
Integrar os vídeos da pasta compartilhada à biblioteca oficial, exibi-los como referência nos treinos, registrar a carga de cada série e manter o tempo de treino mesmo quando o aluno sai da página.

## O que será feito

### 1. Importação dos vídeos
- Usar o índice confirmado da pasta, que contém 778 vídeos MP4 com nome, grupo muscular e arquivo correspondente.
- Copiar os vídeos para a mídia privada da plataforma, mantendo identificação e origem para evitar duplicações.
- Associar automaticamente por nome normalizado e aliases aos exercícios já existentes.
- Criar na biblioteca os exercícios do índice que ainda não existirem, preservando qualquer exercício e vínculo atual.
- Registrar casos ambíguos ou sem correspondência para revisão, sem substituir silenciosamente um exercício por outro.
- Ajustar o acesso privado aos arquivos para que alunos autenticados possam assistir às referências dos exercícios ativos.

### 2. Vídeo de referência no treino
- Reutilizar o visualizador já presente em cada exercício.
- Priorizar o vídeo armazenado na plataforma e carregar somente quando solicitado.
- Manter um estado discreto quando ainda não houver vídeo associado.

### 3. Carga por série
- Trocar o registro único do exercício por linhas individuais para cada série prevista.
- Em cada série, permitir informar carga e repetições realizadas, além dos sinais de esforço, técnica e dor já existentes.
- Salvar cada linha no registro por série já existente, permitindo consultar o histórico depois.
- Preservar compatibilidade com treinos e sessões anteriores.

### 4. Cronômetro persistente
- Iniciar o cronômetro junto com a sessão de treino.
- Calcular o tempo pelo horário de início salvo, em vez de depender de uma contagem apenas na tela.
- Ao trocar de página, fechar o navegador ou retornar em outro momento, recuperar a sessão aberta e mostrar o tempo total correto.
- Encerrar o cronômetro somente ao concluir o treino e salvar a duração real.

### 5. Fábio no painel administrativo
- Remover o papel beta do Fábio, mantendo o plano Plus e o papel de aluno.
- Corrigir a carteira de clientes para considerar somente papéis administrativos como equipe; `beta_member` não esconderá outros alunos do painel.
- Confirmar que Fábio aparece na carteira e continua sem qualquer acesso administrativo.

## Validação
- Conferir totais importados, associados, criados e pendentes de revisão.
- Abrir exercícios com vídeo na biblioteca e em um treino publicado.
- Registrar cargas diferentes em cada série, sair e retornar à tela, concluir o treino e conferir os dados salvos.
- Verificar o cronômetro após navegação e reabertura da página.
- Validar Fábio como aluno Plus no painel, sem papel beta e sem acesso administrativo.
- Testar em celular e desktop, além das verificações de segurança e integridade.
