# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2024-10-24

### Changed - **Breaking Changes**

- **Transformed from API/CLI to pure library**: The package is now exclusively a TypeScript library for programmatic use
- **Removed Express dependency**: API server functionality has been completely removed
- **Removed CLI functionality**: Command-line interface is no longer available
- **Removed `bin` entry point**: No longer installable as a global command
- **Updated package description**: Now accurately reflects library-only usage

### Added

- **Enhanced JSDoc documentation** across all modules:
  - Comprehensive examples for all public APIs
  - Detailed parameter descriptions
  - Thorough error documentation
  - Usage examples in all classes and functions
- **ARCHITECTURE.md**: Comprehensive architecture documentation covering:
  - Clean Architecture principles
  - SOLID principles application
  - Design patterns used
  - Best practices implemented
  - Layer responsibilities and dependencies
- **Improved type definitions** with better documentation
- **Package keywords updated** to reflect library nature

### Removed

- `src/server.ts` - CLI and server entry point
- `src/interfaces/api.controller.ts` - Express controller
- `src/interfaces/api.routes.ts` - Express routes
- `tests/unit/api.controller.test.ts` - API controller tests
- Express and @types/express dependencies
- ts-node-dev dependency (no longer needed)
- `start` and `dev` scripts from package.json
- `bin` configuration from package.json

### Improved

- **Documentation Quality**: All code now has comprehensive JSDoc comments
- **README.md**: Completely rewritten for library usage only
  - Removed API server sections
  - Removed CLI usage sections
  - Enhanced programmatic usage examples
  - Better quick start guide
  - Improved error handling examples
- **Test Coverage**: Maintained 95%+ coverage after refactoring
  - 100 tests passing
  - All tests updated to reflect new structure
  - Removed API-related tests

### Technical Improvements

- **Cleaner exports** in `src/index.ts` with better documentation
- **Simplified package.json** without server-related scripts
- **Better separation of concerns** focusing on library functionality
- **Reduced package size** by removing unused dependencies
- **Updated Jest configuration** to reflect new structure

### Migration Guide

#### For API Users (v1.0.x → v1.1.0)

The API server functionality has been removed. You have two options:

1. **Create your own API wrapper**:
```typescript
import express from 'express';
import { scrapePaniniProduct, InvalidUrlError } from 'panini-scraper';

const app = express();
app.use(express.json());

app.post('/api/scrape', async (req, res) => {
  try {
    const { url } = req.body;
    const product = await scrapePaniniProduct(url);
    res.json({ success: true, data: product });
  } catch (error) {
    if (error instanceof InvalidUrlError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Scraping failed' });
    }
  }
});

app.listen(3000);
```

2. **Use the library directly** in your Node.js application:
```typescript
import { scrapePaniniProduct } from 'panini-scraper';

const product = await scrapePaniniProduct('https://panini.com.br/product');
console.log(product);
```

#### For CLI Users (v1.0.x → v1.1.0)

The CLI has been removed. Use the library programmatically:

**Before (CLI)**:
```bash
panini-scraper scrape https://panini.com.br/product
```

**After (Node.js script)**:
```typescript
// scrape.ts
import { scrapePaniniProduct } from 'panini-scraper';

async function main() {
  const url = process.argv[2];
  const product = await scrapePaniniProduct(url);
  console.log(JSON.stringify(product, null, 2));
}

main();
```

```bash
npx ts-node scrape.ts https://panini.com.br/product
```

#### For Library Users (v1.0.x → v1.1.0)

**No breaking changes** - the programmatic API remains the same:
```typescript
// Still works exactly the same
import { scrapePaniniProduct, createPaniniScraper } from 'panini-scraper';

const product = await scrapePaniniProduct(url);
```

## [1.0.3] - Previous Release

### Features
- API server with Express
- CLI tool for command-line usage
- Library functionality
- Full web scraping capabilities

---

## Upgrade Notes

### Why these changes?

The package has been refocused as a **library-first solution**, removing the API and CLI functionality to:

1. **Simplify maintenance**: Focus on core scraping functionality
2. **Reduce dependencies**: Smaller package size, fewer security concerns
3. **Better flexibility**: Users can build their own API/CLI as needed
4. **Clearer purpose**: Pure library with single responsibility
5. **Easier testing**: No server-related test complexity

### What stays the same?

- ✅ All core scraping functionality
- ✅ TypeScript support
- ✅ Clean Architecture structure
- ✅ High test coverage (95%+)
- ✅ Comprehensive error handling
- ✅ Configuration options
- ✅ MIT License

### What's better?

- ✨ Comprehensive JSDoc documentation
- ✨ Detailed architecture documentation
- ✨ Better code examples
- ✨ Smaller package size
- ✨ Fewer dependencies
- ✨ Clearer focus and purpose

