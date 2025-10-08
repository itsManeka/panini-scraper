# 🧩 Panini Scraper

[![npm version](https://badge.fury.io/js/panini-scraper.svg)](https://badge.fury.io/js/panini-scraper)
[![Build Status](https://github.com/itsManeka/panini-scraper/workflows/Build%2C%20Test%20%26%20Publish/badge.svg)](https://github.com/itsManeka/panini-scraper/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful Node.js TypeScript library for scraping product information from [Panini Brasil](https://panini.com.br) website. Built with Clean Architecture principles, comprehensive testing, and full TypeScript support.

## 🚀 Features

- **Clean Architecture**: Organized codebase following SOLID principles
- **TypeScript Support**: Full type safety and IntelliSense support
- **High Performance**: Efficient scraping with configurable HTTP client
- **Comprehensive Testing**: 80%+ test coverage with unit and integration tests
- **Flexible Usage**: Use as a library, CLI tool, or API server
- **Proxy Support**: Configurable proxy settings for different environments
- **Error Handling**: Detailed error types for different failure scenarios
- **Production Ready**: Battle-tested with proper CI/CD pipeline

## 📦 Installation

### NPM

```bash
npm install panini-scraper
```

### Yarn

```bash
yarn add panini-scraper
```

### pnpm

```bash
pnpm add panini-scraper
```

## 🔧 Quick Start

### Basic Usage

```typescript
import { scrapePaniniProduct } from 'panini-scraper';

async function main() {
  try {
    const product = await scrapePaniniProduct('https://panini.com.br/a-vida-de-wolverine');
    console.log(product);
  } catch (error) {
    console.error('Scraping failed:', error.message);
  }
}

main();
```

### With Configuration

```typescript
import { scrapePaniniProduct } from 'panini-scraper';

const config = {
  timeout: 10000,
  proxy: {
    host: 'proxy.example.com',
    port: 8080,
    auth: {
      username: 'user',
      password: 'pass'
    }
  },
  headers: {
    'User-Agent': 'Custom Bot 1.0'
  }
};

const product = await scrapePaniniProduct(
  'https://panini.com.br/wolverine-2025-05', 
  config
);
```

### Reusable Scraper Instance

```typescript
import { createPaniniScraper } from 'panini-scraper';

const scraper = createPaniniScraper({ timeout: 5000 });

// Scrape multiple products with same configuration
const products = await Promise.all([
  scraper('https://panini.com.br/wolverine-2025-05'),
  scraper('https://panini.com.br/a-fabulosa-x-force'),
  scraper('https://panini.com.br/batman-dark-knight')
]);
```

## 📊 Response Format

The scraper returns a `Product` object with the following structure:

```typescript
interface Product {
  title: string;          // Product title
  fullPrice: number;      // Original price in BRL
  currentPrice: number;   // Current/discounted price in BRL
  isPreOrder: boolean;    // Whether product is in pre-order
  inStock: boolean;       // Stock availability
  imageUrl: string;       // Main product image URL
  url: string;            // Product page URL
  id: string;             // Product identifier/SKU
}
```

### Example Response

```json
{
  "title": "A Vida de Wolverine",
  "fullPrice": 24.90,
  "currentPrice": 16.19,
  "isPreOrder": false,
  "inStock": true,
  "imageUrl": "https://panini.com.br/images/wolverine.jpg",
  "url": "https://panini.com.br/a-vida-de-wolverine",
  "id": "AVWOL001"
}
```

## 🏗️ Advanced Usage

### Using Clean Architecture Components

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

const product = await useCase.execute('https://panini.com.br/spider-man');
```

### Error Handling

```typescript
import { 
  scrapePaniniProduct,
  InvalidUrlError,
  ProductNotFoundError,
  ProductScrapingError 
} from 'panini-scraper';

try {
  const product = await scrapePaniniProduct(url);
} catch (error) {
  if (error instanceof InvalidUrlError) {
    console.error('Invalid URL provided:', error.url);
  } else if (error instanceof ProductNotFoundError) {
    console.error('Product not found at:', error.url);
  } else if (error instanceof ProductScrapingError) {
    console.error('Scraping failed:', error.message, 'Status:', error.statusCode);
  } else {
    console.error('Unknown error:', error.message);
  }
}
```

## 🖥️ CLI Usage

Install globally to use the CLI:

```bash
npm install -g panini-scraper
```

### CLI Commands

```bash
# Scrape a single product
panini-scraper scrape https://panini.com.br/a-vida-de-wolverine

# Start API server
panini-scraper server 3000

# Show help
panini-scraper help
```

### CLI Examples

```bash
# Scrape product and output JSON
$ panini-scraper scrape https://panini.com.br/wolverine-2025-05

{
  "title": "Wolverine 2025 #05",
  "fullPrice": 8.90,
  "currentPrice": 8.90,
  "isPreOrder": true,
  "inStock": true,
  "imageUrl": "https://panini.com.br/images/wolverine2025-05.jpg",
  "url": "https://panini.com.br/wolverine-2025-05",
  "id": "WOL202505"
}
```

## 🌐 API Server

Use as a standalone API server:

```bash
# Start server on default port (3000)
panini-scraper

# Start on custom port
panini-scraper server 8080
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information and documentation |
| GET | `/health` | Health check endpoint |
| POST | `/api/scrape` | Scrape product (URL in body) |
| GET | `/api/scrape?url=<url>` | Scrape product (URL in query) |

### API Examples

**POST Request:**
```bash
curl -X POST http://localhost:3000/api/scrape \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://panini.com.br/a-vida-de-wolverine"}'
```

**GET Request:**
```bash
curl "http://localhost:3000/api/scrape?url=https://panini.com.br/a-vida-de-wolverine"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "A Vida de Wolverine",
    "fullPrice": 24.90,
    "currentPrice": 16.19,
    "isPreOrder": false,
    "inStock": true,
    "imageUrl": "https://panini.com.br/images/wolverine.jpg",
    "url": "https://panini.com.br/a-vida-de-wolverine",
    "id": "AVWOL001"
  }
}
```

## ⚙️ Configuration Options

```typescript
interface HttpConfig {
  proxy?: {
    host: string;
    port: number;
    auth?: {
      username: string;
      password: string;
    };
  };
  timeout?: number;           // Request timeout in ms (default: 10000)
  headers?: Record<string, string>;  // Custom headers
  userAgent?: string;         // Custom user agent
}
```

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run only unit tests
npm test -- tests/unit

# Run only integration tests
npm test -- tests/integration
```

## 🔒 Error Types

| Error Type | Description | Status Code |
|------------|-------------|-------------|
| `InvalidUrlError` | Invalid or malformed URL | 400 |
| `ProductNotFoundError` | Product not found or page structure changed | 404 |
| `ProductScrapingError` | General scraping error | 500 |

## 📈 Performance

- **Average Response Time**: 1-3 seconds per product
- **Concurrent Requests**: Supports parallel scraping
- **Memory Usage**: ~50MB for typical usage
- **Rate Limiting**: Implement your own rate limiting as needed

## 🤝 Contributing

We welcome contributions! Please follow these guidelines to help us maintain a high-quality codebase.

### 📋 How to Contribute

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Make** your changes following our coding standards
4. **Add** tests for your changes
5. **Run** the test suite to ensure everything passes
6. **Commit** your changes (`git commit -m 'Add some amazing feature'`)
7. **Push** to the branch (`git push origin feature/amazing-feature`)
8. **Open** a Pull Request

### 🔍 Before Contributing

- Check if an issue already exists for your feature/bug
- Read through existing code to understand the architecture
- Ensure your changes follow Clean Architecture principles
- Make sure all tests pass and coverage remains above 80%

### 📝 Contribution Guidelines

#### Code Style
- Follow TypeScript best practices
- Use meaningful variable and function names
- Add JSDoc comments for public methods
- Keep functions small and focused (single responsibility)
- Use consistent formatting (run `npm run lint:fix`)

#### Testing
- Write unit tests for new functionality
- Add integration tests for complex features
- Ensure edge cases are covered
- Maintain or improve test coverage
- Use descriptive test names that explain the scenario

#### Documentation
- Update README.md if adding new features
- Add code comments for complex logic
- Include usage examples for new APIs

### 🐛 Reporting Bugs

When reporting bugs, please include:

- Clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (Node.js version, OS, etc.)
- Sample code or URL that demonstrates the issue

### 💡 Suggesting Features

For feature requests, please provide:

- Clear description of the feature
- Use case and motivation
- Possible implementation approach
- Examples of how it would be used

### 🧪 Running Tests Locally

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Development Setup

```bash
# Clone repository
git clone https://github.com/itsManeka/panini-scraper.git
cd panini-scraper

# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Build project
npm run build
```

### Code Quality

- **ESLint**: Code linting and style checking
- **TypeScript**: Static type checking
- **Jest**: Testing framework with coverage
- **Clean Architecture**: Organized codebase structure

## 🐛 Known Issues

- Some product pages may have different HTML structures
- Image URLs might be relative and need base URL resolution
- Pre-order detection depends on Portuguese text patterns

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Emanuel Ozorio Dias**
- GitHub: [@itsManeka](https://github.com/itsManeka)
- Email: [emanuel.ozoriodias@gmail.com](mailto:emanuel.ozoriodias@gmail.com)

## 🙏 Acknowledgments

- [Cheerio](https://cheerio.js.org/) for HTML parsing
- [Axios](https://axios-http.com/) for HTTP requests
- [Jest](https://jestjs.io/) for testing framework
- [TypeScript](https://www.typescriptlang.org/) for type safety

## 📞 Support

If you have questions or need help:

1. Check the [Issues](https://github.com/itsManeka/panini-scraper/issues) page
2. Create a new issue if your problem isn't already reported
3. For urgent matters, contact [emanuel.ozoriodias@gmail.com](mailto:emanuel.ozoriodias@gmail.com)

---

**⚠️ Disclaimer**: This tool is for educational and personal use only. Please respect Panini Brasil's robots.txt and terms of service. Use responsibly and consider implementing rate limiting to avoid overwhelming their servers.
