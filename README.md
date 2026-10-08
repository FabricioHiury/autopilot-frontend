# AutoPilot — Frontend

Interface web do AutoPilot, CRM para lojas e concessionárias de veículos. A aplicação reúne atendimento comercial, conversas, clientes, gestão da equipe, relatórios e assistência de IA. O mesmo frontend oferece a área da loja e o backoffice dos administradores da plataforma.

Stack: Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, componentes Radix, Redux e Socket.io. Os textos da interface são apresentados em português; campos e valores internos dos contratos permanecem em inglês.

## Projetos e responsabilidades

| Projeto                  | Responsabilidade                                        | Porta local |
| ------------------------ | ------------------------------------------------------- | ----------- |
| `autopilot-frontend`     | Navegação, formulários, chat e experiência dos usuários | 3001        |
| `autopilot-backend`      | Autenticação, regras do CRM, dados e análises da IA     | 3003        |
| `autopilot-microservice` | Integrações com os canais externos                      | 3005        |

O navegador acessa o backend principal. Tokens de provedores, Evolution e microservice ficam nas APIs. A inferência da IA também é solicitada pelo backend, inclusive quando o modelo roda localmente no Ollama.

## O que a aplicação oferece

- **Atendimentos:** pipeline de compra, venda e consignação, responsáveis, etapas, etiquetas, temperatura, tarefas, visitas, comentários e histórico.
- **Conversas:** caixa de entrada, filtros, mensagens, anexos, respostas padrão e acompanhamento de entrega.
- **AutoPilot IA:** dossiê do contato, próxima ação e respostas sugeridas para revisão pelo vendedor.
- **Clientes e equipe:** cadastro de contatos, usuários, cargos e permissões por loja.
- **Gestão:** painel comercial, relatórios, distribuição de atendimentos e suspensões.
- **Configurações:** identidade visual, dados da loja e integrações de WhatsApp, Instagram, Facebook e OLX.
- **Suporte:** perguntas frequentes e chamados.
- **Backoffice:** gestão de concessionárias, administradores da plataforma, conteúdo de FAQ e atendimento de suporte.

As telas e ações disponíveis dependem do perfil e das permissões retornadas pelo backend.

## Executar localmente

Recomenda-se Node.js 22 e pnpm 10.25.0 para trabalhar com os três projetos. O frontend roda no host e não precisa de um container próprio.

Na primeira configuração:

```bash
cp .env.example .env.local
pnpm install --frozen-lockfile
pnpm dev
```

Preserve o `.env.local` se ele já estiver configurado. As variáveis públicas são:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3003
NEXT_PUBLIC_SOCKET_URL=http://localhost:3003
```

`NEXT_PUBLIC_SOCKET_URL` recebe a origem, sem `/chats`; quando omitida, o cliente utiliza a origem da API. Variáveis `NEXT_PUBLIC_*` são públicas e incorporadas ao build.

Abra `http://localhost:3001/auth/login`. Para o ambiente integrado, siga o [guia local do backend](../autopilot-backend/docker/local/README.md), considerando os repositórios em pastas irmãs. Ele sobe PostgreSQL, Redis, Evolution e Ollama pelo Colima e mantém as aplicações no host. O CORS do backend deve permitir `http://localhost:3001`.

O login depende de usuários ativos no banco do CRM. A aplicação não fornece uma sessão demonstrativa nem cria usuários automaticamente.

## Navegação e sessão

