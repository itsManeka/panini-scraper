import { ScrapeProductUseCase } from '../../src/usecases/scrapeProduct.usecase';
import { ProductRepository, Product, InvalidUrlError } from '../../src/domain';

// Mock implementation of ProductRepository
class MockProductRepository implements ProductRepository {
    async scrapeProduct(url: string): Promise<Product> {
        if (url === 'https://panini.com.br/valid-product') {
            return {
                title: 'Test Product',
                fullPrice: 50.00,
                currentPrice: 40.00,
                isPreOrder: false,
                inStock: true,
                imageUrl: 'https://panini.com.br/image.jpg',
                url: url,
                id: 'TEST001'
            };
        }
        throw new Error('Product not found');
    }
}

describe('ScrapeProductUseCase', () => {
    let useCase: ScrapeProductUseCase;
    let mockRepository: MockProductRepository;

    beforeEach(() => {
        mockRepository = new MockProductRepository();
        useCase = new ScrapeProductUseCase(mockRepository);
    });

    describe('execute', () => {
        it('should successfully scrape a valid product URL', async () => {
            const url = 'https://panini.com.br/valid-product';
            const result = await useCase.execute(url);

            expect(result).toEqual({
                title: 'Test Product',
                fullPrice: 50.00,
                currentPrice: 40.00,
                isPreOrder: false,
                inStock: true,
                imageUrl: 'https://panini.com.br/image.jpg',
                url: url,
                id: 'TEST001'
            });
        });

        it('should throw InvalidUrlError for empty URL', async () => {
            await expect(useCase.execute('')).rejects.toThrow(InvalidUrlError);
        });

        it('should throw InvalidUrlError for null URL', async () => {
            await expect(useCase.execute(null as any)).rejects.toThrow(InvalidUrlError);
        });

        it('should throw InvalidUrlError for undefined URL', async () => {
            await expect(useCase.execute(undefined as any)).rejects.toThrow(InvalidUrlError);
        });

        it('should normalize URL by removing trailing slash', async () => {
            const spy = jest.spyOn(mockRepository, 'scrapeProduct');
            await useCase.execute('https://panini.com.br/valid-product/');

            expect(spy).toHaveBeenCalledWith('https://panini.com.br/valid-product');
        });

        it('should add https protocol to URLs without protocol', async () => {
            const spy = jest.spyOn(mockRepository, 'scrapeProduct');
            await useCase.execute('panini.com.br/valid-product');

            expect(spy).toHaveBeenCalledWith('https://panini.com.br/valid-product');
        });
    });

    describe('isValidPaniniUrl', () => {
        it('should return true for valid Panini URLs', () => {
            const validUrls = [
                'https://panini.com.br/wolverine',
                'http://panini.com.br/x-men',
                'https://www.panini.com.br/spider-man',
                'http://www.panini.com.br/batman'
            ];

            validUrls.forEach(url => {
                expect(ScrapeProductUseCase.isValidPaniniUrl(url)).toBe(true);
            });
        });

        it('should return false for invalid URLs', () => {
            const invalidUrls = [
                '',
                null,
                undefined,
                'not-a-url',
                'https://google.com',
                'https://amazon.com.br/product',
                'ftp://panini.com.br/product'
            ];

            invalidUrls.forEach(url => {
                expect(ScrapeProductUseCase.isValidPaniniUrl(url as any)).toBe(false);
            });
        });
    });
});