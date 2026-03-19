# AvaliaPro — Estado Atual do Projeto

## Objetivo

Criar um SaaS de avaliações para e-commerce, com widget embedável via script, semelhante a Trustpilot / Yotpo, começando por Nuvemshop, mas preparado para outras plataformas.

---

## Caminho do Projeto

```bash
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

Estrelas do formulário alinhadas visualmente com as estrelas da lista (SVG unificado)
✅

Remoção da avaliação em destaque (simplificação de UI e preparação para carrossel)
✅

Envio com feedback visual (loading + sucesso)
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

Label qualitativo (Excelente, Bom, etc.)
✅

Renderização de estrelas precisa
✅

Meia estrela com SVG
✅

Correção de escape HTML
✅

Sistema de Reviews (Avançado)

Avaliação em destaque fixa
❌ (removida para simplificação da UI)

Sistema de insights (keywords)
✅

Chips interativos (filtros)
✅

Filtro dinâmico funcional
✅

Evita duplicação da review destacada
❌ (não aplicável após remoção do highlight)

Layout clean moderno
✅

Alinhamento refinado
✅

Lista horizontal de características
✅

Correção crítica:

Filtro agora inclui corretamente a review em destaque quando ativo
❌ (substituído por lógica simplificada sem highlight)

Widget — Avanços Recentes (CRÍTICO)

Paginação local
✅

Estado global persistente
✅

Correção de reset de página
✅

Correção de variáveis indefinidas
✅

Unificação da lógica de paginação
✅

Remoção da lógica de highlight da paginação (simplificação estrutural)
✅

Render estável
✅

Re-render seguro
✅

EM ANDAMENTO

Dashboard SaaS completo
⏳

Sistema de agregação persistida
⏳

Widget avançado (layout + conversão)
⏳

Sistema de coleta automática pós-compra
🚨 PRIORIDADE MÁXIMA

Sistema de notificações
⏳

Multi-plataforma
⏳

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
DELETE /api/reviews/:reviewId

Widget API

GET /api/widget/reviews
POST /api/widget/reviews

WIDGET FRONTEND

Arquivo:
backend/widget/widget.js

Funcionalidades

render automático
reviews dinâmicos
média + contagem
paginação local
envio via modal
estrelas dinâmicas (SVG padronizado)
label qualitativo
cache local
SPA ready

Diferenciais

insights automáticos
chips interativos
UX premium
design estilo Stripe / Apple
alta conversão

SPA Handling

MutationObserver
history intercept
polling leve

Cache

Widget
TTL: 60s
limite: 20

Backend
TTL: 60s
limite: 100

SEGURANÇA MULTI-TENANT

isolamento por companyId
apiKey vinculada
queries protegidas

Status:
✅ 100% funcional

SCHEMA PRISMA

User
Company
Product
Customer
Review

Índices otimizados por companyId

ESTADO ATUAL DO SISTEMA

Situação

API estável
widget estável
integração ativa
banco consistente
multi-tenant seguro
cache ativo
paginação estável

UX

nível marketplace premium
interação fluida
alta conversão

PROBLEMAS RESOLVIDOS RECENTEMENTE

duplicação de produtos
erro de API
multi-tenant inconsistente
problemas SKU vs variantId
modal quebrado
conflito de scripts
render de estrelas incorreto
pluralização
timeout de API
remoção completa do sistema de highlight sem quebrar paginação
correção de sobrescrita de SVG das estrelas no formulário

PROBLEMAS ATUAIS

cold start da API (Render)
insights ainda client-side
sem agregação persistida
sem distribuição de estrelas

PRÓXIMOS PASSOS

PRIORIDADE MÁXIMA 🚨

Sistema pós-compra automático:

integração com pedidos
email automático
link direto para avaliação
“Compra verificada”

PRIORIDADE ALTA

agregação persistida
distribuição de estrelas
insights no backend
badges
reputação por produto
carrossel de fotos nas avaliações
upload de imagens nas reviews

PRIORIDADE MÉDIA

dashboard avançado
relatórios
exportação
notificações

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
compressão payload

NOVAS IDEIAS

resumo automático (IA leve)
“o que mais falam”
ranking de características
heatmap de sentimento
detecção de fake review
score de confiabilidade
comparação entre produtos

RESUMO EXECUTIVO

AvaliaPro possui:

integração real
dados confiáveis
persistência estruturada
API robusta
widget premium
UX acima do mercado
insights dinâmicos
paginação pronta
arquitetura SaaS escalável

STATUS FINAL

👉 MVP avançado, estável e pronto para escalar, otimizar conversão e iniciar monetização
```
