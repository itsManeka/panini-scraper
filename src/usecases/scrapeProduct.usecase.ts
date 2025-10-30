import { Product, ProductRepository, InvalidUrlError, BatchScrapeResult, ScrapedProduct, FailedProduct, ProductScrapingError } from '../domain';

/**
 * Use case for scraping product information from Panini Brasil.
 * 
 * This class implements the Use Case layer in Clean Architecture, encapsulating
 * the application-specific business logic for scraping products. It coordinates
 * between the domain layer (entities, interfaces) and the infrastructure layer
 * (actual scraping implementation).
 * 
 * The use case is responsible for:
 * - Validating input (URL format)
 * - Normalizing URLs
 * - Delegating to the repository for actual data retrieval
 * - Providing a clean, high-level interface for the application
 * 
 * @example
 * ```typescript
 * const repository = new PaniniScraperService();
 * const useCase = new ScrapeProductUseCase(repository);
 * 
 * const product = await useCase.execute('https://panini.com.br/wolverine-05');
 * console.log(product.title);
 * ```
 */
export class ScrapeProductUseCase {
    /**
     * Creates a new ScrapeProductUseCase instance.
     * 
     * @param productRepository - The repository implementation used for data access
     */
    constructor(private readonly productRepository: ProductRepository) { }

    /**
     * Executes the product scraping use case.
     * 
     * This method orchestrates the scraping process by:
     * 1. Validating the input URL
     * 2. Normalizing the URL format
     * 3. Delegating to the repository for actual scraping
     * 
     * @param url - The product page URL to scrape
     * @returns A promise that resolves to the scraped product information
     * @throws {InvalidUrlError} When the URL is invalid, empty, or malformed
     * @throws {ProductScrapingError} When scraping fails due to network or parsing errors
     * @throws {ProductNotFoundError} When the product is not found
     * 
     * @example
     * ```typescript
     * try {
     *   const product = await useCase.execute('https://panini.com.br/wolverine-05');
     *   console.log(`Found: ${product.title}`);
     * } catch (error) {
     *   if (error instanceof InvalidUrlError) {
     *     console.error('Invalid URL provided');
     *   }
     * }
     * ```
     */
    async execute(url: string): Promise<Product> {
        // Validate input
        if (!url || typeof url !== 'string' || url.trim().length === 0) {
            throw new InvalidUrlError(url || '');
        }

        // Normalize URL (remove trailing slashes, ensure proper format)
        const normalizedUrl = this.normalizeUrl(url.trim());

        // Delegate to repository for actual scraping
        return await this.productRepository.scrapeProduct(normalizedUrl);
    }

    /**
     * Executes batch product scraping for multiple URLs.
     * 
     * This method processes multiple URLs sequentially, collecting both successful
     * and failed results. It never throws errors for individual URL failures,
     * instead categorizing them in the result object.
     * 
     * @param urls - Array of product page URLs to scrape
     * @returns A promise that resolves to batch scraping results containing successes and failures
     * 
     * @example
     * ```typescript
     * const result = await useCase.executeMany([
     *   'https://panini.com.br/wolverine-05',
     *   'https://panini.com.br/x-men-blue',
     *   'https://invalid-url'
     * ]);
     * 
     * console.log(`Successful: ${result.successCount}`);
     * console.log(`Failed: ${result.failureCount}`);
     * 
     * result.successes.forEach(({ url, product }) => {
     *   console.log(`${url}: ${product.title}`);
     * });
     * 
     * result.failures.forEach(({ url, message }) => {
     *   console.error(`${url}: ${message}`);
     * });
     * ```
     */
    async executeMany(urls: string[]): Promise<BatchScrapeResult> {
        const successes: ScrapedProduct[] = [];
        const failures: FailedProduct[] = [];

        // Process each URL sequentially
        for (const url of urls) {
            try {
                const product = await this.execute(url);
                successes.push({ url, product });
            } catch (error) {
                // Categorize the error and add to failures
                const scrapingError = error instanceof ProductScrapingError
                    ? error
                    : new ProductScrapingError(
                        error instanceof Error ? error.message : 'Unknown error',
                        url
                    );

                failures.push({
                    url,
                    error: scrapingError,
                    message: scrapingError.message
                });
            }
        }

        return {
            successes,
            failures,
            totalProcessed: urls.length,
            successCount: successes.length,
            failureCount: failures.length
        };
    }

    /**
     * Normalizes a URL to a standard format.
     * 
     * This method performs the following normalization:
     * - Removes trailing slashes
     * - Ensures the URL has a protocol (adds https:// if missing)
     * 
     * @param url - The URL to normalize
     * @returns The normalized URL with protocol and without trailing slash
     * @private
     * 
     * @example
     * ```typescript
     * normalizeUrl('panini.com.br/wolverine/') 
     * // Returns: 'https://panini.com.br/wolverine'
     * ```
     */
    private normalizeUrl(url: string): string {
        // Remove trailing slash
        let normalized = url.replace(/\/$/, '');

        // Ensure https protocol
        if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
            normalized = `https://${normalized}`;
        }

        return normalized;
    }

    /**
     * Validates if a URL is likely a valid Panini Brasil product URL.
     * 
     * This static utility method checks if a URL matches the expected pattern
     * for Panini Brasil product pages. It performs basic format validation
     * without making any network requests.
     * 
     * @param url - The URL to validate
     * @returns `true` if the URL appears to be a valid Panini product URL, `false` otherwise
     * 
     * @example
     * ```typescript
     * ScrapeProductUseCase.isValidPaniniUrl('https://panini.com.br/wolverine-05')
     * // Returns: true
     * 
     * ScrapeProductUseCase.isValidPaniniUrl('https://example.com/product')
     * // Returns: false
     * ```
     */
    static isValidPaniniUrl(url: string): boolean {
        if (!url || typeof url !== 'string') {
            return false;
        }

        const paniniUrlPattern = /^https?:\/\/(www\.)?panini\.com\.br\/[a-zA-Z0-9\-_]+/;
        return paniniUrlPattern.test(url);
    }
}
