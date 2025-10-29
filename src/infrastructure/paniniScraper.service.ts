import * as cheerio from 'cheerio';
import { ProductEntity, Product } from '../domain/product.entity';
import {
	ProductRepository,
	HttpConfig,
	ProductScrapingError,
	ProductNotFoundError,
	InvalidUrlError
} from '../domain/product.repository';
import { HttpClient } from './httpClient';

/**
 * Panini website scraper service that implements the ProductRepository interface
 */
export class PaniniScraperService implements ProductRepository {
	private readonly httpClient: HttpClient;
	private readonly baseUrl = 'https://panini.com.br';

	constructor(config?: HttpConfig) {
		this.httpClient = new HttpClient(config);
	}

	/**
	 * Scrapes product information from a Panini product page
	 * @param url - The product page URL
	 * @returns Promise that resolves to product information
	 */
	async scrapeProduct(url: string): Promise<Product> {
		this.validateUrl(url);

		try {
			const response = await this.httpClient.get(url);
			const html = response.data;
			const $ = cheerio.load(html);

			// Extract product information from the page
			const title = this.extractTitle($);
			const { fullPrice, currentPrice } = this.extractPrices($);
			const isPreOrder = this.extractPreOrderStatus($);
			const inStock = this.extractStockStatus($);
			const imageUrl = this.extractImageUrl($);
			const format = this.extractFormat($);
			const contributors = this.extractContributors($);
			const id = this.extractProductId($, url);

			const product = new ProductEntity(
				title,
				fullPrice,
				currentPrice,
				isPreOrder,
				inStock,
				imageUrl,
				url,
				format,
				contributors,
				id
			);

			return product.toJSON();
		} catch (error: unknown) {
			if (error instanceof ProductEntity) {
				throw error;
			}

			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			throw new ProductScrapingError(`Failed to scrape product: ${errorMessage}`, url);
		}
	}

	/**
	 * Validates if the URL is a valid Panini product URL
	 */
	private validateUrl(url: string): void {
		if (!url || typeof url !== 'string') {
			throw new InvalidUrlError(url);
		}

		const urlRegex = /^https?:\/\/(www\.)?panini\.com\.br/;
		if (!urlRegex.test(url)) {
			throw new InvalidUrlError(url);
		}
	}

	/**
	 * Extracts the product title from the page
	 */
	private extractTitle($: cheerio.CheerioAPI): string {
		// Try multiple selectors that might contain the product title
		const selectors = [
			'.product-title',
			'.product-name',
			'h1.title',
			'h1',
			'.page-title',
			'[data-testid="product-title"]'
		];

		for (const selector of selectors) {
			const title = $(selector).first().text().trim();
			if (title) {
				return title;
			}
		}

		throw new ProductNotFoundError('Could not find product title');
	}

	/**
	 * Extracts product prices from the page
	 */
	private extractPrices($: cheerio.CheerioAPI): { fullPrice: number; currentPrice: number } {
		let fullPrice = 0;
		let currentPrice = 0;

		// Look for original/full price with Panini-specific selectors
		const fullPriceSelectors = [
			'.old-price',        // Panini specific class
			'.price-original',
			'.price-old',
			'.was-price',
			'.regular-price',
			'.price.old'
		];

		for (const selector of fullPriceSelectors) {
			const priceText = $(selector).first().text();
			const extracted = this.extractPriceFromText(priceText);
			if (extracted > 0) {
				fullPrice = extracted;
				break;
			}
		}

		// Look for current/sale price with Panini-specific selectors
		const currentPriceSelectors = [
			'.price-current',
			'.current-price',
			'.new-price',
			'.price-sale',
			'.sale-price',
			'.special-price',
			'.price.new',
			'.price'
		];

		for (const selector of currentPriceSelectors) {
			const priceText = $(selector).first().text();
			const extracted = this.extractPriceFromText(priceText);
			if (extracted > 0) {
				currentPrice = extracted;
				break;
			}
		}

		// Try general price selectors if nothing found
		if (currentPrice === 0) {
			const generalSelectors = [
				'.product-price',
				'[data-testid="price"]',
				'.value',
				'.amount',
				'.price-box .price'
			];

			for (const selector of generalSelectors) {
				const priceText = $(selector).first().text();
				const extracted = this.extractPriceFromText(priceText);
				if (extracted > 0) {
					currentPrice = extracted;
					break;
				}
			}
		}

		// If no full price found, assume current price is the full price
		if (fullPrice === 0) {
			fullPrice = currentPrice;
		}

		if (currentPrice === 0) {
			throw new ProductNotFoundError('Could not find product price');
		}

		return { fullPrice, currentPrice };
	}    /**
     * Extracts numeric price from text
     */
	private extractPriceFromText(text: string): number {
		if (!text) return 0;

		// Remove currency symbols and extract number
		const priceMatch = text.match(/[\d.,]+/);
		if (!priceMatch) return 0;

		const priceString = priceMatch[0].replace(/\./g, '').replace(',', '.');
		return parseFloat(priceString) || 0;
	}

