# AutoPilot CRM - Frontend (Web App)

Aplicação web principal do AutoPilot CRM, interface de usuário tanto para lojistas/colaboradores quanto para o backoffice administrativo. Construída com Next.js 14 (App Router), React 18 e Tailwind CSS.

## Sobre o Projeto

O AutoPilot é um CRM omnichannel especializado no mercado automotivo. Este repositório contém a interface web completa do sistema, incluindo:

### Painel da Loja (Lojistas/Colaboradores)
- **Dashboard**: Visão geral da loja, métricas de atendimentos, origem de leads, últimos atendimentos
- **Atendimentos**: 
  - Painel Kanban de atendimentos (funil de vendas)
  - Chat em tempo real com leads/clientes
  - Gerenciamento de suspensões
- **Clientes**: Listagem e detalhes completos, histórico do cliente
- **Relatórios**:
  - Relatório geral de atendimentos e vendas
  - Relatório por canal de atendimento
  - Relatório por vendedor (desempenho, métricas avançadas, motivos de perdas)
  - Tempo médio de resposta, conversão por temperatura do lead
- **Configurações**:
  - Dados da loja
  - Integrações (WhatsApp, Instagram, Facebook, OLX, WebMotors, iCarros, Mobiauto, Showroom, UsadosBR, Site, Ligação, Outros)
  - Permissões e acessos de usuários
  - Suspensões e distribuição automática
- **Assinaturas**: Gestão do plano e assinatura via Stripe
- **Ajuda e FAQ**: FAQ, tickets de suporte, abertura de novos tickets

### Backoffice Administrativo
- **Dashboard**: Estatísticas gerais (assinaturas, receita, churn, cadastros, vida útil)
- **Assinantes**: Listagem e gestão de lojas assinantes, ativar/desativar assinaturas
- **Planos**: Criação e edição de planos do sistema
- **FAQ**: Publicação e gestão de posts do FAQ
- **Acessos**: Gestão de usuários admin, permissões
- **Tickets**: Atendimento de tickets de suporte das lojas

### Autenticação
- Login/cadastro de lojistas
- Login/cadastro de usuários backoffice
- Recuperação e redefinição de senha
- Confirmação de email

## Stack Tecnológica

- **Framework**: Next.js 14 (App Router) + React 18
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS 3, Tailwind Merge, clsx, CVA
- **Componentes UI**: shadcn/ui (Radix UI primitives), Lucide Icons, Boxicons
- **Estado Global**: Redux Toolkit + Next-Redux-Wrapper
- **Formulários**: React Hook Form + Zod (validação)
- **Requisições HTTP**: Axios
- **Gráficos**: Recharts
- **Rich Text**: Lexical Editor + TipTap
- **Drag and Drop**: @dnd-kit
- **Pagamentos**: Stripe (React Stripe.js)
- **Notificações/Toasts**: React Hot Toast + Radix Toast
- **Datas**: date-fns + react-day-picker
- **Emoji**: emoji-mart
- **Áudio**: vmsg (gravação de áudio WASM)
- **Animações**: Framer Motion, Tailwind Motion
- **Upload**: react-dropzone
- **Virtualização**: @tanstack/react-virtual
- **Testes**: Vitest + Testing Library

## Pré-requisitos

- Node.js 18+
- pnpm (recomendado) ou npm
- Backend [autopilot-backend](https://github.com/) rodando
- Microsserviço [autopilot-microservice](https://github.com/) rodando (para integrações)

## Instalação

```bash
pnpm install
```

## Configuração

Configure as variáveis de ambiente conforme necessário (API endpoints, chaves públicas Stripe, etc.).

## Execução

```bash
# Desenvolvimento
pnpm dev

# Build de produção
pnpm build

# Rodar build
pnpm start
```

A aplicação estará disponível em `http://localhost:3000`.

## Docker

```bash
docker-compose up -d
```

## Testes

```bash
pnpm test
```

## Lint

```bash
pnpm lint
```

## Estrutura Principal

```
src/
├── app/
│   ├── app/                      # Área logada da loja
│   │   ├── dashboard/
│   │   ├── atendimentos/         # Chat, painel, suspensões
│   │   ├── clientes/
│   │   ├── painel-relatorio/    # Relatórios diversos
│   │   ├── configuracoes/
│   │   ├── assinaturas/
│   │   └── ajuda-e-faq/
│   ├── backoffice/             # Área administrativa
│   │   ├── autenticacao/
│   │   └── app/                # Dashboard, assinantes, planos, FAQ, tickets
│   └── autenticacao/           # Login/cadastro da loja
├── components/
│   ├── cards/                   # Cards de UI
│   ├── commons/               # Componentes comuns (inputs, botões, modais, gráficos)
│   ├── inputs/                # Componentes de input
│   ├── lex/                   # Lexical Editor
│   ├── lego/                  # Componentes Lego
│   ├── nav/                   # Sidebars, navegação
│   ├── sections/              # Seções específicas (atendimentos, etc)
│   └── reports/             # Componentes de relatório
└── public/
    ├── avatar/                # Avatares dos canais
    ├── icons/               # Ícones SVG
    ├── images/             # Imagens gerais
    └── fonts/              # Fontes customizadas (BR Sonoma)
```
