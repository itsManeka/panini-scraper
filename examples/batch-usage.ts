/**
 * Example demonstrating batch scraping functionality
 * This example shows how to scrape multiple products in a single call
 * with automatic error handling and partial results
 */

import { scrapePaniniProducts, InvalidUrlError, ProductNotFoundError } from '../src/index';

/**
 * Example 1: Basic batch scraping
 */
async function basicBatchExample() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('Example 1: Basic Batch Scraping');
    console.log('═══════════════════════════════════════════════════════\n');

    const urls = [
        'https://panini.com.br/crise-final-grandes-eventos-dc',
        'https://panini.com.br/absolute-batman-01',
        'https://panini.com.br/elektra-assassina-aelea001'
    ];

    try {
        const result = await scrapePaniniProducts(urls);

        console.log(`✅ Successfully scraped: ${result.successCount}/${result.totalProcessed} products`);
        console.log(`❌ Failed: ${result.failureCount} products\n`);

        // Display successful results
        if (result.successCount > 0) {
            console.log('Successful Results:');
            result.successes.forEach(({ url, product }, index) => {
                console.log(`\n${index + 1}. ${product.title}`);
                console.log(`   Price: R$ ${product.currentPrice}`);
                console.log(`   In Stock: ${product.inStock}`);
                console.log(`   URL: ${url}`);
            });
        }

        // Display failures (if any)
        if (result.failureCount > 0) {
            console.log('\n\nFailed Results:');
            result.failures.forEach(({ url, message }, index) => {
                console.log(`\n${index + 1}. URL: ${url}`);
                console.log(`   Error: ${message}`);
            });
        }
    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

/**
 * Example 2: Batch scraping with mixed valid and invalid URLs
 */
async function mixedBatchExample() {
    console.log('\n\n═══════════════════════════════════════════════════════');
    console.log('Example 2: Batch Scraping with Mixed URLs');
    console.log('═══════════════════════════════════════════════════════\n');

    const urls = [
        'https://panini.com.br/crise-final-grandes-eventos-dc',  // Valid
        'https://panini.com.br/nonexistent-product-12345',       // Will fail
        'not-a-valid-url',                                        // Invalid URL
        'https://panini.com.br/batman-terra-um-1'                // Valid
    ];

    const result = await scrapePaniniProducts(urls);

    console.log('Summary:');
    console.log(`  Total Processed: ${result.totalProcessed}`);
    console.log(`  ✅ Successes: ${result.successCount}`);
    console.log(`  ❌ Failures: ${result.failureCount}`);

    // Calculate success rate
    const successRate = (result.successCount / result.totalProcessed) * 100;
    console.log(`  📊 Success Rate: ${successRate.toFixed(1)}%\n`);

    // Display results
    console.log('Successful Products:');
    result.successes.forEach(({ product }) => {
        console.log(`  - ${product.title} (R$ ${product.currentPrice})`);
    });

    console.log('\nFailed URLs:');
    result.failures.forEach(({ url, error }) => {
        let errorType = 'Unknown';
        if (error instanceof InvalidUrlError) {
            errorType = 'Invalid URL';
        } else if (error instanceof ProductNotFoundError) {
            errorType = 'Product Not Found';
        }
        console.log(`  - ${url} (${errorType})`);
    });
}

/**
 * Example 3: Batch scraping with custom configuration
 */
async function batchWithConfigExample() {
    console.log('\n\n═══════════════════════════════════════════════════════');
    console.log('Example 3: Batch Scraping with Custom Configuration');
    console.log('═══════════════════════════════════════════════════════\n');

    const urls = [
        'https://panini.com.br/crise-final-grandes-eventos-dc',
        'https://panini.com.br/batman-terra-um-1'
    ];

    const config = {
        timeout: 15000,
        headers: {
            'User-Agent': 'PaniniBatchScraperExample/1.0'
        }
    };

    console.log('Configuration:');
    console.log(`  Timeout: ${config.timeout}ms`);
    console.log(`  User-Agent: ${config.headers['User-Agent']}\n`);

    const result = await scrapePaniniProducts(urls, config);

    console.log(`Results: ${result.successCount}/${result.totalProcessed} successful\n`);

    result.successes.forEach(({ product }) => {
        console.log(`✓ ${product.title}`);
        console.log(`  Format: ${product.format}`);
        console.log(`  Contributors: ${product.contributors.join(', ')}`);
        console.log(`  Price: R$ ${product.currentPrice}\n`);
    });
}

/**
 * Example 4: Processing batch results for different use cases
 */
async function processingResultsExample() {
    console.log('\n\n═══════════════════════════════════════════════════════');
    console.log('Example 4: Processing Batch Results');
    console.log('═══════════════════════════════════════════════════════\n');

    const urls = [
        'https://panini.com.br/crise-final-grandes-eventos-dc',
        'https://panini.com.br/batman-terra-um-1'
    ];

    const result = await scrapePaniniProducts(urls);

    // Calculate total value
    const totalValue = result.successes.reduce((sum, { product }) => {
        return sum + product.currentPrice;
    }, 0);

    console.log(`Total products scraped: ${result.successCount}`);
    console.log(`Combined value: R$ ${totalValue.toFixed(2)}\n`);

    // Find products with discount
    const discountedProducts = result.successes.filter(
        ({ product }) => product.fullPrice > product.currentPrice
    );

    console.log(`Products with discount: ${discountedProducts.length}`);
    discountedProducts.forEach(({ product }) => {
        const discount = ((1 - product.currentPrice / product.fullPrice) * 100).toFixed(0);
        console.log(`  - ${product.title}: ${discount}% off`);
    });

    // Check availability
    const inStockCount = result.successes.filter(({ product }) => product.inStock).length;
    console.log(`\nIn stock: ${inStockCount}/${result.successCount}`);

    // Pre-order status
    const preOrderCount = result.successes.filter(({ product }) => product.isPreOrder).length;
    console.log(`Pre-order: ${preOrderCount}/${result.successCount}`);
}

/**
 * Main function to run all examples
 */
async function main() {
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║        Panini Scraper - Batch Usage Examples         ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

    try {
        await basicBatchExample();
        await new Promise(resolve => setTimeout(resolve, 2000));

        await mixedBatchExample();
        await new Promise(resolve => setTimeout(resolve, 2000));

        await batchWithConfigExample();
        await new Promise(resolve => setTimeout(resolve, 2000));

        await processingResultsExample();

        console.log('\n\n╔═══════════════════════════════════════════════════════╗');
        console.log('║              All Examples Completed! ✓                ║');
        console.log('╚═══════════════════════════════════════════════════════╝\n');
    } catch (error) {
        console.error('Error running examples:', error);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    main();
}

export { basicBatchExample, mixedBatchExample, batchWithConfigExample, processingResultsExample };

