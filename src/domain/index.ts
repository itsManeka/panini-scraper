// Domain exports
export { Product, ProductEntity } from './product.entity';
export {
    ProductRepository,
    HttpConfig,
    ProductScrapingError,
    ProductNotFoundError,
    InvalidUrlError,
    ScrapedProduct,
    FailedProduct,
    BatchScrapeResult
} from './product.repository';