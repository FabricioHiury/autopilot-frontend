# Alinhamento com autopilot-backend

## Cadastro exclusivo do backoffice

O frontend removeu o cadastro público e centralizou a criação em `/backoffice/app/tenants`. O endpoint existente `POST /store/register` ainda é público no backend de referência. Ocultar a tela não restringe chamadas diretas à API.

O arquivo [backend-registration.patch](backend-registration.patch) contém a alteração proposta: `JwtAuthGuard`, `ProfileGuard` e perfil `autopilot` na rota de cadastro. Não foi aplicado ao repositório de referência. Após revisar, aplique dentro de `autopilot-backend`:

```sh
git apply --check ../autopilot-frontend/docs/backend-registration.patch
git apply ../autopilot-frontend/docs/backend-registration.patch
```

Valide 401 sem token, 403 para proprietário/funcionário e 201 para administrador Autopilot com dados válidos. Atualize também a documentação Swagger de cadastro para indicar autenticação administrativa. O primeiro administrador da plataforma precisa ser provisionado pelo seed/procedimento do backend.

## Contratos do dossiê

O backend atual expõe a análise consolidada e aceita atualizar `descriptionDeal` e `temperature`. Não possui colunas específicas para veículo de interesse, troca, pagamento e objeção. Esses dados ficam em um bloco identificado na descrição, preservando o restante da ficha. O vendedor pode editar todo o bloco antes de confirmar.

A interface consulta novamente o deal antes da confirmação e bloqueia a atualização quando descrição ou temperatura mudaram durante a revisão. Garantia de concorrência atômica exige versão/ETag ou operação equivalente no backend.

## Sessão e marca

O frontend respeita as cores retornadas pelo backend. O schema atual cria customizações com azul e cinza, que prevalecem sobre o fallback institucional. O patch opcional [backend-branding-defaults.patch](backend-branding-defaults.patch) define petróleo, azul escuro e âmbar para novas customizações, sem modificar as lojas já personalizadas. Aplique com `git apply ../autopilot-frontend/docs/backend-branding-defaults.patch` dentro do backend para alinhar os padrões entre os projetos.

O perfil proprietário é `storeOwner` no código atual, apesar de o guia usar `storeowner`. Usuários `user` têm cargos e permissões da loja. Alteração de branding é reservada ao proprietário pelo backend; um funcionário com cargo administrativo continua sujeito a essa regra de perfil.

Sem endpoint de refresh, o login permanece ativo até o `exp` do JWT. Para sessões renováveis será necessário implementar renovação no backend.

O upload de logo usa `POST /store/update-logo`, que retorna `url` e atualiza também o cadastro básico da loja. O tema é confirmado ao salvar a identidade visual. URLs de branding precisam ser HTTPS pelo DTO atual. Favicon e logo alternativo usam URLs; o backend não possui upload independente desses ativos nem operação dedicada para apagar URLs de customização. Cancelar a prévia não desfaz um arquivo já enviado ao servidor.

## Canais

O navegador fala somente com o backend principal. WhatsApp usa Evolution e QR Code. A API oficial da Meta não aparece na interface; Instagram, Facebook e OLX são preservados.

O status unificado atual não repassa o número conectado. A interface o exibe quando o contrato de conexão fornecer `number`; para exibi-lo sempre será preciso incluir esse campo na resposta do backend principal.

## Teste com os serviços reais

1. Subir infraestrutura e serviços conforme os READMEs do backend e microservice; conferir `/health` e `/docs` em 3003 e CORS/URL de frontend em 3001.
2. Entrar com administrador Autopilot, criar concessionária e confirmar o e-mail. Habilitar seu WhatsApp pelo backoffice.
3. Entrar com proprietário, cadastrar usuários vendedores/pré-vendedores e revisar cargos/permissões. Fechar e reabrir o navegador; testar logout e expiração de sessão.
4. Salvar cores/logos, cancelar outra prévia e alternar entre duas contas de lojas diferentes; verificar a limpeza do tema e histórico.
5. Parear o WhatsApp por QR e testar conexão, renovação e desconexão. Validar os fluxos OAuth de Instagram, Facebook e OLX com as credenciais do ambiente.
6. Receber/enviar mensagens, anexos e respostas citadas; conferir ticks de entrega e leitura. Derrubar/reconectar o socket e conferir a recuperação do histórico via REST.
7. Habilitar análise de IA no ambiente, solicitar análise, receber `autopilot:analysis-ready`, editar sugestão e enviar manualmente. Revisar/aplicar o dossiê e verificar persistência no deal.
8. Conferir pipeline, clientes, tarefas, visitas, notificações, relatórios e suporte com dados reais. Testar um usuário sem permissão de edição/resposta e garantir os bloqueios do backend.

Build e testes de frontend não substituem esse teste integrado, pois os serviços estavam desligados durante a implementação.
