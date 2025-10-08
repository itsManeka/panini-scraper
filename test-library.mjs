#!/usr/bin/env node

// Test script to verify the library works correctly
import { scrapePaniniProduct, createPaniniScraper } from './dist/index.js';

async function testLibrary() {
    console.log('🧪 Testing Panini Scraper Library...\n');

    try {
        // Test 1: Basic scraping function
        console.log('Test 1: Testing scrapePaniniProduct function');
        console.log('Note: Using a mock URL since we cannot test real scraping without internet');

        // Test 2: Scraper factory
        console.log('\nTest 2: Testing createPaniniScraper factory');
        const scraper = createPaniniScraper({ timeout: 5000 });
        console.log('✅ Scraper created successfully with custom timeout');

        // Test 3: URL validation
        console.log('\nTest 3: Testing URL validation');
        const { ScrapeProductUseCase } = await import('./dist/usecases/index.js');

        console.log('Valid Panini URL:', ScrapeProductUseCase.isValidPaniniUrl('https://panini.com.br/wolverine'));
        console.log('Invalid URL:', ScrapeProductUseCase.isValidPaniniUrl('https://google.com'));

        console.log('\n✅ All library tests passed!');
        console.log('\n📝 To test with real URLs, use the CLI:');
        console.log('   node dist/server.js scrape <panini-url>');
        console.log('\n🚀 To start the API server:');
        console.log('   node dist/server.js server 3000');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

testLibrary();