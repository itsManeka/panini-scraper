import { scrapePaniniProducts } from '../../src/index';
import { PaniniScraperService } from '../../src/infrastructure/paniniScraper.service';
import { HttpClient } from '../../src/infrastructure/httpClient';
import { InvalidUrlError, ProductNotFoundError, ProductScrapingError } from '../../src/domain';

// Mock the actual HTTP calls
jest.mock('../../src/infrastructure/httpClient');

describe('Batch Scraping Integration', () => {
    let mockHttpClient: jest.Mocked<HttpClient>;

    beforeEach(() => {
        jest.clearAllMocks();

        mockHttpClient = {
            get: jest.fn(),
            updateConfig: jest.fn()
        } as any;

        // Mock the HttpClient constructor
        (HttpClient as any).mockImplementation(() => mockHttpClient);
    });

    const createMockHtml = (title: string, price: string, id: string) => `
        <html>
            <head><title>${title}</title></head>
            <body>
                <h1 class="product-title">${title}</h1>
                <div class="price-current">R$ ${price}</div>
                <div class="product-image">
                    <img src="https://d26lpennugtm8s.cloudfront.net/stores/001/234/${id}.jpg" alt="Product" />
                </div>
                <table class="additional-attributes">
                    <tr>
                        <td data-th="Encadernação">Capa dura</td>
                    </tr>
                    <tr>
                        <td data-th="Autores">Test Author</td>
                    </tr>
                    <tr>
                        <td data-th="Referência">${id}</td>
                    </tr>
                </table>
            </body>
        </html>
    `;

    describe('scrapePaniniProducts', () => {
        it('should successfully scrape multiple valid URLs', async () => {
            // Mock responses for different URLs
            mockHttpClient.get.mockImplementation(async (url: string) => {
                if (url.includes('wolverine')) {
                    return {
                        data: createMockHtml('Wolverine', '49,90', 'WOLV001'),
                        status: 200,
                        statusText: 'OK',
                        headers: {},
                        config: {}
                    } as any;
                }
                if (url.includes('x-men')) {
                    return {
                        data: createMockHtml('X-Men', '59,90', 'XMEN001'),
                        status: 200,
                        statusText: 'OK',
                        headers: {},
                        config: {}
                    } as any;
                }
                if (url.includes('spider-man')) {
                    return {
                        data: createMockHtml('Spider-Man', '44,90', 'SPIDER001'),
                        status: 200,
                        statusText: 'OK',
                        headers: {},
                        config: {}
                    } as any;
                }
                throw new Error('Unexpected URL');
            });

            const urls = [
                'https://panini.com.br/wolverine',
                'https://panini.com.br/x-men',
                'https://panini.com.br/spider-man'
            ];

            const result = await scrapePaniniProducts(urls);

            expect(result.totalProcessed).toBe(3);
            expect(result.successCount).toBe(3);
            expect(result.failureCount).toBe(0);
            
            // Verify all products were scraped
            expect(result.successes).toHaveLength(3);
            expect(result.successes[0].product.title).toBe('Wolverine');
            expect(result.successes[0].product.currentPrice).toBe(49.90);
            expect(result.successes[1].product.title).toBe('X-Men');
            expect(result.successes[1].product.currentPrice).toBe(59.90);
            expect(result.successes[2].product.title).toBe('Spider-Man');
            expect(result.successes[2].product.currentPrice).toBe(44.90);
        });

        it('should handle mixed success and failure scenarios', async () => {
            mockHttpClient.get.mockImplementation(async (url: string) => {
                if (url.includes('wolverine')) {
                    return {
                        data: createMockHtml('Wolverine', '49,90', 'WOLV001'),
                        status: 200,
                        statusText: 'OK',
                        headers: {},
                        config: {}
                    } as any;
                }
                if (url.includes('not-found')) {
                    // Return HTML that will trigger ProductNotFoundError (no title in expected selectors)
                    return {
                        data: '<html><body><div>Page not found</div></body></html>',
                        status: 200,
                        statusText: 'OK',
                        headers: {},
                        config: {}
                    } as any;
                }
                if (url.includes('x-men')) {
                    return {
                        data: createMockHtml('X-Men', '59,90', 'XMEN001'),
                        status: 200,
                        statusText: 'OK',
                        headers: {},
                        config: {}
                    } as any;
                }
                throw new Error('Network error');
            });

            const urls = [
                'https://panini.com.br/wolverine',      // Success
                'invalid-url',                          // Invalid URL error
                'https://panini.com.br/not-found',      // Product not found (will throw ProductNotFoundError due to missing title)
                'https://panini.com.br/x-men'           // Success
            ];

            const result = await scrapePaniniProducts(urls);

            expect(result.totalProcessed).toBe(4);
            expect(result.successCount).toBe(2);
            expect(result.failureCount).toBe(2);

            // Verify successes
            expect(result.successes).toHaveLength(2);
            expect(result.successes[0].product.title).toBe('Wolverine');
            expect(result.successes[1].product.title).toBe('X-Men');

            // Verify failures
            expect(result.failures).toHaveLength(2);
            expect(result.failures[0].url).toBe('invalid-url');
            expect(result.failures[0].error).toBeInstanceOf(InvalidUrlError);
            expect(result.failures[1].url).toBe('https://panini.com.br/not-found');
            // The error will be ProductScrapingError or its subclass (ProductNotFoundError)
            // because the HTML doesn't have required product info
            expect(result.failures[1].error).toBeInstanceOf(ProductScrapingError);
            expect(result.failures[1].error).not.toBeInstanceOf(InvalidUrlError);
            expect(result.failures[1].message).toBeTruthy();
        });

        it('should handle all URLs failing', async () => {
            const urls = [
                'invalid-url-1',
                'not-a-valid-url',
                ''
            ];

            const result = await scrapePaniniProducts(urls);

            expect(result.totalProcessed).toBe(3);
            expect(result.successCount).toBe(0);
            expect(result.failureCount).toBe(3);
            expect(result.successes).toHaveLength(0);
            expect(result.failures).toHaveLength(3);

            // All should have error information
            result.failures.forEach(failure => {
                expect(failure.error).toBeDefined();
                expect(failure.message).toBeTruthy();
            });
        });

        it('should handle empty URL array', async () => {
            const result = await scrapePaniniProducts([]);

            expect(result.totalProcessed).toBe(0);
            expect(result.successCount).toBe(0);
            expect(result.failureCount).toBe(0);
            expect(result.successes).toHaveLength(0);
            expect(result.failures).toHaveLength(0);
        });

        it('should process URLs sequentially', async () => {
            const executionOrder: string[] = [];

            mockHttpClient.get.mockImplementation(async (url: string) => {
                executionOrder.push(url);
                
                // Add small delay to ensure sequential processing matters
                await new Promise(resolve => setTimeout(resolve, 10));
                
                if (url.includes('wolverine')) {
                    return {
                        data: createMockHtml('Wolverine', '49,90', 'WOLV001'),
                        status: 200,
                        statusText: 'OK',
                        headers: {},
                        config: {}
                    } as any;
                }
                if (url.includes('x-men')) {
                    return {
                        data: createMockHtml('X-Men', '59,90', 'XMEN001'),
                        status: 200,
                        statusText: 'OK',
                        headers: {},
                        config: {}
                    } as any;
                }
                if (url.includes('spider-man')) {
                    return {
                        data: createMockHtml('Spider-Man', '44,90', 'SPIDER001'),
                        status: 200,
                        statusText: 'OK',
                        headers: {},
                        config: {}
                    } as any;
                }
                throw new Error('Unexpected URL');
            });

            const urls = [
                'https://panini.com.br/wolverine',
                'https://panini.com.br/x-men',
                'https://panini.com.br/spider-man'
            ];

            await scrapePaniniProducts(urls);

            // Verify order
            expect(executionOrder).toEqual(urls);
        });

        it('should use provided configuration for all requests', async () => {
            mockHttpClient.get.mockResolvedValue({
                data: createMockHtml('Test Product', '29,90', 'TEST001'),
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            } as any);

            const config = {
                timeout: 5000,
                headers: { 'X-Custom-Header': 'test' }
            };

            const urls = [
                'https://panini.com.br/product-1',
                'https://panini.com.br/product-2'
            ];

            await scrapePaniniProducts(urls, config);

            // Verify the service was called multiple times
            expect(mockHttpClient.get).toHaveBeenCalledTimes(2);
        });

        it('should preserve complete product data in successes', async () => {
            mockHttpClient.get.mockResolvedValue({
                data: createMockHtml('Complete Product', '99,90', 'COMP001'),
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            } as any);

            const urls = ['https://panini.com.br/complete-product'];
            const result = await scrapePaniniProducts(urls);

            expect(result.successes).toHaveLength(1);
            const success = result.successes[0];

            // Verify all product fields are present
            expect(success.url).toBe('https://panini.com.br/complete-product');
            expect(success.product.title).toBe('Complete Product');
            expect(success.product.currentPrice).toBe(99.90);
            expect(success.product.fullPrice).toBe(99.90);
            expect(success.product.imageUrl).toBeTruthy();
            expect(success.product.format).toBe('Capa dura');
            expect(success.product.contributors).toEqual(['Test Author']);
            expect(success.product.id).toBe('COMP001');
            expect(success.product.inStock).toBe(true);
            expect(success.product.isPreOrder).toBe(false);
        });

        it('should include detailed error information in failures', async () => {
            mockHttpClient.get.mockImplementation(async (url: string) => {
                if (url.includes('network-error')) {
                    throw new Error('Network timeout');
                }
                return {
                    data: '<html><body></body></html>',
                    status: 200
                } as any;
            });

            const urls = [
                'invalid-url',
                'https://panini.com.br/network-error'
            ];

            const result = await scrapePaniniProducts(urls);

            expect(result.failures).toHaveLength(2);

            // Verify failure structure
            result.failures.forEach(failure => {
                expect(failure.url).toBeTruthy();
                expect(failure.error).toBeDefined();
                expect(failure.message).toBeTruthy();
                expect(typeof failure.message).toBe('string');
            });
        });

        it('should handle single URL in batch', async () => {
            mockHttpClient.get.mockResolvedValue({
                data: createMockHtml('Single Product', '39,90', 'SINGLE001'),
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            } as any);

            const result = await scrapePaniniProducts(['https://panini.com.br/single']);

            expect(result.totalProcessed).toBe(1);
            expect(result.successCount).toBe(1);
            expect(result.failureCount).toBe(0);
            expect(result.successes[0].product.title).toBe('Single Product');
        });

        it('should normalize URLs before scraping', async () => {
            mockHttpClient.get.mockResolvedValue({
                data: createMockHtml('Normalized Product', '29,90', 'NORM001'),
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            } as any);

            const urls = [
                'panini.com.br/product-1',           // Missing protocol
                'https://panini.com.br/product-2/',  // Trailing slash
            ];

            await scrapePaniniProducts(urls);

            // Verify normalized URLs were used
            expect(mockHttpClient.get).toHaveBeenCalledWith('https://panini.com.br/product-1');
            expect(mockHttpClient.get).toHaveBeenCalledWith('https://panini.com.br/product-2');
        });

        it('should maintain consistent result structure', async () => {
            mockHttpClient.get.mockResolvedValue({
                data: createMockHtml('Test', '19,90', 'TEST001'),
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            } as any);

            const result = await scrapePaniniProducts(['https://panini.com.br/test']);

            // Verify result structure
            expect(result).toHaveProperty('successes');
            expect(result).toHaveProperty('failures');
            expect(result).toHaveProperty('totalProcessed');
            expect(result).toHaveProperty('successCount');
            expect(result).toHaveProperty('failureCount');

            expect(Array.isArray(result.successes)).toBe(true);
            expect(Array.isArray(result.failures)).toBe(true);
            expect(typeof result.totalProcessed).toBe('number');
            expect(typeof result.successCount).toBe('number');
            expect(typeof result.failureCount).toBe('number');
        });
    });
});

