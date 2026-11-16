# FIAP - Aplicativo React Native

Aplicativo Expo integrado à API Node/Express e ao MySQL do projeto Fase 2.

## Requisitos
- Node.js LTS
- Backend da pasta `backend` em execução
- Banco MySQL `fase2` configurado com as tabelas `users` e `posts`

## Instalação e execução (Windows / PowerShell)
1. Abra o terminal nesta pasta (`React_Native`).
2. Execute `npm install`.
3. Copie `.env.example` para `.env`.
4. Configure `EXPO_PUBLIC_API_URL` conforme o ambiente:
   - Expo Web: `http://localhost:3000/api`
   - Emulador Android: `http://10.0.2.2:3000/api`
   - Celular físico: `http://IP-DA-SUA-MAQUINA:3000/api`
5. Inicie o backend na pasta `backend` com `npm install` e `npm start`.
6. Inicie o app com `npx expo start`; pressione `w` para abrir no navegador.

## Funcionalidades
- Login de professor e aluno.
- Feed de posts, pesquisa por assunto e detalhes.
- Criação, edição e exclusão de posts para professores.
- Gerenciamento de professores e alunos: cadastro, edição, exclusão e listagem paginada.
- Token Bearer armazenado no AsyncStorage e enviado automaticamente nas requisições.

O arquivo `.env` não deve ser versionado. Use `.env.example` como modelo.