| Rota                         | Área                                          |
| ---------------------------- | --------------------------------------------- |
| `/auth/login`                | Login compartilhado das lojas e da plataforma |
| `/app/dashboard`             | Painel da loja                                |
| `/app/deals/pipeline`        | Pipeline de atendimentos                      |
| `/app/deals/chat`            | Caixa de entrada e AutoPilot IA               |
| `/app/customers`             | Clientes                                      |
| `/app/reports`               | Relatórios comerciais                         |
| `/app/settings/access`       | Usuários, cargos e permissões                 |
| `/app/settings/branding`     | Identidade visual da loja                     |
| `/app/settings/integrations` | Configuração dos canais                       |
| `/app/help-faq`              | FAQ e suporte                                 |
| `/backoffice/app/tenants`    | Concessionárias e seus administradores        |
| `/backoffice/app/access`     | Administradores da plataforma                 |
| `/backoffice/app/tickets`    | Chamados de suporte do backoffice             |

O perfil `autopilot` acessa o backoffice; `storeOwner` e `user` acessam a loja. A sessão persiste até expirar, ocorrer logout ou resposta HTTP 401. Uma resposta 403 mantém a sessão e informa a falta de permissão. Não existe renovação automática de JWT no contrato atual.

A identidade institucional AutoPilot usa a mesma logo nas áreas da aplicação. A personalização da loja é carregada após o login por `GET /store/customization`, aplicada ao tema e removida ao sair. As lojas compartilham o domínio da aplicação.

## Experiência do AutoPilot IA

Em cada conversa, o painel começa recolhido na barra **AutoPilot IA**. O usuário pode abrir ou minimizar as sugestões; o dossiê estratégico aparece sob demanda dentro do painel, com altura limitada e rolagem própria.

Selecionar uma resposta recolhe o painel e preenche o editor para revisão. O envio depende do botão normal de enviar. Aplicar dados ao atendimento exige permissão, revisão e confirmação; alterações concorrentes são verificadas antes de salvar.

Quando a análise termina, o painel recebe a atualização em tempo real sem abrir automaticamente. Estados de carregamento, indisponibilidade e IA desabilitada também ficam acessíveis ao expandir a barra.

O modelo e a habilitação são definidos no **backend**, pelas variáveis `CHAT_AI_URL`, `CHAT_AI_MODEL` e `CHAT_AI_API_KEY`. O frontend não guarda a chave nem escolhe o modelo. O ambiente local documentado usa Ollama com `gemma3:1b`, um modelo leve para testes com limitações de qualidade.

## Integração e estrutura

`src/app/` organiza as rotas. Componentes ficam em `src/components/`; contratos REST em `src/services/`; modelos em `src/types/`; estado e contexto em `src/redux/`, `src/hooks/` e `src/contexts/`. Assets institucionais ficam em `public/` e testes em `src/test/`.

`api.client.ts` centraliza JWT, timeout e o envelope `{ message, statusCode, data }`. Helpers de apresentação traduzem cargos, canais, etiquetas conhecidas e mensagens de erro, preservando os valores enviados à API e nomes personalizados.

`RealtimeContext` mantém uma conexão Socket.io por sessão no namespace `/chats`. Os eventos são filtrados pela loja. Reconexão e retorno à aba reconciliam o histórico por REST; o pareamento de WhatsApp consulta o status enquanto aguarda o QR Code.

Há redirecionamentos para links antigos de login, recuperação de senha, confirmação de e-mail e callbacks dos canais. Os parâmetros dos callbacks são preservados.

## Verificação e produção

```bash
pnpm typecheck
pnpm test:run
pnpm lint
pnpm format:check
pnpm build
pnpm start
```

Vitest e React Testing Library cobrem sessão, permissões, contratos REST, tema, mensagens em tempo real, tradução da interface e revisão humana da IA. `pnpm format` e `pnpm lint:fix` aplicam as correções automáticas de formatação e lint.

O lint geral ainda possui pendências preexistentes que podem bloquear `pnpm build`. Para diagnosticar somente compilação e tipagem, existe `pnpm exec next build --no-lint`; esse comando não substitui a correção do lint.

Integrações reais exigem contas e credenciais configuradas nas APIs. SMTP, Firebase e Evolution não são simulados pelo frontend. Consulte [AGENTS.md](AGENTS.md) para as convenções de contribuição.
