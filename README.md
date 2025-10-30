# 🧩 Panini Scraper

[![npm version](https://badge.fury.io/js/panini-scraper.svg)](https://badge.fury.io/js/panini-scraper)
[![Build Status](https://github.com/itsManeka/panini-scraper/workflows/Build%2C%20Test%20%26%20Publish/badge.svg)](https://github.com/itsManeka/panini-scraper/actions)
[![codecov](https://codecov.io/github/itsManeka/panini-scraper/graph/badge.svg?token=YRAC35KTCZ)](https://codecov.io/github/itsManeka/panini-scraper)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful and elegant TypeScript library for scraping product information from [Panini Brasil](https://panini.com.br) website. Built with Clean Architecture principles, comprehensive testing, and full TypeScript support.

## 🚀 Features

- **Batch Scraping**: Scrape multiple products in a single call with automatic error handling
- **Clean Architecture**: Organized codebase following SOLID principles and separation of concerns
- **TypeScript First**: Full type safety with comprehensive TypeScript definitions
- **Well Tested**: 95%+ test coverage with unit and integration tests
- **High Performance**: Efficient HTML parsing with Cheerio and HTTP requests with Axios
- **Flexible Configuration**: Configurable HTTP client with proxy support and custom headers
- **Detailed Error Handling**: Specific error types for different failure scenarios with partial results support
- **Production Ready**: Battle-tested with proper CI/CD pipeline
- **Zero Dependencies on Runtime**: Only requires Axios and Cheerio

## 📦 Installation

```bash
# NPM
npm install panini-scraper

# Yarn
yarn add panini-scraper

# pnpm
pnpm add panini-scraper
```

## 🔧 Quick Start

### Basic Usage

```typescript
import { scrapePaniniProduct } from 'panini-scraper';

async function main() {
  try {
    const product = await scrapePaniniProduct('https://panini.com.br/wolverine-2025-05');
    
    console.log(`Title: ${product.title}`);
    console.log(`Price: R$ ${product.currentPrice}`);
    console.log(`In Stock: ${product.inStock}`);
    console.log(`Pre-order: ${product.isPreOrder}`);
  } catch (error) {
    console.error('Scraping failed:', error.message);
  }
}

main();
```

### Batch Scraping (Multiple Products)

```typescript
import { scrapePaniniProducts } from 'panini-scraper';

// Scrape multiple products with automatic error handling
const result = await scrapePaniniProducts([
  'https://panini.com.br/wolverine-2025-05',
  'https://panini.com.br/a-fabulosa-x-force',
  'https://panini.com.br/batman-dark-knight'
]);

// Access results with success/failure separation
console.log(`✅ Successfully scraped: ${result.successCount}/${result.totalProcessed}`);

// Process successful results
result.successes.forEach(({ url, product }) => {
  console.log(`${product.title}: R$ ${product.currentPrice}`);
});

// Handle failures gracefully
result.failures.forEach(({ url, message }) => {
  console.error(`❌ Failed to scrape ${url}: ${message}`);
});
```

### Scraping Multiple Products (Advanced)

```typescript
import { createPaniniScraper } from 'panini-scraper';

const scraper = createPaniniScraper({ timeout: 5000 });

// Efficiently scrape multiple products with the same configuration using Promise.all
const products = await Promise.all([
  scraper('https://panini.com.br/wolverine-2025-05'),
  scraper('https://panini.com.br/a-fabulosa-x-force'),
  scraper('https://panini.com.br/batman-dark-knight')
]);

products.forEach(product => {
  console.log(`${product.title}: R$ ${product.currentPrice}`);
});
```

### With Custom Configuration

```typescript
import { scrapePaniniProduct } from 'panini-scraper';

const config = {
  timeout: 15000,
  headers: {
    'User-Agent': 'MyApp/1.0'
  },
  proxy: {
    host: 'proxy.example.com',
    port: 8080,
    auth: {
      username: 'user',
      password: 'pass'
    }
  }
};

const product = await scrapePaniniProduct(
  'https://panini.com.br/spider-man',
  config
);
```

## 📊 Response Formats

### Single Product Response

The library returns a `Product` object with the following structure:

```typescript
interface Product {
  title: string;          // Product title
  fullPrice: number;      // Original price in BRL
  currentPrice: number;   // Current/discounted price in BRL
  isPreOrder: boolean;    // Whether product is in pre-order
  inStock: boolean;       // Stock availability
  imageUrl: string;       // Main product image URL
  url: string;            // Product page URL
  format: string;         // Product format (e.g., "Capa dura", "Brochura")
  contributors: string[]; // List of authors, artists, translators, etc.
  id: string;             // Product identifier/SKU
}
```

#### Example Single Product Response

```json
{
  "title": "Crise Final (Grandes Eventos DC)",
  "fullPrice": 89.90,
  "currentPrice": 89.90,
  "isPreOrder": false,
  "inStock": true,
  "imageUrl": "https://d3ugyf2ht6aenh.cloudfront.net/stores/916/977/products/crise-final.jpg",
  "url": "https://panini.com.br/crise-final-grandes-eventos-dc",
  "format": "Capa dura",
  "contributors": [
    "Carlos Pacheco",
    "Doug Mahnke",
    "Grant Morrison",
    "J.G. Jones",
    "Matthew Clark"
  ],
  "id": "AGECF001"
}
```

### Batch Scraping Response

The `scrapePaniniProducts` function returns a `BatchScrapeResult` with the following structure:

```typescript
interface BatchScrapeResult {
  successes: ScrapedProduct[];      // Successfully scraped products
  failures: FailedProduct[];        // Failed scraping attempts
  totalProcessed: number;           // Total URLs processed
  successCount: number;             // Number of successes
  failureCount: number;             // Number of failures
}

interface ScrapedProduct {
  url: string;                      // The URL that was scraped
  product: Product;                 // The scraped product data
}

interface FailedProduct {
  url: string;                      // The URL that failed
  error: ProductScrapingError;      // The error object
  message: string;                  // Error message
}
```

#### Example Batch Response

```json
{
  "successes": [
    {
      "url": "https://panini.com.br/wolverine-2025-05",
      "product": {
        "title": "Wolverine #05",
        "fullPrice": 8.90,
        "currentPrice": 8.90,
        "isPreOrder": false,
        "inStock": true,
        "imageUrl": "https://...",
        "url": "https://panini.com.br/wolverine-2025-05",
        "format": "Brochura",
        "contributors": ["Benjamin Percy", "Adam Kubert"],
        "id": "WOL05"
      }
    }
  ],
  "failures": [
    {
      "url": "https://panini.com.br/invalid-product",
      "message": "Product not found or page structure has changed",
      "error": { /* ProductNotFoundError object */ }
    }
  ],
  "totalProcessed": 2,
  "successCount": 1,
  "failureCount": 1
}
```

## 🏗️ Advanced Usage

### Batch Scraping with Configuration

```typescript
import { scrapePaniniProducts } from 'panini-scraper';

const config = {
  timeout: 15000,
  headers: {
    'User-Agent': 'MyApp/1.0'
  }
};

const urls = [
  'https://panini.com.br/wolverine-2025-05',
  'https://panini.com.br/spider-man',
  'https://panini.com.br/batman'
];

const result = await scrapePaniniProducts(urls, config);

// Process results based on success/failure
if (result.successCount > 0) {
  console.log(`✅ Successfully scraped ${result.successCount} products`);
  
  result.successes.forEach(({ product }) => {
    console.log(`- ${product.title}: R$ ${product.currentPrice}`);
  });
}

if (result.failureCount > 0) {
  console.log(`\n❌ Failed to scrape ${result.failureCount} products`);
  
  result.failures.forEach(({ url, message, error }) => {
    console.log(`- ${url}`);
    console.log(`  Reason: ${message}`);
    console.log(`  Error type: ${error.name}`);
  });
}
```

### Using Clean Architecture Components

For advanced use cases, you can use the underlying Clean Architecture components directly:

```typescript
import { 
  ScrapeProductUseCase, 
  PaniniScraperService,
  HttpConfig 
} from 'panini-scraper';

// Create your own configured instance
const config: HttpConfig = {
  timeout: 15000,
  userAgent: 'MyApp/1.0'
};

const scraperService = new PaniniScraperService(config);
const useCase = new ScrapeProductUseCase(scraperService);

// Single product scraping
const product = await useCase.execute('https://panini.com.br/spider-man');

// Batch scraping
const result = await useCase.executeMany([
  'https://panini.com.br/wolverine',
  'https://panini.com.br/x-men'
]);
```

### Error Handling

#### Single Product Error Handling

The library provides specific error types for different scenarios:

```typescript
import { 
  scrapePaniniProduct,
  InvalidUrlError,
  ProductNotFoundError,
  ProductScrapingError 
} from 'panini-scraper';

try {
  const product = await scrapePaniniProduct(url);
  console.log(product);
} catch (error) {
  if (error instanceof InvalidUrlError) {
    // URL is invalid or not from Panini Brasil
    console.error('Invalid URL:', error.url);
  } else if (error instanceof ProductNotFoundError) {
    // Product not found or page structure changed
    console.error('Product not found at:', error.url);
  } else if (error instanceof ProductScrapingError) {
    // General scraping error (network, parsing, etc.)
    console.error('Scraping failed:', error.message);
    console.error('Status code:', error.statusCode);
  }
}
```

#### Batch Scraping Error Handling

Batch scraping never throws errors. Instead, it returns a result with successes and failures:

```typescript
import { scrapePaniniProducts, InvalidUrlError, ProductNotFoundError } from 'panini-scraper';

const result = await scrapePaniniProducts([
  'https://panini.com.br/valid-product',
  'https://panini.com.br/invalid-product',
  'not-a-valid-url'
]);

// Batch scraping automatically categorizes errors
result.failures.forEach(({ url, error, message }) => {
  if (error instanceof InvalidUrlError) {
    console.error(`Invalid URL format: ${url}`);
  } else if (error instanceof ProductNotFoundError) {
    console.error(`Product not found: ${url}`);
  } else {
    console.error(`Scraping failed for ${url}: ${message}`);
  }
});

// You can also check the overall success rate
const successRate = (result.successCount / result.totalProcessed) * 100;
console.log(`Success rate: ${successRate.toFixed(2)}%`);
```

### Working with Product Entity

The library also exports the `ProductEntity` class with additional utility methods:

```typescript
import { ProductEntity } from 'panini-scraper';

// ProductEntity provides computed properties
const entity = new ProductEntity(
  'Wolverine #05',
  8.90,    // fullPrice
  5.90,    // currentPrice
  false,   // isPreOrder
  true,    // inStock
  'https://example.com/image.jpg',
  'https://panini.com.br/wolverine-05',
  'WOL05'
);

console.log(entity.hasDiscount);          // true
console.log(entity.discountPercentage);   // 34 (rounded)
console.log(entity.savingsAmount);        // 3.00
console.log(entity.toJSON());             // Plain object
```

## ⚙️ Configuration Options

```typescript
interface HttpConfig {
  /** Request timeout in milliseconds (default: 10000) */
  timeout?: number;
  
  /** Custom HTTP headers */
  headers?: Record<string, string>;
  
  /** Custom user agent string */
  userAgent?: string;
  
  /** Proxy configuration */
  proxy?: {
    host: string;
    port: number;
    auth?: {
      username: string;
      password: string;
    };
  };
}
```

## 🧪 Testing

The library has comprehensive test coverage:

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Coverage

The library maintains high test coverage standards:
- **Statements**: 95%+
- **Branches**: 85%+
- **Functions**: 100%
- **Lines**: 95%+

## 🔒 Error Types

| Error Type | Description | When Thrown |
|------------|-------------|-------------|
| `InvalidUrlError` | Invalid or malformed URL | URL is not from panini.com.br domain |
| `ProductNotFoundError` | Product not found | Page structure changed or product doesn't exist |
| `ProductScrapingError` | General scraping error | Network issues, parsing errors, etc. |

## 📈 Performance

- **Average Response Time**: 1-3 seconds per product
- **Batch Processing**: Sequential processing (prevents overwhelming the server)
- **Concurrent Requests**: Supports parallel scraping with Promise.all for advanced use cases
- **Memory Usage**: ~50MB for typical usage, scales with batch size
- **Rate Limiting**: Implement your own rate limiting as needed

### Performance Tips

- **Batch Scraping**: Use `scrapePaniniProducts` for multiple URLs - it processes sequentially and handles errors gracefully
- **Parallel Scraping**: For maximum speed (at your own risk), use `Promise.all` with `createPaniniScraper`
- **Error Recovery**: Batch scraping returns partial results, so you don't lose successful scrapes if some URLs fail

## 🏛️ Architecture

This library follows Clean Architecture principles:

```
src/
├── domain/              # Business entities and interfaces
│   ├── product.entity.ts
│   └── product.repository.ts
├── usecases/            # Application business rules
│   └── scrapeProduct.usecase.ts
└── infrastructure/      # External implementations
    ├── httpClient.ts
    └── paniniScraper.service.ts
```

### Layer Responsibilities

- **Domain**: Core business logic and entities (no external dependencies)
- **Use Cases**: Application-specific business rules
- **Infrastructure**: External concerns (HTTP, parsing, etc.)

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Make** your changes following our coding standards
4. **Add** tests for your changes
5. **Run** the test suite (`npm test`)
6. **Ensure** test coverage remains above 80%
7. **Commit** your changes (`git commit -m 'Add amazing feature'`)
8. **Push** to the branch (`git push origin feature/amazing-feature`)
9. **Open** a Pull Request

### Code Quality Standards

- Follow TypeScript best practices
- Write comprehensive JSDoc comments
- Maintain test coverage above 80%
- Use meaningful variable and function names
- Keep functions small and focused
- Run `npm run lint:fix` before committing

### Running Tests Locally

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Build the project
npm run build
```

## 📄 API Reference

### Main Functions

#### `scrapePaniniProduct(url, config?)`

Scrapes a single product from Panini Brasil.

**Parameters:**
- `url` (string): Product URL
- `config` (HttpConfig, optional): HTTP configuration

**Returns:** `Promise<Product>`

**Throws:**
- `InvalidUrlError`: Invalid URL
- `ProductNotFoundError`: Product not found
- `ProductScrapingError`: Scraping failed

---

#### `scrapePaniniProducts(urls, config?)` ✨ **NEW**

Scrapes multiple products in a single call with automatic error handling.

**Parameters:**
- `urls` (string[]): Array of product URLs
- `config` (HttpConfig, optional): HTTP configuration

**Returns:** `Promise<BatchScrapeResult>`

**Features:**
- **Sequential Processing**: URLs are processed one by one to avoid overwhelming the server
- **Partial Results**: Returns both successful and failed scrapes
- **Never Throws**: All errors are captured and returned in the `failures` array
- **Detailed Errors**: Each failure includes the URL, error object, and message

**Example:**
```typescript
const result = await scrapePaniniProducts([
  'https://panini.com.br/product-1',
  'https://panini.com.br/product-2'
]);

console.log(`Success: ${result.successCount}, Failed: ${result.failureCount}`);
```

---

#### `createPaniniScraper(config?)`

Creates a reusable scraper function.

**Parameters:**
- `config` (HttpConfig, optional): HTTP configuration

**Returns:** `(url: string) => Promise<Product>`

### Classes

#### `ScrapeProductUseCase`

Use case for scraping products with support for both single and batch operations.

```typescript
const useCase = new ScrapeProductUseCase(repository);

// Single product
const product = await useCase.execute(url);

// Batch products
const result = await useCase.executeMany([url1, url2, url3]);
```

#### `PaniniScraperService`

Infrastructure service implementing the repository interface.

```typescript
const service = new PaniniScraperService(config);
const product = await service.scrapeProduct(url);
```

#### `ProductEntity`

Domain entity with validation and computed properties.

```typescript
const entity = new ProductEntity(...);
console.log(entity.hasDiscount);
console.log(entity.discountPercentage);
```

## 🐛 Known Issues

- Some product pages may have different HTML structures
- Image URLs might be placeholders for new products
- Pre-order detection depends on Portuguese text patterns
- Stock status is inferred from page content

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and changes.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Emanuel Ozorio Dias**
- GitHub: [@itsManeka](https://github.com/itsManeka)
- Email: [emanuel.ozoriodias@gmail.com](mailto:emanuel.ozoriodias@gmail.com)

## 🙏 Acknowledgments

- [Cheerio](https://cheerio.js.org/) - Fast, flexible HTML parsing
- [Axios](https://axios-http.com/) - Promise-based HTTP client
- [Jest](https://jestjs.io/) - Delightful JavaScript testing
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types

## 📞 Support

If you need help or have questions:

1. Check the [documentation](https://github.com/itsManeka/panini-scraper#readme)
2. Browse [existing issues](https://github.com/itsManeka/panini-scraper/issues)
3. Create a [new issue](https://github.com/itsManeka/panini-scraper/issues/new)
4. For urgent matters: [emanuel.ozoriodias@gmail.com](mailto:emanuel.ozoriodias@gmail.com)

## ⚖️ Legal Disclaimer

This tool is for educational and personal use only. Please respect Panini Brasil's robots.txt and terms of service. The authors are not responsible for misuse of this library. Always implement appropriate rate limiting and consider the impact on target servers.

---

**Made with ❤️ and TypeScript**
