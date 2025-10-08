#!/usr/bin/env node

/**
 * CLI and Server entry point for Panini Scraper API
 * This file can be used to start the API server or run CLI operations
 */

import { ScrapeProductUseCase } from './usecases';
import { PaniniScraperService } from './infrastructure';
import { ApiController, createApp } from './interfaces';

/**
 * Starts the API server
 * @param port - Port number to listen on
 */
async function startServer(port: number = 3000): Promise<void> {
    try {
        // Create dependencies
        const scraperService = new PaniniScraperService();
        const useCase = new ScrapeProductUseCase(scraperService);
        const controller = new ApiController(useCase);

        // Create and start the app
        const app = createApp(controller);

        app.listen(port, () => {
            console.log(`🚀 Panini Scraper API is running on port ${port}`);
            console.log(`📖 API Documentation: http://localhost:${port}/`);
            console.log(`❤️  Health Check: http://localhost:${port}/health`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

/**
 * CLI scraping function
 * @param url - URL to scrape
 */
async function cliScrape(url: string): Promise<void> {
    try {
        const scraperService = new PaniniScraperService();
        const useCase = new ScrapeProductUseCase(scraperService);

        console.log(`🔍 Scraping: ${url}`);
        const product = await useCase.execute(url);

        console.log('✅ Product scraped successfully:');
        console.log(JSON.stringify(product, null, 2));
    } catch (error) {
        console.error('❌ Scraping failed:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

// Main CLI logic
async function main(): Promise<void> {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        // No arguments - start server
        const port = parseInt(process.env.PORT || '3000', 10);
        await startServer(port);
        return;
    }

    const command = args[0];

    switch (command) {
        case 'server':
        case 'start': {
            const port = parseInt(args[1] || process.env.PORT || '3000', 10);
            await startServer(port);
            break;
        }

        case 'scrape':
            if (args[1]) {
                await cliScrape(args[1]);
            } else {
                console.error('❌ Please provide a URL to scrape');
                console.log('Usage: panini-scraper scrape <url>');
                process.exit(1);
            }
            break;

        case 'help':
        case '--help':
        case '-h':
            console.log(`
🧩 Panini Scraper CLI

Usage:
  panini-scraper                    Start API server on port 3000
  panini-scraper server [port]     Start API server on specified port
  panini-scraper scrape <url>      Scrape a single product URL
  panini-scraper help              Show this help message

Examples:
  panini-scraper server 8080
  panini-scraper scrape https://panini.com.br/a-vida-de-wolverine

Environment Variables:
  PORT                             Port for API server (default: 3000)
      `);
            break;

        default:
            console.error(`❌ Unknown command: ${command}`);
            console.log('Use "panini-scraper help" for usage information');
            process.exit(1);
    }
}

// Run if this file is executed directly
if (require.main === module) {
    main().catch((error) => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
}