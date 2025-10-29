# Panini Scraper - Usage Examples

This directory contains practical examples demonstrating how to use the panini-scraper library.

## Available Examples

### 1. Basic Usage (`basic-usage.ts`)

Demonstrates the simplest way to scrape a single product:
- Simple product scraping
- Error handling
- Display product information

**Run:**
```bash
npx ts-node examples/basic-usage.ts
```

### 2. Advanced Usage (`advanced-usage.ts`)

Demonstrates advanced features and patterns:
- Batch scraping multiple products
- Custom HTTP configuration
- Proxy support
- Advanced error handling
- Product filtering and analysis

**Run:**
```bash
npx ts-node examples/advanced-usage.ts
```

## Prerequisites

Install ts-node if you don't have it:
```bash
npm install -g ts-node
```

Or use it via npx:
```bash
npx ts-node examples/basic-usage.ts
```

## Quick Start

### Simplest Example

```typescript
import { scrapePaniniProduct } from 'panini-scraper';

const product = await scrapePaniniProduct('https://panini.com.br/product-url');
console.log(`${product.title}: R$ ${product.currentPrice}`);
```

### With Configuration

```typescript
import { scrapePaniniProduct } from 'panini-scraper';

const product = await scrapePaniniProduct(
  'https://panini.com.br/product-url',
  { timeout: 15000 }
);
```

### Batch Scraping

```typescript
import { createPaniniScraper } from 'panini-scraper';

const scraper = createPaniniScraper({ timeout: 10000 });

const products = await Promise.all([
  scraper('https://panini.com.br/product1'),
  scraper('https://panini.com.br/product2'),
  scraper('https://panini.com.br/product3')
]);
```

### Error Handling

```typescript
import { 
  scrapePaniniProduct, 
  InvalidUrlError, 
  ProductNotFoundError 
} from 'panini-scraper';

try {
  const product = await scrapePaniniProduct(url);
} catch (error) {
  if (error instanceof InvalidUrlError) {
    console.error('Invalid URL:', error.url);
  } else if (error instanceof ProductNotFoundError) {
    console.error('Product not found:', error.url);
  }
}
```

## Notes

- Replace example URLs with real Panini Brasil product URLs
- The library requires active internet connection
- Respect rate limits and implement delays between requests
- See main README.md for complete API documentation

## Integration Examples

### Express API Server

```typescript
import express from 'express';
import { scrapePaniniProduct } from 'panini-scraper';

const app = express();
app.use(express.json());

app.post('/api/scrape', async (req, res) => {
  try {
    const { url } = req.body;
    const product = await scrapePaniniProduct(url);
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.listen(3000);
```

### CLI Tool

```typescript
#!/usr/bin/env node
import { scrapePaniniProduct } from 'panini-scraper';

async function main() {
  const url = process.argv[2];
  
  if (!url) {
    console.error('Usage: scrape <url>');
    process.exit(1);
  }
  
  try {
    const product = await scrapePaniniProduct(url);
    console.log(JSON.stringify(product, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
```

## Support

For more examples and documentation, see:
- [Main README](../README.md)
- [Architecture Documentation](../ARCHITECTURE.md)
- [API Documentation](../README.md#api-reference)

