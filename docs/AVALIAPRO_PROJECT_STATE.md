AvaliaPro — Estado Atual do Projeto
Objetivo

Criar um SaaS de avaliações para e-commerce, com widget embedável via script, semelhante a Trustpilot / Yotpo, começando por Nuvemshop, mas preparado para outras plataformas.

Caminho do Projeto
cd ~/Documents/Programas/AvaliaPro
Script de Instalação

<script
  src="https://avaliapro-api.onrender.com/widget/widget.js"
  data-api-key="API_KEY"
></script>

ROADMAP TÉCNICO ATUALIZADO
Núcleo do Sistema

Widget estável
✅

Sistema de reviews
✅

Sistema de moderação
✅

Sistema de edição
✅

Painel conectado à API
✅

Tela de produtos básica
✅

Sincronização de produtos (Nuvemshop)
✅

Cadastro automático via SKU / platformId
✅

Paginação de produtos (API SaaS)
✅

Integração oficial com Nuvemshop (OAuth completo)
✅

Isolamento multi-tenant (companyId + apiKey)
✅

Validação de produto por company no widget
✅

Correção de inconsistência de múltiplas companies
✅

Limpeza de banco (dados inválidos / duplicados)
✅

Widget funcionando com produto real da loja
✅

Widget com cache inteligente (TTL + limite)
✅

Widget UX / Conversão

Modal funcional de avaliação
✅

Sistema de estrelas interativas (hover + clique)
✅

Estrelas alinhadas (SVG unificado)
✅

Remoção da avaliação em destaque
✅

Envio com feedback visual
✅

Micro-animações
✅

Select substituído por estrelas
✅

Validação de formulário corrigida
✅

Layout premium do modal
✅

CTA otimizado
✅

Reposicionamento do botão
✅

Separação visual header/conteúdo
✅

Pluralização corrigida
✅

Exibição “Baseado em X avaliações”
✅

Label qualitativo
✅

Renderização de estrelas precisa
✅

Meia estrela com SVG
✅

Correção de escape HTML
✅

Trava visual de imagens no widget/modal
✅

Avaliação anônima no Modal pdp
✅

Formatação textual de data na list pdp
✅

Resumo visual de avaliações refinado
✅

Sistema de Reviews (Avançado)

Insights (keywords)
✅

Chips interativos
✅

Filtro dinâmico
✅

Layout clean moderno
✅

Lista horizontal de características
✅

Exibição completa dos chips sem limite artificial de 4 itens
✅

Widget — Avanços Recentes

Paginação local
✅

Estado global persistente
✅

Correção de reset de página
✅

Unificação da paginação
✅

Remoção do highlight
✅

Render estável
✅

Normalização de avatar no fluxo do widget
✅

Imagens travadas para não clicar/arrastar
✅

Avatares públicos reais no widget
✅

Avatar padrão público (avatar-default.png)
✅

Preview grande de avatar no modal do widget
✅

Fallback de avatar agora manual no widget
✅

Regra de avatar aleatório removida do widget
✅

Avaliação anônima com nome mascarado no Modal pdp
✅

Envio de isAnonymous pelo widget
✅

Resumo do topo da list pdp refinado visualmente
✅

Admin — Avanços Recentes

Formulário de review manual estável
✅

Correção de perda de authorName
✅

Correção de envio de avatar para backend
✅

Padronização de avatarType
✅

Rollback seguro após instabilidade de avatar
✅

Fluxo de avatar entre admin/backend/widget estabilizado
✅

Imagens travadas no admin e NewReview
✅

Nova avaliação via modal popup no painel
✅

Reutilização segura do NewReviewPage dentro de modal
✅

Avatar padrão visual no modal do admin
✅

Avatar padrão manual no admin (avatar-default.png)
✅

Regra de avatar aleatório removida do admin
✅

Avatar reposicionado no topo do formulário
✅

Fundo do modal refinado para visual mais limpo
✅

EM ANDAMENTO

Dashboard SaaS completo
⏳

Sistema de agregação persistida
⏳

Widget avançado
⏳

