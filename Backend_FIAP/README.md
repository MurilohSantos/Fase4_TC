# Backend FIAP

## Configuração
1. Copie `.env.example` para `.env` e informe as credenciais do MySQL.
2. Defina `AUTH_SECRET` como uma chave aleatória longa e privada.
3. Confirme que o banco `fase2` possui as tabelas `users` e `posts` usadas pelo projeto.
4. Execute `npm install` e `npm start`.

A tabela `users` esperada contém `id`, `name`, `email`, `tipo` (`p` professor ou `a` aluno) e `senha`. A senha permanece compatível com os registros existentes do projeto; em uma implantação pública, migre para hashes de senha antes de disponibilizar o serviço.

## Rotas
- `POST /api/users/login`: login; retorna token Bearer válido por 8 horas.
- `GET /api/users?tipo=p|a&page=1&limit=10`: lista paginada (professor autenticado).
- `POST /api/users`: cadastra professor/aluno (professor autenticado).
- `PUT /api/users/:id`: edita usuário; senha é opcional (professor autenticado).
- `DELETE /api/users/:id`: exclui usuário, exceto o próprio usuário autenticado.
- `GET /api/posts` e `GET /api/posts/:id`: consulta pública.
- `POST`, `PUT` e `DELETE /api/posts`: exigem token de professor.

O middleware valida assinatura HMAC e expiração do token e verifica o tipo de usuário no token. Não substitui uma solução de identidade completa para produção.

As permissões são conferidas no banco em cada requisição administrativa, de modo que uma alteração do tipo do usuário também invalida o acesso administrativo concedido por um token antigo.
