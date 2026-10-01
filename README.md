# Guru's Educa

## Rodando o projeto
1. Instale o PostgreSQL na sua maquina
2. `cp apps/api/.env.example apps/api/.env` e coloque sua senha na DATABASE_URL
3. `npm install`
4. `npm run db:migrate` (cria o banco gurus_educa se ele nao existir)
5. Em dois terminais: `npm run dev:api` e `npm run dev:web`
