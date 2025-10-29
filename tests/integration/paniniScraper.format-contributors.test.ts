import { PaniniScraperService } from '../../src/infrastructure/paniniScraper.service';
import { HttpClient } from '../../src/infrastructure/httpClient';

describe('PaniniScraperService - Format and Contributors Extraction', () => {
	let scraperService: PaniniScraperService;
	let mockHttpClient: jest.Mocked<HttpClient>;

	beforeEach(() => {
		mockHttpClient = {
			get: jest.fn(),
			updateConfig: jest.fn()
		} as any;

		scraperService = new PaniniScraperService();
		(scraperService as any).httpClient = mockHttpClient;
	});

	describe('Format extraction', () => {
		it('should extract format from Encadernação field', async () => {
			const mockHtml = `
                <html>
                    <body>
                        <h1>Produto com Formato</h1>
                        <div class="price">R$ 50,00</div>
                        <table class="additional-attributes" id="product-attribute-specs-table">
                            <tbody>
                                <tr><td class="col data" data-th="Referência">PROD001</td></tr>
                                <tr><td class="col data" data-th="Encadernação">Capa dura</td></tr>
                                <tr><td class="col data" data-th="Autores">Stan Lee, Jack Kirby</td></tr>
                            </tbody>
                        </table>
                        <img src="/test.jpg" />
                    </body>
                </html>
            `;

			mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

			const result = await scraperService.scrapeProduct('https://panini.com.br/produto');
			expect(result.format).toBe('Capa dura');
		});

		it('should extract format from fallback Formato field', async () => {
			const mockHtml = `
                <html>
                    <body>
                        <h1>Produto com Formato Alternativo</h1>
                        <div class="price">R$ 50,00</div>
                        <table class="additional-attributes" id="product-attribute-specs-table">
                            <tbody>
                                <tr><td class="col data" data-th="Referência">PROD002</td></tr>
                                <tr><td class="col data" data-th="Formato">Brochura</td></tr>
                            </tbody>
                        </table>
                        <img src="/test.jpg" />
                    </body>
                </html>
            `;

			mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

			const result = await scraperService.scrapeProduct('https://panini.com.br/produto2');
			expect(result.format).toBe('Brochura');
		});

		it('should return default format when not found', async () => {
			const mockHtml = `
                <html>
                    <body>
                        <h1>Produto sem Formato</h1>
                        <div class="price">R$ 50,00</div>
                        <table class="additional-attributes">
                            <tbody>
                                <tr><td class="col data" data-th="Referência">PROD003</td></tr>
                            </tbody>
                        </table>
                        <img src="/test.jpg" />
                    </body>
                </html>
            `;

			mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

			const result = await scraperService.scrapeProduct('https://panini.com.br/produto3');
			expect(result.format).toBe('Formato não especificado');
		});
	});

	describe('Contributors extraction', () => {
		it('should extract contributors from Autores field', async () => {
			const mockHtml = `
                <html>
                    <body>
                        <h1>Produto com Autores</h1>
                        <div class="price">R$ 50,00</div>
                        <table class="additional-attributes" id="product-attribute-specs-table">
                            <tbody>
                                <tr><td class="col data" data-th="Referência">PROD004</td></tr>
                                <tr><td class="col data" data-th="Autores">Carlos Pacheco, Doug Mahnke, Grant Morrison, J.G. Jones, Matthew Clark</td></tr>
                            </tbody>
                        </table>
                        <img src="/test.jpg" />
                    </body>
                </html>
            `;

			mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

			const result = await scraperService.scrapeProduct('https://panini.com.br/produto4');
			expect(result.contributors).toEqual([
				'Carlos Pacheco',
				'Doug Mahnke',
				'Grant Morrison',
				'J.G. Jones',
				'Matthew Clark'
			]);
		});

		it('should extract contributors from fallback autor field', async () => {
			const mockHtml = `
                <html>
                    <body>
                        <h1>Produto com Autor</h1>
                        <div class="price">R$ 50,00</div>
                        <table class="additional-attributes" id="product-attribute-specs-table">
                            <tbody>
                                <tr><td class="col data" data-th="Referência">PROD005</td></tr>
                                <tr><td class="col data" data-th="Autor">Alan Moore</td></tr>
                            </tbody>
                        </table>
                        <img src="/test.jpg" />
                    </body>
                </html>
            `;

			mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

			const result = await scraperService.scrapeProduct('https://panini.com.br/produto5');
			expect(result.contributors).toEqual(['Alan Moore']);
		});

		it('should extract contributors from Roteiro field', async () => {
			const mockHtml = `
                <html>
                    <body>
                        <h1>Produto com Roteiro</h1>
                        <div class="price">R$ 50,00</div>
                        <table class="additional-attributes" id="product-attribute-specs-table">
                            <tbody>
                                <tr><td class="col data" data-th="Referência">PROD006</td></tr>
                                <tr><td class="col data" data-th="Roteiro">Neil Gaiman, Mike Carey</td></tr>
                            </tbody>
                        </table>
                        <img src="/test.jpg" />
                    </body>
                </html>
            `;

			mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

			const result = await scraperService.scrapeProduct('https://panini.com.br/produto6');
			expect(result.contributors).toEqual(['Neil Gaiman', 'Mike Carey']);
		});

		it('should extract contributors from Arte field', async () => {
			const mockHtml = `
                <html>
                    <body>
                        <h1>Produto com Arte</h1>
                        <div class="price">R$ 50,00</div>
                        <table class="additional-attributes" id="product-attribute-specs-table">
                            <tbody>
                                <tr><td class="col data" data-th="Referência">PROD007</td></tr>
                                <tr><td class="col data" data-th="Arte">Jim Lee, Frank Miller</td></tr>
                            </tbody>
                        </table>
                        <img src="/test.jpg" />
                    </body>
                </html>
            `;

			mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

			const result = await scraperService.scrapeProduct('https://panini.com.br/produto7');
			expect(result.contributors).toEqual(['Jim Lee', 'Frank Miller']);
		});

		it('should return empty array when no contributors found', async () => {
			const mockHtml = `
                <html>
                    <body>
                        <h1>Produto sem Autores</h1>
                        <div class="price">R$ 50,00</div>
                        <table class="additional-attributes">
                            <tbody>
                                <tr><td class="col data" data-th="Referência">PROD008</td></tr>
                            </tbody>
                        </table>
                        <img src="/test.jpg" />
                    </body>
                </html>
            `;

			mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

			const result = await scraperService.scrapeProduct('https://panini.com.br/produto8');
			expect(result.contributors).toEqual([]);
		});

		it('should handle contributors with single author', async () => {
			const mockHtml = `
                <html>
                    <body>
                        <h1>Produto com um Autor</h1>
                        <div class="price">R$ 50,00</div>
                        <table class="additional-attributes" id="product-attribute-specs-table">
                            <tbody>
                                <tr><td class="col data" data-th="Referência">PROD009</td></tr>
                                <tr><td class="col data" data-th="Autores">Frank Miller</td></tr>
                            </tbody>
                        </table>
                        <img src="/test.jpg" />
                    </body>
                </html>
            `;

			mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

			const result = await scraperService.scrapeProduct('https://panini.com.br/produto9');
			expect(result.contributors).toEqual(['Frank Miller']);
		});

		it('should remove duplicates from contributors', async () => {
			const mockHtml = `
                <html>
                    <body>
                        <h1>Produto com Autores Duplicados</h1>
                        <div class="price">R$ 50,00</div>
                        <table class="additional-attributes" id="product-attribute-specs-table">
                            <tbody>
                                <tr><td class="col data" data-th="Referência">PROD010</td></tr>
                                <tr><td class="col data" data-th="Autores">Alan Moore, Alan Moore, Dave Gibbons</td></tr>
                            </tbody>
                        </table>
                        <img src="/test.jpg" />
                    </body>
                </html>
            `;

			mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

			const result = await scraperService.scrapeProduct('https://panini.com.br/produto10');
			expect(result.contributors).toEqual(['Alan Moore', 'Dave Gibbons']);
		});
	});

	describe('Combined format and contributors extraction', () => {
		it('should extract both format and contributors correctly', async () => {
			const mockHtml = `
                <html>
                    <body>
                        <h1>Produto Completo</h1>
                        <div class="price">R$ 89,90</div>
                        <table class="additional-attributes" id="product-attribute-specs-table">
                            <tbody>
                                <tr><td class="col data" data-th="Referência">AGECF001</td></tr>
                                <tr><td class="col data" data-th="Autores">Carlos Pacheco, Doug Mahnke, Grant Morrison</td></tr>
                                <tr><td class="col data" data-th="Encadernação">Capa dura</td></tr>
                            </tbody>
                        </table>
                        <img src="https://panini.com.br/crise-final.jpg" />
                    </body>
                </html>
            `;

			mockHttpClient.get.mockResolvedValue({ data: mockHtml } as any);

			const result = await scraperService.scrapeProduct('https://panini.com.br/crise-final-grandes-eventos-dc');
			expect(result.format).toBe('Capa dura');
			expect(result.contributors).toEqual(['Carlos Pacheco', 'Doug Mahnke', 'Grant Morrison']);
			expect(result.id).toBe('AGECF001');
		});
	});
});

