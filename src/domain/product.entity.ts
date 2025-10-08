/**
 * Represents a Panini product with all its essential information
 */
export interface Product {
    /** Product title */
    title: string;

    /** Original full price in BRL */
    fullPrice: number;

    /** Current price (discounted if applicable) in BRL */
    currentPrice: number;

    /** Whether the product is available for pre-order */
    isPreOrder: boolean;

    /** Whether the product is currently in stock */
    inStock: boolean;

    /** URL of the main product image */
    imageUrl: string;

    /** Product page URL */
    url: string;

    /** Product identifier/SKU */
    id: string;
}

/**
 * Product entity class that encapsulates business logic and validation
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
        public readonly id: string
    ) {
        this.validate();
    }

    /**
     * Validates the product data
     * @throws {Error} If any required field is invalid
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
     * Checks if the product has a discount
     */
    get hasDiscount(): boolean {
        return this.currentPrice < this.fullPrice;
    }

    /**
     * Calculates the discount percentage
     */
    get discountPercentage(): number {
        if (!this.hasDiscount) return 0;
        return Math.round(((this.fullPrice - this.currentPrice) / this.fullPrice) * 100);
    }

    /**
     * Returns the savings amount
     */
    get savingsAmount(): number {
        return this.fullPrice - this.currentPrice;
    }

    /**
     * Validates URL format
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
     * Creates a plain object representation of the product
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
            id: this.id
        };
    }
}