	/**
	 * Determines if the product is available for pre-order
	 */
	private extractPreOrderStatus($: cheerio.CheerioAPI): boolean {
		// First, check for specific Panini pre-order class
		const preOrderElement = $('.infobase-label-presale');
		if (preOrderElement.length > 0) {
			const preOrderText = preOrderElement.text().toLowerCase().trim();
			const display = preOrderElement.css('display');
			// Check if element exists and is not hidden
			if (preOrderText.includes('pré-venda') && display !== 'none') {
				return true;
			}
		}

		// Check for other pre-order indicators in specific sections
		const preOrderSelectors = [
			'.product-availability',
			'.availability-info',
			'.product-status',
			'.status-info',
			'.preorder-info'
		];

		for (const selector of preOrderSelectors) {
			const element = $(selector);
			if (element.length > 0) {
				const text = element.text().toLowerCase();
				if (text.includes('pré-venda') || text.includes('pre-order') || text.includes('pré-lançamento')) {
					return true;
				}
			}
		}

		// As a fallback, check for pre-order indicators but be more specific
		// Only check in product-specific areas, not the entire page
		const productArea = $('.product-main, .product-info, .product-details').text().toLowerCase();
		if (productArea) {
			const preOrderIndicators = ['pré-venda', 'pre-order', 'pré-lançamento'];
			return preOrderIndicators.some(indicator => productArea.includes(indicator));
		}

		return false;
	}    /**
     * Determines if the product is in stock
     */
	private extractStockStatus($: cheerio.CheerioAPI): boolean {
		const outOfStockIndicators = [
			'produto indisponível',
			'fora de estoque',
			'esgotado',
			'sem estoque',
			'indisponível'
		];

		const pageText = $('body').text().toLowerCase();
		const isOutOfStock = outOfStockIndicators.some(indicator => pageText.includes(indicator));

		return !isOutOfStock;
	}

	/**
	 * Extracts the product format (e.g., "Capa dura", "Brochura", "Digital")
	 * Looks for the "Encadernação" field in the product details table
	 */
	private extractFormat($: cheerio.CheerioAPI): string {
		// Try to find format in the product details table using data-th attribute
		const formatCell = $('td[data-th="Encadernação"]');
		if (formatCell.length > 0) {
			const format = formatCell.text().trim();
			if (format && format.length > 0) {
				return format;
			}
		}

		// Fallback: Try to find in table rows by label
		const detailsTable = $('table.additional-attributes, #product-attribute-specs-table');
		if (detailsTable.length > 0) {
			const rows = detailsTable.find('tr');
			for (let i = 0; i < rows.length; i++) {
				const row = rows.eq(i);
				const cell = row.find('td[data-th]');
				const dataThValue = cell.attr('data-th');

				if (dataThValue &&
					(dataThValue.toLowerCase().includes('encadernação') ||
						dataThValue.toLowerCase().includes('formato'))) {
					const value = cell.text().trim();
					if (value && value.length > 0) {
						return value;
					}
				}
			}
		}

		// Default format if not found
		return 'Formato não especificado';
	}

