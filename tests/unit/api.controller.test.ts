import { ApiController } from '../../src/interfaces/api.controller';
import { ScrapeProductUseCase } from '../../src/usecases/scrapeProduct.usecase';
import {
    InvalidUrlError,
    ProductNotFoundError,
    ProductScrapingError
} from '../../src/domain';

// Get package version dynamically
const packageJson = require('../../package.json');
const PACKAGE_VERSION = packageJson.version;

// Mock use case
const mockScrapeProductUseCase = {
    execute: jest.fn()
} as unknown as jest.Mocked<ScrapeProductUseCase>;

describe('ApiController', () => {
    let controller: ApiController;
    let mockRequest: any;
    let mockResponse: any;

    beforeEach(() => {
        controller = new ApiController(mockScrapeProductUseCase);

        // Reset mocks
        jest.clearAllMocks();

        // Mock Express request
        mockRequest = {
            body: {},
            query: {}
        };

        // Mock Express response
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    describe('scrapeProduct', () => {
        it('should successfully scrape product from request body', async () => {
            const mockProduct = {
                title: 'Test Product',
                fullPrice: 50.00,
                currentPrice: 40.00,
                isPreOrder: false,
                inStock: true,
                imageUrl: 'https://example.com/image.jpg',
                url: 'https://panini.com.br/test-product',
                id: 'TEST001'
            };

            mockRequest.body = { url: 'https://panini.com.br/test-product' };
            mockScrapeProductUseCase.execute.mockResolvedValue(mockProduct);

            await controller.scrapeProduct(mockRequest, mockResponse);

            expect(mockScrapeProductUseCase.execute).toHaveBeenCalledWith('https://panini.com.br/test-product');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockProduct
            });
        });

        it('should return 400 for missing URL', async () => {
            mockRequest.body = {};

            await controller.scrapeProduct(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Bad Request',
                message: 'URL is required',
                code: 'MISSING_URL'
            });
        });

        it('should handle InvalidUrlError', async () => {
            const error = new InvalidUrlError('invalid-url');
            mockRequest.body = { url: 'invalid-url' };
            mockScrapeProductUseCase.execute.mockRejectedValue(error);

            await controller.scrapeProduct(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Bad Request',
                message: error.message,
                code: 'INVALID_URL',
                url: 'invalid-url'
            });
        });

        it('should handle ProductNotFoundError', async () => {
            const error = new ProductNotFoundError('https://panini.com.br/not-found');
            mockRequest.body = { url: 'https://panini.com.br/not-found' };
            mockScrapeProductUseCase.execute.mockRejectedValue(error);

            await controller.scrapeProduct(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Not Found',
                message: error.message,
                code: 'PRODUCT_NOT_FOUND',
                url: 'https://panini.com.br/not-found'
            });
        });

        it('should handle ProductScrapingError', async () => {
            const error = new ProductScrapingError('Scraping failed', 'https://panini.com.br/error', 500);
            mockRequest.body = { url: 'https://panini.com.br/error' };
            mockScrapeProductUseCase.execute.mockRejectedValue(error);

            await controller.scrapeProduct(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Internal Server Error',
                message: error.message,
                code: 'SCRAPING_ERROR',
                url: 'https://panini.com.br/error',
                statusCode: 500
            });
        });

        it('should handle generic errors', async () => {
            const error = new Error('Generic error');
            mockRequest.body = { url: 'https://panini.com.br/generic-error' };
            mockScrapeProductUseCase.execute.mockRejectedValue(error);

            await controller.scrapeProduct(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Internal Server Error',
                message: 'Generic error',
                code: 'INTERNAL_ERROR'
            });
        });
    });

    describe('scrapeProductByQuery', () => {
        it('should successfully scrape product from query parameter', async () => {
            const mockProduct = {
                title: 'Test Product',
                fullPrice: 50.00,
                currentPrice: 40.00,
                isPreOrder: false,
                inStock: true,
                imageUrl: 'https://example.com/image.jpg',
                url: 'https://panini.com.br/test-product',
                id: 'TEST001'
            };

            mockRequest.query = { url: 'https://panini.com.br/test-product' };
            mockScrapeProductUseCase.execute.mockResolvedValue(mockProduct);

            await controller.scrapeProductByQuery(mockRequest, mockResponse);

            expect(mockScrapeProductUseCase.execute).toHaveBeenCalledWith('https://panini.com.br/test-product');
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                data: mockProduct
            });
        });

        it('should return 400 for missing URL query parameter', async () => {
            mockRequest.query = {};

            await controller.scrapeProductByQuery(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Bad Request',
                message: 'URL query parameter is required',
                code: 'MISSING_URL'
            });
        });

        it('should return 400 for non-string URL parameter', async () => {
            mockRequest.query = { url: 123 };

            await controller.scrapeProductByQuery(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Bad Request',
                message: 'URL query parameter is required',
                code: 'MISSING_URL'
            });
        });
    });

    describe('healthCheck', () => {
        it('should return health status', async () => {
            await controller.healthCheck(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: true,
                message: 'Panini Scraper API is running',
                version: PACKAGE_VERSION,
                timestamp: expect.any(String)
            });
        });
    });

    describe('getApiInfo', () => {
        it('should return API information', async () => {
            await controller.getApiInfo(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                name: 'Panini Scraper API',
                description: 'API for scraping Panini Brasil product information',
                version: PACKAGE_VERSION,
                endpoints: {
                    'POST /api/scrape': 'Scrape product by URL in request body',
                    'GET /api/scrape': 'Scrape product by URL in query parameter',
                    'GET /health': 'Health check endpoint',
                    'GET /': 'API information'
                },
                documentation: 'https://github.com/itsManeka/panini-scraper#readme'
            });
        });
    });
});