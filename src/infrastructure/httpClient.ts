import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { HttpConfig } from '../domain/product.repository';

/**
 * HTTP client wrapper that provides a configurable interface for making HTTP requests.
 * 
 * This class encapsulates Axios functionality, providing a clean interface for HTTP operations
 * with support for custom headers, timeouts, and proxy configuration. It follows the
 * Infrastructure layer pattern in Clean Architecture, isolating external HTTP concerns.
 * 
 * @example
 * Basic usage:
 * ```typescript
 * const client = new HttpClient({ timeout: 5000 });
 * const response = await client.get('https://example.com');
 * ```
 * 
 * @example
 * With proxy configuration:
 * ```typescript
 * const client = new HttpClient({
 *   timeout: 10000,
 *   proxy: {
 *     host: 'proxy.example.com',
 *     port: 8080,
 *     auth: { username: 'user', password: 'pass' }
 *   }
 * });
 * ```
 */
export class HttpClient {
    /** Internal Axios instance used for making HTTP requests */
    private readonly client: AxiosInstance;

    /**
     * Creates a new HttpClient instance with the specified configuration.
     * 
     * Initializes an Axios instance with browser-like headers to avoid detection
     * as a bot. The default timeout is 15 seconds, and the User-Agent mimics
     * a modern Chrome browser.
     * 
     * @param config - Optional HTTP configuration options
     */
    constructor(config?: HttpConfig) {
        const axiosConfig: AxiosRequestConfig = {
            timeout: config?.timeout || 15000,
            headers: {
                'User-Agent': config?.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Cache-Control': 'max-age=0',
                ...config?.headers
            }
        };

        if (config?.proxy) {
            axiosConfig.proxy = {
                host: config.proxy.host,
                port: config.proxy.port,
                auth: config.proxy.auth
            };
        }

        this.client = axios.create(axiosConfig);
    }

    /**
     * Performs an HTTP GET request to the specified URL.
     * 
     * This method wraps Axios's GET functionality, providing consistent error handling
     * by transforming Axios-specific errors into standard Error objects with descriptive messages.
     * 
     * @param url - The full URL to fetch
     * @returns A promise that resolves to the Axios response containing the HTML string
     * @throws {Error} When the HTTP request fails, with details about the failure reason and status code
     * 
     * @example
     * ```typescript
     * const client = new HttpClient();
     * const response = await client.get('https://panini.com.br/product');
     * console.log(response.data); // HTML content
     * ```
     */
    async get(url: string): Promise<AxiosResponse<string>> {
        try {
            return await this.client.get<string>(url);
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as any;
                const message = axiosError.message;
                const status = axiosError.response?.status || 'unknown';
                throw new Error(`HTTP request failed: ${message} (${status})`);
            }
            throw error;
        }
    }

    /**
     * Updates the HTTP client configuration dynamically.
     * 
     * This method allows modifying the client's configuration after instantiation,
     * which is useful for changing settings like timeout or headers without creating
     * a new client instance. Only the provided configuration options are updated;
     * existing settings remain unchanged.
     * 
     * @param config - Configuration options to update (only provided options are changed)
     * 
     * @example
     * ```typescript
     * const client = new HttpClient({ timeout: 5000 });
     * 
     * // Later, increase timeout without recreating the client
     * client.updateConfig({ timeout: 10000 });
     * 
     * // Add custom headers
     * client.updateConfig({ 
     *   headers: { 'X-Custom-Header': 'value' } 
     * });
     * ```
     */
    updateConfig(config: HttpConfig): void {
        if (config.timeout) {
            this.client.defaults.timeout = config.timeout;
        }

        if (config.headers) {
            this.client.defaults.headers = {
                ...this.client.defaults.headers,
                ...config.headers
            };
        }

        if (config.userAgent) {
            this.client.defaults.headers['User-Agent'] = config.userAgent;
        }
    }
}
