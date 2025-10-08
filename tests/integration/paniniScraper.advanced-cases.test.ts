import { PaniniScraperService } from '../../src/infrastructure/paniniScraper.service';
import { HttpClient } from '../../src/infrastructure/httpClient';
import { ProductScrapingError } from '../../src/domain/product.repository';

// Mock the actual HTTP calls
jest.mock('../../src/infrastructure/httpClient');

describe('PaniniScraperService Advanced Edge Cases', () => {
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

    describe('Image extraction from JavaScript content', () => {
        it('should extract image from JSON in script tags', async () => {
            const mockHtml = `
                <html>
                    <body>
                        <h1>JavaScript Image Test</h1>
                        <div class="price">R$ 25,00</div>
                        <script>
                            var productData = {"image": "https://d123abc.cloudfront.net/product.jpg", "title": "Test"};
                        </script>
                    </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/js-image');
            expect(result.imageUrl).toBe('https://d123abc.cloudfront.net/product.jpg');
        });

        it('should extract image from src field in JSON', async () => {
            const mockHtml = `
                <html>
                    <body>
                        <h1>JavaScript Src Test</h1>
                        <div class="price">R$ 25,00</div>
                        <script>
                            const imageData = {"src": "/images/product.jpg", "alt": "Product"};
                        </script>
                    </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/js-src');
            expect(result.imageUrl).toBe('https://panini.com.br/images/product.jpg');
        });

        it('should extract image from url field in JSON', async () => {
            const mockHtml = `
                <html>
                    <body>
                        <h1>JavaScript URL Test</h1>
                        <div class="price">R$ 25,00</div>
                        <script>
                            var config = {"url": "https://example.cloudfront.net/image.png"};
                        </script>
                    </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/js-url');
            expect(result.imageUrl).toBe('https://example.cloudfront.net/image.png');
        });

        it('should extract CloudFront URL from JavaScript', async () => {
            const mockHtml = `
                <html>
                    <body>
                        <h1>CloudFront JS Test</h1>
                        <div class="price">R$ 25,00</div>
                        <script>
                            var imgSrc = "https://d456def.cloudfront.net/products/amazing-product.webp";
                        </script>
                    </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/cloudfront-js');
            expect(result.imageUrl).toBe('https://d456def.cloudfront.net/products/amazing-product.webp');
        });

        it('should extract CDN URL from JavaScript comments', async () => {
            const mockHtml = `
                <html>
                    <body>
                        <h1>CDN JS Test</h1>
                        <div class="price">R$ 25,00</div>
                        <script>
                            // Image URL: https://cdn.example.com/images/product.jpeg
                            var productImage = "https://cdn.example.com/images/product.jpeg";
                        </script>
                    </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/cdn-js');
            expect(result.imageUrl).toBe('https://cdn.example.com/images/product.jpeg');
        });

        it('should handle invalid JSON in script tags', async () => {
            const mockHtml = `
                <html>
                    <body>
                        <h1>Invalid JSON Test</h1>
                        <div class="price">R$ 25,00</div>
                        <script>
                            var invalid = {image: "broken json without quotes};
                        </script>
                        <img src="/fallback.jpg" />
                    </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/invalid-json');
            expect(result.imageUrl).toBe('https://panini.com.br/fallback.jpg');
        });

        it('should filter out social media images from CDN URLs', async () => {
            const mockHtml = `
                <html>
                    <body>
                        <h1>Social Media Filter Test</h1>
                        <div class="price">R$ 25,00</div>
                        <script>
                            var socialImg = "https://facebook.com/image.jpg";
                            var twitterImg = "https://twitter.com/image.jpg";
                            var instagramImg = "https://instagram.com/image.jpg";
                        </script>
                        <img src="/product.png" />
                    </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/social-filter');
            expect(result.imageUrl).toBe('https://panini.com.br/product.png');
        });
    });

    describe('Placeholder image detection', () => {
        it('should detect placeholder images', async () => {
            const mockHtml = `
                <html>
                    <body>
                        <h1>Placeholder Test</h1>
                        <div class="price">R$ 25,00</div>
                        <img src="/default/panini-placeholder.jpg" />
                        <img src="/images/no-image.png" />
                        <img src="/loading.gif" />
                        <img src="/spinner.svg" />
                        <img src="/actual-product.jpg" />
                    </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/placeholder');
            expect(result.imageUrl).toBe('https://panini.com.br/actual-product.jpg');
        });
    });

    describe('Product ID extraction edge cases', () => {
        it('should extract ID from product details table', async () => {
            const mockHtml = `
                <html>
                    <body>
                        <h1>Table ID Test</h1>
                        <div class="price">R$ 25,00</div>
                        <table class="product-details">
                            <tr>
                                <td>Código:</td>
                                <td>PROD123ABC</td>
                            </tr>
                            <tr>
                                <td>Categoria:</td>
                                <td>Comics</td>
                            </tr>
                        </table>
                        <img src="/test.jpg" />
                    </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/table-id');
            expect(result.id).toBe('PROD123ABC');
        });

        it('should extract ID from SKU attribute', async () => {
            const mockHtml = `
                <html>
                    <body>
                        <h1>SKU Test</h1>
                        <div class="price">R$ 25,00</div>
                        <div class="product-info" data-sku="SKU987XYZ">Product Info</div>
                        <img src="/test.jpg" />
                    </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/sku-test');
            expect(result.id).toBe('SKU987XYZ');
        });

        it('should extract ID from reference in detailed section', async () => {
            const mockHtml = `
                <html>
                    <body>
                        <h1>Detailed Reference Test</h1>
                        <div class="price">R$ 25,00</div>
                        <div class="details-section">
                            <span class="ref-label">Referência:</span>
                            <span class="ref-value">REF456DEF</span>
                        </div>
                        <img src="/test.jpg" />
                    </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/detailed-ref');
            expect(result.id).toBe('REF456DEF');
        });
    });

    describe('Error handling in catch blocks', () => {
        it('should handle non-Error objects thrown', async () => {
            // This test covers the case where something other than an Error is thrown
            const mockHttpClient = {
                get: jest.fn().mockImplementation(() => {
                    throw "String error"; // Non-Error object
                }),
                updateConfig: jest.fn()
            } as any;

            (scraperService as any).httpClient = mockHttpClient;

            await expect(scraperService.scrapeProduct('https://panini.com.br/string-error'))
                .rejects.toThrow(ProductScrapingError);
        });

        it('should handle case where catch error is ProductEntity instance', async () => {
            // Mock the extractTitle method to throw a ProductEntity error
            const mockError = new Error('Validation error');
            mockError.name = 'ProductEntityError';

            jest.spyOn(scraperService as any, 'extractTitle').mockImplementation(() => {
                throw mockError;
            });

            const mockHtml = `
                <html>
                    <body>
                        <h1>Test</h1>
                        <div class="price">R$ 25,00</div>
                        <img src="/test.jpg" />
                    </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

            await expect(scraperService.scrapeProduct('https://panini.com.br/entity-error'))
                .rejects.toThrow(ProductScrapingError);
        });
    });

    describe('Additional image extraction paths', () => {
        it('should handle image with multiple src attributes (data-original)', async () => {
            const mockHtml = `
                <html>
                    <body>
                        <h1>Data Original Test</h1>
                        <div class="price">R$ 25,00</div>
                        <img src="/placeholder.jpg" data-original="/real-image.webp" />
                    </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/data-original');
            expect(result.imageUrl).toBe('https://panini.com.br/real-image.webp');
        });

        it('should handle images in containers', async () => {
            const mockHtml = `
                <html>
                    <body>
                        <h1>Container Test</h1>
                        <div class="price">R$ 25,00</div>
                        <div class="image-container">
                            <img src="/local-image.jpg" />
                        </div>
                    </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/container-test');
            expect(result.imageUrl).toBe('https://panini.com.br/local-image.jpg');
        });
    });

    describe('Pre-order detection variations', () => {
        it('should handle pre-order element with different display values', async () => {
            const mockHtml = `
                <html>
                    <body>
                        <h1>Display Test</h1>
                        <div class="price">R$ 25,00</div>
                        <div class="infobase-label-presale" style="display: block;">Pré-venda</div>
                        <img src="/test.jpg" />
                    </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/display-test');
            expect(result.isPreOrder).toBe(true);
        });

        it('should handle empty product area in pre-order fallback', async () => {
            const mockHtml = `
                <html>
                    <body>
                        <h1>Empty Area Test</h1>
                        <div class="price">R$ 25,00</div>
                        <div class="product-main"></div>
                        <img src="/test.jpg" />
                    </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/empty-area');
            expect(result.isPreOrder).toBe(false);
        });
    });
});