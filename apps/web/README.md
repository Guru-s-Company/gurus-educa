# Guru's Educa Web

Frontend React/Vite do Guru's Educa, organizado por funcionalidades.

## Estrutura

```text
src/
├── app/
│   ├── App.jsx
│   ├── components/       # componentes transversais e layout
│   └── providers/        # autenticação e tema
├── features/
│   ├── achievements/
│   ├── auth/
│   ├── community/
│   ├── courses/
│   └── home/
├── lib/                  # helpers compartilhados
└── services/
    └── api/              # cliente HTTP centralizado
```

Cada feature pode conter `components`, `pages`, `hooks`, `services`, `mocks` e
`schemas` conforme a responsabilidade existir. Não crie diretórios vazios.

## Convenções

- Componentes e páginas usam PascalCase.
- Hooks usam o prefixo `use`.
- Serviços usam o sufixo `Service`.
- Componentes visuais possuem CSS próprio.
- Classes CSS seguem BEM e CSS Nesting nativo.
- Tokens visuais ficam em `src/index.css` e devem ser reutilizados por novos estilos.
- Dados mockados ficam em `features/<feature>/mocks`.
- Componentes de apresentação não devem conhecer endpoints ou detalhes de autenticação.

## Criar uma feature

1. Crie `src/features/<feature>/`.
2. Adicione somente as subpastas necessárias.
3. Crie a página em `pages/` e registre a rota em `src/app/App.jsx`.
4. Extraia estado e regras reutilizáveis para `hooks/`.
5. Coloque dados temporários em `mocks/`, deixando claro que não são respostas da API.
6. Adicione o CSS ao lado do componente ou página.

## Criar um componente global

Componentes reutilizáveis por várias features ficam em
`src/app/components/ui` ou `src/app/components/layout`. Eles devem receber
dados por props e não importar mocks ou serviços específicos de uma feature.

## Conectar uma feature ao backend

Use `apiClient` em `src/services/api/client.js` dentro de um serviço da feature:

```js
import { apiClient } from "../../../services/api/client";

export const exampleService = {
  getData(signal) {
    return apiClient.request("/resource", { signal });
  },
};
```

O cliente usa `VITE_API_URL`, inclui cookies seguros e transforma respostas de
erro em `ApiError`. Não coloque tokens ou segredos em `localStorage` ou em
variáveis `VITE_*`.

## Estado assíncrono

Operações de rede devem distinguir carregamento, sucesso, ausência de dados e
erro. Erros devem ser exibidos pela interface ou encaminhados ao consumidor;
não use fallbacks silenciosos.

## Autenticação

`AuthProvider` e `useAuth` ficam em `src/app/providers`. A sessão atual é
mantida em memória e usa os endpoints reais de `/auth`. As rotas internas são
protegidas por `ProtectedRoute`.

Durante o desenvolvimento sem backend, a proteção fica desativada por padrão.
Para ativá-la quando a API estiver pronta, defina `VITE_ENABLE_AUTH=true`.

## Dados ainda simulados

- Lista de comunidades: `features/community/mocks/communityList.js`.
- Mensagens do servidor: `features/community/mocks/communityMocks.js`.
- Conteúdo de home, cursos e conquistas ainda é demonstrativo.

Esses dados devem ser substituídos por serviços HTTP somente quando os
respectivos contratos existirem no backend.
