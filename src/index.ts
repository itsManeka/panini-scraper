/**
 * Panini Scraper - A TypeScript library for scraping Panini Brasil product information
 * 
 * This library provides a clean, type-safe interface for extracting product data
 * from Panini Brasil's website. Built with Clean Architecture principles, it offers
 * flexibility through dependency injection while maintaining simplicity for common use cases.
 * 
 * @packageDocumentation
 */

// Main library exports - Domain layer
export * from './domain';

// Main library exports - Use cases layer
export * from './usecases';

// Main library exports - Infrastructure layer
export * from './infrastructure';

// Convenience functions for direct usage
import { ScrapeProductUseCase } from './usecases';
import { PaniniScraperService } from './infrastructure';
import { HttpConfig, Product, BatchScrapeResult } from './domain';

/**
 * Scrapes product information from a Panini Brasil product page.
 * 
 * This is the main entry point for simple, one-off scraping operations.
 * It creates a new scraper instance for each call with the provided configuration.
 * 
 * @param url - The full URL of the Panini product page to scrape
 * @param config - Optional HTTP configuration for customizing request behavior
 * @returns A promise that resolves to the scraped product information
 * 
 * @throws {InvalidUrlError} When the URL is invalid or not a Panini Brasil URL
 * @throws {ProductNotFoundError} When the product cannot be found or page structure has changed
 * @throws {ProductScrapingError} When scraping fails due to network or parsing errors
 * 
 * @example
 * Basic usage:
 * ```typescript
 * import { scrapePaniniProduct } from 'panini-scraper';
 * 
 * const product = await scrapePaniniProduct('https://panini.com.br/a-vida-de-wolverine');
 * console.log(`${product.title}: R$ ${product.currentPrice}`);
 * ```
 * 
 * @example
 * With configuration:
 * ```typescript
 * import { scrapePaniniProduct } from 'panini-scraper';
 * 
 * const product = await scrapePaniniProduct(
 *   'https://panini.com.br/wolverine-2025-05',
 *   { timeout: 15000 }
 * );
 * ```
 * 
 * @example
 * With error handling:
 * ```typescript
 * import { scrapePaniniProduct, InvalidUrlError } from 'panini-scraper';
 * 
 * try {
 *   const product = await scrapePaniniProduct(url);
 *   console.log(product);
 * } catch (error) {
 *   if (error instanceof InvalidUrlError) {
 *     console.error('Invalid URL:', error.url);
 *   } else {
 *     console.error('Scraping failed:', error.message);
 *   }
 * }
 * ```
 */
export async function scrapePaniniProduct(url: string, config?: HttpConfig): Promise<Product> {
    const scraperService = new PaniniScraperService(config);
    const useCase = new ScrapeProductUseCase(scraperService);

    return await useCase.execute(url);
}

/**
 * Scrapes product information from multiple Panini Brasil product pages.
 * 
 * This function processes multiple URLs sequentially, returning both successful
 * and failed results. Unlike the single URL version, this never throws errors
 * for individual URL failures, instead returning them categorized in the result.
 * 
 * @param urls - Array of product page URLs to scrape
 * @param config - Optional HTTP configuration for customizing request behavior
 * @returns A promise that resolves to batch scraping results with successes and failures
 * 
 * @example
 * Basic batch usage:
 * ```typescript
 * import { scrapePaniniProducts } from 'panini-scraper';
 * 
 * const result = await scrapePaniniProducts([
 *   'https://panini.com.br/wolverine-05',
 *   'https://panini.com.br/x-men-blue',
 *   'https://panini.com.br/spider-man'
 * ]);
 * 
 * console.log(`Successfully scraped: ${result.successCount}/${result.totalProcessed}`);
 * 
 * result.successes.forEach(({ url, product }) => {
 *   console.log(`${product.title}: R$ ${product.currentPrice}`);
 * });
 * 
 * result.failures.forEach(({ url, message }) => {
 *   console.error(`Failed to scrape ${url}: ${message}`);
 * });
 * ```
 * 
 * @example
 * With configuration:
 * ```typescript
 * import { scrapePaniniProducts } from 'panini-scraper';
 * 
 * const result = await scrapePaniniProducts(
 *   ['https://panini.com.br/wolverine-05', 'https://panini.com.br/x-men-blue'],
 *   { timeout: 15000 }
 * );
 * ```
 */
export async function scrapePaniniProducts(urls: string[], config?: HttpConfig): Promise<BatchScrapeResult> {
    const scraperService = new PaniniScraperService(config);
    const useCase = new ScrapeProductUseCase(scraperService);

    return await useCase.executeMany(urls);
}

/**
 * Creates a reusable scraper function with pre-configured settings.
 * 
 * This factory function is useful when you need to scrape multiple products
 * with the same configuration. It creates a single instance of the scraper service
 * and use case, avoiding the overhead of recreating them for each scrape operation.
 * 
 * @param config - Optional HTTP configuration that will be used for all scraping operations
 * @returns A configured function that accepts a URL and returns scraped product data
 * 
 * @example
 * Scraping multiple products efficiently:
 * ```typescript
 * import { createPaniniScraper } from 'panini-scraper';
 * 
 * const scraper = createPaniniScraper({ timeout: 5000 });
 * 
 * // Reuse the same scraper instance for multiple products
 * const products = await Promise.all([
 *   scraper('https://panini.com.br/wolverine-2025-05'),
 *   scraper('https://panini.com.br/a-fabulosa-x-force'),
 *   scraper('https://panini.com.br/batman-dark-knight')
 * ]);
 * 
 * products.forEach(product => {
 *   console.log(`${product.title}: R$ ${product.currentPrice}`);
 * });
 * ```
 * 
 * @example
 * With proxy configuration:
 * ```typescript
 * import { createPaniniScraper } from 'panini-scraper';
 * 
 * const scraper = createPaniniScraper({
 *   timeout: 10000,
 *   proxy: {
 *     host: 'proxy.example.com',
 *     port: 8080,
 *     auth: {
 *       username: 'user',
 *       password: 'pass'
 *     }
 *   }
 * });
 * 
 * const product = await scraper('https://panini.com.br/spider-man');
 * ```
 */
export function createPaniniScraper(config?: HttpConfig): (url: string) => Promise<Product> {
    const scraperService = new PaniniScraperService(config);
    const useCase = new ScrapeProductUseCase(scraperService);

    return async (url: string) => await useCase.execute(url);
}
