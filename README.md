# SIMPLEX_PROBLEMA_ESCALA

API Spring Boot para gerar padrões de escala de trabalho/folga e resolver um problema de otimização de cobertura mínima por período usando OR-Tools.

## Requisitos

- Java 21
- Docker e Docker Compose
- Terminal com acesso à internet na primeira execução do Maven Wrapper, para baixar dependências

Não é necessário instalar Maven localmente, porque o projeto usa `mvnw`.

## Estrutura

```text
.
├── docker-compose.yml
└── backend/
    └── escalaSimplex/
        ├── mvnw
        ├── pom.xml
        └── src/main/
```

O backend fica em `backend/escalaSimplex`.

## Subir o banco

Na raiz do projeto:

```bash
docker compose up -d
```

Isso sobe um PostgreSQL 16 com:

- Host: `localhost`
- Porta local: `5431`
- Database: `escalas_db`
- Usuário: `escalas_user`
- Senha: `escalas_pass`

Para parar o banco:

```bash
docker compose down
```

Para parar e apagar o volume com os dados:

```bash
docker compose down -v
```

## Deploy completo com backend e frontend

O `docker-compose.yml` da raiz agora sobe os tres servicos:

- `postgres`
- `backend`
- `frontend`

Suba tudo com:

```bash
docker compose up -d --build
```

Arquitetura do deploy:

- O `frontend` roda em Nginx na porta `80`
- O Nginx encaminha `/api/*` para o `backend` interno
- O `backend` fala com o `postgres` pelo nome do servico `postgres`
- O Cloudflare Tunnel deve apontar para o `frontend`, nao para o backend

Observacao:

- Em producao, o frontend usa caminho relativo `/api`, entao nao precisa de `VITE_API_BASE_URL`
- Em desenvolvimento, o Vite local já faz proxy de `/api` para `http://localhost:8080`

## Rodar o backend

Com o PostgreSQL ativo, entre na pasta do backend:

```bash
cd backend/escalaSimplex
```

Rode a aplicação:

```bash
./mvnw spring-boot:run
```

A API ficará disponível em:

```text
http://localhost:8080
```

## Rodar a API sem banco

Para testar os endpoints sem subir o PostgreSQL, use o profile `api-demo`:

```bash
cd backend/escalaSimplex
./mvnw spring-boot:run -Dspring-boot.run.profiles=api-demo
```

Esse profile mantém a API web ativa em `http://localhost:8080`, mas desativa a configuração de DataSource e Hibernate. Ele é útil para testar endpoints que recebem o cenário completo no JSON, como `/solve` e `/patterns/preview`.

## Endpoints principais

### Fluxo oficial do frontend

O fluxo recomendado para o frontend é sempre trabalhar com cenários salvos:

```text
1. Salvar cenário
2. Resolver pelo id do cenário
3. Reabrir a solução salva quando a página for recarregada
```

Endpoints usados pelo frontend:

```http
GET    /api/v1/scenarios
POST   /api/v1/scenarios
GET    /api/v1/scenarios/{id}
PUT    /api/v1/scenarios/{id}
DELETE /api/v1/scenarios/{id}

POST   /api/v1/scenarios/{id}/solve
GET    /api/v1/scenarios/{id}/solution
```

O endpoint `POST /api/v1/scenarios/solve` continua disponível para teste/desenvolvimento com JSON avulso, mas o frontend deve preferir `POST /api/v1/scenarios/{id}/solve`.

### Modelo de request de cenário

Usado em `POST /api/v1/scenarios`, `PUT /api/v1/scenarios/{id}`, `POST /api/v1/scenarios/solve` e `POST /api/v1/scenarios/patterns/preview`:

```json
{
  "nome": "Semana comum LCL",
  "descricao": "Cenário com 7 períodos diários.",
  "periodos": [
    { "nome": "Segunda", "ordem": 1, "demandaMinima": 18, "ativo": true },
    { "nome": "Terça", "ordem": 2, "demandaMinima": 12, "ativo": true },
    { "nome": "Quarta", "ordem": 3, "demandaMinima": 15, "ativo": true },
    { "nome": "Quinta", "ordem": 4, "demandaMinima": 19, "ativo": true },
    { "nome": "Sexta", "ordem": 5, "demandaMinima": 14, "ativo": true },
    { "nome": "Sábado", "ordem": 6, "demandaMinima": 16, "ativo": true },
    { "nome": "Domingo", "ordem": 7, "demandaMinima": 11, "ativo": true }
  ],
  "regraTrabalhoFolga": {
    "periodosTrabalhados": 5,
    "periodosFolga": 2,
    "circular": true
  }
}
```

### Criar cenário

```http
POST /api/v1/scenarios
```

Exemplo com `curl`:

