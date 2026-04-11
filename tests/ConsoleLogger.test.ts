import { ConsoleLogger } from '../src/utils/ConsoleLogger';

describe('ConsoleLogger class (Unit Test)', () => 
{
    let stdoutWriteSpy: jest.SpyInstance;
    let stderrWriteSpy: jest.SpyInstance;

    beforeEach(() => 
{
        stdoutWriteSpy = jest
            .spyOn(process.stdout, 'write')
            .mockImplementation(() => true);
        stderrWriteSpy = jest
            .spyOn(process.stderr, 'write')
            .mockImplementation(() => true);
    });

    afterEach(() => 
{
        stdoutWriteSpy.mockRestore();
        stderrWriteSpy.mockRestore();
    });

    it('should log info messages to stdout as JSON', () => 
{
        const consoleLogger = new ConsoleLogger();
        consoleLogger.info('Test Info Message');

        const output = stdoutWriteSpy.mock.calls[0][0];
        const parsed = JSON.parse(output);
        expect(parsed.level).toBe('info');
        expect(parsed.message).toBe('Test Info Message');
        expect(parsed.timestamp).toBeDefined();
    });

    it('should log warn messages to stdout as JSON', () => 
{
        const consoleLogger = new ConsoleLogger();
        consoleLogger.warn('Test Warning Message');

        const output = stdoutWriteSpy.mock.calls[0][0];
        const parsed = JSON.parse(output);
        expect(parsed.level).toBe('warn');
        expect(parsed.message).toBe('Test Warning Message');
    });

    it('should log error messages to stderr as JSON', () => 
{
        const consoleLogger = new ConsoleLogger();
        consoleLogger.error('Test Error Message');

        const output = stderrWriteSpy.mock.calls[0][0];
        const parsed = JSON.parse(output);
        expect(parsed.level).toBe('error');
        expect(parsed.message).toBe('Test Error Message');
    });

    it('should log debug messages to stdout as JSON', () => 
{
        const consoleLogger = new ConsoleLogger();
        consoleLogger.debug('Test Debug Message');

        const output = stdoutWriteSpy.mock.calls[0][0];
        const parsed = JSON.parse(output);
        expect(parsed.level).toBe('debug');
        expect(parsed.message).toBe('Test Debug Message');
    });

    it('should include metadata when provided', () => 
{
        const consoleLogger = new ConsoleLogger();
        const meta = { userId: 123, action: 'test' };

        consoleLogger.info('Test with metadata', meta);

        const output = stdoutWriteSpy.mock.calls[0][0];
        const parsed = JSON.parse(output);
        expect(parsed.meta).toEqual(meta);
    });

    it('should handle circular references in metadata', () => 
{
        const consoleLogger = new ConsoleLogger();
        const obj: any = { name: 'test' };
        obj.self = obj; // Create circular reference

        expect(() => 
{
            consoleLogger.info('Test circular', obj);
        }).not.toThrow();

        const output = stdoutWriteSpy.mock.calls[0][0];
        const parsed = JSON.parse(output);
        expect(parsed.meta.self).toBe('[Circular Reference]');
    });

    it('should not include meta when undefined', () => 
{
        const consoleLogger = new ConsoleLogger();
        consoleLogger.info('Test without metadata');

        const output = stdoutWriteSpy.mock.calls[0][0];
        const parsed = JSON.parse(output);
        expect(parsed.meta).toBeUndefined();
    });
});
