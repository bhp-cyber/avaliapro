# AVALIAPRO_ENGINEERING_RULES

Manual técnico de engenharia do projeto AvaliaPro.

Este documento define padrões obrigatórios para desenvolvimento, arquitetura e evolução do sistema.

Objetivo:

- manter consistência técnica
- evitar regressões
- garantir escalabilidade do SaaS
- facilitar manutenção futura

# PRINCÍPIO FUNDAMENTAL

O sistema deve sempre evoluir **sem quebrar o que já funciona**.

Mudanças devem ser:

- pequenas
- seguras
- reversíveis

# PADRÃO DE COMMITS

Formato obrigatório:

tipo: descrição curta

Exemplos:

funcionalidade: suporte a avaliações por variante
correção: validação de rating no endpoint de reviews
refatoração: organização do cache do widget

Tipos permitidos:

funcionalidade
correção
refatoração
performance
infraestrutura

# PADRÃO DE BRANCH

Branch principal:

main

Novas features podem usar:

feature/nome-da-feature

# PADRÃO DE TAGS

Formato:

versao-X.Y-descricao

Exemplos:

versao-0.1-primeiro-widget
versao-0.2-suporte-variantes
versao-0.3-cache-backend

# PADRÃO DE API

Endpoints devem sempre:

- validar apiKey
- validar empresa
- validar produto
- retornar JSON consistente

Estrutura padrão de resposta:

{
company,
product,
summary,
reviews
}

# PADRÃO DE BANCO DE DADOS

Nunca remover campos existentes sem migração segura.

Novos campos devem ser:

- opcionais inicialmente
- introduzidos via prisma migrate

# PADRÃO DO WIDGET

O widget deve ser:

- totalmente embedável
- independente de plataforma
- resiliente a mudanças de DOM
- compatível com SPA

Identificação de produto deve seguir prioridade:

1 platformProductId  
2 sku

# PADRÃO DE CACHE

Cache deve sempre considerar:

- produto
- variante (quando existir)

Cache nunca deve retornar avaliações de outro produto.

# PADRÃO DE SEGURANÇA

Sempre validar:

- apiKey
- rating entre 1 e 5
- sanitização de texto

# REGRA DE EVOLUÇÃO DO SISTEMA

Antes de qualquer nova funcionalidade:

1 verificar impacto no widget
2 verificar impacto na API
3 verificar impacto no banco
4 verificar impacto no cache

# REGRA DE ESTABILIDADE

Se alguma alteração causar instabilidade:

1 reverter imediatamente
2 estabilizar o sistema
3 documentar o problema
4 planejar nova abordagem

# OBJETIVO FINAL DO SISTEMA

AvaliaPro deve evoluir para um SaaS completo de avaliações para e-commerce com:

- widget universal
- coleta automática de reviews
- painel do lojista
- moderação
- reputação de avaliações
- integração com múltiplas plataformas
