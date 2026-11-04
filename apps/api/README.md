# Express API

API REST construída com Express 5, TypeScript, Mongoose e `routing-controllers`. O código é organizado em slices verticais e disponibiliza um CRUD autenticado de pessoas persistido no MongoDB.

## Tecnologias

- Node.js
- Express 5
- TypeScript
- MongoDB com Mongoose
- `routing-controllers` para controllers, validação e autorização
- `class-validator` e `class-transformer` para DTOs
- `routing-controllers-openapi` para gerar OpenAPI em runtime
- Auth0 JWT com verificação RS256, issuer e audience
- Swagger UI
- OpenTelemetry com Grafana Cloud

## Estrutura

```text
.
├── src/
│   ├── app.ts
│   ├── server.ts
│   └── features/
│       └── people/
│           ├── people.controller.ts
│           ├── people.model.ts
│           ├── people.service.ts
│           └── people.types.ts
│       ├── observability/
│       └── shared/auth/
├── .env.example
├── package.json
├── tsconfig.json
```

## Requisitos

- Node.js instalado
- MongoDB em execução

## Instalação

```bash
npm install
cp .env.example .env
```

Ajuste o arquivo `.env` conforme necessário:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/express_api

# Opcional: deixe vazio para executar sem exportacao remota de telemetria
OTEL_SERVICE_NAME=express-api
OTEL_SERVICE_VERSION=1.0.0
OTEL_DEPLOYMENT_ENVIRONMENT=development
OTEL_RESOURCE_ATTRIBUTES=service.namespace=express-api
OTEL_EXPORTER_OTLP_ENDPOINT=
OTEL_EXPORTER_OTLP_HEADERS=
OTEL_TRACES_SAMPLER=parentbased_traceidratio
OTEL_TRACES_SAMPLER_ARG=1

AUTH0_DOMAIN=https://seu-tenant.us.auth0.com/
AUTH0_AUDIENCE=https://seu-identificador-de-api
AUTH0_ROLES_CLAIM=roles
```

`AUTH0_DOMAIN` e `AUTH0_AUDIENCE` são obrigatórios. O domínio deve usar HTTPS. Configure `AUTH0_ROLES_CLAIM` com o nome da claim de roles emitida pela sua API no Auth0; a autorização também aceita a claim padrão `permissions`.

## Desenvolvimento

```bash
npm run dev
```

O servidor será iniciado em `http://localhost:3000` por padrão.

## Build e produção

```bash
npm run build
npm start
```

O comando `npm run build` compila o projeto para `dist/`. As rotas e o documento OpenAPI são montados a partir dos decorators durante a inicialização.

## Comandos disponíveis

| Comando         | Descrição                                          |
| --------------- | -------------------------------------------------- |
| `npm run dev`   | Inicia o servidor em modo watch                    |
| `npm run build` | Compila o projeto                                  |
| `npm start`     | Executa a versão compilada                         |
| `npm test`      | Executa testes de validação, auth, erros e tracing |

## Documentação da API

- Swagger UI: <http://localhost:3000/docs>
- OpenAPI JSON: <http://localhost:3000/docs/openapi.json>

## Requests com REST Client

Instale a extensão [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client), copie `rest-client/.env.example` para `rest-client/.env` e preencha `AUTH0_CLIENT_ID` e `AUTH0_CLIENT_SECRET` localmente. O `.env` ao lado do arquivo `.http` é lido pela extensão e ignorado pelo Git; não coloque credenciais no arquivo de requests.

A primeira request de `people.http` chama `POST /oauth/token` com `grant_type: client_credentials` e a audience `people-register`. As requests protegidas usam o `access_token` da resposta automaticamente. O domínio/audience também precisam estar configurados no `.env` da API para validar o token.

Inicie o MongoDB e a API com `AUTH0_DOMAIN` e `AUTH0_AUDIENCE` definidos no `.env` da API:

