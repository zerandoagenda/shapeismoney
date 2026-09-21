# Importação completa da biblioteca Muscle & Strength

## Objetivo
Trazer todos os exercícios e vídeos autorizados da Muscle & Strength para a biblioteca oficial do Shape Is Money, com rastreabilidade, revisão administrativa e reprodução dentro do treino do aluno.

## Escopo
- Descobrir todas as páginas de exercícios disponíveis na origem, respeitando limites de acesso e evitando páginas que não sejam exercícios.
- Extrair de cada exercício: nome original, grupos musculares, equipamento, nível, instruções, erros/cues quando disponíveis, imagem, vídeo, URL de origem e identificação externa.
- Baixar e armazenar cópias autorizadas dos vídeos e imagens em mídia privada da plataforma, sem depender da disponibilidade futura do site externo.
- Preservar os quatro exercícios já existentes e consolidar duplicatas por identificação da origem, nome normalizado e aliases; nenhum exercício em uso será apagado ou terá seu ID trocado.
- Exibir o vídeo demonstrativo no exercício durante a sessão do aluno, separado do envio de vídeo técnico feito pelo próprio aluno.

## Fluxo administrativo
- Adicionar ao Exercise Library um importador exclusivo para administradores com ações de descobrir catálogo, importar lote e retomar falhas.
- Mostrar progresso real: encontrados, importados, atualizados, duplicados, sem vídeo e com erro.
- Permitir visualizar vídeo, origem, estado da importação, data da última sincronização e editar normalmente cada exercício.
- Manter a importação idempotente: executar novamente atualiza o mesmo registro, sem multiplicar exercícios ou arquivos.

## Dados e segurança
- Ampliar `exercise_library` com origem, URL original, ID externo, crédito/autorização, caminho privado da mídia, estado e data de sincronização.
- Criar um bucket privado específico para a biblioteca de exercícios e entregar vídeos por URLs temporárias apenas a membros autenticados com acesso ao treino.
- Registrar lotes, itens, falhas e ações administrativas para auditoria e retomada.
- Validar tipo e tamanho dos arquivos, limitar a origem ao domínio autorizado e impedir que URLs arbitrárias sejam baixadas pelo servidor.
- Restringir importação e alterações à equipe autorizada; alunos apenas leem exercícios ativos vinculados ao próprio treino.

## Estratégia de importação
- Usar uma conexão de coleta de sites no servidor para mapear o catálogo e extrair dados estruturados em lotes.
- Processar a importação fora da renderização das páginas, em lotes limitados e retomáveis, com pausa em bloqueios, respostas 4xx ou limites da origem.
- Resolver os endereços reais das mídias por página, armazenar uma cópia autorizada e registrar a página-fonte e os créditos.
- Marcar casos sem vídeo ou sem correspondência para revisão, sem inventar substituições.

## Experiência do aluno
- Mostrar um controle de vídeo compacto em cada exercício da sessão, com poster/imagem quando disponível.
- Carregar o vídeo somente quando solicitado para evitar lentidão no celular.
- Exibir estado discreto quando um exercício ainda não possuir vídeo, sem bloquear a execução e os registros da sessão.

## Validação
- Conferir amostras de todas as categorias e comparar nome, vídeo, instruções e origem com as páginas autorizadas.
- Testar reexecução do mesmo lote, retomada após falha, deduplicação e preservação dos exercícios já usados em programas.
- Validar acesso administrativo, reprodução como aluno, URLs temporárias, celular e desktop.
- Entregar relatório final com totais encontrados/importados/atualizados/sem vídeo/falhos e lista de revisão.

## Dependência operacional
Antes da implementação, conectar o serviço de coleta de sites ao projeto. O volume final de páginas e mídia determinará o tempo e o espaço consumidos; a importação será feita em lotes para permanecer recuperável.
