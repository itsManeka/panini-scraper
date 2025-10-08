import { Request, Response } from 'express';
import { ScrapeProductUseCase } from '../usecases';
import {
    Product,
    ProductScrapingError,
    ProductNotFoundError,
    InvalidUrlError
} from '../domain';

/**
 * API Controller for product scraping operations
 */
export class ApiController {
    constructor(private readonly scrapeProductUseCase: ScrapeProductUseCase) { }

    /**
     * Handles product scraping requests
     * @param req - Express request object
     * @param res - Express response object
     */
    async scrapeProduct(req: Request, res: Response): Promise<void> {
        try {
            const { url } = req.body;

            if (!url) {
                res.status(400).json({
                    error: 'Bad Request',
                    message: 'URL is required',
                    code: 'MISSING_URL'
                });
                return;
            }

            const product: Product = await this.scrapeProductUseCase.execute(url);

            res.status(200).json({
                success: true,
                data: product
            });
        } catch (error: unknown) {
            this.handleError(error, res);
        }
    }

    /**
     * Handles product scraping requests via GET with URL as query parameter
     * @param req - Express request object
     * @param res - Express response object
     */
    async scrapeProductByQuery(req: Request, res: Response): Promise<void> {
        try {
            const { url } = req.query;

            if (!url || typeof url !== 'string') {
                res.status(400).json({
                    error: 'Bad Request',
                    message: 'URL query parameter is required',
                    code: 'MISSING_URL'
                });
                return;
            }

            const product: Product = await this.scrapeProductUseCase.execute(url);

            res.status(200).json({
                success: true,
                data: product
            });
        } catch (error: unknown) {
            this.handleError(error, res);
        }
    }

    /**
     * Health check endpoint
     * @param req - Express request object
     * @param res - Express response object
     */
    async healthCheck(req: Request, res: Response): Promise<void> {
        res.status(200).json({
            success: true,
            message: 'Panini Scraper API is running',
            version: process.env.npm_package_version || '1.0.0',
            timestamp: new Date().toISOString()
        });
    }

    /**
     * API information endpoint
     * @param req - Express request object
     * @param res - Express response object
     */
    async getApiInfo(req: Request, res: Response): Promise<void> {
        res.status(200).json({
            name: 'Panini Scraper API',
            description: 'API for scraping Panini Brasil product information',
            version: process.env.npm_package_version || '1.0.0',
            endpoints: {
                'POST /api/scrape': 'Scrape product by URL in request body',
                'GET /api/scrape': 'Scrape product by URL in query parameter',
                'GET /health': 'Health check endpoint',
                'GET /': 'API information'
            },
            documentation: 'https://github.com/itsManeka/panini-scraper#readme'
        });
    }

    /**
     * Handles different types of errors and sends appropriate responses
     * @param error - The error that occurred
     * @param res - Express response object
     */
    private handleError(error: unknown, res: Response): void {
        if (error instanceof InvalidUrlError) {
            res.status(400).json({
                error: 'Bad Request',
                message: error.message,
                code: 'INVALID_URL',
                url: error.url
            });
            return;
        }

        if (error instanceof ProductNotFoundError) {
            res.status(404).json({
                error: 'Not Found',
                message: error.message,
                code: 'PRODUCT_NOT_FOUND',
                url: error.url
            });
            return;
        }

        if (error instanceof ProductScrapingError) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
                code: 'SCRAPING_ERROR',
                url: error.url,
                statusCode: error.statusCode
            });
            return;
        }

        // Generic error handling
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        res.status(500).json({
            error: 'Internal Server Error',
            message: errorMessage,
            code: 'INTERNAL_ERROR'
        });
    }
}