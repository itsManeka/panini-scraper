import { Product, ProductRepository, InvalidUrlError } from '../domain';

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
