import { Product } from './product.entity';

/**
 * Repository interface for scraping product data.
 * 
 * This interface defines the contract for data access in the domain layer,
 * following the Repository pattern from Domain-Driven Design. It abstracts
 * the details of how product data is retrieved, allowing the domain layer
 * to remain independent of infrastructure concerns.
 * 
 * Implementations of this interface should handle all the technical details
 * of web scraping, HTTP requests, and HTML parsing.
 */
export interface ProductRepository {
    /**
     * Scrapes and retrieves product information from a given URL.
     * 
     * @param url - The full URL of the product page to scrape
     * @returns A promise that resolves to the scraped product information
     * @throws {InvalidUrlError} When the URL is invalid or not from the expected domain
     * @throws {ProductNotFoundError} When the product cannot be found
     * @throws {ProductScrapingError} When scraping fails due to network or parsing errors
     */
    scrapeProduct(url: string): Promise<Product>;
}

/**
 * Configuration options for HTTP requests.
 * 
 * This interface defines the available options for configuring the HTTP client
 * used for scraping operations. All properties are optional, allowing flexible
 * configuration based on specific needs.
 */
export interface HttpConfig {
    /** 
     * Proxy configuration for routing HTTP requests through a proxy server.
     * Useful for bypassing regional restrictions or load balancing.
     */
    proxy?: {
        /** The proxy server hostname or IP address */
        host: string;
        /** The proxy server port number */
        port: number;
        /** Optional authentication credentials for the proxy server */
        auth?: {
            /** Proxy authentication username */
            username: string;
            /** Proxy authentication password */
            password: string;
        };
    };

    /** Request timeout in milliseconds (default: 10000ms/10s) */
    timeout?: number;

    /** Custom HTTP headers to include in requests */
    headers?: Record<string, string>;

    /** 
     * Custom User-Agent string to use for requests.
     * If not provided, a realistic browser User-Agent will be used.
     */
    userAgent?: string;
}

/**
 * Base error class for product scraping operations.
 * 
 * This error extends the standard Error class and adds context-specific
 * information about scraping failures, including the URL being scraped
 * and optional HTTP status codes.
 */
export class ProductScrapingError extends Error {
    /**
     * Creates a new ProductScrapingError.
     * 
     * @param message - Human-readable error description
     * @param url - The URL that was being scraped when the error occurred
     * @param statusCode - Optional HTTP status code associated with the error
     */
    constructor(
        message: string,
        public readonly url: string,
        public readonly statusCode?: number
    ) {
        super(message);
        this.name = 'ProductScrapingError';
    }
}

/**
 * Error thrown when a product cannot be found at the specified URL.
 * 
 * This typically occurs when:
 * - The product no longer exists
 * - The URL is incorrect
 * - The page structure has changed significantly
 */
export class ProductNotFoundError extends ProductScrapingError {
    /**
     * Creates a new ProductNotFoundError.
     * 
     * @param url - The URL where the product was not found
     */
    constructor(url: string) {
        super('Product not found or page structure has changed', url, 404);
        this.name = 'ProductNotFoundError';
    }
}

/**
 * Error thrown when an invalid URL is provided.
 * 
 * This occurs when:
 * - The URL format is malformed
 * - The URL is not from the expected domain (panini.com.br)
 * - The URL is empty or null
 */
export class InvalidUrlError extends ProductScrapingError {
    /**
     * Creates a new InvalidUrlError.
     * 
     * @param url - The invalid URL that was provided
     */
    constructor(url: string) {
        super('Invalid or malformed URL provided', url);
        this.name = 'InvalidUrlError';
    }
}
