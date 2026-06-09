# Implementar CRUD de Cenários no Frontend

## Summary

Adicionar uma experiência com múltiplas telas para gerenciar cenários persistidos no banco, mantendo a tela atual de preenchimento/resolução como base para `/cenarios/:id`. A navegação usará React Router, com lista operacional em tabela, criação de novo cenário e edição/resolução de cenário salvo.

## Key Changes

- Adicionar roteamento no frontend com `react-router-dom`:
  - `/` redireciona para `/cenarios`.
  - `/cenarios` lista cenários salvos.
  - `/cenarios/novo` abre formulário de criação.
  - `/cenarios/:id` abre cenário existente para editar, salvar e resolver.
- Criar uma camada simples de API para centralizar chamadas:
  - `GET /api/v1/scenarios`
  - `POST /api/v1/scenarios`
  - `GET /api/v1/scenarios/{id}`
  - `PUT /api/v1/scenarios/{id}`
  - `DELETE /api/v1/scenarios/{id}`
  - `POST /api/v1/scenarios/{id}/solve`
  - `GET /api/v1/scenarios/{id}/solution`
- Refatorar a tela atual:
  - Extrair o formulário de cenário para ser usado em criação e edição.
  - Extrair o painel de resultado para reutilizar com solução avulsa e solução salva.
  - Trocar o endpoint atual `POST /solve` pelo fluxo persistido quando estiver em `/cenarios/:id`.
- Manter o payload compatível com `CenarioRequest`:
  - `nome`
  - `descricao`
  - `periodos[]` com `id`, `nome`, `ordem`, `demandaMinima`, `ativo`
  - `regraTrabalhoFolga` com `periodosTrabalhados`, `periodosFolga`, `circular`

## UX

- `/cenarios` terá tabela operacional com:
  - nome, descrição curta, quantidade de períodos, regra de trabalho/folga e ações.
  - ações: abrir/editar, resolver, excluir.
  - estado vazio com botão “Novo cenário”.
  - confirmação antes de excluir.
- `/cenarios/novo` terá formulário com valores padrão semelhantes à tela atual.
  - Ao salvar com sucesso, chamar `POST /api/v1/scenarios` e navegar para `/cenarios/:id`.
  - Não resolver antes de existir ID.
- `/cenarios/:id` terá:
  - cabeçalho com nome do cenário e botão voltar para lista.
  - formulário editável.
  - botão “Salvar alterações”, usando `PUT /api/v1/scenarios/{id}`.
  - botão “Resolver cenário”, usando `POST /api/v1/scenarios/{id}/solve`.
  - painel de resultado abaixo, no mesmo padrão atual.
  - ao carregar a página, tentar `GET /api/v1/scenarios/{id}/solution`; se retornar 404, mostrar apenas o formulário sem erro visual.
- Como o backend remove a solução quando o cenário é atualizado, após salvar alterações o frontend deve limpar o resultado exibido e orientar o usuário a resolver novamente.

## Error, Loading, and State Handling

- Exibir loading separado para listar, salvar, resolver e excluir.
- Tratar respostas de erro do backend no formato `ErroResponse` usando `mensagem`.
- Em erro 404 ao buscar cenário por ID, mostrar estado “Cenário não encontrado” com ação para voltar à lista.
- Após excluir na listagem, remover o item localmente ou recarregar a lista.
- Após resolver pela listagem, navegar para `/cenarios/:id` levando ou recarregando o resultado.

## Test Plan

- Rodar `npm run lint` e `npm run build` no frontend.
- Validar manualmente:
  - abrir `/cenarios` com lista vazia e com cenários existentes.
  - criar cenário novo e confirmar navegação para `/cenarios/:id`.
  - editar cenário e confirmar que a solução exibida é limpa.
  - resolver cenário e confirmar renderização de KPIs, padrões e cobertura.
  - recarregar `/cenarios/:id` com solução salva e confirmar que `GET /solution` reaparece no painel.
  - excluir cenário pela lista e confirmar remoção.
  - acessar ID inexistente e ver estado de erro controlado.

## Assumptions

- Usaremos React Router porque URLs reais tornam os cenários compartilháveis e simplificam `/cenarios/:id`.
- A listagem será tabela operacional, não cards.
- O fluxo de criação será “criar e abrir”: salvar no banco primeiro e depois editar/resolver na página do cenário.
- O backend continuará rodando em `http://localhost:8080`; a base URL deve ficar centralizada para facilitar ajuste futuro.
