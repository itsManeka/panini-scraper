import { ProductEntity } from '../../src/domain/product.entity';

describe('ProductEntity', () => {
    const validProductData = {
        title: 'A Vida de Wolverine',
        fullPrice: 24.90,
        currentPrice: 16.19,
        isPreOrder: false,
        inStock: true,
        imageUrl: 'https://panini.com.br/image.jpg',
        url: 'https://panini.com.br/a-vida-de-wolverine',
        id: 'AVWOL001'
    };

    describe('constructor', () => {
        it('should create a valid product entity', () => {
            const product = new ProductEntity(
                validProductData.title,
                validProductData.fullPrice,
                validProductData.currentPrice,
                validProductData.isPreOrder,
                validProductData.inStock,
                validProductData.imageUrl,
                validProductData.url,
                validProductData.id
            );

            expect(product.title).toBe(validProductData.title);
            expect(product.fullPrice).toBe(validProductData.fullPrice);
            expect(product.currentPrice).toBe(validProductData.currentPrice);
            expect(product.isPreOrder).toBe(validProductData.isPreOrder);
            expect(product.inStock).toBe(validProductData.inStock);
            expect(product.imageUrl).toBe(validProductData.imageUrl);
            expect(product.url).toBe(validProductData.url);
            expect(product.id).toBe(validProductData.id);
        });

        it('should throw error for empty title', () => {
            expect(() => {
                new ProductEntity(
                    '',
                    validProductData.fullPrice,
                    validProductData.currentPrice,
                    validProductData.isPreOrder,
                    validProductData.inStock,
                    validProductData.imageUrl,
                    validProductData.url,
                    validProductData.id
                );
            }).toThrow('Product title is required');
        });

        it('should throw error for negative full price', () => {
            expect(() => {
                new ProductEntity(
                    validProductData.title,
                    -10,
                    validProductData.currentPrice,
                    validProductData.isPreOrder,
                    validProductData.inStock,
                    validProductData.imageUrl,
                    validProductData.url,
                    validProductData.id
                );
            }).toThrow('Full price must be non-negative');
        });

        it('should throw error for negative current price', () => {
            expect(() => {
                new ProductEntity(
                    validProductData.title,
                    validProductData.fullPrice,
                    -5,
                    validProductData.isPreOrder,
                    validProductData.inStock,
                    validProductData.imageUrl,
                    validProductData.url,
                    validProductData.id
                );
            }).toThrow('Current price must be non-negative');
        });

        it('should throw error when current price is higher than full price', () => {
            expect(() => {
                new ProductEntity(
                    validProductData.title,
                    20.00,
                    25.00,
                    validProductData.isPreOrder,
                    validProductData.inStock,
                    validProductData.imageUrl,
                    validProductData.url,
                    validProductData.id
                );
            }).toThrow('Current price cannot be higher than full price');
        });

        it('should throw error for invalid URL', () => {
            expect(() => {
                new ProductEntity(
                    validProductData.title,
                    validProductData.fullPrice,
                    validProductData.currentPrice,
                    validProductData.isPreOrder,
                    validProductData.inStock,
                    validProductData.imageUrl,
                    'invalid-url',
                    validProductData.id
                );
            }).toThrow('Valid product URL is required');
        });

        it('should throw error for empty ID', () => {
            expect(() => {
                new ProductEntity(
                    validProductData.title,
                    validProductData.fullPrice,
                    validProductData.currentPrice,
                    validProductData.isPreOrder,
                    validProductData.inStock,
                    validProductData.imageUrl,
                    validProductData.url,
                    ''
                );
            }).toThrow('Product ID is required');
        });
    });

    describe('hasDiscount', () => {
        it('should return true when current price is lower than full price', () => {
            const product = new ProductEntity(
                validProductData.title,
                24.90,
                16.19,
                validProductData.isPreOrder,
                validProductData.inStock,
                validProductData.imageUrl,
                validProductData.url,
                validProductData.id
            );

            expect(product.hasDiscount).toBe(true);
        });

        it('should return false when current price equals full price', () => {
            const product = new ProductEntity(
                validProductData.title,
                24.90,
                24.90,
                validProductData.isPreOrder,
                validProductData.inStock,
                validProductData.imageUrl,
                validProductData.url,
                validProductData.id
            );

            expect(product.hasDiscount).toBe(false);
        });
    });

    describe('discountPercentage', () => {
        it('should calculate correct discount percentage', () => {
            const product = new ProductEntity(
                validProductData.title,
                100.00,
                80.00,
                validProductData.isPreOrder,
                validProductData.inStock,
                validProductData.imageUrl,
                validProductData.url,
                validProductData.id
            );

            expect(product.discountPercentage).toBe(20);
        });

        it('should return 0 when there is no discount', () => {
            const product = new ProductEntity(
                validProductData.title,
                24.90,
                24.90,
                validProductData.isPreOrder,
                validProductData.inStock,
                validProductData.imageUrl,
                validProductData.url,
                validProductData.id
            );

            expect(product.discountPercentage).toBe(0);
        });
    });

    describe('savingsAmount', () => {
        it('should calculate correct savings amount', () => {
            const product = new ProductEntity(
                validProductData.title,
                24.90,
                16.19,
                validProductData.isPreOrder,
                validProductData.inStock,
                validProductData.imageUrl,
                validProductData.url,
                validProductData.id
            );

            expect(product.savingsAmount).toBeCloseTo(8.71, 2);
        });

        it('should return 0 when there are no savings', () => {
            const product = new ProductEntity(
                validProductData.title,
                24.90,
                24.90,
                validProductData.isPreOrder,
                validProductData.inStock,
                validProductData.imageUrl,
                validProductData.url,
                validProductData.id
            );

            expect(product.savingsAmount).toBe(0);
        });
    });

    describe('toJSON', () => {
        it('should return plain object representation', () => {
            const product = new ProductEntity(
                validProductData.title,
                validProductData.fullPrice,
                validProductData.currentPrice,
                validProductData.isPreOrder,
                validProductData.inStock,
                validProductData.imageUrl,
                validProductData.url,
                validProductData.id
            );

            const json = product.toJSON();

            expect(json).toEqual(validProductData);
            expect(json).not.toBeInstanceOf(ProductEntity);
        });
    });
});