Sistema pós-compra automático
⏳

PRIORIDADE MÁXIMA 🚨
Sistema pós-compra automático

integração com pedidos
email automático
link de avaliação
“Compra verificada”

ESTADO ATUAL DA ARQUITETURA
Backend API
Stack

Node.js
Express
Prisma
PostgreSQL (Supabase)

Deploy

Render

Estrutura
backend/src
├ app.ts
├ routes
│ ├ index.ts
│ ├ widget.routes.ts
│ ├ review.routes.ts
│ ├ company.routes.ts
│ ├ product.routes.ts
│ ├ nuvemshop.routes.ts
│ └ health.routes.ts
└ lib
└ prisma.ts
ROTAS DA API
Prefixo

/api

Health

GET /api/health

Companies

GET /api/companies
POST /api/companies
GET /api/companies/:companyId
GET /api/companies/:companyId/summary

Products

GET /api/products
POST /api/products
GET /api/products/sku/:sku
GET /api/products/:productId/reviews

Reviews

GET /api/reviews
POST /api/reviews
PATCH /api/reviews/:reviewId
PATCH /api/reviews/:reviewId/status
DELETE /api/reviews/:reviewId

Widget API

GET /api/widget/reviews
POST /api/widget/reviews

WIDGET FRONTEND
Arquivo

backend/widget/widget.js

Funcionalidades

render automático
reviews dinâmicos
média + contagem
paginação local
envio via modal
estrelas SVG
label qualitativo
cache local
SPA ready
trava visual das imagens
fallback de avatar
avatares públicos
avatar padrão público
preview grande de avatar no modal
regra manual para avatar quando nenhum for selecionado
avaliação anônima no Modal pdp
máscara de nome no fluxo anônimo do widget
formatação textual de data na list pdp
resumo visual refinado no topo da list pdp
chips de insights exibindo todos os itens disponíveis

SEGURANÇA MULTI-TENANT

isolamento por companyId
apiKey vinculada
queries protegidas

Status:
✅ funcional

SCHEMA PRISMA

User
Company
Product
Customer
Review

ESTADO ATUAL DO SISTEMA
Situação

API estável
widget estável
admin estável
integração ativa
banco consistente
multi-tenant seguro
cache ativo
avatar estabilizado
travas visuais de imagem aplicadas
modal de nova avaliação estável no admin
avatar padrão manual estável no admin e widget
resumo visual do widget estabilizado
fluxo anônimo no Modal pdp funcionando

Terminologia operacional adotada

Modal pdp = criar avaliação na página do produto
list pdp = lista de avaliações da página do produto
Modal adm = criar avaliação no painel de gestão
list adm = lista de avaliações no painel de gestão

PROBLEMAS RESOLVIDOS RECENTEMENTE

duplicação de produtos
erro de API
multi-tenant inconsistente
problemas SKU vs variantId
modal quebrado
render de estrelas
pluralização
remoção do highlight
correção de authorName
correção de fluxo de aprovação
normalização do fluxo de avatar
proteção de avatarUrl pública
consistência entre POST/PATCH de reviews
trava de arraste/clique visual das imagens
avatar preset público no widget
fallback aleatório removido do admin
fallback aleatório removido do widget
padronização do avatar-default.png
nova avaliação via modal no painel admin
avaliação anônima no widget
formato de data refinado na list pdp
limite artificial de 4 chips removido dos insights
refino visual do resumo de avaliações no widget

PROBLEMA ATUAL (CRÍTICO DEFINIDO)

Nenhum bug crítico ativo definido no núcleo estável atual.

Pendência visual não crítica
validar em cenário com poucas avaliações se o menu de ações do painel admin deixou de ser cortado no topo da tabela após ajuste de overflow em frontend/admin/src/pages/ReviewsPage.tsx

Status:
✅ avatar estabilizado em modo manual
✅ admin e widget alinhados no uso de avatar-default.png
✅ resumo visual de avaliações salvo no widget
⏳ foco principal continua sendo pós-compra automático

ÚLTIMO PASSO EXECUTADO