	/**
	 * Extracts the list of contributors (authors, artists, translators, etc.)
	 * Looks for the "Autores" field in the product details table
	 */
	private extractContributors($: cheerio.CheerioAPI): string[] {
		const contributors: string[] = [];

		// Try to find authors in the product details table using data-th attribute
		const authorsCell = $('td[data-th="Autores"]');
		if (authorsCell.length > 0) {
			const authorsText = authorsCell.text().trim();
			if (authorsText && authorsText.length > 0) {
				// Split by comma and trim each name
				const names = authorsText
					.split(',')
					.map(name => name.trim())
					.filter(name => name.length > 0 && name.length < 100);

				contributors.push(...names);
			}
		}

		// Fallback: Try to find in table rows by label if primary method failed
		if (contributors.length === 0) {
			const detailsTable = $('table.additional-attributes, #product-attribute-specs-table');
			if (detailsTable.length > 0) {
				const rows = detailsTable.find('tr');
				for (let i = 0; i < rows.length; i++) {
					const row = rows.eq(i);
					const cell = row.find('td[data-th]');
					const dataThValue = cell.attr('data-th');

					if (dataThValue &&
						(dataThValue.toLowerCase().includes('autor') ||
							dataThValue.toLowerCase().includes('roteiro') ||
							dataThValue.toLowerCase().includes('arte'))) {
						const value = cell.text().trim();
						if (value && value.length > 0) {
							// Split by comma and trim each name
							const names = value
								.split(',')
								.map(name => name.trim())
								.filter(name => name.length > 0 && name.length < 100);

							contributors.push(...names);
							break; // Found contributors, no need to continue
						}
					}
				}
			}
		}

		// Remove duplicates
		return Array.from(new Set(contributors));
	}

