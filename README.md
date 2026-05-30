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

## Endpoints principais

### Resolver cenário

```http
POST /api/v1/scenarios/solve
```

Exemplo com `curl`:

```bash
curl -X POST http://localhost:8080/api/v1/scenarios/solve \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Semana comum LCL",
    "descricao": "Cenario com 7 periodos diarios.",
    "periodos": [
      { "id": 1, "nome": "Segunda", "ordem": 1, "demandaMinima": 18, "ativo": true },
      { "id": 2, "nome": "Terca", "ordem": 2, "demandaMinima": 12, "ativo": true },
      { "id": 3, "nome": "Quarta", "ordem": 3, "demandaMinima": 15, "ativo": true },
      { "id": 4, "nome": "Quinta", "ordem": 4, "demandaMinima": 19, "ativo": true },
      { "id": 5, "nome": "Sexta", "ordem": 5, "demandaMinima": 14, "ativo": true },
      { "id": 6, "nome": "Sabado", "ordem": 6, "demandaMinima": 16, "ativo": true },
      { "id": 7, "nome": "Domingo", "ordem": 7, "demandaMinima": 11, "ativo": true }
    ],
    "regraTrabalhoFolga": {
      "periodosTrabalhados": 5,
      "periodosFolga": 2,
      "circular": true
    }
  }'
```

### Pre-visualizar padrões

```http
POST /api/v1/scenarios/patterns/preview
```

Use o mesmo corpo JSON do endpoint `/solve`. Esse endpoint retorna apenas os padrões gerados, sem resolver a otimização.

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
