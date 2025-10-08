import { Router } from 'express';
import express from 'express';
import { ApiController } from './api.controller';

/**
 * Creates and configures API routes
 * @param apiController - The API controller instance
 * @returns Configured Express router
 */
export function createApiRoutes(apiController: ApiController): Router {
    const router = Router();

    // Health check endpoint
    router.get('/health', (req, res) => apiController.healthCheck(req, res));

    // API information endpoint
    router.get('/', (req, res) => apiController.getApiInfo(req, res));

    // Product scraping endpoints
    router.post('/api/scrape', (req, res) => apiController.scrapeProduct(req, res));
    router.get('/api/scrape', (req, res) => apiController.scrapeProductByQuery(req, res));

    return router;
}

/**
 * Creates Express application with configured routes and middleware
 * @param apiController - The API controller instance
 * @returns Configured Express application
 */
export function createApp(apiController: ApiController) {
    const app = express();

    // Middleware
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    // CORS headers
    app.use((req: any, res: any, next: any) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

        if (req.method === 'OPTIONS') {
            res.sendStatus(200);
        } else {
            next();
        }
    });

    // Request logging middleware
    app.use((req: any, _res: any, next: any) => {
        const timestamp = new Date().toISOString();
        // eslint-disable-next-line no-console
        console.log(`[${timestamp}] ${req.method} ${req.url}`);
        next();
    });

    // API routes
    const routes = createApiRoutes(apiController);
    app.use('/', routes);

    // Error handling middleware
    app.use((err: any, _req: any, res: any, _next: any) => {
        // eslint-disable-next-line no-console
        console.error('Unhandled error:', err);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'An unexpected error occurred',
            code: 'INTERNAL_ERROR'
        });
    });

    // 404 handler
    app.use((req: any, res: any) => {
        res.status(404).json({
            error: 'Not Found',
            message: `Route ${req.method} ${req.url} not found`,
            code: 'ROUTE_NOT_FOUND'
        });
    });

    return app;
}