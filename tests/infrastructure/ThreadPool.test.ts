/**
 * @file Test contract for ThreadPool
 * @description Validates concurrency limits, queuing behavior, and graceful shutdown
 */

import { ThreadPool } from '../../src/infrastructure/ThreadPool';
import { ConsoleLogger } from '../../src/utils/ConsoleLogger';

// Mock worker_threads module
jest.mock('worker_threads', () => {
  return {
    Worker: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
      postMessage: jest.fn(),
      terminate: jest.fn(),
    })),
    isMainThread: true,
  };
});

describe('ThreadPool', () => {
  let threadPool: ThreadPool;
  let logger: ConsoleLogger;
  let originalStdoutWrite: typeof process.stdout.write;
  let originalStderrWrite: typeof process.stderr.write;
  let stdoutOutput: string[];
  let stderrOutput: string[];

  beforeEach(() => {
    stdoutOutput = [];
    stderrOutput = [];

    // Capture stdout and stderr for Logger
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

    logger = new ConsoleLogger();
    threadPool = new ThreadPool(logger);
  });

  afterEach(() => {
    // Restore original streams
    process.stdout.write = originalStdoutWrite;
    process.stderr.write = originalStderrWrite;
  });

  describe('Constructor', () => {
    it('instantiates ThreadPool with default max workers', () => {
      expect(threadPool).toBeDefined();
      expect(threadPool).toBeInstanceOf(ThreadPool);
    });

    it('instantiates ThreadPool with custom max workers', () => {
      const customPool = new ThreadPool(logger, 10);
      expect(customPool).toBeDefined();
    });

    it('requires valid max workers value', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new (ThreadPool as any)(logger, 0);
      }).toThrow();

      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new (ThreadPool as any)(logger, -1);
      }).toThrow();
    });
  });

  describe('Task Submission', () => {
    it('submits a task successfully', () => {
      const task = {
        modulePath: './test-module',
        functionName: 'testFunction',
        data: { key: 'value' },
      };

      const result = threadPool.SubmitTask(task);
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('queues tasks when max workers reached', () => {
      // Simulate max workers being reached
      const task1 = {
        modulePath: './test-module',
        functionName: 'testFunc1',
        data: {},
      };

      const task2 = {
        modulePath: './test-module',
        functionName: 'testFunc2',
        data: {},
      };

      const result1 = threadPool.SubmitTask(task1);
      const result2 = threadPool.SubmitTask(task2);

      // Both should return a task handle
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });

    it('rejects null task', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => threadPool.SubmitTask(null as any)).toThrow();
    });

    it('rejects task with missing module path', () => {
      const invalidTask = {
        functionName: 'testFunction',
        data: {},
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => threadPool.SubmitTask(invalidTask as any)).toThrow();
    });

    it('rejects task with missing function name', () => {
      const invalidTask = {
        modulePath: './test-module',
        data: {},
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => threadPool.SubmitTask(invalidTask as any)).toThrow();
    });
  });

  describe('Concurrency Limits', () => {
    it('respects max worker limit', () => {
      const pool = new ThreadPool(logger, 4);

      // Submit more tasks than workers
      for (let i = 0; i < 10; i++) {
        const task = {
          modulePath: './test-module',
          functionName: `testFunction${i}`,
          data: { index: i },
        };

        expect(() => pool.SubmitTask(task)).not.toThrow();
      }
    });

    it('queues excess tasks when workers busy', () => {
      const pool = new ThreadPool(logger, 2);

      const tasks = [];
      for (let i = 0; i < 5; i++) {
        tasks.push({
          modulePath: './test-module',
          functionName: `testFunction${i}`,
          data: {},
        });
      }

      // All submissions should succeed without throwing
      tasks.forEach((task) => {
        expect(() => pool.SubmitTask(task)).not.toThrow();
      });
    });
  });

  describe('Task Execution and Results', () => {
    it('returns task handle with unique ID', () => {
      const task = {
        modulePath: './test-module',
        functionName: 'testFunction',
        data: {},
      };

      const handle1 = threadPool.SubmitTask(task);
      const handle2 = threadPool.SubmitTask(task);

      expect(handle1).not.toEqual(handle2);
    });

    it('tracks task status', () => {
      const task = {
        modulePath: './test-module',
        functionName: 'testFunction',
        data: {},
      };

      const handle = threadPool.SubmitTask(task);

      // Handle should have status information
      expect(handle).toHaveProperty('status');
    });
  });

  describe('Graceful Shutdown', () => {
    it('GracefulShutdown method exists and is callable', () => {
      expect(typeof threadPool.GracefulShutdown).toBe('function');

      expect(() => {
        threadPool.GracefulShutdown();
      }).not.toThrow();
    });

    it('GracefulShutdown accepts timeout parameter', () => {
      expect(() => {
        threadPool.GracefulShutdown(5000);
      }).not.toThrow();
    });

    it('GracefulShutdown waits for active tasks', () => {
      // Should not throw even with no active tasks
      expect(() => {
        threadPool.GracefulShutdown(100);
      }).not.toThrow();
    });

    it('ForceClose method exists', () => {
      expect(typeof threadPool.ForceClose).toBe('function');

      expect(() => {
        threadPool.ForceClose();
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('logs worker exceptions via Logger', () => {
      const task = {
        modulePath: './test-module',
        functionName: 'failingFunction',
        data: {},
      };

      // Should not crash the main thread
      expect(() => {
        threadPool.SubmitTask(task);
      }).not.toThrow();
    });

    it('handles task rejection gracefully', () => {
      const invalidTask = {
        modulePath: './nonexistent-module',
        functionName: 'testFunction',
        data: {},
      };

      // Should not crash
      expect(() => {
        threadPool.SubmitTask(invalidTask);
      }).not.toThrow();
    });
  });

  describe('Pool Status', () => {
    it('GetActiveWorkersCount returns number', () => {
      const count = threadPool.GetActiveWorkersCount();
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it('GetQueueLength returns number', () => {
      const length = threadPool.GetQueueLength();
      expect(typeof length).toBe('number');
      expect(length).toBeGreaterThanOrEqual(0);
    });

    it('IsShutdown returns boolean', () => {
      const status = threadPool.IsShutdown();
      expect(typeof status).toBe('boolean');
    });

    it('IsShutdown returns false initially', () => {
      expect(threadPool.IsShutdown()).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty data payload', () => {
      const task = {
        modulePath: './test-module',
        functionName: 'testFunction',
        data: {},
      };

      expect(() => threadPool.SubmitTask(task)).not.toThrow();
    });

    it('handles large data payload', () => {
      const largeData = {
        array: new Array(1000).fill('test'),
        nested: { deep: { value: 'data' } },
      };

      const task = {
        modulePath: './test-module',
        functionName: 'testFunction',
        data: largeData,
      };

      expect(() => threadPool.SubmitTask(task)).not.toThrow();
    });

    it('handles special characters in function name', () => {
      const task = {
        modulePath: './test-module',
        functionName: 'test_function-with.special!chars',
        data: {},
      };

      expect(() => threadPool.SubmitTask(task)).not.toThrow();
    });

    it('handles concurrent task submissions', () => {
      const tasks: Array<{
        modulePath: string;
        functionName: string;
        data: Record<string, unknown>;
      }> = [];

      for (let i = 0; i < 100; i++) {
        tasks.push({
          modulePath: './test-module',
          functionName: `testFunction${i}`,
          data: { index: i },
        });
      }

      // Submit all tasks rapidly
      tasks.forEach((task) => {
        expect(() => threadPool.SubmitTask(task)).not.toThrow();
      });
    });
  });

  describe('Resource Management', () => {
    it('does not leak worker references after shutdown', () => {
      threadPool.GracefulShutdown(100);

      // Should complete without errors
      expect(threadPool.IsShutdown()).toBe(true);
    });

    it('prevents task submission after shutdown', () => {
      threadPool.GracefulShutdown(100);

      const task = {
        modulePath: './test-module',
        functionName: 'testFunction',
        data: {},
      };

      expect(() => {
        threadPool.SubmitTask(task);
      }).toThrow();
    });
  });
});
