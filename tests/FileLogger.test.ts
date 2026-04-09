import { FileLogger } from '../src/utils/FileLogger';
import * as fs from 'fs';

// Mock the fs module
jest.mock('fs', () => ({
    existsSync: jest.fn(),
    mkdirSync: jest.fn(),
    promises: {
        appendFile: jest.fn().mockResolvedValue(undefined),
    },
}));

describe('FileLogger class (Unit Test)', () => {
    const filePath = '/path/to/logs/test_log.txt';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create directory if it does not exist', () => {
        (fs.existsSync as jest.Mock).mockReturnValueOnce(false);
        new FileLogger(filePath);
        expect(fs.mkdirSync).toHaveBeenCalledWith('/path/to/logs', {
            recursive: true,
        });
    });

    it('should NOT create directory if it already exists', () => {
        (fs.existsSync as jest.Mock).mockReturnValueOnce(true);
        new FileLogger(filePath);
        expect(fs.mkdirSync).not.toHaveBeenCalled();
    });

    it('should log info messages as JSON', async () => {
        const fileLogger = new FileLogger(filePath);
        await fileLogger.info('Test Info Message');
        
        const callArgs = (fs.promises.appendFile as jest.Mock).mock.calls[0];
        const logLine = callArgs[1];
        const parsed = JSON.parse(logLine);
        
        expect(parsed.level).toBe('info');
        expect(parsed.message).toBe('Test Info Message');
        expect(parsed.timestamp).toBeDefined();
    });

    it('should log error messages as JSON', async () => {
        const fileLogger = new FileLogger(filePath);
        await fileLogger.error('Test Error Message');
        
        const callArgs = (fs.promises.appendFile as jest.Mock).mock.calls[0];
        const logLine = callArgs[1];
        const parsed = JSON.parse(logLine);
        
        expect(parsed.level).toBe('error');
        expect(parsed.message).toBe('Test Error Message');
    });

    it('should include metadata when provided', async () => {
        const fileLogger = new FileLogger(filePath);
        const meta = { userId: 123, action: 'test' };
        await fileLogger.info('Test with metadata', meta);
        
        const callArgs = (fs.promises.appendFile as jest.Mock).mock.calls[0];
        const logLine = callArgs[1];
        const parsed = JSON.parse(logLine);
        
        expect(parsed.meta).toEqual(meta);
    });

    it('should handle log write failure gracefully', async () => {
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        (fs.promises.appendFile as jest.Mock).mockRejectedValueOnce(
            new Error('Write Error')
        );
        
        const fileLogger = new FileLogger(filePath);
        await fileLogger.info('Test Message');
        
        expect(consoleLogSpy).toHaveBeenCalledWith('Failed to write log entry to file.');
        consoleLogSpy.mockRestore();
    });

    it('should not create directory for root path', () => {
        (fs.existsSync as jest.Mock).mockReturnValueOnce(false);
        // Log file in root - no directory to create
        new FileLogger('test.log');
        expect(fs.mkdirSync).not.toHaveBeenCalled();
    });
});
