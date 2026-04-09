import { LoggerCollection } from '../src/utils/LoggerCollection';
import { ConsoleLogger } from '../src/utils/ConsoleLogger';
import { FileLogger } from '../src/utils/FileLogger';

describe('LoggerCollection', () => {
    let loggerCollection: LoggerCollection;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        const consoleLogger = new ConsoleLogger();
        loggerCollection = new LoggerCollection([consoleLogger]);
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    it('should log through ConsoleLogger in collection', () => {
        loggerCollection.log('Test message');
        expect(consoleSpy).toHaveBeenCalledWith('Test message');
    });

    it('should log through FileLogger in collection', () => {
        const fileLogger = new FileLogger('/tmp/test.log');
        const collection = new LoggerCollection([fileLogger]);

        expect(() => collection.log('Test file log')).not.toThrow();
    });

    it('should log to multiple loggers', () => {
        const consoleLogger = new ConsoleLogger();
        const collection = new LoggerCollection([consoleLogger, consoleLogger]);

        collection.log('Multi log test');
        expect(consoleSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle empty collection', () => {
        const emptyCollection = new LoggerCollection([]);
        expect(() => emptyCollection.log('Test')).not.toThrow();
    });
});
