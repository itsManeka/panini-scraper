import { ScrapeProductUseCase } from '../../src/usecases/scrapeProduct.usecase';
import { ProductRepository, Product, InvalidUrlError, ProductScrapingError, ProductNotFoundError } from '../../src/domain';

// Mock implementation of ProductRepository for batch testing
class MockBatchProductRepository implements ProductRepository {
    async scrapeProduct(url: string): Promise<Product> {
        // Validate URL like the real service does
        if (!url || typeof url !== 'string' || !url.includes('panini.com.br')) {
            throw new InvalidUrlError(url);
        }

        // Simulate different scenarios based on URL
        if (url === 'https://panini.com.br/wolverine') {
            return {
                title: 'Wolverine',
                fullPrice: 50.00,
                currentPrice: 40.00,
                isPreOrder: false,
                inStock: true,
                imageUrl: 'https://panini.com.br/wolverine.jpg',
                url: url,
                format: 'Capa dura',
                contributors: ['Chris Claremont'],
                id: 'WOLV001'
            };
        }
        
        if (url === 'https://panini.com.br/x-men') {
            return {
                title: 'X-Men',
                fullPrice: 60.00,
                currentPrice: 50.00,
                isPreOrder: false,
                inStock: true,
                imageUrl: 'https://panini.com.br/x-men.jpg',
                url: url,
                format: 'Brochura',
                contributors: ['Stan Lee'],
                id: 'XMEN001'
            };
        }

        if (url === 'https://panini.com.br/spider-man') {
            return {
                title: 'Spider-Man',
                fullPrice: 45.00,
                currentPrice: 35.00,
                isPreOrder: true,
                inStock: true,
                imageUrl: 'https://panini.com.br/spider-man.jpg',
                url: url,
                format: 'Capa dura',
                contributors: ['Stan Lee', 'Steve Ditko'],
                id: 'SPIDER001'
            };
        }

        if (url === 'https://panini.com.br/not-found') {
            throw new ProductNotFoundError(url);
        }

        throw new ProductScrapingError('Network error', url);
    }
}

