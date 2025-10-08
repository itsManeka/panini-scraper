// Main library exports
export * from './domain';
export * from './usecases';
export * from './infrastructure';
export * from './interfaces';

// Convenience function for direct usage
import { ScrapeProductUseCase } from './usecases';
import { PaniniScraperService } from './infrastructure';
import { HttpConfig, Product } from './domain';

/**
 * Simple function to scrape a Panini product
 * This is the main entry point for programmatic usage
 * 
 * @param url - The Panini product URL to scrape
 * @param config - Optional HTTP configuration
 * @returns Promise that resolves to product information
 * 
 * @example
 * ```typescript
 * import { scrapePaniniProduct } from 'panini-scraper';
 * 
 * const product = await scrapePaniniProduct('https://panini.com.br/a-vida-de-wolverine');
 * console.log(product);
 * ```
 */
export async function scrapePaniniProduct(url: string, config?: HttpConfig): Promise<Product> {
    const scraperService = new PaniniScraperService(config);
    const useCase = new ScrapeProductUseCase(scraperService);

    return await useCase.execute(url);
}

/**
 * Creates a reusable scraper instance with configuration
 * Useful when you need to scrape multiple products with the same configuration
 * 
 * @param config - Optional HTTP configuration
 * @returns Configured scraper function
 * 
 * @example
 * ```typescript
 * import { createPaniniScraper } from 'panini-scraper';
 * 
 * const scraper = createPaniniScraper({ timeout: 5000 });
 * 
 * const product1 = await scraper('https://panini.com.br/wolverine-2025-05');
 * const product2 = await scraper('https://panini.com.br/a-fabulosa-x-force');
 * ```
 */
export function createPaniniScraper(config?: HttpConfig): (url: string) => Promise<Product> {
    const scraperService = new PaniniScraperService(config);
    const useCase = new ScrapeProductUseCase(scraperService);

    return async (url: string) => await useCase.execute(url);
}