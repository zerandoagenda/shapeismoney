# Visualização do aluno na carteira

## Objetivo
Permitir que o administrador abra, diretamente na lista de clientes, uma prévia segura e somente leitura da experiência real de cada aluno.

## Implementação
- Adicionar uma ação “Ver como aluno” em cada cliente, tanto na lista de celular quanto na tabela de desktop.
- Evoluir a visualização existente para alternar entre “Dashboard” e “Treino”.
- Reproduzir no Dashboard os dados reais que o aluno recebe: prioridade, SIM Score, próxima ação e entregas publicadas.
- Reproduzir no Treino o programa publicado, dias, duração, exercícios, séries, repetições, descanso e disponibilidade de vídeo.
- Manter a prévia estritamente somente leitura: nenhuma sessão, carga, check-in ou progresso poderá ser alterado pelo administrador.
- Preservar o acesso ao Client 360 e o retorno para a carteira.

## Validação
- Confirmar a ação em celular e desktop.
- Abrir um aluno com treino publicado e outro sem treino para validar os dois estados.
- Verificar ausência de sobreposição, erros no navegador e falhas de compilação.
