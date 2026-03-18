# panini-scraper

Biblioteca npm para scraping da Panini Brasil. Publicado como `panini-scraper`.

## API publica

```typescript
import { scrapePaniniProduct, scrapePaniniProducts, createPaniniScraper } from 'panini-scraper';

// Produto unico
const product = await scrapePaniniProduct('https://panini.com.br/produto/...');

// Batch
const results = await scrapePaniniProducts(['url1', 'url2']);

// Factory com config
const scraper = createPaniniScraper({ timeout: 5000, proxy: '...' });
```

## Arquitetura

Clean Architecture (domain -> use cases -> infrastructure).

```
src/
  domain/          product.entity.ts, product.repository.ts
  usecases/        scrapeProduct.usecase.ts
  infrastructure/  httpClient.ts, paniniScraper.service.ts
  interfaces/      tipos de interface
```

## Mapeamento para GibiPromo

| panini-scraper | GibiPromo Product |
|----------------|-------------------|
| `id` (SKU) | `id` (PK, diferente do ASIN) |
| `currentPrice` (number) | `price` |
| `fullPrice` (number) | `full_price` |
| `inStock` | `in_stock` |
| `isPreOrder` | `preorder` |
| `imageUrl` | `image` |

## Comandos

```bash
npm test              # Jest
npm run build         # TypeScript compiler
npm run lint          # ESLint
```

## Convencoes

- TypeScript strict, Clean Architecture, SOLID
- Testes unitarios + integracao
- 95%+ cobertura