describe('ScrapeProductUseCase - Batch Operations', () => {
    let useCase: ScrapeProductUseCase;
    let mockRepository: MockBatchProductRepository;

    beforeEach(() => {
        mockRepository = new MockBatchProductRepository();
        useCase = new ScrapeProductUseCase(mockRepository);
    });

    describe('executeMany', () => {
        it('should successfully scrape all valid URLs', async () => {
            const urls = [
                'https://panini.com.br/wolverine',
                'https://panini.com.br/x-men',
                'https://panini.com.br/spider-man'
            ];

            const result = await useCase.executeMany(urls);

            expect(result.totalProcessed).toBe(3);
            expect(result.successCount).toBe(3);
            expect(result.failureCount).toBe(0);
            expect(result.successes).toHaveLength(3);
            expect(result.failures).toHaveLength(0);

            // Verify products are correctly returned
            expect(result.successes[0].url).toBe('https://panini.com.br/wolverine');
            expect(result.successes[0].product.title).toBe('Wolverine');
            expect(result.successes[1].url).toBe('https://panini.com.br/x-men');
            expect(result.successes[1].product.title).toBe('X-Men');
            expect(result.successes[2].url).toBe('https://panini.com.br/spider-man');
            expect(result.successes[2].product.title).toBe('Spider-Man');
        });

        it('should handle partial success when some URLs are invalid', async () => {
            const urls = [
                'https://panini.com.br/wolverine',
                'invalid-url',
                'https://panini.com.br/x-men'
            ];

            const result = await useCase.executeMany(urls);

            expect(result.totalProcessed).toBe(3);
            expect(result.successCount).toBe(2);
            expect(result.failureCount).toBe(1);
            expect(result.successes).toHaveLength(2);
            expect(result.failures).toHaveLength(1);

            // Verify successful products
            expect(result.successes[0].product.title).toBe('Wolverine');
            expect(result.successes[1].product.title).toBe('X-Men');

            // Verify failure details
            expect(result.failures[0].url).toBe('invalid-url');
            expect(result.failures[0].error).toBeInstanceOf(InvalidUrlError);
            expect(result.failures[0].message).toContain('Invalid or malformed URL');
        });

        it('should handle all URLs failing', async () => {
            const urls = [
                'invalid-url-1',
                '',
                'not-a-url'
            ];

            const result = await useCase.executeMany(urls);

            expect(result.totalProcessed).toBe(3);
            expect(result.successCount).toBe(0);
            expect(result.failureCount).toBe(3);
            expect(result.successes).toHaveLength(0);
            expect(result.failures).toHaveLength(3);

            // All should have error details
            result.failures.forEach(failure => {
                expect(failure.error).toBeInstanceOf(ProductScrapingError);
                expect(failure.message).toBeTruthy();
            });
        });

        it('should handle empty URL array', async () => {
            const result = await useCase.executeMany([]);

            expect(result.totalProcessed).toBe(0);
            expect(result.successCount).toBe(0);
            expect(result.failureCount).toBe(0);
            expect(result.successes).toHaveLength(0);
            expect(result.failures).toHaveLength(0);
        });

        it('should categorize different error types correctly', async () => {
            const urls = [
                'https://panini.com.br/wolverine',  // Success
                'invalid-url',                       // InvalidUrlError
                'https://panini.com.br/not-found',  // ProductNotFoundError
                'https://panini.com.br/network-error' // ProductScrapingError
            ];

            const result = await useCase.executeMany(urls);

            expect(result.totalProcessed).toBe(4);
            expect(result.successCount).toBe(1);
            expect(result.failureCount).toBe(3);

            // Verify error types
            expect(result.failures[0].error).toBeInstanceOf(InvalidUrlError);
            expect(result.failures[1].error).toBeInstanceOf(ProductNotFoundError);
            expect(result.failures[2].error).toBeInstanceOf(ProductScrapingError);
        });

        it('should process URLs sequentially in order', async () => {
            const urls = [
                'https://panini.com.br/wolverine',
                'https://panini.com.br/x-men',
                'https://panini.com.br/spider-man'
            ];

            const executionOrder: string[] = [];
            
            // Create a custom repository that tracks order
            class OrderTrackingRepository implements ProductRepository {
                async scrapeProduct(url: string): Promise<Product> {
                    executionOrder.push(url);
                    return mockRepository.scrapeProduct(url);
                }
            }
            
            const trackingRepo = new OrderTrackingRepository();
            const trackingUseCase = new ScrapeProductUseCase(trackingRepo);

            await trackingUseCase.executeMany(urls);

            // Verify order matches input order
            expect(executionOrder).toEqual(urls);
        });

        it('should handle mixed success and failure cases', async () => {
            const urls = [
                'https://panini.com.br/wolverine',    // Success
                'https://panini.com.br/not-found',    // Failure
                'https://panini.com.br/x-men',        // Success
                'invalid-url',                         // Failure
                'https://panini.com.br/spider-man'    // Success
            ];

            const result = await useCase.executeMany(urls);

            expect(result.totalProcessed).toBe(5);
            expect(result.successCount).toBe(3);
            expect(result.failureCount).toBe(2);

            // Verify successes
            expect(result.successes.map(s => s.product.title)).toEqual([
                'Wolverine',
                'X-Men',
                'Spider-Man'
            ]);

            // Verify failures
            expect(result.failures.map(f => f.url)).toEqual([
                'https://panini.com.br/not-found',
                'invalid-url'
            ]);
        });

        it('should normalize URLs before scraping in batch', async () => {
            const urls = [
                'panini.com.br/wolverine',           // Missing protocol
                'https://panini.com.br/x-men/',      // Trailing slash
            ];

            const spy = jest.spyOn(mockRepository, 'scrapeProduct');
            
            await useCase.executeMany(urls);

            // Verify normalized URLs were passed to repository
            expect(spy).toHaveBeenCalledWith('https://panini.com.br/wolverine');
            expect(spy).toHaveBeenCalledWith('https://panini.com.br/x-men');
        });

        it('should include error messages in failure results', async () => {
            const urls = [
                'invalid-url',
                'https://panini.com.br/not-found'
            ];

            const result = await useCase.executeMany(urls);

            expect(result.failures).toHaveLength(2);
            
            // Each failure should have a message
            result.failures.forEach(failure => {
                expect(failure.message).toBeTruthy();
                expect(typeof failure.message).toBe('string');
                expect(failure.message.length).toBeGreaterThan(0);
            });
        });

        it('should preserve URL in both success and failure results', async () => {
            const urls = [
                'https://panini.com.br/wolverine',
                'invalid-url',
                'https://panini.com.br/x-men'
            ];

            const result = await useCase.executeMany(urls);

            // Verify URLs are preserved in successes
            expect(result.successes[0].url).toBe('https://panini.com.br/wolverine');
            expect(result.successes[1].url).toBe('https://panini.com.br/x-men');

            // Verify URL is preserved in failure
            expect(result.failures[0].url).toBe('invalid-url');
        });

        it('should handle single URL in array', async () => {
            const urls = ['https://panini.com.br/wolverine'];

            const result = await useCase.executeMany(urls);

            expect(result.totalProcessed).toBe(1);
            expect(result.successCount).toBe(1);
            expect(result.failureCount).toBe(0);
            expect(result.successes[0].product.title).toBe('Wolverine');
        });
    });
});

