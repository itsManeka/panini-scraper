import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { HttpConfig } from '../domain/product.repository';

/**
 * HTTP client wrapper that handles requests with configurable options
 */
export class HttpClient {
    private readonly client: AxiosInstance;

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
     * Performs a GET request to the specified URL
     * @param url - The URL to fetch
     * @returns Promise that resolves to the response
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
     * Updates the HTTP configuration
     * @param config - New configuration options
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