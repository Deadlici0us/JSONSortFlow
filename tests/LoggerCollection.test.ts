import { LoggerCollection } from '../src/utils/LoggerCollection';
import { ConsoleLogger } from '../src/utils/ConsoleLogger';
import { FileLogger } from '../src/utils/FileLogger';
import * as fs from 'fs';

// Mock fs for FileLogger
jest.mock('fs', () => ({
    existsSync: jest.fn().mockReturnValue(true),
    mkdirSync: jest.fn(),
    promises: {
        appendFile: jest.fn().mockResolvedValue(undefined),
    },
}));

describe('LoggerCollection', () => {
    let stdoutWriteSpy: jest.SpyInstance;
    let stderrWriteSpy: jest.SpyInstance;

    beforeEach(() => {
        stdoutWriteSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
        stderrWriteSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
        jest.clearAllMocks();
    });

    afterEach(() => {
        stdoutWriteSpy.mockRestore();
        stderrWriteSpy.mockRestore();
    });

    it('should log info through ConsoleLogger in collection', () => {
        const consoleLogger = new ConsoleLogger();
        const loggerCollection = new LoggerCollection([consoleLogger]);
        
        loggerCollection.info('Test message');
        
        expect(stdoutWriteSpy).toHaveBeenCalled();
        const output = JSON.parse(stdoutWriteSpy.mock.calls[0][0]);
        expect(output.level).toBe('info');
        expect(output.message).toBe('Test message');
    });

    it('should log error through ConsoleLogger to stderr', () => {
        const consoleLogger = new ConsoleLogger();
        const loggerCollection = new LoggerCollection([consoleLogger]);
        
        loggerCollection.error('Error message');
        
        expect(stderrWriteSpy).toHaveBeenCalled();
        const output = JSON.parse(stderrWriteSpy.mock.calls[0][0]);
        expect(output.level).toBe('error');
    });

    it('should log through FileLogger in collection', async () => {
        const fileLogger = new FileLogger('/tmp/test.log');
        const collection = new LoggerCollection([fileLogger]);

        await collection.info('Test file log');
        
        expect(fs.promises.appendFile).toHaveBeenCalled();
    });

    it('should log to multiple loggers', () => {
        const consoleLogger1 = new ConsoleLogger();
        const consoleLogger2 = new ConsoleLogger();
        const collection = new LoggerCollection([consoleLogger1, consoleLogger2]);

        collection.info('Multi log test');
        
        // Both loggers should be called
        expect(stdoutWriteSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle empty collection', () => {
        const emptyCollection = new LoggerCollection([]);
        expect(() => emptyCollection.info('Test')).not.toThrow();
        expect(stdoutWriteSpy).not.toHaveBeenCalled();
    });

    it('should pass metadata to all loggers', () => {
        const consoleLogger = new ConsoleLogger();
        const collection = new LoggerCollection([consoleLogger]);
        const meta = { userId: 123 };

        collection.info('Test with metadata', meta);
        
        const output = JSON.parse(stdoutWriteSpy.mock.calls[0][0]);
        expect(output.meta).toEqual(meta);
    });

    it('should handle warn level', () => {
        const consoleLogger = new ConsoleLogger();
        const collection = new LoggerCollection([consoleLogger]);

        collection.warn('Warning message');
        
        const output = JSON.parse(stdoutWriteSpy.mock.calls[0][0]);
        expect(output.level).toBe('warn');
    });

    it('should handle debug level', () => {
        const consoleLogger = new ConsoleLogger();
        const collection = new LoggerCollection([consoleLogger]);

        collection.debug('Debug message');
        
        const output = JSON.parse(stdoutWriteSpy.mock.calls[0][0]);
        expect(output.level).toBe('debug');
    });
});