	/**
	 * Extracts the main product image URL
	 */
	private extractImageUrl($: cheerio.CheerioAPI): string {
		// First, look for external image sources that are not placeholders
		const externalImageSources = [
			'img[src*="cloudfront"]',
			'img[src*="amazonaws.com"]',
			'img[data-src*="cloudfront"]',
			'img[data-original*="cloudfront"]',
			'img[data-lazy*="cloudfront"]'
		];

		for (const selector of externalImageSources) {
			const img = $(selector).first();
			const src = img.attr('src') ||
				img.attr('data-src') ||
				img.attr('data-lazy') ||
				img.attr('data-original') ||
				'';

			if (src && !this.isPlaceholderImage(src)) {
				return src;
			}
		}

		// Look for any images with CloudFront or external CDN URLs in the entire page
		let foundExternalImage = '';
		$('img').each((_, element) => {
			const img = $(element);
			const srcAttributes = [
				img.attr('src'),
				img.attr('data-src'),
				img.attr('data-lazy'),
				img.attr('data-original')
			];

			for (const src of srcAttributes) {
				if (src && (src.includes('cloudfront') || src.includes('amazonaws.com')) && !this.isPlaceholderImage(src)) {
					foundExternalImage = src;
					return false; // Break out of each loop
				}
			}
		});

		if (foundExternalImage) {
			return foundExternalImage;
		}

		// Try to find real image URLs in JavaScript content
		const constructedImageUrl = this.tryConstructImageUrl($);
		if (constructedImageUrl) {
			return constructedImageUrl;
		}

		// Fallback to original selectors but filter out placeholders
		const imageSelectors = [
			'.product-image img',
			'.product-photo img',
			'.main-image img',
			'.product-gallery img',
			'.gallery img:first',
			'.hero-image img',
			'.primary-image img',
			'[data-testid="product-image"] img',
			'.product-media img',
			'img[alt*="produto"]',
			'img[alt*="product"]'
		];

		for (const selector of imageSelectors) {
			const img = $(selector).first();
			let src = img.attr('src') ||
				img.attr('data-src') ||
				img.attr('data-lazy') ||
				img.attr('data-original') ||
				'';

			if (src && !this.isPlaceholderImage(src)) {
				// Convert relative URLs to absolute
				if (src.startsWith('/')) {
					src = this.baseUrl + src;
				}
				// Make sure it's a valid image URL and not a placeholder
				if ((src.includes('.jpg') || src.includes('.jpeg') || src.includes('.png') || src.includes('.webp') || src.includes('cloudfront')) &&
					!this.isPlaceholderImage(src)) {
					return src;
				}
			}
		}

		// Try to find images in specific containers
		const containerSelectors = [
			'.product-image-main',
			'.product-images',
			'.image-container',
			'.hero-section'
		];

		for (const containerSelector of containerSelectors) {
			const container = $(containerSelector);
			if (container.length > 0) {
				const img = container.find('img').first();
				let src = img.attr('src') || img.attr('data-src') || '';

				if (src && !this.isPlaceholderImage(src)) {
					if (src.startsWith('/')) {
						src = this.baseUrl + src;
					}
					if ((src.includes('.jpg') || src.includes('.jpeg') || src.includes('.png') || src.includes('.webp') || src.includes('cloudfront')) &&
						!this.isPlaceholderImage(src)) {
						return src;
					}
				}
			}
		}

		// Last resort: try to find ANY non-placeholder image, even if it's local
		let fallbackImage = '';
		$('img').each((_, element) => {
			const img = $(element);
			const srcAttributes = [
				img.attr('src'),
				img.attr('data-src'),
				img.attr('data-lazy'),
				img.attr('data-original')
			];

			for (const src of srcAttributes) {
				if (src && !this.isPlaceholderImage(src)) {
					// Skip navigation and logo images
					if (!src.includes('logo') &&
						!src.includes('nav') &&
						!src.includes('icon') &&
						!src.includes('banner') &&
						(src.includes('.jpg') || src.includes('.jpeg') || src.includes('.png') || src.includes('.webp'))) {

						const absoluteSrc = src.startsWith('/') ? this.baseUrl + src : src;

						if (!fallbackImage) {
							fallbackImage = absoluteSrc;
						}
					}
				}
			}
		});

		if (fallbackImage) {
			return fallbackImage;
		}

		// If no valid image found, return empty string instead of constructing potentially invalid URLs
		return '';
	}

