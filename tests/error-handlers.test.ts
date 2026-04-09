
import { Request, Response, NextFunction } from 'express';

import { NotFoundError } from '../src/errorhandling/NotFoundError';
import { NotFoundErrorHandler } from '../src/errorhandling/NotFoundErrorHandler';
import { BadRequestError } from '../src/errorhandling/BadRequestError';
import { BadRequestErrorHandler } from '../src/errorhandling/BadRequestErrorHandler';
import { DefaultErrorHandler } from '../src/errorhandling/DefaultErrorHandler';
import { DefaultError } from '../src/errorhandling/DefaultError';
import { UnexpectedErrorHandler } from '../src/errorhandling/UnexpectedErrorHandler';
import { HandlerCollection } from '../src/errorhandling/HandlerCollection';
import { ConsoleLogger } from '../src/utils/ConsoleLogger';

type MockRequest = {
    protocol?: string;
    get?: jest.Mock;
    originalUrl?: string;
};

type MockResponse = {
    status?: jest.Mock;
    json?: jest.Mock;
};

type UnexpectedError = Error | string | null | undefined;

describe('ErrorHandler Tests', () => {
    let consoleSpy: ReturnType<typeof jest.spyOn>;
    let logger: ConsoleLogger;

    beforeEach(() => {
        consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        logger = new ConsoleLogger();
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    describe('NotFoundError', () => {
        it('should create NotFoundError with custom message', () => {
            const error = new NotFoundError(404, 'Resource not found');
            expect(error.message).toBe('Resource not found');
            expect(error instanceof Error).toBe(true);
            expect(error.statusCode).toBe(404);
        });

        it('should create NotFoundError with default message', () => {
            const error = new NotFoundError(404, 'Not Found');
            expect(error.message).toBe('Not Found');
        });
    });

    describe('NotFoundErrorHandler', () => {
        it('should handle NotFoundError and return 404', () => {
            const mockError = new NotFoundError(404, 'Not found');
            const mockRequest = {
                protocol: 'http',
                get: jest.fn().mockReturnValue('localhost:3000'),
                originalUrl: '/test',
            } as unknown as Request;
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;
            const mockNext = jest.fn();

            const handler = new NotFoundErrorHandler(logger);
            const handled = handler.handle(
                mockError,
                mockRequest,
                mockResponse,
                mockNext,
            );

            expect(handled).toBe(true);
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Not Found Error.',
                message: 'Not found http://localhost:3000/test',
            });
        });

        it('should use default statusCode 400 when statusCode is falsy', () => {
            const mockError = new NotFoundError(0, 'Not found');
            const mockRequest = {
                protocol: 'http',
                get: jest.fn().mockReturnValue('localhost:3000'),
                originalUrl: '/test',
            } as unknown as Request;
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;
            const mockNext = jest.fn();

            const handler = new NotFoundErrorHandler(logger);
            handler.handle(mockError, mockRequest, mockResponse, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });

        it('should log with correct format including protocol and host', () => {
            const mockError = new NotFoundError(404, 'Resource not found');
            const mockRequest = {
                protocol: 'https',
                get: jest.fn().mockReturnValue('example.com'),
                originalUrl: '/api/resource',
            } as unknown as Request;
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;
            const mockNext = jest.fn();

            const handler = new NotFoundErrorHandler(logger);
            handler.handle(mockError, mockRequest, mockResponse, mockNext);

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining(' Error: ')
            );
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Resource not found ')
            );
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('https://example.com/api/resource')
            );
        });

        it('should call req.get with exact argument host', () => {
            const mockError = new NotFoundError(404, 'Resource not found');
            const mockRequest = {
                protocol: 'http',
                get: jest.fn().mockImplementation((key) => {
                    if (key !== 'host') {
                        throw new Error(`Expected 'host' but got '${key}'`);
                    }
                    return 'localhost:3000';
                }),
                originalUrl: '/test',
            } as unknown as Request;
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;
            const mockNext = jest.fn();

            const handler = new NotFoundErrorHandler(logger);
            handler.handle(mockError, mockRequest, mockResponse, mockNext);

            expect(mockRequest.get).toHaveBeenCalledWith('host');
        });

        it('should not handle non-NotFoundError', () => {
            const mockError = new BadRequestError(400, 'Bad request');
            const mockRequest = {} as unknown as Request;
            const mockResponse = {} as unknown as Response;
            const mockNext = jest.fn();

            const handler = new NotFoundErrorHandler(logger);
            const handled = handler.handle(
                mockError,
                mockRequest,
                mockResponse,
                mockNext,
            );

            expect(handled).toBe(false);
        });
    });

    describe('BadRequestErrorHandler', () => {
        it('should handle BadRequestError and return 400', () => {
            const mockError = new BadRequestError(400, 'Invalid input');
            const mockRequest = {
                protocol: 'http',
                get: jest.fn().mockReturnValue('localhost:3000'),
                originalUrl: '/test',
            } as unknown as Request;
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;
            const mockNext = jest.fn();

            const handler = new BadRequestErrorHandler(logger);
            const handled = handler.handle(
                mockError,
                mockRequest,
                mockResponse,
                mockNext,
            );

            expect(handled).toBe(true);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Bad Request',
                message: 'Invalid input',
            });
        });

        it('should use default statusCode 400 when statusCode is falsy', () => {
            const mockError = new BadRequestError(0, 'Invalid input');
            const mockRequest = {} as unknown as Request;
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;
            const mockNext = jest.fn();

            const handler = new BadRequestErrorHandler(logger);
            handler.handle(mockError, mockRequest, mockResponse, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
        });

        it('should log error stack with timestamp prefix', () => {
            const mockError = new BadRequestError(400, 'Test error');
            const mockRequest = {} as unknown as Request;
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;
            const mockNext = jest.fn();

            const handler = new BadRequestErrorHandler(logger);
            handler.handle(mockError, mockRequest, mockResponse, mockNext);

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining(' ' + mockError.stack)
            );
        });

        it('should not handle non-BadRequestError', () => {
            const mockError = new NotFoundError(404, 'Not found');
            const mockRequest = {} as unknown as Request;
            const mockResponse = {} as unknown as Response;
            const mockNext = jest.fn();

            const handler = new BadRequestErrorHandler(logger);
            const handled = handler.handle(
                mockError,
                mockRequest,
                mockResponse,
                mockNext,
            );

            expect(handled).toBe(false);
        });
    });

    describe('DefaultErrorHandler', () => {
        it('should handle DefaultError and return 500', () => {
            const mockError = new DefaultError(500, 'Something went wrong');
            const mockRequest = {
                protocol: 'http',
                get: jest.fn().mockReturnValue('localhost:3000'),
                originalUrl: '/test',
            } as unknown as Request;
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;
            const mockNext = jest.fn();

            const handler = new DefaultErrorHandler(logger);
            const handled = handler.handle(
                mockError,
                mockRequest,
                mockResponse,
                mockNext,
            );

            expect(handled).toBe(true);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Internal Server Error.',
                message: 'Something went wrong',
            });
        });

        it('should use default statusCode 500 when statusCode is falsy', () => {
            const mockError = new DefaultError(0, 'Something went wrong');
            const mockRequest = {} as unknown as Request;
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;
            const mockNext = jest.fn();

            const handler = new DefaultErrorHandler(logger);
            handler.handle(mockError, mockRequest, mockResponse, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
        });

        it('should log error stack with timestamp prefix', () => {
            const mockError = new DefaultError(500, 'Test error');
            const mockRequest = {} as unknown as Request;
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;
            const mockNext = jest.fn();

            const handler = new DefaultErrorHandler(logger);
            handler.handle(mockError, mockRequest, mockResponse, mockNext);

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining(' ' + mockError.stack)
            );
        });

        it('should not handle non-DefaultError', () => {
            const mockError = new Error('Generic error');
            const mockRequest = {} as unknown as Request;
            const mockResponse = {} as unknown as Response;
            const mockNext = jest.fn();

            const handler = new DefaultErrorHandler(logger);
            const handled = handler.handle(
                mockError,
                mockRequest,
                mockResponse,
                mockNext,
            );

            expect(handled).toBe(false);
        });
    });

    describe('UnexpectedErrorHandler', () => {
        it('should handle non-Error objects and return 500', () => {
            const mockError = 'String error' as UnexpectedError;
            const mockRequest = {
                protocol: 'http',
                get: jest.fn().mockReturnValue('localhost:3000'),
                originalUrl: '/test',
            } as unknown as Request;
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;
            const mockNext = jest.fn();

            const handler = new UnexpectedErrorHandler(logger);
            const handled = handler.handle(
                mockError,
                mockRequest,
                mockResponse,
                mockNext,
            );

            expect(handled).toBe(true);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Internal Server Error.',
                message: 'Unexpected Error',
            });
        });

        it('should handle null errors', () => {
            const mockError = null as UnexpectedError;
            const mockRequest = {} as unknown as Request;
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;
            const mockNext = jest.fn();

            const handler = new UnexpectedErrorHandler(logger);
            const handled = handler.handle(
                mockError,
                mockRequest,
                mockResponse,
                mockNext,
            );

            expect(handled).toBe(true);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Internal Server Error.',
                message: 'Unexpected Error',
            });
        });

        it('should handle undefined errors', () => {
            const mockError = undefined as UnexpectedError;
            const mockRequest = {} as unknown as Request;
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;
            const mockNext = jest.fn();

            const handler = new UnexpectedErrorHandler(logger);
            const handled = handler.handle(
                mockError,
                mockRequest,
                mockResponse,
                mockNext,
            );

            expect(handled).toBe(true);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Internal Server Error.',
                message: 'Unexpected Error',
            });
        });

        it('should use stack property when error is an object with stack', () => {
            const mockError = new Error('Error with stack') as Error;
            const mockRequest = {} as unknown as Request;
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;
            const mockNext = jest.fn();

            const handler = new UnexpectedErrorHandler(logger);
            handler.handle(mockError, mockRequest, mockResponse, mockNext);

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining(mockError.stack!)
            );
        });

        it('should use String() fallback when object lacks stack property', () => {
            const mockError = { message: 'Object without stack' };
            const mockRequest = {} as unknown as Request;
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;
            const mockNext = jest.fn();

            const handler = new UnexpectedErrorHandler(logger);
            (handler.handle as unknown as (e: unknown, req: Request, res: Response, next: NextFunction) => void)(
                mockError, mockRequest, mockResponse, mockNext
            );

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('[object Object]')
            );
        });

        it('should log timestamp prefix before error message', () => {
            const mockError = 'Test error' as UnexpectedError;
            const mockRequest = {} as unknown as Request;
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;
            const mockNext = jest.fn();

            const handler = new UnexpectedErrorHandler(logger);
            handler.handle(mockError, mockRequest, mockResponse, mockNext);

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining(' ' + mockError)
            );
        });
    });

    describe('HandlerCollection', () => {
        let handlerCollection: HandlerCollection;
        let unexpectedHandler: UnexpectedErrorHandler;

        beforeEach(() => {
            unexpectedHandler = new UnexpectedErrorHandler(logger);
            const handlers = [
                new NotFoundErrorHandler(logger),
                new BadRequestErrorHandler(logger),
                new DefaultErrorHandler(logger),
            ];
            handlerCollection = new HandlerCollection(handlers, unexpectedHandler);
        });

        it('should handle NotFoundError with NotFoundErrorHandler', () => {
            const mockError = new NotFoundError(404, 'Not found');
            const mockRequest = {
                protocol: 'http',
                get: jest.fn().mockReturnValue('localhost:3000'),
                originalUrl: '/test',
            } as unknown as Request;
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;
            const mockNext = jest.fn();

            handlerCollection.handle(mockError, mockRequest, mockResponse, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Not Found Error.',
                message: 'Not found http://localhost:3000/test',
            });
        });

        it('should handle BadRequestError with BadRequestErrorHandler', () => {
            const mockError = new BadRequestError(400, 'Bad request');
            const mockRequest = {
                protocol: 'http',
                get: jest.fn().mockReturnValue('localhost:3000'),
                originalUrl: '/test',
            } as unknown as Request;
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;
            const mockNext = jest.fn();

            handlerCollection.handle(mockError, mockRequest, mockResponse, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Bad Request',
                message: 'Bad request',
            });
        });

        it('should handle DefaultError with DefaultErrorHandler', () => {
            const mockError = new DefaultError(500, 'Server error');
            const mockRequest = {
                protocol: 'http',
                get: jest.fn().mockReturnValue('localhost:3000'),
                originalUrl: '/test',
            } as unknown as Request;
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;
            const mockNext = jest.fn();

            handlerCollection.handle(mockError, mockRequest, mockResponse, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Internal Server Error.',
                message: 'Server error',
            });
        });

        it('should handle non-Error objects with UnexpectedErrorHandler', () => {
            const mockError = 'String error' as unknown as Error;
            const mockRequest = {} as unknown as Request;
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;
            const mockNext = jest.fn();

            handlerCollection.handle(mockError, mockRequest, mockResponse, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Internal Server Error.',
                message: 'Unexpected Error',
            });
        });

        it('should handle null with UnexpectedErrorHandler', () => {
            const mockError = null as unknown as Error;
            const mockRequest = {} as unknown as Request;
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;
            const mockNext = jest.fn();

            handlerCollection.handle(mockError, mockRequest, mockResponse, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Internal Server Error.',
                message: 'Unexpected Error',
            });
        });

        it('should handle undefined with UnexpectedErrorHandler', () => {
            const mockError = undefined as unknown as Error;
            const mockRequest = {} as unknown as Request;
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;
            const mockNext = jest.fn();

            handlerCollection.handle(mockError, mockRequest, mockResponse, mockNext);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Internal Server Error.',
                message: 'Unexpected Error',
            });
        });

        it('should add a new error handler dynamically', () => {
            const customHandler = {
                handle: jest.fn().mockReturnValue(true),
            } as unknown as HandlerCollection;
            const mockError = new Error('Custom error');
            const mockRequest = {} as unknown as Request;
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;
            const mockNext = jest.fn();

            handlerCollection.addErrorHandler(customHandler);
            handlerCollection.handle(mockError, mockRequest, mockResponse, mockNext);

            expect((customHandler as unknown as { handle: jest.Mock }).handle).toHaveBeenCalled();
        });

        it('should not call unexpectedHandler when error is handled by a registered handler', () => {
            const mockError = new NotFoundError(404, 'Not found');
            const mockRequest = {
                protocol: 'http',
                get: jest.fn().mockReturnValue('localhost:3000'),
                originalUrl: '/test',
            } as unknown as Request;
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;
            const mockNext = jest.fn();

            const unexpectedHandleSpy = jest.spyOn(unexpectedHandler, 'handle');
            handlerCollection.handle(mockError, mockRequest, mockResponse, mockNext);

            expect(unexpectedHandleSpy).not.toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(404);
        });

        it('should call unexpectedHandler when no registered handler handles the error', () => {
            const mockError = new Error('Unknown error');
            const mockRequest = {} as unknown as Request;
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;
            const mockNext = jest.fn();

            const unexpectedHandleSpy = jest.spyOn(unexpectedHandler, 'handle');
            handlerCollection.handle(mockError, mockRequest, mockResponse, mockNext);

            expect(unexpectedHandleSpy).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(500);
        });

        it('should iterate through all handlers in order until one handles the error', () => {
            const notFoundHandler = new NotFoundErrorHandler(logger);
            const badRequestHandler = new BadRequestErrorHandler(logger);
            const defaultHandler = new DefaultErrorHandler(logger);

            const notFoundSpy = jest.spyOn(notFoundHandler, 'handle');
            const badRequestSpy = jest.spyOn(badRequestHandler, 'handle');
            const defaultSpy = jest.spyOn(defaultHandler, 'handle');

            const testCollection = new HandlerCollection(
                [notFoundHandler, badRequestHandler, defaultHandler],
                unexpectedHandler
            );

            const mockError = new DefaultError(500, 'Default error');
            const mockRequest = {} as unknown as Request;
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;
            const mockNext = jest.fn();

            testCollection.handle(mockError, mockRequest, mockResponse, mockNext);

            expect(notFoundSpy).toHaveBeenCalled();
            expect(badRequestSpy).toHaveBeenCalled();
            expect(defaultSpy).toHaveBeenCalled();
        });
    });
});
