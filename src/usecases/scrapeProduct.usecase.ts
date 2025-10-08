import { Product, ProductRepository, InvalidUrlError } from '../domain';

/**
 * Use case for scraping product information
 * This class encapsulates the business logic for product scraping operations
 */
export class ScrapeProductUseCase {
    constructor(private readonly productRepository: ProductRepository) { }

    /**
     * Executes the product scraping use case
     * @param url - The product page URL to scrape
     * @returns Promise that resolves to product information
     * @throws {InvalidUrlError} If the URL is invalid
     * @throws {ProductScrapingError} If scraping fails
     * @throws {ProductNotFoundError} If product is not found
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
     * Normalizes the URL format
     * @param url - The URL to normalize
     * @returns The normalized URL
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
     * Validates if a URL is likely a Panini product URL
     * @param url - The URL to validate
     * @returns True if the URL appears to be a valid Panini product URL
     */
    static isValidPaniniUrl(url: string): boolean {
        if (!url || typeof url !== 'string') {
            return false;
        }

        const paniniUrlPattern = /^https?:\/\/(www\.)?panini\.com\.br\/[a-zA-Z0-9\-_]+/;
        return paniniUrlPattern.test(url);
    }
}