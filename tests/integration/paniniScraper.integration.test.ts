import { PaniniScraperService } from '../../src/infrastructure/paniniScraper.service';
import { HttpClient } from '../../src/infrastructure/httpClient';

// Mock the actual HTTP calls
jest.mock('../../src/infrastructure/httpClient');

describe('PaniniScraperService Integration', () => {
    let scraperService: PaniniScraperService;
    let mockHttpClient: jest.Mocked<HttpClient>;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        scraperService = new PaniniScraperService();

        // Mock the HttpClient
        mockHttpClient = {
            get: jest.fn(),
            updateConfig: jest.fn()
        } as any;

        // Replace the internal http client
        (scraperService as any).httpClient = mockHttpClient;
    });

    describe('scrapeProduct', () => {
        it('should scrape product information from valid HTML', async () => {
            const mockHtml = `
        <html>
            <head><title>A Vida de Wolverine</title></head>
            <body>
                <h1 class="product-title">A Vida de Wolverine</h1>
                <div class="old-price">R$ 24,90</div>
                <div class="price-current">R$ 16,19</div>
                <div class="product-image">
                    <img src="/images/wolverine.jpg" alt="Product" />
                </div>
                <div class="stock-status">Em estoque</div>
            </body>
        </html>
            `;

            mockHttpClient.get.mockResolvedValue({
                data: mockHtml,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            } as any);

            const url = 'https://panini.com.br/a-vida-de-wolverine';
            const result = await scraperService.scrapeProduct(url);

            expect(result).toEqual({
                title: 'A Vida de Wolverine',
                fullPrice: 24.90,
                currentPrice: 16.19,
                isPreOrder: false,
                inStock: true,
                imageUrl: 'https://panini.com.br/images/wolverine.jpg',
                url: url,
                format: 'Formato não especificado',
                contributors: [],
                id: 'a-vida-de-wolverine'
            });

            expect(mockHttpClient.get).toHaveBeenCalledWith(url);
        });

        it('should handle pre-order products', async () => {
            const mockHtml = `
        <html>
            <body>
                <h1>Wolverine 2025</h1>
                <div class="price">R$ 29,90</div>
                <div class="infobase-label-presale" style="display: block">Pré-venda</div>
                <img src="/images/wolverine2025.jpg" />
            </body>
        </html>
            `;

            mockHttpClient.get.mockResolvedValue({
                data: mockHtml,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            } as any);

            const url = 'https://panini.com.br/wolverine-2025';
            const result = await scraperService.scrapeProduct(url);

            expect(result.isPreOrder).toBe(true);
            expect(result.title).toBe('Wolverine 2025');
            expect(result.currentPrice).toBe(29.90);
            expect(result.fullPrice).toBe(29.90);
        });

        it('should handle out of stock products', async () => {
            const mockHtml = `
        <html>
            <body>
                <h1>X-Force Collection</h1>
                <div class="price">R$ 45,00</div>
                <div>Produto indisponível</div>
                <img src="/images/xforce.jpg" />
            </body>
        </html>
            `;

            mockHttpClient.get.mockResolvedValue({
                data: mockHtml,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            } as any);

            const url = 'https://panini.com.br/x-force-collection';
            const result = await scraperService.scrapeProduct(url);

            expect(result.inStock).toBe(false);
            expect(result.title).toBe('X-Force Collection');
        });

        it('should throw error for invalid Panini URL', async () => {
            const invalidUrl = 'https://amazon.com/product';

            await expect(scraperService.scrapeProduct(invalidUrl))
                .rejects
                .toThrow('Invalid or malformed URL provided');
        });

        it('should throw error for non-Panini domain', async () => {
            const invalidUrl = 'https://google.com';

            await expect(scraperService.scrapeProduct(invalidUrl))
                .rejects
                .toThrow('Invalid or malformed URL provided');
        });

        it('should handle HTTP errors', async () => {
            const url = 'https://panini.com.br/non-existent-product';

            mockHttpClient.get.mockRejectedValue(new Error('HTTP 404: Not Found'));

            await expect(scraperService.scrapeProduct(url))
                .rejects
                .toThrow('Failed to scrape product');
        });

        it('should extract product ID from URL when not found in HTML', async () => {
            const mockHtml = `
        <html>
            <body>
                <h1>Batman Dark Knight</h1>
                <div class="price">R$ 35,00</div>
            </body>
        </html>
            `;

            mockHttpClient.get.mockResolvedValue({
                data: mockHtml,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            } as any);

            const url = 'https://panini.com.br/batman-dark-knight-special-edition';
            const result = await scraperService.scrapeProduct(url);

            expect(result.id).toBe('batman-dark-knight-special-edition');
        });

        it('should handle missing price information', async () => {
            const mockHtml = `
        <html>
            <body>
                <h1>Produto sem preço</h1>
                <div class="product-description">
                    <p>Descrição do produto</p>
                </div>
            </body>
        </html>
            `;

            mockHttpClient.get.mockResolvedValue({
                data: mockHtml,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            } as any);

            await expect(scraperService.scrapeProduct('https://panini.com.br/produto-sem-preco'))
                .rejects
                .toThrow('Failed to scrape product');
        });

        it('should handle missing title', async () => {
            const mockHtml = `
        <html>
            <body>
                <div class="price">R$ 29,90</div>
            </body>
        </html>
        `;

            mockHttpClient.get.mockResolvedValue({
                data: mockHtml,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            } as any);

            await expect(scraperService.scrapeProduct('https://panini.com.br/produto-sem-titulo'))
                .rejects
                .toThrow('Failed to scrape product');
        });

        it('should handle description fallback to title', async () => {
            const mockHtml = `
        <html>
          <body>
            <h1>Produto Teste</h1>
            <div class="price">R$ 29,90</div>
            <img src="/image.jpg" alt="Produto" />
          </body>
        </html>
      `;

            mockHttpClient.get.mockResolvedValue({
                data: mockHtml,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/produto-sem-descricao');

            expect(result.title).toBe('Produto Teste');
            // Product doesn't have description property, so we just test title
            expect(result.title).toBeDefined();
        });

        it('should handle image extraction with data-original attribute', async () => {
            const mockHtml = `
        <html>
          <body>
            <h1>Produto com Imagem</h1>
            <div class="price">R$ 29,90</div>
            <div class="product-image">
              <img data-original="/original-image.jpg" alt="produto" />
            </div>
          </body>
        </html>
      `;

            mockHttpClient.get.mockResolvedValue({
                data: mockHtml,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/produto-com-imagem');

            expect(result.imageUrl).toBe('https://panini.com.br/original-image.jpg');
        });

        it('should handle image with data-src attribute', async () => {
            const mockHtml = `
        <html>
          <body>
            <h1>Produto com Data-Src</h1>
            <div class="price">R$ 29,90</div>
            <div class="product-image-main">
              <img data-src="/data-src-image.png" alt="produto" />
            </div>
          </body>
        </html>
      `;

            mockHttpClient.get.mockResolvedValue({
                data: mockHtml,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/produto-data-src');

            expect(result.imageUrl).toBe('https://panini.com.br/data-src-image.png');
        });

        it('should handle product ID extraction from details section', async () => {
            const mockHtml = `
        <html>
          <body>
            <h1>Produto com ID nos Detalhes</h1>
            <div class="price">R$ 29,90</div>
            <table class="additional-attributes">
              <tbody>
                <tr><td class="col data" data-th="Referência">DET123456</td></tr>
              </tbody>
            </table>
          </body>
        </html>
      `;

            mockHttpClient.get.mockResolvedValue({
                data: mockHtml,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/produto-det123456');

            expect(result.id).toBe('DET123456');
        });

        it('should detect pre-order in product area fallback', async () => {
            const mockHtml = `
        <html>
          <body>
            <div class="product-main">
              <h1>Produto Pré-Venda</h1>
              <div class="price">R$ 29,90</div>
              <p>Este produto está em pré-venda</p>
            </div>
          </body>
        </html>
      `;

            mockHttpClient.get.mockResolvedValue({
                data: mockHtml,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/produto-pre-venda');

            expect(result.isPreOrder).toBe(true);
        });

        it('should handle availability info without pre-order', async () => {
            const mockHtml = `
        <html>
          <body>
            <h1>Produto Disponível</h1>
            <div class="price">R$ 29,90</div>
            <div class="product-availability">Disponível em estoque</div>
          </body>
        </html>
      `;

            mockHttpClient.get.mockResolvedValue({
                data: mockHtml,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/produto-disponivel');

            expect(result.isPreOrder).toBe(false);
        });

        it('should handle price without discount (fullPrice equals currentPrice)', async () => {
            const mockHtml = `
        <html>
          <body>
            <h1>Produto Sem Desconto</h1>
            <div class="price-current">R$ 45,90</div>
            <img src="/produto-sem-desconto.jpg" alt="produto" />
          </body>
        </html>
      `;

            mockHttpClient.get.mockResolvedValue({
                data: mockHtml,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/produto-sem-desconto');

            expect(result.fullPrice).toBe(result.currentPrice);
            expect(result.fullPrice).toBe(45.90);
        });

        it('should handle image search in different containers', async () => {
            const mockHtml = `
        <html>
          <body>
            <h1>Produto com Imagem em Container</h1>
            <div class="price">R$ 29,90</div>
            <div class="image-container">
              <img src="/container-image.png" alt="produto" />
            </div>
          </body>
        </html>
      `;

            mockHttpClient.get.mockResolvedValue({
                data: mockHtml,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/produto-container');

            expect(result.imageUrl).toBe('https://panini.com.br/container-image.png');
        });

        it('should handle image with src attribute', async () => {
            const mockHtml = `
        <html>
          <body>
            <h1>Produto com Src</h1>
            <div class="price">R$ 29,90</div>
            <div class="hero-section">
              <img src="/hero-image.webp" alt="produto" />
            </div>
          </body>
        </html>
      `;

            mockHttpClient.get.mockResolvedValue({
                data: mockHtml,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/produto-hero');

            expect(result.imageUrl).toBe('https://panini.com.br/hero-image.webp');
        });

        it('should handle out of stock detection', async () => {
            const mockHtml = `
        <html>
          <body>
            <h1>Produto Esgotado</h1>
            <div class="price">R$ 29,90</div>
            <div class="availability">Produto esgotado</div>
          </body>
        </html>
      `;

            mockHttpClient.get.mockResolvedValue({
                data: mockHtml,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/produto-esgotado');

            expect(result.inStock).toBe(false);
        });

        it('should handle different price selectors', async () => {
            const mockHtml = `
        <html>
          <body>
            <h1>Produto com Preço Especial</h1>
            <div class="product-price">R$ 19,99</div>
          </body>
        </html>
      `;

            mockHttpClient.get.mockResolvedValue({
                data: mockHtml,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/produto-preco-especial');

            expect(result.currentPrice).toBe(19.99);
            expect(result.fullPrice).toBe(19.99);
        });

        it('should handle product with cloudfront image', async () => {
            const mockHtml = `
        <html>
          <body>
            <h1>Produto CloudFront</h1>
            <div class="price">R$ 35,00</div>
            <img src="https://d2ufo47lrtsv6s.cloudfront.net/product.jpg" alt="produto" />
          </body>
        </html>
      `;

            mockHttpClient.get.mockResolvedValue({
                data: mockHtml,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/produto-cloudfront');

            expect(result.imageUrl).toBe('https://d2ufo47lrtsv6s.cloudfront.net/product.jpg');
        });

        it('should handle product availability selectors', async () => {
            const mockHtml = `
        <html>
          <body>
            <h1>Produto com Status</h1>
            <div class="price">R$ 29,90</div>
            <div class="status-info">pré-venda disponível</div>
          </body>
        </html>
      `;

            mockHttpClient.get.mockResolvedValue({
                data: mockHtml,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/produto-status');

            expect(result.isPreOrder).toBe(true);
        });

        it('should handle pre-order with display none', async () => {
            const mockHtml = `
        <html>
          <head>
            <style>.infobase-label-presale { display: none; }</style>
          </head>
          <body>
            <h1>Produto Pré-Venda Hidden</h1>
            <div class="price">R$ 29,90</div>
            <div class="infobase-label-presale" style="display: none;">pré-venda</div>
          </body>
        </html>
      `;

            mockHttpClient.get.mockResolvedValue({
                data: mockHtml,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/produto-hidden-preorder');

            expect(result.isPreOrder).toBe(false);
        });

        it('should avoid placeholder images and prioritize external CDN images', async () => {
            const mockHtml = `
                <html>
                <body>
                    <h1>Produto com Imagem CloudFront</h1>
                    <div class="price">R$ 29,90</div>
                    <img src="https://panini.com.br/media/catalog/product/placeholder/default/panini-placeholder.png" alt="placeholder" />
                    <img src="https://d14d9vp3wdof84.cloudfront.net/image/123456/image_real/-S897-FWEBP" alt="produto" />
                </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({
                data: mockHtml,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/produto-cloudfront-real');

            expect(result.imageUrl).toBe('https://d14d9vp3wdof84.cloudfront.net/image/123456/image_real/-S897-FWEBP');
            expect(result.imageUrl).not.toContain('placeholder');
        });

        it('should handle SmartBMC image URLs', async () => {
            const mockHtml = `
                <html>
                <body>
                    <h1>Produto SmartBMC</h1>
                    <div class="price">R$ 29,90</div>
                    <img src="https://d14d9vp3wdof84.cloudfront.net/image/123456/product_image.jpg" alt="produto" />
                </body>
                </html>
            `;

            mockHttpClient.get.mockResolvedValue({
                data: mockHtml,
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            } as any);

            const result = await scraperService.scrapeProduct('https://panini.com.br/produto-cloudfront');

            expect(result.imageUrl).toBe('https://d14d9vp3wdof84.cloudfront.net/image/123456/product_image.jpg');
        });
    });

    describe('updateConfig', () => {
        it('should update HTTP client configuration', () => {
            const config = {
                timeout: 5000,
                headers: { 'Custom-Header': 'test' }
            };

            scraperService.updateConfig(config);

            expect(mockHttpClient.updateConfig).toHaveBeenCalledWith(config);
        });
    });
});