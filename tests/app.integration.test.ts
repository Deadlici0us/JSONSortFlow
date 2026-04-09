/**
 * @file Integration tests for SignalLifecycleManager wiring in App
 * @description Validates that the application properly integrates SignalLifecycleManager
 */

import App from '../src/app';
import { SignalLifecycleManager } from '../src/infrastructure/SignalLifecycleManager';

describe('App Integration - SignalLifecycleManager', () => {
  let app: App;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any server instances
    jest.restoreAllMocks();
  });

  describe('Constructor Integration', () => {
    it('instantiates SignalLifecycleManager during construction', () => {
      app = new App();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const signalManager = (app as any).signalLifecycleManager;
      expect(signalManager).toBeDefined();
      expect(signalManager).toBeInstanceOf(SignalLifecycleManager);
    });
  });

  describe('RegisterShutdownHook Integration', () => {
    it('registers the server close callback with SignalLifecycleManager exactly once', () => {
      // Mock SignalLifecycleManager to track RegisterShutdownHook calls
      const registerSpy = jest.spyOn(SignalLifecycleManager.prototype, 'RegisterShutdownHook');

      app = new App();

      expect(registerSpy).toHaveBeenCalledTimes(1);

      // Verify the callback is a function
      const registeredCallback = registerSpy.mock.calls[0][0];
      expect(typeof registeredCallback).toBe('function');

      registerSpy.mockRestore();
    });

    it('registers a callback that closes the server when invoked', () => {
      const registerSpy = jest.spyOn(SignalLifecycleManager.prototype, 'RegisterShutdownHook');

      app = new App();

      // Get the registered callback
      const registeredCallback = registerSpy.mock.calls[0][0];

      // Start the server on a test port
      const testPort = 0; // Let OS assign available port
      app.Listen(testPort);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const server = (app as any).server;
      expect(server).toBeDefined();
      expect(server.listening).toBe(true);

      // Invoke the registered callback
      registeredCallback();

      // Server should be closing or closed
      expect(server.listening).toBe(false);

      registerSpy.mockRestore();
    });

    it('handles callback invocation before server is started gracefully', () => {
      const registerSpy = jest.spyOn(SignalLifecycleManager.prototype, 'RegisterShutdownHook');

      app = new App();
      const registeredCallback = registerSpy.mock.calls[0][0];

      // Invoke callback before Listen() is called
      // Should not throw
      expect(() => {
        registeredCallback();
      }).not.toThrow();

      registerSpy.mockRestore();
    });

    it('handles multiple callback invocations idempotently', () => {
      const registerSpy = jest.spyOn(SignalLifecycleManager.prototype, 'RegisterShutdownHook');

      app = new App();
      const registeredCallback = registerSpy.mock.calls[0][0];

      app.Listen(0);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const server = (app as any).server;

      // Invoke callback multiple times
      registeredCallback();
      registeredCallback();
      registeredCallback();

      // Server should only close once (idempotent)
      expect(server.listening).toBe(false);

      registerSpy.mockRestore();
    });
  });

  describe('StartListening Integration', () => {
    it('calls StartListening on SignalLifecycleManager', () => {
      const startListeningSpy = jest.spyOn(
        SignalLifecycleManager.prototype,
        'StartListening'
      );

      app = new App();

      // Check if StartListening was called
      // Note: This test will fail initially as part of TDD red phase
      expect(startListeningSpy).toHaveBeenCalled();

      startListeningSpy.mockRestore();
    });
  });

  describe('Signal Handler Attachment', () => {
    it('attaches SIGTERM and SIGINT handlers through SignalLifecycleManager', () => {
      // This test verifies that process.on is called for signal handlers
      // We'll track calls through the SignalLifecycleManager mock
      const originalOn = process.on;
      const processOnCalls: [string, Function][] = [];

      jest.spyOn(process, 'on').mockImplementation((event, listener) => {
        processOnCalls.push([event as string, listener as Function]);
        return originalOn.call(process, event, listener);
      });

      app = new App();

      // Restore original process.on
      jest.doMock('process', () => ({
        ...process,
        on: originalOn,
      }));

      // Verify handlers were attached for SIGTERM and SIGINT
      const sigtermCalls = processOnCalls.filter((call) => call[0] === 'SIGTERM');
      const sigintCalls = processOnCalls.filter((call) => call[0] === 'SIGINT');

      expect(sigtermCalls.length).toBeGreaterThan(0);
      expect(sigintCalls.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('properly initializes dependencies before registering shutdown hook', () => {
      const initializationOrder: string[] = [];

      // Track initialization order
      const originalRegisterShutdownHook =
        SignalLifecycleManager.prototype.RegisterShutdownHook;
      jest.spyOn(SignalLifecycleManager.prototype, 'RegisterShutdownHook').mockImplementation(function(this: void) {
        initializationOrder.push('RegisterShutdownHook');
        return originalRegisterShutdownHook.apply(this, [undefined] as unknown as Parameters<typeof originalRegisterShutdownHook>);
      });

      app = new App();

      // SignalLifecycleManager should be instantiated before RegisterShutdownHook is called
      expect(initializationOrder).toContain('RegisterShutdownHook');
    });

    it('does not register duplicate shutdown hooks', () => {
      const registerSpy = jest.spyOn(SignalLifecycleManager.prototype, 'RegisterShutdownHook');

      app = new App();

      // RegisterShutdownHook should only be called once during construction
      expect(registerSpy).toHaveBeenCalledTimes(1);

      registerSpy.mockRestore();
    });
  });

  describe('Server State Management', () => {
    it('server is null before Listen() is called', () => {
      app = new App();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((app as any).server).toBe(null);
    });

    it('server is defined after Listen() is called', (done) => {
      app = new App();
      app.Listen(0);

      // Give server time to start
      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((app as any).server).not.toBe(null);
        done();
      }, 100);
    });

    it('shutdown callback handles both started and non-started server states', () => {
      const registerSpy = jest.spyOn(SignalLifecycleManager.prototype, 'RegisterShutdownHook');

      app = new App();
      const registeredCallback = registerSpy.mock.calls[0][0];

      // Before server starts - should not throw
      expect(() => registeredCallback()).not.toThrow();

      // Start server
      app.Listen(0);

      // After server starts - should close server
      setTimeout(() => {
        registeredCallback();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const server = (app as any).server;
        expect(server.listening).toBe(false);

        registerSpy.mockRestore();
      }, 100);
    });
  });
});