	/**
	 * Attempts to construct image URL based on page content and known patterns
	 */
	private tryConstructImageUrl($: cheerio.CheerioAPI): string {
		// Look for specific patterns in scripts or data attributes that directly reference images
		const scripts = $('script');
		let foundImageReference = '';

		scripts.each((_, element) => {
			const scriptContent = $(element).html() || '';

			// Look for JSON data with image URLs
			try {
				// Try to find JSON objects that might contain image data
				const jsonMatches = scriptContent.match(/\{[^{}]*"image"[^{}]*\}/g) ||
					scriptContent.match(/\{[^{}]*"src"[^{}]*\}/g) ||
					scriptContent.match(/\{[^{}]*"url"[^{}]*\}/g);

				if (jsonMatches) {
					for (const jsonMatch of jsonMatches) {
						try {
							const parsedJson = JSON.parse(jsonMatch);
							const imageFields = ['image', 'src', 'url', 'imageUrl', 'photo'];

							for (const field of imageFields) {
								if (parsedJson[field] && typeof parsedJson[field] === 'string') {
									const imageUrl = parsedJson[field];
									if (!this.isPlaceholderImage(imageUrl) &&
										(imageUrl.includes('http') || imageUrl.startsWith('/'))) {
										foundImageReference = imageUrl.startsWith('/') ? this.baseUrl + imageUrl : imageUrl;
										return false; // Break
									}
								}
							}
						} catch (e) {
							// Ignore JSON parsing errors
						}
					}
				}
			} catch (e) {
				// Ignore errors
			}

			// Look for CloudFront URLs in JavaScript - must be complete URLs
			const cloudFrontMatch = scriptContent.match(/https:\/\/d[a-z0-9]+\.cloudfront\.net\/[^"'\s]+\.(jpg|jpeg|png|webp)/gi);
			if (cloudFrontMatch && cloudFrontMatch.length > 0) {
				foundImageReference = cloudFrontMatch[0];
				return false; // Break
			}

			// Look for other CDN image URLs
			const cdnImageMatch = scriptContent.match(/https:\/\/[^"'\s]+\.(jpg|jpeg|png|webp)/gi);
			if (cdnImageMatch && cdnImageMatch.length > 0) {
				// Filter out placeholders and social media images
				const validImages = cdnImageMatch.filter(url =>
					!this.isPlaceholderImage(url) &&
					!url.includes('facebook.com') &&
					!url.includes('twitter.com') &&
					!url.includes('instagram.com')
				);
				if (validImages.length > 0) {
					foundImageReference = validImages[0];
					return false; // Break
				}
			}
		});

		return foundImageReference;
	}

	/**
	 * Checks if an image URL is a placeholder image
	 */
	private isPlaceholderImage(src: string): boolean {
		const placeholderPatterns = [
			'placeholder',
			'default/panini-placeholder',
			'no-image',
			'loading',
			'spinner'
		];

		return placeholderPatterns.some(pattern =>
			src.toLowerCase().includes(pattern.toLowerCase())
		);
	}

	/**
	 * Extracts or generates a product ID (Reference/SKU)
	 * Looks for the "Referência" field in the product details table
	 */
	private extractProductId($: cheerio.CheerioAPI, url: string): string {
		// Primary method: Try to find reference in the product details table using data-th attribute
		const referenceCell = $('td[data-th="Referência"]');
		if (referenceCell.length > 0) {
			const reference = referenceCell.text().trim();
			if (reference && reference.length > 0) {
				return reference;
			}
		}

		// Fallback 1: Try to find product ID in various places
		const idSelectors = [
			'[data-product-id]',
			'[data-sku]',
			'.product-sku',
			'.sku',
			'.product-code',
			'.reference',
			'.codigo-produto'
		];

		for (const selector of idSelectors) {
			const element = $(selector).first();
			const id = element.attr('data-product-id') ||
				element.attr('data-sku') ||
				element.text().trim();

			if (id) {
				return id;
			}
		}

		// Fallback 2: Try to find in product details table by label
		const detailsTable = $('table.additional-attributes, #product-attribute-specs-table');
		if (detailsTable.length > 0) {
			const rows = detailsTable.find('tr');
			for (let i = 0; i < rows.length; i++) {
				const row = rows.eq(i);
				const cell = row.find('td[data-th]');
				const dataThValue = cell.attr('data-th');

				if (dataThValue &&
					(dataThValue.toLowerCase().includes('referência') ||
						dataThValue.toLowerCase().includes('código') ||
						dataThValue.toLowerCase().includes('sku'))) {
					const value = cell.text().trim();
					if (value && value.length > 0) {
						return value;
					}
				}
			}
		}

		// Fallback 3: Try a broader search for reference in page text
		const allText = $('body').text();
		const globalReferenceMatch = allText.match(/referência[:\s]*([A-Z0-9-_]+)/i);
		if (globalReferenceMatch && globalReferenceMatch[1]) {
			return globalReferenceMatch[1];
		}

		// Fallback 4: Extract from URL
		const urlParts = url.split('/');
		const lastPart = urlParts[urlParts.length - 1];

		// Remove query parameters and file extensions
		const cleanId = lastPart.split('?')[0].split('.')[0];

		return cleanId || `panini-${Date.now()}`;
	}

	/**
	 * Updates the HTTP configuration
	 */
	updateConfig(config: HttpConfig): void {
		this.httpClient.updateConfig(config);
	}
}