/**
 * @file Test contract for structured JSON Logger
 * @description Validates JSON logging format, stream targets, and edge cases
 */

import { Logger } from '../../src/infrastructure/Logger';

describe('Logger', () => {
  let logger: Logger;
  let originalStdoutWrite: typeof process.stdout.write;
  let originalStderrWrite: typeof process.stderr.write;
  let stdoutOutput: string[];
  let stderrOutput: string[];

  beforeEach(() => {
    stdoutOutput = [];
    stderrOutput = [];

    // Capture stdout and stderr
    originalStdoutWrite = process.stdout.write;
    originalStderrWrite = process.stderr.write;

    process.stdout.write = (data: string): boolean => {
      stdoutOutput.push(data);
      return true;
    };

    process.stderr.write = (data: string): boolean => {
      stderrOutput.push(data);
      return true;
    };

    logger = new Logger();
  });

  afterEach(() => {
    // Restore original streams
    process.stdout.write = originalStdoutWrite;
    process.stderr.write = originalStderrWrite;
  });

  describe('Constructor', () => {
    it('instantiates Logger without parameters', () => {
      expect(logger).toBeDefined();
      expect(logger).toBeInstanceOf(Logger);
    });
  });

  describe('Log Method - Basic Functionality', () => {
    it('logs info level message to stdout as JSON', () => {
      logger.Log('info', 'System start');

      expect(stdoutOutput.length).toBe(1);
      const logEntry = JSON.parse(stdoutOutput[0]);

      expect(logEntry).toHaveProperty('timestamp');
      expect(logEntry).toHaveProperty('level', 'info');
      expect(logEntry).toHaveProperty('message', 'System start');
      expect(logEntry.timestamp).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('logs warn level message to stdout as JSON', () => {
      logger.Log('warn', 'Warning message');

      expect(stdoutOutput.length).toBe(1);
      const logEntry = JSON.parse(stdoutOutput[0]);

      expect(logEntry.level).toBe('warn');
      expect(logEntry.message).toBe('Warning message');
    });

    it('logs error level message to stderr as JSON', () => {
      logger.Log('error', 'Error message');

      expect(stderrOutput.length).toBe(1);
      const logEntry = JSON.parse(stderrOutput[0]);

      expect(logEntry.level).toBe('error');
      expect(logEntry.message).toBe('Error message');
      expect(stdoutOutput.length).toBe(0);
    });

    it('logs debug level message to stdout as JSON', () => {
      logger.Log('debug', 'Debug message');

      expect(stdoutOutput.length).toBe(1);
      const logEntry = JSON.parse(stdoutOutput[0]);

      expect(logEntry.level).toBe('debug');
      expect(logEntry.message).toBe('Debug message');
    });
  });

  describe('Log Method - Payload Support', () => {
    it('includes payload object in log entry', () => {
      const payload = { userId: 123, action: 'login' };
      logger.Log('info', 'User action', payload);

      const logEntry = JSON.parse(stdoutOutput[0]);
      expect(logEntry.payload).toEqual(payload);
    });

    it('handles empty payload object', () => {
      logger.Log('info', 'Empty payload', {});

      const logEntry = JSON.parse(stdoutOutput[0]);
      expect(logEntry.payload).toEqual({});
    });

    it('handles undefined payload gracefully', () => {
      logger.Log('info', 'No payload', undefined);

      const logEntry = JSON.parse(stdoutOutput[0]);
      expect(logEntry).not.toHaveProperty('payload');
    });

    it('includes nested objects in payload', () => {
      const payload = { user: { id: 1, name: 'test' }, metadata: { ip: '127.0.0.1' } };
      logger.Log('info', 'Nested payload', payload);

      const logEntry = JSON.parse(stdoutOutput[0]);
      expect(logEntry.payload).toEqual(payload);
    });

    it('includes arrays in payload', () => {
      const payload = { items: [1, 2, 3], tags: ['a', 'b', 'c'] };
      logger.Log('info', 'Array payload', payload);

      const logEntry = JSON.parse(stdoutOutput[0]);
      expect(logEntry.payload).toEqual(payload);
    });
  });

  describe('Log Method - Edge Cases', () => {
    it('handles circular references without crashing', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const obj: Record<string, any> = { name: 'test' };
      obj.self = obj; // Create circular reference

      expect(() => {
        logger.Log('info', 'Circular reference', obj);
      }).not.toThrow();

      // Should still produce valid JSON output
      expect(stdoutOutput.length).toBe(1);
      expect(() => JSON.parse(stdoutOutput[0])).not.toThrow();
    });

    it('handles deeply nested objects', () => {
      const payload: Record<string, unknown> = { level1: { level2: { level3: { level4: 'deep' } } } };
      logger.Log('info', 'Deep nesting', payload);

      const logEntry = JSON.parse(stdoutOutput[0]);
      expect(logEntry.payload.level1.level2.level3.level4).toBe('deep');
    });

    it('handles special characters in message', () => {
      const message = 'Message with "quotes", \\backslash\\, and newlines\n';
      logger.Log('info', message);

      const logEntry = JSON.parse(stdoutOutput[0]);
      expect(logEntry.message).toBe(message);
    });

    it('handles empty message', () => {
      logger.Log('info', '');

      const logEntry = JSON.parse(stdoutOutput[0]);
      expect(logEntry.message).toBe('');
    });

    it('handles very long messages', () => {
      const longMessage = 'a'.repeat(10000);
      logger.Log('info', longMessage);

      const logEntry = JSON.parse(stdoutOutput[0]);
      expect(logEntry.message).toBe(longMessage);
    });
  });

  describe('Log Method - Invalid Inputs', () => {
    it('rejects null level', () => {
      expect(() => {
        logger.Log(null as unknown as string, 'Message');
      }).toThrow();
    });

    it('rejects empty string level', () => {
      expect(() => {
        logger.Log('', 'Message');
      }).toThrow();
    });

    it('accepts unknown log levels without validation', () => {
      // Logger should accept any level string, validation is optional
      logger.Log('custom', 'Custom level');

      const logEntry = JSON.parse(stdoutOutput[0]);
      expect(logEntry.level).toBe('custom');
    });
  });

  describe('Log Method - Timestamp Format', () => {
    it('uses ISO 8601 timestamp format', () => {
      logger.Log('info', 'Timestamp test');

      const logEntry = JSON.parse(stdoutOutput[0]);
      const timestampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      expect(logEntry.timestamp).toMatch(timestampRegex);
    });

    it('timestamp is a valid Date', () => {
      logger.Log('info', 'Date test');

      const logEntry = JSON.parse(stdoutOutput[0]);
      const parsedDate = new Date(logEntry.timestamp);
      expect(!isNaN(parsedDate.getTime())).toBe(true);
    });
  });

  describe('Log Method - Output Stream Selection', () => {
    it('error level writes exclusively to stderr', () => {
      logger.Log('error', 'Error only to stderr');

      expect(stderrOutput.length).toBe(1);
      expect(stdoutOutput.length).toBe(0);
    });

    it('info level writes exclusively to stdout', () => {
      logger.Log('info', 'Info only to stdout');

      expect(stdoutOutput.length).toBe(1);
      expect(stderrOutput.length).toBe(0);
    });

    it('warn level writes to stdout', () => {
      logger.Log('warn', 'Warn to stdout');

      expect(stdoutOutput.length).toBe(1);
      expect(stderrOutput.length).toBe(0);
    });

    it('handles multiple log calls sequentially', () => {
      logger.Log('info', 'First message');
      logger.Log('error', 'Second message');
      logger.Log('info', 'Third message');

      expect(stdoutOutput.length).toBe(2);
      expect(stderrOutput.length).toBe(1);
      expect(JSON.parse(stdoutOutput[0]).message).toBe('First message');
      expect(JSON.parse(stdoutOutput[1]).message).toBe('Third message');
      expect(JSON.parse(stderrOutput[0]).message).toBe('Second message');
    });
  });

  describe('Log Method - JSON Structure', () => {
    it('produces valid JSON string', () => {
      logger.Log('info', 'JSON validation');

      expect(() => {
        JSON.parse(stdoutOutput[0]);
      }).not.toThrow();
    });

    it('includes newline after each log entry', () => {
      logger.Log('info', 'Newline test');

      expect(stdoutOutput[0]).toMatch(/\n$/);
    });

    it('maintains consistent property order', () => {
      logger.Log('info', 'Order test', { key: 'value' });

      const logEntry = JSON.parse(stdoutOutput[0]);
      const keys = Object.keys(logEntry);

      // timestamp should be first, level second, message third
      expect(keys[0]).toBe('timestamp');
      expect(keys[1]).toBe('level');
      expect(keys[2]).toBe('message');
    });
  });

  describe('Convenience Methods', () => {
    it('Info method delegates to Log with info level', () => {
      logger.Info('Info message');

      const logEntry = JSON.parse(stdoutOutput[0]);
      expect(logEntry.level).toBe('info');
      expect(logEntry.message).toBe('Info message');
    });

    it('Warn method delegates to Log with warn level', () => {
      logger.Warn('Warn message');

      const logEntry = JSON.parse(stdoutOutput[0]);
      expect(logEntry.level).toBe('warn');
      expect(logEntry.message).toBe('Warn message');
    });

    it('Error method delegates to Log with error level to stderr', () => {
      logger.Error('Error message');

      const logEntry = JSON.parse(stderrOutput[0]);
      expect(logEntry.level).toBe('error');
      expect(logEntry.message).toBe('Error message');
      expect(stdoutOutput.length).toBe(0);
    });

    it('Debug method delegates to Log with debug level', () => {
      logger.Debug('Debug message');

      const logEntry = JSON.parse(stdoutOutput[0]);
      expect(logEntry.level).toBe('debug');
      expect(logEntry.message).toBe('Debug message');
    });
  });

  describe('Production vs Development', () => {
    it('logs consistently regardless of NODE_ENV', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      logger.Log('info', 'Production test');

      expect(stdoutOutput.length).toBe(1);
      expect(() => JSON.parse(stdoutOutput[0])).not.toThrow();

      process.env.NODE_ENV = originalEnv;
    });
  });
});
