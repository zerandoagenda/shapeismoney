# Plano — Decisão assistida no Agente de Treino

## Objetivo
Transformar a tela após selecionar o cliente em uma central de decisão já alimentada pelos dados reais dele. O Bruno revisa a leitura, confirma a decisão e cria um treino em draft com um único comando.

## Experiência proposta
1. **Resumo do cliente preenchido automaticamente**
   - Objetivo principal e objetivo de 90 dias.
   - Histórico de treino, frequência sustentável e tempo disponível.
   - Dificuldades, desconfortos e região informada.
   - SIM Score e seus cinco pilares.
   - Avaliação física/fotográfica aprovada e quantidade de fotos disponíveis.
   - Dor e restrições atuais, últimos check-ins, revisões semanais e histórico recente de execução.
   - Cada bloco mostra claramente “não informado” quando não houver dado; nada será inventado.

2. **Leitura para decisão**
   - Organizar os dados na sequência oficial: Dado → Evidência → Interpretação → Prioridade → Decisão.
   - Pré-preencher a estratégia do ciclo com onboarding/anamnese: objetivo, frequência, duração e contexto.
   - Manter os campos editáveis para o Bruno corrigir objetivos, prioridades e estratégia antes da geração.
   - Destacar sinais impeditivos, especialmente dor RED, avaliação ainda não aprovada ou protocolo fotográfico incompleto.

3. **Ação principal clara**
   - Adicionar o botão **“Criar treino a partir desta decisão”**.
   - Ao clicar, salvar primeiro a decisão/ciclo revisado e então executar o Training Intelligence com todo o contexto real.
   - Mostrar andamento, sucesso, erro e requisitos pendentes na própria tela.
   - Em caso de exercício ausente, mostrar `NEEDS_LIBRARY` com acesso direto à Biblioteca.

4. **Revisão humana preservada**
   - O resultado será sempre um draft editável.
   - Exibir no retorno: decisão resumida, evidências utilizadas, prioridades, estrutura semanal, sessões, progressão, contingência, semana mínima e gatilhos de revisão.
   - Aprovar e publicar continuam ações separadas; a IA nunca publica automaticamente.

## Ajustes técnicos
- Criar uma leitura administrativa protegida que reúna perfil, `onboarding_responses`, último `sim_score`, avaliação aprovada, fotos, `pain_reports`, check-ins, revisões semanais e sessões anteriores.
- Reutilizar o gerador server-side atual, que já consome essas fontes e exige exercícios por ID da Biblioteca.
- Unificar a tela com o Orchestrator atual: respeitar readiness, registrar job/evento e impedir duplicação de drafts durante geração ou revisão.
- Converter as chaves do onboarding em rótulos humanos iguais aos da calibração inicial.
- Não expor fotos ou dados privados fora do acesso administrativo autorizado.

## Validação
- Abrir um cliente com onboarding completo e confirmar que as respostas aparecem corretamente.
- Confirmar estados com dados ausentes e com pré-requisitos pendentes.
- Gerar um draft pelo novo botão e verificar que nenhuma publicação ocorreu.
- Confirmar bloqueio por dor RED e tratamento de `NEEDS_LIBRARY`.
- Validar desktop e mobile, sem erros, com os dados de outro cliente permanecendo isolados.
