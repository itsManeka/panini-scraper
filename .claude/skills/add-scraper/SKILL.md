---
name: add-scraper
description: Adiciona novo scraper/parser ao panini-scraper
disable-model-invocation: true
argument-hint: "<funcionalidade>"
---

Adicione um novo scraper ao panini-scraper.

Funcionalidade: $ARGUMENTS

## Checklist

1. Entidade em `src/domain/` (se necessario)
2. Use case em `src/usecases/`
3. Service com Cheerio em `src/infrastructure/`
4. Testes em `tests/`
5. Export em `src/index.ts`
6. Exemplo em `examples/`
