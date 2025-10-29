/**
 * Represents a Panini Brasil product with all its essential information.
 * 
 * This interface defines the core data structure for a scraped product,
 * serving as the domain model in the Clean Architecture pattern.
 * It represents a product in its simplest form, without business logic.
 */
export interface Product {
    /** The product's title or name */
    title: string;

    /** The original full price in Brazilian Real (BRL) before any discounts */
    fullPrice: number;

    /** The current price in Brazilian Real (BRL), which may include discounts */
    currentPrice: number;

    /** Indicates whether the product is available for pre-order */
    isPreOrder: boolean;

    /** Indicates whether the product is currently in stock and available for purchase */
    inStock: boolean;

    /** The full URL of the main product image */
    imageUrl: string;

    /** The full URL of the product page on Panini Brasil website */
    url: string;

    /** The format of the product */
    format: string;

    /** The contributors of the product */
    contributors: string[];

    /** The unique product identifier or SKU (Stock Keeping Unit) */
    id: string;
}

/**
 * Product entity class that encapsulates business logic and validation.
 * 
 * This class implements the Product interface and adds validation, computed properties,
 * and business methods. It ensures data integrity through validation in the constructor
 * and provides convenient methods for working with product data.
 * 
 * Following Domain-Driven Design principles, this entity represents a product in the
 * business domain with its invariants and business rules.
 * 
 * @example
 * Creating a product entity:
 * ```typescript
 * const product = new ProductEntity(
 *   'Wolverine #05',
 *   8.90,    // fullPrice
 *   5.90,    // currentPrice
 *   false,   // isPreOrder
 *   true,    // inStock
 *   'https://example.com/image.jpg',
 *   'https://panini.com.br/wolverine-05',
 *   'WOL05'
 * );
 * 
 * console.log(product.hasDiscount);          // true
 * console.log(product.discountPercentage);   // 34
 * console.log(product.savingsAmount);        // 3.00
 * ```
 */
export class ProductEntity implements Product {
    constructor(
        public readonly title: string,
        public readonly fullPrice: number,
        public readonly currentPrice: number,
        public readonly isPreOrder: boolean,
        public readonly inStock: boolean,
        public readonly imageUrl: string,
        public readonly url: string,
        public readonly format: string,
        public readonly contributors: string[],
        public readonly id: string
    ) {
        this.validate();
    }

    /**
     * Validates all product data to ensure business rules are met.
     * 
     * This method enforces the following invariants:
     * - Title must be non-empty
     * - Prices must be non-negative
     * - Current price cannot exceed full price
     * - URL must be valid
     * - Product ID must be non-empty
     * 
     * @throws {Error} If any validation rule is violated
     * @private
     */
    private validate(): void {
        if (!this.title || this.title.trim().length === 0) {
            throw new Error('Product title is required');
        }

        if (this.fullPrice < 0) {
            throw new Error('Full price must be non-negative');
        }

        if (this.currentPrice < 0) {
            throw new Error('Current price must be non-negative');
        }

        if (this.currentPrice > this.fullPrice) {
            throw new Error('Current price cannot be higher than full price');
        }

        if (!this.url || !this.isValidUrl(this.url)) {
            throw new Error('Valid product URL is required');
        }

        if (!this.id || this.id.trim().length === 0) {
            throw new Error('Product ID is required');
        }
    }

    /**
     * Checks if the product currently has a discount applied.
     * 
     * @returns `true` if the current price is lower than the full price, `false` otherwise
     */
    get hasDiscount(): boolean {
        return this.currentPrice < this.fullPrice;
    }

    /**
     * Calculates the discount percentage.
     * 
     * The discount is calculated as: `((fullPrice - currentPrice) / fullPrice) * 100`
     * and rounded to the nearest integer.
     * 
     * @returns The discount percentage as an integer, or 0 if there's no discount
     * 
     * @example
     * ```typescript
     * // Product with R$ 10.00 full price and R$ 7.50 current price
     * product.discountPercentage; // 25
     * ```
     */
    get discountPercentage(): number {
        if (!this.hasDiscount) return 0;
        return Math.round(((this.fullPrice - this.currentPrice) / this.fullPrice) * 100);
    }

    /**
     * Calculates the amount saved due to the discount.
     * 
     * @returns The savings amount in BRL, or 0 if there's no discount
     * 
     * @example
     * ```typescript
     * // Product with R$ 10.00 full price and R$ 7.50 current price
     * product.savingsAmount; // 2.50
     * ```
     */
    get savingsAmount(): number {
        return this.fullPrice - this.currentPrice;
    }

    /**
     * Validates if a string is a properly formatted URL.
     * 
     * @param url - The URL string to validate
     * @returns `true` if the URL format is valid, `false` otherwise
     * @private
     */
    private isValidUrl(url: string): boolean {
        try {
            const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;
            return urlRegex.test(url);
        } catch {
            return false;
        }
    }

    /**
     * Converts the entity to a plain JavaScript object.
     * 
     * This method is useful for serialization (e.g., to JSON for API responses)
     * and removes the methods and getters from the entity, returning only the data.
     * 
     * @returns A plain object implementing the Product interface
     * 
     * @example
     * ```typescript
     * const entity = new ProductEntity(...);
     * const json = JSON.stringify(entity.toJSON());
     * ```
     */
    toJSON(): Product {
        return {
            title: this.title,
            fullPrice: this.fullPrice,
            currentPrice: this.currentPrice,
            isPreOrder: this.isPreOrder,
            inStock: this.inStock,
            imageUrl: this.imageUrl,
            url: this.url,
            format: this.format,
            contributors: this.contributors,
            id: this.id
        };
    }
}
