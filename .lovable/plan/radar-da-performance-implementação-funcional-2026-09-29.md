# Radar da Performance — implementação funcional

## Objetivo
Integrar ao Shape Is Money OS uma jornada pública real de avaliação executiva, sem login e sem alterar a identidade, os dados ou os fluxos existentes:

```text
Captação → identificação no CRM → Radar → score determinístico
→ análise por IA → PDF → resultado seguro → WhatsApp
```

A versão 1.0 reutilizará as 15 perguntas quantitativas atuais do onboarding: três para cada pilar oficial. Os sete campos de identificação/contexto serão coletados antes e não entrarão no cálculo do score.

## Experiência pública
- Criar `/radar` com abertura cinematográfica, logo oficial, mensagem e os cinco pilares.
- Reservar a seção de vídeo para conteúdo configurado no Admin; enquanto não houver vídeo, não exibir mídia falsa nem botão quebrado.
- Coletar nome, WhatsApp, e-mail, idade, cargo, empresa e segmento, além de consentimento não pré-marcado.
- Criar o lead imediatamente ao avançar da identificação, capturando UTMs, origem, referência e página de entrada.
- Executar as 15 perguntas em etapas curtas, com autosave, retomada após recarregar/fechar e progresso real.
- Concluir com a experiência animada de mapeamento dos pilares e análise, respeitando redução de movimento.
- Criar `/radar/result/$token` com token opaco, score, gráfico radar real, ativo, gargalo, leitura dos cinco pilares e próximo movimento.
- Registrar visualização do resultado e clique no grupo; o link inicial será `https://chat.whatsapp.com/BNk2t6YT4XhCpHXh4R7ED6` e continuará editável no Admin.
- Criar `/privacy` com política específica para identificação, respostas, análise e contato relacionado ao Radar.

## Dados, segurança e continuidade
- Criar entidades separadas para leads, sessões, perguntas versionadas, respostas, scores, análises, relatórios, eventos, histórico de status, atribuição e configurações.
- Incluir `GRANT`, RLS e políticas em cada nova tabela: nenhuma informação pessoal ou resposta terá leitura pública direta.
- Expor somente operações públicas estreitas por funções de servidor: criar lead, salvar resposta usando segredo de sessão, concluir, consultar resultado por token e registrar eventos permitidos.
- Guardar apenas hashes dos segredos públicos; usar tokens aleatórios não enumeráveis, validação de payload, honeypot e limitação de abuso.
- Manter status comercial separado do progresso operacional e marcar abandono por inatividade sem apagar o lead.
- Persistir a versão 1.0 das perguntas por migration, incluindo textos, ordem, pilar, escala, direção e regra de normalização.
- Reaproveitar a lógica determinística existente: escala 1–5 normalizada para 0–100, inversão da pergunta de interferência por dor, média por pilar e média geral. A IA recebe o score pronto e nunca o recalcula.

## Análise e relatório
- Criar análise estruturada com o gateway de IA já usado pelo sistema e o modelo oficial do projeto.
- Validar o JSON obrigatório: resumo executivo, estado atual, força, gargalo, incoerência, cinco análises, prioridade, próximo movimento e fechamento.
- Aplicar linguagem executiva e limites de segurança: sem motivação genérica, diagnóstico médico, promessa financeira ou causalidade não sustentada.
- Registrar modelo, versão, prompt, tentativas, data e falha recuperável.
- Gerar automaticamente um PDF premium e legível com capa, gráfico, scores, leitura, cinco pilares, todas as perguntas/respostas e próximo movimento.
- Armazenar o PDF em área privada como snapshot da versão concluída; resultado e Admin receberão download real, estado de processamento e opção de tentar novamente.

## CRM administrativo
- Adicionar Radar como subárea de **Negócio**, preservando as seis áreas principais do Admin.
- Criar visão de funil com contagens e taxas reais: visitantes, identificados, iniciados, concluídos, resultados vistos e cliques no WhatsApp.
- Criar lista responsiva de leads com busca, filtros de origem/status/score/pilares/data, progresso, score, força, gargalo e última atividade.
- Criar Lead 360 com dados de contato, ações reais, resultado, gráfico, respostas agrupadas, análise auditável, PDF e timeline.
- Permitir alterar status comercial com histórico; clique no WhatsApp não será tratado como entrada confirmada no grupo.
- Acrescentar às Configurações: campanha ativa, URL do grupo, URL do vídeo, versão ativa e texto do CTA. Apenas Admin Master poderá alterar; leitura pública exporá somente campos seguros.

## Integração técnica
- Usar funções de servidor e módulos server-only; não criar Edge Functions.
- Reaproveitar `Brand`, `CinematicBackdrop`, tokens visuais, componentes de formulário e o gateway de IA.
- Usar Recharts para a teia na interface e uma representação vetorial equivalente no PDF.
- Gerar PDF com biblioteca JavaScript compatível com o ambiente de publicação, sem navegador headless nem binários nativos.
- Adicionar metadados próprios em `/radar`, `/radar/result/$token` e `/privacy`.
- Registrar a arquitetura nova no `AGENTS.md` e acompanhar a entrega no `roadmap.md`.

## Validação obrigatória
- Criar um lead de teste sem login e confirmar sua entrada imediata no CRM.
- Interromper e retomar o Radar para provar o autosave.
- Concluir as 15 respostas e conferir score determinístico e dados do gráfico.
- Confirmar análise estruturada, PDF gerado/baixável e resultado acessível somente pelo token.
- Conferir Lead 360, respostas, timeline, alteração de status e evento do WhatsApp.
- Validar campanha desativada, falha/retry de análise e relatório, consentimento e isolamento entre tokens.
- Validar teclado, redução de movimento, celular, tablet e desktop sem sobreposição ou botões decorativos.
- Confirmar testes, tipos, build, logs e o fluxo completo no navegador antes de marcar concluído.