Refino visual do resumo de avaliações na list pdp e estabilização do topo do widget:

backend/widget/widget.js

Ajustes concluídos
refinamento visual do bloco de média geral
refinamento visual do bloco de recomendação (96% recomendam este produto)
ajuste do CTA Escrever avaliação
reorganização dos chips de insights no topo
título dos insights alinhado no mesmo eixo visual do bloco
remoção do limite artificial de 4 chips
formatação de data da list pdp em formato textual
avaliação anônima funcional no Modal pdp com nome mascarado
checkpoint salvo após estabilização visual
Validação executada
resumo do widget validado visualmente
chips exibidos corretamente
data da list pdp validada
fluxo anônimo do widget validado com sucesso
widget preservado após os refinamentos
CHECKPOINTS SALVOS

commit:
estabiliza avatars preset públicos no admin e widget

tag:
v0.4.2-avatars-preset-publicos

commit:
adiciona modal de nova avaliação e fallback de avatar no widget

tag:
v0.4.3-modal-nova-avaliacao

commit:
remove avatar aleatório no admin e define avatar padrão manual

tag:
v0.4.4-avatar-manual-admin

commit:
remove avatar aleatório no widget e define avatar padrão manual

tag:
v0.4.5-avatar-manual-widget

commit:
refina resumo de avaliações no widget

tag:
checkpoint visual salvo nesta conversa
(tag específica não confirmada no arquivo atual)

RESULTADO

✔ avatar estabilizado em fluxo manual
✔ avatar-default.png padronizado
✔ widget preservado
✔ admin preservado
✔ modal de nova avaliação ativo no painel
✔ avaliação anônima funcional no Modal pdp
✔ resumo visual de avaliações estabilizado no widget
✔ ponto seguro salvo após refinamento do topo da list pdp

PRÓXIMO PASSO DEFINIDO
Validar a correção do corte do menu de ações no painel admin em cenário com poucas avaliações
Se validado, salvar novo checkpoint
Encerrar o tema visual residual de widget/admin
Retomar o roadmap principal no pós-compra:
ler backend/src/routes/nuvemshop.routes.ts
identificar o que já existe de pedidos / webhooks / sync
definir o ponto exato de entrada para “Compra verificada”
planejar disparo de solicitação de avaliação sem quebrar o fluxo atual
PRÓXIMOS PASSOS
PRIORIDADE ALTA

integração com pedidos da Nuvemshop
marcação de compra verificada
link individual de avaliação
agregação persistida
distribuição de estrelas
insights no backend
badges
reputação por produto

PRIORIDADE MÉDIA

dashboard avançado
relatórios
exportação
notificações
fila segura para emails pós-compra

PRIORIDADE FUTURA

Shopify
WooCommerce
anti-spam
CDN widget
upload de imagens
analytics
A/B testing

MELHORIAS ESTRATÉGICAS

lazy loading
pré-carregamento
render parcial
schema.org ⭐
fallback API lenta
cache CDN
redução de egress
persistência de agregados por produto

NOVAS IDEIAS

resumo automático (IA leve)
ranking de características
heatmap de sentimento
detecção de fake review
score de confiabilidade

RESUMO EXECUTIVO

AvaliaPro possui:

integração real
dados confiáveis
persistência estruturada
API robusta
widget premium
UX avançada
paginação estável
arquitetura SaaS escalável
modal de nova avaliação no admin
avatar público e manual padronizado entre admin e widget
avaliação anônima funcional no widget
resumo visual refinado e salvo no topo da list pdp
checkpoint estável salvo após refinamento visual do widget

STATUS FINAL

👉 Sistema estável e congelado no ponto atual
👉 Avatar estabilizado em modo manual com avatar-default.png
👉 Modal de nova avaliação ativo no admin
👉 Modal pdp com avaliação anônima funcional
👉 Resumo visual da list pdp salvo e estabilizado
👉 Há apenas uma pendência visual não crítica de validação no menu de ações do admin
👉 Próximo foco principal continua sendo pós-compra automático + compra verificada
