import { Product } from './product.entity';

/**
 * Repository interface for scraping product data
 * This interface defines the contract for data access in the domain layer
 */
export interface ProductRepository {
    /**
     * Scrapes product information from a given URL
     * @param url - The product page URL
     * @returns Promise that resolves to product information
     * @throws {Error} If the URL is invalid or scraping fails
     */
    scrapeProduct(url: string): Promise<Product>;
}

/**
 * Configuration options for HTTP requests
 */
export interface HttpConfig {
    /** Proxy configuration for HTTP requests */
    proxy?: {
        host: string;
        port: number;
        auth?: {
            username: string;
            password: string;
        };
    };

    /** Request timeout in milliseconds */
    timeout?: number;

    /** Custom headers for requests */
    headers?: Record<string, string>;

    /** User agent string */
    userAgent?: string;
}

/**
 * Error types for product scraping operations
 */
export class ProductScrapingError extends Error {
    constructor(
        message: string,
        public readonly url: string,
        public readonly statusCode?: number
    ) {
        super(message);
        this.name = 'ProductScrapingError';
    }
}

export class ProductNotFoundError extends ProductScrapingError {
    constructor(url: string) {
        super('Product not found or page structure has changed', url, 404);
        this.name = 'ProductNotFoundError';
    }
}

export class InvalidUrlError extends ProductScrapingError {
    constructor(url: string) {
        super('Invalid or malformed URL provided', url);
        this.name = 'InvalidUrlError';
    }
}