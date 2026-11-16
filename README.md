# Plataforma Educacional FIAP — Tech Challenge Fase 4

Aplicativo mobile em **React Native (Expo)** integrado a uma **API REST em Node.js/Express** com banco **MySQL**, para publicação e leitura de posts educacionais com controle de acesso por perfil.

| Perfil | O que pode fazer |
|---|---|
| **Professor** | Criar, editar e excluir posts; cadastrar, editar, excluir e listar professores e alunos |
| **Aluno** | Ver o feed, pesquisar por assunto e ler os detalhes dos posts |

---

## Sumário

- [Arquitetura](#arquitetura)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Setup inicial](#setup-inicial)
  - [Pré-requisitos](#pré-requisitos)
  - [1. Banco de dados](#1-banco-de-dados)
  - [2. Back-end](#2-back-end)
  - [3. Aplicativo mobile](#3-aplicativo-mobile)
- [Guia de uso](#guia-de-uso)
  - [Aplicativo](#aplicativo)
  - [API](#api)
- [Testes](#testes)
- [Solução de problemas](#solução-de-problemas)

---

## Arquitetura

```
┌──────────────────────────────┐
│  App React Native (Expo)     │  Android · iOS · Web
│  React Navigation · Axios    │
│  Token salvo no AsyncStorage │
└──────────────┬───────────────┘
               │ HTTP/JSON
               │ Authorization: Bearer <token>
               ▼
┌──────────────────────────────┐
│  API Node.js / Express 5     │  /api/posts · /api/users · /api/health
│  middleware.js (auth/perfil) │
└──────────────┬───────────────┘
               │ mysql2 (pool de conexões)
               ▼
┌──────────────────────────────┐
│  MySQL                       │  tabelas posts e users
└──────────────────────────────┘
```

### Tecnologias

| Camada | Tecnologias |
|---|---|
| Mobile | React Native 0.76, Expo SDK 52, TypeScript, React Navigation 7, Axios, AsyncStorage |
| Back-end | Node.js, Express 5, mysql2, dotenv, cors |
| Testes | Jest, Supertest |
| Banco | MySQL |

### Autenticação e autorização

- `POST /api/users/login` devolve um **token Bearer** assinado com **HMAC-SHA256** (chave `AUTH_SECRET`), válido por **8 horas**.
- O app guarda o token no AsyncStorage, e um interceptor do Axios o envia em todas as requisições.
- `authenticate` valida a assinatura e a expiração e consulta o perfil atual do usuário no banco. Se o perfil de alguém mudar, as permissões do token antigo deixam de valer na hora.
- `requireProfessor` libera apenas usuários com `tipo = 'p'`. Resposta **401** quando não há sessão válida e **403** quando o perfil não tem permissão.

### Modelo de dados

**posts**

| Campo | Tipo | Descrição |
|---|---|---|
| id | int | Identificador (auto incremento) |
| materia | string | Disciplina |
| assunto | string | Assunto / título |
| descricao | string | Conteúdo do post |
| habilitado | int | 1 = publicado, 0 = desativado |
| autor | string | Nome do autor |

**users**

| Campo | Tipo | Descrição |
|---|---|---|
| id | int | Identificador (auto incremento) |
| name | string | Nome de usuário (login) |
| email | string | E-mail |
| tipo | char | `p` = professor, `a` = aluno |
| senha | string | Senha |

---

## Estrutura do repositório

```
Fase4_TC/
├── Backend_FIAP/              # API Node.js / Express
│   ├── app.js                 # Express, CORS, pool MySQL e rotas
│   ├── middleware.js          # Token (createToken), authenticate, requireProfessor
│   ├── controllers/
│   │   ├── postController.js  # CRUD e busca de posts
│   │   └── userController.js  # Login e CRUD paginado de usuários
│   ├── routes/
│   │   ├── postRoutes.js
│   │   └── userRoutes.js
│   ├── testes/                # Testes Jest + Supertest
│   └── request.http           # Exemplos de requisições
│
└── React_Native/              # Aplicativo mobile (Expo + TypeScript)
    ├── App.tsx                # Navegação (Stack Navigator)
    └── src/
        ├── screens/           # Login, Feed, PostForm, PostDetails, ManageUsers
        ├── components/        # PostCard e componentes de UI (ui.tsx)
        ├── services/api.ts    # Cliente Axios com envio automático do token
        └── types.ts           # Tipos Post, User e rotas
```

---

## Setup inicial

### Pré-requisitos

- [Node.js](https://nodejs.org/) LTS (18 ou superior)
- MySQL 8 (local ou em container)
- Git
- Para testar no celular: app **Expo Go** (Android/iOS). Para o emulador: Android Studio.

```bash
git clone https://github.com/MurilohSantos/Fase4_TC.git
cd Fase4_TC
```

### 1. Banco de dados

Crie o banco e as tabelas usadas pela API. O script abaixo é uma sugestão compatível com os campos que o código usa:

```sql
CREATE DATABASE IF NOT EXISTS fase2;
USE fase2;

CREATE TABLE IF NOT EXISTS users (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  name   VARCHAR(100) NOT NULL UNIQUE,
  email  VARCHAR(150) NOT NULL UNIQUE,
  tipo   CHAR(1)      NOT NULL,          -- 'p' professor | 'a' aluno
  senha  VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS posts (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  materia     VARCHAR(100) NOT NULL,
  assunto     VARCHAR(200) NOT NULL,
  descricao   TEXT         NOT NULL,
  habilitado  TINYINT(1)   NOT NULL DEFAULT 1,
  autor       VARCHAR(100)
);

-- Usuário inicial para o primeiro acesso
INSERT INTO users (name, email, tipo, senha)
VALUES ('professor', 'professor@fiap.com', 'p', '123');
```

> Os demais professores e alunos podem ser cadastrados pelo próprio app, em **Gerenciar Usuários**.

### 2. Back-end

```bash
cd Backend_FIAP
npm install
```

Crie o arquivo `Backend_FIAP/.env` (ele já está no `.gitignore`):

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=fase2
AUTH_SECRET=troque-por-uma-chave-aleatoria-longa
```

Inicie a API:

```bash
npm start
```

Deve aparecer `MySQL conectado!` e `Servidor rodando na porta 3000`. Para conferir, acesse <http://localhost:3000/api/health>, que deve responder `{"status":"ok"}`.

### 3. Aplicativo mobile

Em outro terminal:

```bash
cd React_Native
npm install
```

Crie o arquivo `React_Native/.env` com a URL da API conforme o ambiente:

| Onde o app vai rodar | `EXPO_PUBLIC_API_URL` |
|---|---|
| Navegador (Expo Web) | `http://localhost:3000/api` |
| Emulador Android | `http://10.0.2.2:3000/api` |
| Celular físico (mesma rede Wi-Fi) | `http://IP-DA-SUA-MAQUINA:3000/api` |

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

Inicie o app:

```bash
npx expo start
```

- Pressione **`w`** para abrir no navegador.
- Pressione **`a`** para abrir no emulador Android.
- Ou leia o **QR Code** com o app Expo Go no celular.

> Sempre que alterar o `.env` do app, reinicie o Expo (`npx expo start -c` limpa o cache).

---

## Guia de uso

### Aplicativo

**Login**
1. Informe usuário e senha (ex.: `professor` / `123`, criado no script do banco).
2. Professores vão para a **Área do professor** e alunos, para a **Área do aluno**.

**Feed (professor e aluno)**
- Lista todos os posts com autor, matéria, status (Publicado/Desativado) e um resumo do conteúdo.
- Use o campo **Buscar post pelo título...** para filtrar pelo assunto.
- Puxe a lista para baixo para atualizar.
- Toque no post para abrir os **detalhes**.

**Gerenciar posts (professor)**
- **+ Novo Post**: preencha Autor, Matéria, Assunto e Descrição, escolha se o post fica publicado e toque em **Publicar Post**.
- **✏️ Editar**: altere os campos e toque em **Atualizar Post**.
- **🗑️ Excluir**: confirme a exclusão na caixa de diálogo.

**Gerenciar usuários (professor)**
1. No feed, toque em **Gerenciar Usuários**.
2. Escolha a aba **Professores** ou **Alunos**.
3. **Cadastrar**: preencha nome, e-mail e senha e toque em **Cadastrar usuário**.
4. **Editar**: toque em **Editar** no usuário. A senha é opcional; deixe em branco para manter a atual.
5. **Excluir**: toque em **Excluir** e confirme. Não é possível excluir o próprio usuário.
6. Use **Anterior** / **Próxima** para navegar entre as páginas (8 por página).

### API

URL base: `http://localhost:3000/api`

**Posts**

| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| GET | `/posts` | Público | Lista todos os posts |
| GET | `/posts/:id` | Público | Busca um post por ID |
| GET | `/posts/search?assunto=texto` | Público | Pesquisa por assunto |
| POST | `/posts` | Professor | Cria um post |
| PUT | `/posts/:id` | Professor | Atualiza um post |
| DELETE | `/posts/:id` | Professor | Exclui um post |

**Usuários**

| Método | Endpoint | Acesso | Descrição |
|---|---|---|---|
| POST | `/users/login` | Público | Login; retorna perfil e token |
| GET | `/users?tipo=p\|a&page=1&limit=10` | Professor | Lista paginada (máx. 100 por página) |
| POST | `/users` | Professor | Cadastra professor ou aluno |
| PUT | `/users/:id` | Professor | Edita usuário (senha opcional) |
| DELETE | `/users/:id` | Professor | Exclui usuário (exceto o próprio) |

**Exemplo de uso com cURL**

```bash
# 1. Login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"name":"professor","senha":"123"}'
# → { "message": "Login realizado com sucesso", "tipo": "professor", "user": {...}, "token": "..." }

# 2. Criar post com o token recebido
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"materia":"Matematica","assunto":"Frações","descricao":"Conteúdo do post","habilitado":1,"autor":"Professor"}'
```

O arquivo [`Backend_FIAP/request.http`](Backend_FIAP/request.http) traz esses e outros exemplos prontos para a extensão REST Client do VS Code.

**Códigos de resposta**

| Código | Quando ocorre |
|---|---|
| 200 / 201 | Sucesso / registro criado |
| 400 | Dados obrigatórios ausentes ou inválidos |
| 401 | Token ausente, inválido ou expirado |
| 403 | Usuário sem perfil de professor |
| 404 | Registro não encontrado |
| 409 | Usuário duplicado |

---

## Testes

Os testes ficam em `Backend_FIAP/testes` e usam **Jest** + **Supertest** com um banco simulado (`app.locals.db` substituído por `jest.fn()`), então não precisam de MySQL.

```bash
cd Backend_FIAP
npm test
```

Cenários cobertos:

- Professor autenticado cria post → **201**
- Listagem pública de posts → **200** com uma lista
- Aluno tentando criar post → **403**
- Listagem de usuários sem token → **401**
- Aluno em rota administrativa → **403**
- Listagem paginada por professor → **200**
- Cadastro de usuário por professor → **201**

---

## Solução de problemas

| Problema | Solução |
|---|---|
| App não conecta na API no emulador Android | Use `http://10.0.2.2:3000/api` em vez de `localhost` |
| App não conecta no celular | Use o IP da máquina (`ipconfig` / `ifconfig`), mantenha celular e PC na mesma rede e libere a porta 3000 no firewall |
| Erro "Origem não permitida pelo CORS" | O app precisa rodar nas portas 8081 ou 19006 do Expo, em localhost ou em um IP 192.168.x.x |
| `Erro ao conectar ao MySQL` | Confira as variáveis `DB_*` do `.env` e se o MySQL está rodando |
| "Sessão inválida ou expirada" | Faça login novamente (o token vale 8 horas) ou verifique se o `AUTH_SECRET` mudou |
| Alteração no `.env` do app não surtiu efeito | Reinicie com `npx expo start -c` |

> **Segurança:** as senhas ficam gravadas em texto puro para manter compatibilidade com os dados das fases anteriores. Antes de publicar o serviço, use hash de senha (ex.: bcrypt) e defina um `AUTH_SECRET` forte.
