/**
 * Basic Usage Example for Panini Scraper
 * 
 * This file demonstrates the basic usage of the panini-scraper library.
 * Run with: npx ts-node examples/basic-usage.ts
 */

import { scrapePaniniProduct, InvalidUrlError, ProductNotFoundError } from '../src';

async function basicExample() {
    console.log('🧩 Panini Scraper - Basic Usage Example\n');

    try {
        console.log('📡 Scraping product...\n');
        
        // Example URL (replace with a real Panini Brasil product URL)
        const url = 'https://panini.com.br/wolverine-2025-05';
        
        const product = await scrapePaniniProduct(url);
        
        console.log('✅ Product found!\n');
        console.log('📦 Product Details:');
        console.log('─────────────────────────────────────');
        console.log(`Title:         ${product.title}`);
        console.log(`Full Price:    R$ ${product.fullPrice.toFixed(2)}`);
        console.log(`Current Price: R$ ${product.currentPrice.toFixed(2)}`);
        console.log(`In Stock:      ${product.inStock ? '✓' : '✗'}`);
        console.log(`Pre-order:     ${product.isPreOrder ? '✓' : '✗'}`);
        console.log(`Product ID:    ${product.id}`);
        console.log(`Format:        ${product.format}`);
        console.log(`Contributors:  ${product.contributors.join(', ')}`);
        console.log(`Image URL:     ${product.imageUrl}`);
        console.log(`Product URL:   ${product.url}`);
        console.log('─────────────────────────────────────\n');
        
        // Calculate discount if applicable
        const discount = product.fullPrice - product.currentPrice;
        if (discount > 0) {
            const percentage = Math.round((discount / product.fullPrice) * 100);
            console.log(`💰 Discount: ${percentage}% (R$ ${discount.toFixed(2)} off)`);
        } else {
            console.log('💰 No discount available');
        }
        
    } catch (error) {
        console.error('❌ Error occurred:\n');
        
        if (error instanceof InvalidUrlError) {
            console.error('Invalid URL provided:');
            console.error(`  URL: ${error.url}`);
            console.error('  Please provide a valid Panini Brasil product URL.');
        } else if (error instanceof ProductNotFoundError) {
            console.error('Product not found:');
            console.error(`  URL: ${error.url}`);
            console.error('  The product may no longer exist or the page structure changed.');
        } else if (error instanceof Error) {
            console.error(`Unexpected error: ${error.message}`);
        } else {
            console.error('Unknown error occurred');
        }
        
        process.exit(1);
    }
}

// Run the example
basicExample();

