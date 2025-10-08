import { HttpClient } from '../../src/infrastructure/httpClient';

// Mock axios module
jest.mock('axios', () => ({
    create: jest.fn(),
    isAxiosError: jest.fn()
}));

// Import axios after mocking
const axios = require('axios');

describe('HttpClient', () => {
    let httpClient: HttpClient;
    let mockAxiosInstance: any;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Create mock axios instance
        mockAxiosInstance = {
            get: jest.fn(),
            defaults: {
                timeout: 10000,
                headers: {}
            }
        };

        // Mock axios.create to return our mock instance
        axios.create.mockReturnValue(mockAxiosInstance);

        httpClient = new HttpClient();
    });

    describe('constructor', () => {
        it('should create HttpClient with default configuration', () => {
            expect(axios.create).toHaveBeenCalledWith({
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none',
                    'Sec-Fetch-User': '?1',
                    'Cache-Control': 'max-age=0'
                }
            });
        });

        it('should create HttpClient with custom configuration', () => {
            const config = {
                timeout: 5000,
                headers: { 'Custom-Header': 'test' },
                userAgent: 'Custom Agent',
                proxy: {
                    host: 'proxy.example.com',
                    port: 8080,
                    auth: {
                        username: 'user',
                        password: 'pass'
                    }
                }
            };

            new HttpClient(config);

            expect(axios.create).toHaveBeenCalledWith({
                timeout: 5000,
                headers: {
                    'User-Agent': 'Custom Agent',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none',
                    'Sec-Fetch-User': '?1',
                    'Cache-Control': 'max-age=0',
                    'Custom-Header': 'test'
                },
                proxy: {
                    host: 'proxy.example.com',
                    port: 8080,
                    auth: {
                        username: 'user',
                        password: 'pass'
                    }
                }
            });
        });
    });

    describe('get', () => {
        it('should make successful GET request', async () => {
            const mockResponse = {
                data: '<html>Test</html>',
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            };

            mockAxiosInstance.get.mockResolvedValue(mockResponse);

            const result = await httpClient.get('https://example.com');

            expect(mockAxiosInstance.get).toHaveBeenCalledWith('https://example.com');
            expect(result).toEqual(mockResponse);
        });

        it('should handle axios errors', async () => {
            const axiosError = {
                message: 'Network Error',
                response: { status: 500 }
            };

            mockAxiosInstance.get.mockRejectedValue(axiosError);
            axios.isAxiosError = jest.fn().mockReturnValue(true);

            await expect(httpClient.get('https://example.com'))
                .rejects
                .toThrow('HTTP request failed: Network Error (500)');
        });

        it('should handle non-axios errors', async () => {
            const genericError = new Error('Generic error');

            mockAxiosInstance.get.mockRejectedValue(genericError);
            axios.isAxiosError = jest.fn().mockReturnValue(false);

            await expect(httpClient.get('https://example.com'))
                .rejects
                .toThrow('Generic error');
        });
    });

    describe('updateConfig', () => {
        it('should update timeout configuration', () => {
            httpClient.updateConfig({ timeout: 15000 });

            expect(mockAxiosInstance.defaults.timeout).toBe(15000);
        });

        it('should update headers configuration', () => {
            const headers = { 'New-Header': 'value' };
            httpClient.updateConfig({ headers });

            expect(mockAxiosInstance.defaults.headers).toEqual(
                expect.objectContaining(headers)
            );
        });

        it('should update user agent', () => {
            httpClient.updateConfig({ userAgent: 'New User Agent' });

            expect(mockAxiosInstance.defaults.headers['User-Agent']).toBe('New User Agent');
        });
    });
});