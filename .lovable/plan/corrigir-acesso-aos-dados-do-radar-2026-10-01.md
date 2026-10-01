# Corrigir acesso aos dados do Radar

## Objetivo
Garantir que a ficha individual do lead abra corretamente e mostre identificação, score, análise, todas as respostas e histórico.

## Implementação
- Tornar o carregamento da ficha resiliente a erros, com mensagem clara e ação para tentar novamente.
- Normalizar os relacionamentos retornados pelo banco para exibir corretamente sessão, respostas, score e análise.
- Mostrar estado contextual caso uma avaliação ainda não tenha respostas.
- Validar a ficha real exibida na imagem em desktop e celular.

## Segurança
- Manter os dados acessíveis somente à equipe autorizada.
- Preservar os tokens protegidos e não liberar leitura pública das tabelas do Radar.