```bash
cd apps/api-express
npm run dev
```

Abra `rest-client/people.http` e use **Send Request** primeiro na request `getAuthToken`; depois, envie as requests de saúde/docs e, para o ciclo autenticado, execute create, get, update, delete e get após delete. O token e o ID são encadeados das respostas `getAuthToken` e `createPerson`, respectivamente.

A collection cobre as rotas públicas, o `401` sem bearer token, o CRUD (`201`, `200`, `204`, `404`), email inválido, propriedade desconhecida e ID inválido (`400`). Confira os status e os corpos no painel de resposta do REST Client. A API precisa conseguir conectar ao MongoDB antes de abrir a porta, inclusive para health e OpenAPI.

O arquivo não testa e-mail duplicado: o tratamento `409` existe, mas o schema atual não declara índice único para `email`.

## Endpoints

| Método   | Rota              | Descrição                     |
| -------- | ----------------- | ----------------------------- |
| `GET`    | `/`               | Verifica se a API está online |
| `GET`    | `/api/people`     | Lista todas as pessoas        |
| `POST`   | `/api/people`     | Cria uma pessoa               |
| `GET`    | `/api/people/:id` | Busca uma pessoa por ID       |
| `PUT`    | `/api/people/:id` | Atualiza uma pessoa           |
| `DELETE` | `/api/people/:id` | Remove uma pessoa             |

Os documentos OpenAPI e a interface Swagger exibem o contrato detalhado dos endpoints, incluindo os schemas de entrada e resposta.

## Tratamento de erros

Os erros da API são centralizados em `src/shared/errors/error-messages.ts`. As respostas usam um código estável junto da mensagem:

```json
{
  "message": "Person not found",
  "code": "PERSON_NOT_FOUND"
}
```

Erros de validação retornam `400`, credenciais ausentes ou inválidas retornam `401`, falta de role retorna `403`, conflitos de e-mail retornam `409`, recursos inexistentes retornam `404` e erros inesperados retornam `500` sem expor detalhes internos.

## Observabilidade

A aplicação usa OpenTelemetry para instrumentar requisições HTTP, Express e MongoDB, e spans por método nos serviços. Traces e métricas podem ser exportados para o Grafana Cloud via OTLP. O Pino emite logs JSON em stdout, correlacionados com `trace_id` e `span_id` quando houver um span ativo; eles podem ser coletados pelo runtime ou pelo Grafana Alloy para o Loki.

Para configurar o Grafana Cloud:

1. No Grafana Cloud, abra a opção de enviar dados com OpenTelemetry e copie o endpoint OTLP regional e o header de autenticação fornecido para sua stack.
2. Defina `OTEL_EXPORTER_OTLP_ENDPOINT` com o endpoint base indicado pelo Grafana Cloud, normalmente terminando em `/otlp`.
3. Defina `OTEL_EXPORTER_OTLP_HEADERS` com o header completo, por exemplo `Authorization=Basic%20<valor-base64>`.
4. Armazene o token somente nos secrets do ambiente de execução. Não o committe no `.env` ou no repositório.

Quando `OTEL_EXPORTER_OTLP_ENDPOINT` estiver vazio, a API continua funcionando sem exportação remota. Em produção, use sampling configurado por ambiente e evite incluir nomes, e-mails, IDs de pessoas, corpos de requisição, credenciais ou URI do MongoDB em logs e atributos.

Com os dados enviados, use o Grafana Cloud para consultar traces no Tempo e métricas no Mimir. Os logs JSON podem ser enviados ao Loki pelo runtime ou Grafana Alloy. A correlação deve ser feita pelos campos `trace_id` e `span_id`.

## Modelo de pessoa

A API persiste somente os campos:

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com"
}
```

O campo `email` deve ser único e validado como endereço de e-mail. Campos desconhecidos e payloads inválidos são rejeitados por `class-validator` antes de chegar ao serviço.
