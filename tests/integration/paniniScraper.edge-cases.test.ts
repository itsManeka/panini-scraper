import { PaniniScraperService } from '../../src/infrastructure/paniniScraper.service';
import { HttpClient } from '../../src/infrastructure/httpClient';
import { ProductNotFoundError, InvalidUrlError, ProductScrapingError } from '../../src/domain/product.repository';

// Mock the actual HTTP calls
jest.mock('../../src/infrastructure/httpClient');

describe('PaniniScraperService Edge Cases', () => {
    let scraperService: PaniniScraperService;
    let mockHttpClient: jest.Mocked<HttpClient>;

    beforeEach(() => {
        jest.clearAllMocks();
        scraperService = new PaniniScraperService();
        mockHttpClient = {
            get: jest.fn(),
            updateConfig: jest.fn()
        } as any;
        (scraperService as any).httpClient = mockHttpClient;
    });

    describe('URL validation edge cases', () => {
        it('should throw InvalidUrlError for null URL', async () => {
            await expect(scraperService.scrapeProduct(null as any)).rejects.toThrow(InvalidUrlError);
        });

        it('should throw InvalidUrlError for undefined URL', async () => {
            await expect(scraperService.scrapeProduct(undefined as any)).rejects.toThrow(InvalidUrlError);
        });

        it('should throw InvalidUrlError for empty string', async () => {
            await expect(scraperService.scrapeProduct('')).rejects.toThrow(InvalidUrlError);
        });

        it('should throw InvalidUrlError for non-string URL', async () => {
            await expect(scraperService.scrapeProduct(123 as any)).rejects.toThrow(InvalidUrlError);
        });

        it('should throw InvalidUrlError for non-Panini domain', async () => {
            await expect(scraperService.scrapeProduct('https://example.com/product')).rejects.toThrow(InvalidUrlError);
        });

        it('should handle HTTP URL (non-HTTPS)', async () => {
            const mockHtml = `
                <html>
                    <body>
                        <h1>Test Product</h1>
                        <div class="price">R$ 10,00</div>
                        <img src="/test.jpg" />
                    </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

            const result = await scraperService.scrapeProduct('http://panini.com.br/test-product');
            expect(result.title).toBe('Test Product');
        });
    });

    describe('Price extraction edge cases', () => {
        it('should handle prices with multiple decimal separators', async () => {
            const mockHtml = `
                <html>
                    <body>
                        <h1>Complex Price Product</h1>
                        <div class="old-price">R$ 1.234,56</div>
                        <div class="price-current">R$ 999,99</div>
                        <img src="/test.jpg" />
                    </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/complex-price');
            expect(result.fullPrice).toBe(1234.56);
            expect(result.currentPrice).toBe(999.99);
        });

        it('should handle price with currency symbols and spaces', async () => {
            const mockHtml = `
                <html>
                    <body>
                        <h1>Currency Test</h1>
                        <div class="price">R$ 45,67 BRL</div>
                        <img src="/test.jpg" />
                    </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/currency-test');
            expect(result.currentPrice).toBe(45.67);
            expect(result.fullPrice).toBe(45.67);
        });

        it('should handle price text without numbers', async () => {
            const mockHtml = `
                <html>
                    <body>
                        <h1>No Price Product</h1>
                        <div class="price">Preço sob consulta</div>
                        <img src="/test.jpg" />
                    </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

            await expect(scraperService.scrapeProduct('https://panini.com.br/no-price'))
                .rejects.toThrow(ProductScrapingError);
        });

        it('should handle empty price text', async () => {
            const mockHtml = `
                <html>
                    <body>
                        <h1>Empty Price Product</h1>
                        <div class="price"></div>
                        <img src="/test.jpg" />
                    </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

            await expect(scraperService.scrapeProduct('https://panini.com.br/empty-price'))
                .rejects.toThrow(ProductScrapingError);
        });
    });

    describe('Image extraction edge cases', () => {
        it('should handle image with query parameters', async () => {
            const mockHtml = `
                <html>
                    <body>
                        <h1>Query Param Image</h1>
                        <div class="price">R$ 25,00</div>
                        <img src="/images/product.jpg?v=123&size=large" />
                    </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/query-image');
            expect(result.imageUrl).toBe('https://panini.com.br/images/product.jpg?v=123&size=large');
        });

        it('should handle image with data-lazy attribute', async () => {
            const mockHtml = `
                <html>
                    <body>
                        <h1>Lazy Image</h1>
                        <div class="price">R$ 25,00</div>
                        <img data-lazy="/images/lazy.jpg" src="/placeholder.jpg" />
                    </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/lazy-image');
            expect(result.imageUrl).toBe('https://panini.com.br/images/lazy.jpg');
        });

        it('should handle multiple images and choose the first valid one', async () => {
            const mockHtml = `
                <html>
                    <body>
                        <h1>Multiple Images</h1>
                        <div class="price">R$ 25,00</div>
                        <img src="/placeholder.jpg" />
                        <img src="/images/logo.png" />
                        <img src="/images/product.webp" />
                    </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/multiple-images');
            expect(result.imageUrl).toBe('https://panini.com.br/images/product.webp');
        });

        it('should handle no valid images found', async () => {
            const mockHtml = `
                <html>
                    <body>
                        <h1>No Images</h1>
                        <div class="price">R$ 25,00</div>
                    </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/no-images');
            expect(result.imageUrl).toBe('');
        });

        it('should prioritize CloudFront images over local images', async () => {
            const mockHtml = `
                <html>
                    <body>
                        <h1>CloudFront Priority</h1>
                        <div class="price">R$ 25,00</div>
                        <img src="/local/image.jpg" />
                        <img src="https://d123abc.cloudfront.net/product.jpg" />
                    </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/cloudfront-priority');
            expect(result.imageUrl).toBe('https://d123abc.cloudfront.net/product.jpg');
        });
    });

    describe('Pre-order detection edge cases', () => {
        it('should detect pre-order with different text variations', async () => {
            const testCases = [
                'PRÉ-VENDA',
                'pre-order',
                'Pré-lançamento',
                'PRE-ORDER',
                'pré-venda disponível'
            ];

            for (const preOrderText of testCases) {
                const mockHtml = `
                    <html>
                        <body>
                            <h1>Pre-order Test</h1>
                            <div class="price">R$ 25,00</div>
                            <div class="product-status">${preOrderText}</div>
                            <img src="/test.jpg" />
                        </body>
                    </html>
                `;

                mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

                const result = await scraperService.scrapeProduct('https://panini.com.br/preorder-test');
                expect(result.isPreOrder).toBe(true);
            }
        });

        it('should not detect pre-order when element is hidden', async () => {
            const mockHtml = `
                <html>
                    <body>
                        <h1>Hidden Pre-order</h1>
                        <div class="price">R$ 25,00</div>
                        <div class="infobase-label-presale" style="display: none">Pré-venda</div>
                        <img src="/test.jpg" />
                    </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/hidden-preorder');
            expect(result.isPreOrder).toBe(false);
        });

        it('should detect pre-order in product area fallback', async () => {
            const mockHtml = `
                <html>
                    <body>
                        <h1>Fallback Pre-order</h1>
                        <div class="price">R$ 25,00</div>
                        <div class="product-main">
                            Este produto está em pré-venda e será enviado em breve.
                        </div>
                        <img src="/test.jpg" />
                    </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/fallback-preorder');
            expect(result.isPreOrder).toBe(true);
        });
    });

    describe('Product ID extraction edge cases', () => {
        it('should extract ID from URL when no other ID found', async () => {
            const mockHtml = `
                <html>
                    <body>
                        <h1>URL ID Test</h1>
                        <div class="price">R$ 25,00</div>
                        <img src="/test.jpg" />
                    </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/product-xyz-123');
            expect(result.id).toBe('product-xyz-123');
        });

        it('should extract ID from URL with query parameters', async () => {
            const mockHtml = `
                <html>
                    <body>
                        <h1>Query URL ID</h1>
                        <div class="price">R$ 25,00</div>
                        <img src="/test.jpg" />
                    </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/product-abc?ref=123&utm=test');
            expect(result.id).toBe('product-abc');
        });

        it('should extract ID from reference text in HTML', async () => {
            const mockHtml = `
                <html>
                    <body>
                        <h1>Reference ID Test</h1>
                        <div class="price">R$ 25,00</div>
                        <div class="product-details">
                            <p>Referência: ABC123XYZ</p>
                        </div>
                        <img src="/test.jpg" />
                    </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/reference-test');
            expect(result.id).toBe('ABC123XYZ');
        });

        it('should generate timestamp ID when no ID patterns found', async () => {
            const mockHtml = `
                <html>
                    <body>
                        <h1>No ID Test</h1>
                        <div class="price">R$ 25,00</div>
                        <img src="/test.jpg" />
                    </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

            // Mock Date.now to make test deterministic
            const mockDate = 1640995200000; // 2022-01-01T00:00:00.000Z
            jest.spyOn(Date, 'now').mockReturnValue(mockDate);

            const result = await scraperService.scrapeProduct('https://panini.com.br/');
            expect(result.id).toBe('panini-1640995200000');

            jest.restoreAllMocks();
        });
    });

    describe('Stock status edge cases', () => {
        it('should detect out of stock with various indicators', async () => {
            const outOfStockTexts = [
                'produto indisponível',
                'fora de estoque',
                'esgotado',
                'sem estoque',
                'indisponível'
            ];

            for (const stockText of outOfStockTexts) {
                const mockHtml = `
                    <html>
                        <body>
                            <h1>Stock Test</h1>
                            <div class="price">R$ 25,00</div>
                            <div class="status">Status: ${stockText}</div>
                            <img src="/test.jpg" />
                        </body>
                    </html>
                `;

                mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

                const result = await scraperService.scrapeProduct('https://panini.com.br/stock-test');
                expect(result.inStock).toBe(false);
            }
        });

        it('should consider in stock when no out-of-stock indicators found', async () => {
            const mockHtml = `
                <html>
                    <body>
                        <h1>In Stock Test</h1>
                        <div class="price">R$ 25,00</div>
                        <div class="status">Disponível para compra</div>
                        <img src="/test.jpg" />
                    </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/in-stock-test');
            expect(result.inStock).toBe(true);
        });
    });

    describe('Error handling edge cases', () => {
        it('should handle ProductEntity validation errors', async () => {
            const mockHtml = `
                <html>
                    <body>
                        <h1></h1>
                        <div class="price">R$ 25,00</div>
                        <img src="/test.jpg" />
                    </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

            await expect(scraperService.scrapeProduct('https://panini.com.br/empty-title'))
                .rejects.toThrow(ProductScrapingError);
        });

        it('should handle HTTP client errors', async () => {
            mockHttpClient.get.mockRejectedValue(new Error('Network error'));

            await expect(scraperService.scrapeProduct('https://panini.com.br/network-error'))
                .rejects.toThrow('Failed to scrape product: Network error');
        });

        it('should handle malformed HTML', async () => {
            const mockHtml = `<html><body><h1>Broken HTML`;

            mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

            await expect(scraperService.scrapeProduct('https://panini.com.br/broken-html'))
                .rejects.toThrow(ProductScrapingError);
        });
    });
});