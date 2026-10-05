# AutoPilot CRM — Frontend

CRM para concessionárias com interface em português, serviços REST em inglês, identidade visual por loja e assistência de IA nas conversas. A implementação usa como referência o repositório `autopilot-backend` atual.

## Executar localmente

Requisitos: Node.js 20 ou superior e pnpm. O frontend não precisa de Docker.

```sh
pnpm install
cp .env.example .env.local
pnpm dev
```

Abra `http://localhost:3001/auth/login`. O backend principal deve estar em `http://localhost:3003`. Configure `NEXT_PUBLIC_API_URL` em `.env.local` se usar outra origem. `NEXT_PUBLIC_SOCKET_URL` é opcional e recebe somente a origem, sem o namespace `/chats`.

Inicie backend e microservice nos respectivos projetos. Libere `http://localhost:3001` no CORS do backend, configure sua URL de frontend para os links de e-mail e prepare banco, Redis, SMTP, armazenamento de arquivos e Evolution conforme as instruções desses projetos. Não há dados demonstrativos nem credenciais de microservice no navegador. Sem backend, o login mostra o erro da conexão.

Para produção:

```sh
pnpm build
pnpm start
```

As variáveis `NEXT_PUBLIC_*` são públicas e incorporadas ao build. Nunca coloque tokens de microservice ou de provedores nelas.

## Fluxos principais

- `/auth/login`: login único. `autopilot` entra no backoffice; `storeOwner` e `user` entram na loja. A sessão persiste entre visitas até expirar o JWT, com encerramento em logout ou resposta HTTP 401. Respostas 403 mantêm a sessão.
- `/backoffice/app/tenants`: cadastro de concessionária e administrador responsável, confirmação de e-mail e habilitação do WhatsApp. Não há cadastro público na interface nem checkout/Stripe.
- `/app/settings/access`: usuários, cargos e permissões por loja. Os cargos iniciais do backend incluem vendedor e pré-vendedor; cargos adicionais e suas permissões podem ser definidos pela administração da loja.
- `/app/settings/branding`: cores, nome, logos, favicon, horários e dias de atendimento. A prévia pode ser cancelada. O upload de logo usa o backend; logos alternativos e favicon aceitam URLs HTTPS.
- `/app/settings/integrations/connect/whatsapp`: Evolution com QR Code, renovação visual e desconexão. Instagram, Facebook e OLX continuam disponíveis.
- `/app/deals`: pipeline; `/app/deals/chat`: mensagens, status de entrega e AutoPilot IA. O dossiê lateral permite revisar os dados e confirmar sua aplicação ao deal. Sugestões apenas preenchem o editor; o vendedor envia a mensagem.
- `/app/customers`, `/app/reports` e `/app/help-faq`: clientes, relatórios e suporte.

As cores institucionais padrão são petróleo `#087F8C`, azul escuro `#172D3E` e âmbar `#D98C10`. O tema é carregado após autenticação por `GET /store/customization` e limpo ao sair. A identidade institucional aparece no login, compartilhado entre todas as lojas.

## Integração e organização

`src/services/api.client.ts` centraliza JWT, timeout de 30 segundos e tratamento do envelope `{message,statusCode,data}`. Serviços em `src/services` concentram os contratos de cada domínio; `src/types` contém os modelos. `TenantContext` carrega a marca e `RealtimeContext` mantém uma conexão Socket.io por sessão.

O socket usa `/chats` e `auth: {token}`. Eventos são conferidos pelo `storeId`. Reconexão e retorno à aba refazem a consulta REST; mensagens não dependem de polling. A consulta periódica de status durante o pareamento do QR Code continua necessária. Não existe renovação de JWT no backend atual.

Os links de e-mail existentes `/login` e `/authentication/reset-password` são redirecionados para as rotas atuais. A confirmação usa `/confirm-email?token=...`. Os callbacks legados dos canais em `/app/configuracoes/integracoes/acesso/:channel` continuam sendo redirecionados, preservando os parâmetros do microservice.

## Verificação

Para padronizar a formatação de TypeScript, TSX, JavaScript, JSON, CSS e Markdown:

```sh
pnpm format
pnpm lint:fix
```

`format` aplica o Prettier ao projeto, ignorando dependências, builds, arquivos estáticos e patches de backend. `lint:fix` corrige os problemas que o ESLint consegue resolver automaticamente; erros de lógica, tipagem e hooks podem exigir revisão manual. Para apenas verificar, sem alterar arquivos, use `pnpm format:check` e `pnpm lint`.

```sh
pnpm typecheck
pnpm test:run
pnpm build
```

Os testes cobrem sessão persistente, erro de permissão, envelope REST, limpeza do tema, reconciliação de mensagens e revisão humana da IA. A validação com os serviços reais depende de iniciar backend e microservice. Veja os pontos de alinhamento e o roteiro de teste em [docs/BACKEND_ALIGNMENT.md](docs/BACKEND_ALIGNMENT.md).