```bash
curl -X POST http://localhost:8080/api/v1/scenarios \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Semana comum LCL",
    "descricao": "Cenario com 7 periodos diarios.",
    "periodos": [
      { "nome": "Segunda", "ordem": 1, "demandaMinima": 18, "ativo": true },
      { "nome": "Terca", "ordem": 2, "demandaMinima": 12, "ativo": true },
      { "nome": "Quarta", "ordem": 3, "demandaMinima": 15, "ativo": true },
      { "nome": "Quinta", "ordem": 4, "demandaMinima": 19, "ativo": true },
      { "nome": "Sexta", "ordem": 5, "demandaMinima": 14, "ativo": true },
      { "nome": "Sabado", "ordem": 6, "demandaMinima": 16, "ativo": true },
      { "nome": "Domingo", "ordem": 7, "demandaMinima": 11, "ativo": true }
    ],
    "regraTrabalhoFolga": {
      "periodosTrabalhados": 5,
      "periodosFolga": 2,
      "circular": true
    }
  }'
```

Resposta:

```json
{
  "id": 1,
  "nome": "Semana comum LCL",
  "descricao": "Cenario com 7 periodos diarios.",
  "periodos": [
    { "id": 1, "nome": "Segunda", "ordem": 1, "demandaMinima": 18, "ativo": true }
  ],
  "regraTrabalhoFolga": {
    "id": 1,
    "periodosTrabalhados": 5,
    "periodosFolga": 2,
    "circular": true
  }
}
```

### Listar cenários

```http
GET /api/v1/scenarios
```

Retorna todos os cenários salvos.

### Buscar cenário por id

```http
GET /api/v1/scenarios/{id}
```

Exemplo:

```http
GET /api/v1/scenarios/1
```

### Atualizar cenário

```http
PUT /api/v1/scenarios/{id}
```

Use o mesmo corpo JSON de criação.

Quando um cenário é atualizado, a solução salva anterior é apagada automaticamente, porque pode não representar mais o cenário atual.

### Excluir cenário

```http
DELETE /api/v1/scenarios/{id}
```

Exemplo:

```http
DELETE /api/v1/scenarios/1
```

Retorna `204 No Content`.

### Resolver cenário salvo

```http
POST /api/v1/scenarios/{id}/solve
```

Exemplo:

```http
POST /api/v1/scenarios/1/solve
```

Comportamento:

- Se o cenário ainda não tem solução salva, o backend resolve com Simplex/GLOP, salva a solução no banco e retorna o resultado.
- Se o cenário já tem solução salva, o backend retorna a solução salva sem resolver novamente.

### Buscar solução salva

```http
GET /api/v1/scenarios/{id}/solution
```

Exemplo:

```http
GET /api/v1/scenarios/1/solution
```

Se existir solução salva, retorna:

```json
{
  "status": "OPTIMAL",
  "zContinuo": 22.6666666667,
  "zAproximado": 24,
  "padroes": [],
  "cobertura": [],
  "modeloMatematico": "Min Z = ..."
}
```

Se não existir solução salva:

```json
{
  "code": "RECURSO_NAO_ENCONTRADO",
  "message": "Solução não encontrada para este cenário."
}
```

### Resolver JSON avulso

```http
POST /api/v1/scenarios/solve
```

Esse endpoint resolve um cenário enviado diretamente no corpo da requisição e não salva o cenário nem a solução. Use apenas para teste ou desenvolvimento.

### Pre-visualizar padrões

```http
POST /api/v1/scenarios/patterns/preview
```

Use o mesmo corpo JSON de criação. Esse endpoint retorna apenas os padrões gerados, sem resolver a otimização e sem salvar dados no banco.

## Rodar testes

Com o PostgreSQL ativo:

```bash
cd backend/escalaSimplex
./mvnw test
```

Para compilar sem executar testes:

```bash
./mvnw -DskipTests compile
```

## Rodar exemplo de terminal

O projeto possui um `InitialProblemRunner` para executar um cenário de demonstração no terminal. Ele só roda com o profile `demo`.

```bash
cd backend/escalaSimplex
./mvnw spring-boot:run -Dspring-boot.run.profiles=demo
```

Nesse modo a aplicação não sobe como servidor web e não usa o PostgreSQL. Ela apenas executa o exemplo e imprime os padrões e resultados no console.

## Configuração

A configuração padrão está em:

```text
backend/escalaSimplex/src/main/resources/application.properties
```

Ela aponta para o PostgreSQL do `docker-compose.yml`.

A configuração do modo demo está em:

```text
backend/escalaSimplex/src/main/resources/application-demo.properties
```

Ela desativa a aplicação web e a configuração de banco para permitir rodar apenas o exemplo de terminal.

A configuração do modo API sem banco está em:

```text
backend/escalaSimplex/src/main/resources/application-api-demo.properties
```

Ela desativa DataSource e Hibernate, mas mantém o servidor web na porta `8080`.
