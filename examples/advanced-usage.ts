/**
 * Advanced Usage Example for Panini Scraper
 * 
 * This file demonstrates advanced usage patterns including:
 * - Batch scraping multiple products
 * - Custom configuration (timeout, headers)
 * - Error handling
 * - Reusable scraper instances
 * 
 * Run with: npx ts-node examples/advanced-usage.ts
 */

import { 
    createPaniniScraper, 
    scrapePaniniProduct,
    InvalidUrlError,
    ProductNotFoundError,
    Product 
} from '../src';

/**
 * Example 1: Scrape multiple products efficiently
 */
async function batchScraping() {
    console.log('📚 Example 1: Batch Scraping\n');
    
    // Create a reusable scraper instance
    const scraper = createPaniniScraper({ 
        timeout: 10000 
    });
    
    const urls = [
        'https://panini.com.br/wolverine-2025-05',
        'https://panini.com.br/a-fabulosa-x-force',
        'https://panini.com.br/batman-dark-knight'
    ];
    
    console.log(`Scraping ${urls.length} products...\n`);
    
    try {
        const products = await Promise.all(
            urls.map(url => scraper(url))
        );
        
        console.log('✅ All products scraped successfully!\n');
        
        products.forEach((product, index) => {
            console.log(`${index + 1}. ${product.title}`);
            console.log(`   Price: R$ ${product.currentPrice.toFixed(2)}`);
            console.log(`   Stock: ${product.inStock ? 'Available' : 'Out of stock'}\n`);
        });
        
    } catch (error) {
        console.error('Error during batch scraping:', error);
    }
}

/**
 * Example 2: Custom configuration with proxy
 */
async function customConfiguration() {
    console.log('⚙️  Example 2: Custom Configuration\n');
    
    try {
        const product = await scrapePaniniProduct(
            'https://panini.com.br/product',
            {
                timeout: 15000,
                headers: {
                    'X-Custom-Header': 'MyApp/1.0'
                },
                userAgent: 'MyCustomBot/1.0',
                // Uncomment to use a proxy:
                // proxy: {
                //     host: 'proxy.example.com',
                //     port: 8080,
                //     auth: {
                //         username: 'user',
                //         password: 'pass'
                //     }
                // }
            }
        );
        
        console.log('✅ Product scraped with custom config:');
        console.log(`   ${product.title} - R$ ${product.currentPrice}`);
        
    } catch (error) {
        console.error('Error with custom config:', error);
    }
}

/**
 * Example 3: Advanced error handling
 */
async function advancedErrorHandling() {
    console.log('🛡️  Example 3: Advanced Error Handling\n');
    
    const urls = [
        'https://panini.com.br/valid-product',
        'https://example.com/invalid-domain',
        'invalid-url',
        'https://panini.com.br/non-existent-product'
    ];
    
    for (const url of urls) {
        try {
            const product = await scrapePaniniProduct(url);
            console.log(`✅ ${url}: ${product.title}`);
            
        } catch (error) {
            if (error instanceof InvalidUrlError) {
                console.log(`❌ ${url}: Invalid URL`);
            } else if (error instanceof ProductNotFoundError) {
                console.log(`❌ ${url}: Product not found`);
            } else {
                console.log(`❌ ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
    }
}

/**
 * Example 4: Product filtering and analysis
 */
async function productAnalysis() {
    console.log('📊 Example 4: Product Analysis\n');
    
    const scraper = createPaniniScraper();
    
    const urls = [
        'https://panini.com.br/product1',
        'https://panini.com.br/product2',
        'https://panini.com.br/product3'
    ];
    
    try {
        const products = await Promise.all(
            urls.map(async url => {
                try {
                    return await scraper(url);
                } catch {
                    return null;
                }
            })
        );
        
        // Filter out failed scrapes
        const validProducts = products.filter((p): p is Product => p !== null);
        
        // Find products with discounts
        const discountedProducts = validProducts.filter(
            p => p.currentPrice < p.fullPrice
        );
        
        // Find pre-order products
        const preOrderProducts = validProducts.filter(p => p.isPreOrder);
        
        // Calculate average price
        const avgPrice = validProducts.reduce((sum, p) => sum + p.currentPrice, 0) 
            / validProducts.length;
        
        console.log(`📈 Analysis Results:`);
        console.log(`   Total products: ${validProducts.length}`);
        console.log(`   With discounts: ${discountedProducts.length}`);
        console.log(`   Pre-orders: ${preOrderProducts.length}`);
        console.log(`   Average price: R$ ${avgPrice.toFixed(2)}\n`);
        
        if (discountedProducts.length > 0) {
            console.log('💰 Best Deals:');
            discountedProducts
                .sort((a, b) => {
                    const discountA = (a.fullPrice - a.currentPrice) / a.fullPrice;
                    const discountB = (b.fullPrice - b.currentPrice) / b.fullPrice;
                    return discountB - discountA;
                })
                .slice(0, 3)
                .forEach(product => {
                    const discount = Math.round(
                        ((product.fullPrice - product.currentPrice) / product.fullPrice) * 100
                    );
                    console.log(`   ${discount}% off - ${product.title}`);
                });
        }
        
    } catch (error) {
        console.error('Error during analysis:', error);
    }
}

/**
 * Run all examples
 */
async function main() {
    console.log('🧩 Panini Scraper - Advanced Usage Examples\n');
    console.log('='.repeat(60) + '\n');
    
    // Note: Comment out examples to run individually
    // await batchScraping();
    // console.log('\n' + '='.repeat(60) + '\n');
    
    // await customConfiguration();
    // console.log('\n' + '='.repeat(60) + '\n');
    
    // await advancedErrorHandling();
    // console.log('\n' + '='.repeat(60) + '\n');
    
    // await productAnalysis();
    
    console.log('ℹ️  Note: Uncomment examples in main() to run them.');
    console.log('   Make sure to use valid Panini Brasil product URLs.');
}

main();

