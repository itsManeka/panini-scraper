const { HttpClient } = require('./dist/infrastructure/httpClient.js');
const cheerio = require('cheerio');

async function detailedAnalysis() {
  const httpClient = new HttpClient();
  
  try {
    console.log('Fetching page...');
    const html = await httpClient.get('https://panini.com.br/colecao-msp-50');
    const $ = cheerio.load(html);
    
    console.log('=== DETAILED ANALYSIS OF PRODUCT PAGE ===');
    
    // Look for JSON-LD structured data
    console.log('\n1. JSON-LD STRUCTURED DATA:');
    $('script[type="application/ld+json"]').each((i, element) => {
      try {
        const jsonData = JSON.parse($(element).html() || '{}');
        console.log('JSON-LD found:', JSON.stringify(jsonData, null, 2));
      } catch (e) {
        console.log('Invalid JSON-LD found');
      }
    });
    
    // Look for all IMG tags with their attributes
    console.log('\n2. ALL IMG TAGS:');
    $('img').each((i, element) => {
      const img = $(element);
      console.log(`IMG ${i + 1}:`);
      console.log(`  src: ${img.attr('src') || 'N/A'}`);
      console.log(`  data-src: ${img.attr('data-src') || 'N/A'}`);
      console.log(`  data-original: ${img.attr('data-original') || 'N/A'}`);
      console.log(`  data-lazy: ${img.attr('data-lazy') || 'N/A'}`);
      console.log(`  alt: ${img.attr('alt') || 'N/A'}`);
      console.log(`  class: ${img.attr('class') || 'N/A'}`);
      console.log('');
    });
    
    // Look for specific image patterns in entire HTML
    console.log('\n3. SEARCHING FOR CLOUDFRONT URLS:');
    const htmlContent = $.html();
    
    // More specific CloudFront patterns
    const cloudFrontMatches = htmlContent.match(/https:\/\/d[a-z0-9]+\.cloudfront\.net\/[^"'\s<>]+/gi);
    if (cloudFrontMatches) {
      console.log('CloudFront URLs found:');
      cloudFrontMatches.forEach((url, i) => {
        console.log(`${i + 1}: ${url}`);
      });
    } else {
      console.log('No CloudFront URLs found');
    }
    
    // Look for the specific pattern you mentioned
    console.log('\n4. SEARCHING FOR SPECIFIC PATTERN:');
    if (htmlContent.includes('d14d9vp3wdof84.cloudfront.net')) {
      console.log('Found the specific CloudFront domain!');
      const specificPattern = htmlContent.match(/https:\/\/d14d9vp3wdof84\.cloudfront\.net\/[^"'\s<>]+/gi);
      if (specificPattern) {
        console.log('Specific URLs:', specificPattern);
      }
    } else {
      console.log('The specific CloudFront domain was not found in HTML');
    }
    
    // Look for any references to the product code APMSP001
    console.log('\n5. SEARCHING FOR PRODUCT CODE:');
    if (htmlContent.includes('APMSP001')) {
      console.log('Product code APMSP001 found in HTML');
      const context = htmlContent.match(/.{0,100}APMSP001.{0,100}/gi);
      if (context) {
        context.forEach((ctx, i) => {
          console.log(`Context ${i + 1}: ${ctx}`);
        });
      }
    } else {
      console.log('Product code APMSP001 not found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

detailedAnalysis();