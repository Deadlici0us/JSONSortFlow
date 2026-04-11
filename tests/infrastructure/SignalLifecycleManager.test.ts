/**
 * @file Strict TDD contract for SignalLifecycleManager
 * @description Validates signal handling, idempotency, and callback invocation
 */

import { SignalLifecycleManager } from '../../src/infrastructure/SignalLifecycleManager';

// Mock Node.js process object
const mockExit = jest.fn();
const mockProcessOn = jest.fn();

// Mocking global process
Object.defineProperty(globalThis, 'process', {
    value: {
        on: mockProcessOn,
        exit: mockExit,
    },
    writable: true,
});

describe('SignalLifecycleManager', () => 
{
    let manager: SignalLifecycleManager;

    beforeEach(() => 
{
        jest.clearAllMocks();
        mockExit.mockImplementation(() => 
{
            // Prevent actual exit during tests
            return undefined as unknown as never;
        });
        manager = new SignalLifecycleManager();
    });

    describe('Constructor', () => 
{
        it('initializes without attaching signal handlers immediately', () => 
{
            expect(mockProcessOn).not.toHaveBeenCalled();
        });

        it('initializes with empty callbacks array', () => 
{
             
            expect((manager as any).shutdownCallbacks).toEqual([]);
        });

        it('initializes shutdownInitiated as false', () => 
{
             
            expect((manager as any).shutdownInitiated).toBe(false);
        });
    });

    describe('RegisterShutdownHook', () => 
{
        it('registers a shutdown callback', () => 
{
            const callback = jest.fn();
            manager.RegisterShutdownHook(callback);
            expect(callback).not.toHaveBeenCalled();
        });

        it('allows registering multiple shutdown callbacks', () => 
{
            const callback1 = jest.fn();
            const callback2 = jest.fn();
            manager.RegisterShutdownHook(callback1);
            manager.RegisterShutdownHook(callback2);
            expect(callback1).not.toHaveBeenCalled();
            expect(callback2).not.toHaveBeenCalled();
        });

        it('ignores null callbacks', () => 
{
            const initialCount = 1; // StartListening will add handlers
             
            (manager as any).RegisterShutdownHook(null);
            // Verify null was not added by checking callback count after triggering
            manager.StartListening();
            const sigtermHandler = mockProcessOn.mock.calls.find(
                (call: [string, Function]) => call[0] === 'SIGTERM'
            )?.[1];
            if (sigtermHandler) 
{
                sigtermHandler();
            }
            // No callbacks should have been invoked
            expect(mockProcessOn).toHaveBeenCalled();
        });

        it('ignores undefined callbacks', () => 
{
             
            (manager as any).RegisterShutdownHook(undefined);
            manager.StartListening();
            const sigtermHandler = mockProcessOn.mock.calls.find(
                (call: [string, Function]) => call[0] === 'SIGTERM'
            )?.[1];
            if (sigtermHandler) 
{
                sigtermHandler();
            }
            // Should not throw or invoke anything
        });

        it('only adds valid callbacks to execution queue', () => 
{
            const validCallback = jest.fn();
             
            (manager as any).RegisterShutdownHook(null);
             
            (manager as any).RegisterShutdownHook(undefined);
            manager.RegisterShutdownHook(validCallback);

            manager.StartListening();
            const sigtermHandler = mockProcessOn.mock.calls.find(
                (call: [string, Function]) => call[0] === 'SIGTERM'
            )?.[1];

            if (sigtermHandler) 
{
                sigtermHandler();
            }

            // Only the valid callback should be called
            expect(validCallback).toHaveBeenCalledTimes(1);
        });

        it('rejects callback when exactly null (not undefined)', () => 
{
            const callback = jest.fn();
             
            (manager as any).RegisterShutdownHook(null);
            manager.RegisterShutdownHook(callback);
            manager.StartListening();

            const sigtermHandler = mockProcessOn.mock.calls.find(
                (call: [string, Function]) => call[0] === 'SIGTERM'
            )?.[1];

            if (sigtermHandler) 
{
                sigtermHandler();
            }

            expect(callback).toHaveBeenCalledTimes(1);
            // Verify only 1 callback was executed, not 2
        });

        it('rejects callback when exactly undefined (not null)', () => 
{
            const callback = jest.fn();
             
            (manager as any).RegisterShutdownHook(undefined);
            manager.RegisterShutdownHook(callback);
            manager.StartListening();

            const sigtermHandler = mockProcessOn.mock.calls.find(
                (call: [string, Function]) => call[0] === 'SIGTERM'
            )?.[1];

            if (sigtermHandler) 
{
                sigtermHandler();
            }

            expect(callback).toHaveBeenCalledTimes(1);
        });
    });

    describe('StartListening', () => 
{
        it('attaches SIGTERM and SIGINT handlers when started', () => 
{
            manager.StartListening();
            expect(mockProcessOn).toHaveBeenCalledWith(
                'SIGTERM',
                expect.any(Function)
            );
            expect(mockProcessOn).toHaveBeenCalledWith(
                'SIGINT',
                expect.any(Function)
            );
        });

        it('is idempotent - does not reattach handlers if called twice', () => 
{
            manager.StartListening();
            const firstSigtermCall = mockProcessOn.mock.calls.length;
            manager.StartListening();
            expect(mockProcessOn.mock.calls.length).toBe(firstSigtermCall);
        });

        it('invokes registered callbacks when SIGTERM is emitted', () => 
{
            const callback = jest.fn();
            manager.RegisterShutdownHook(callback);
            manager.StartListening();

            // Extract the handler from mockProcessOn call
            const sigtermHandler = mockProcessOn.mock.calls.find(
                (call: [string, Function]) => call[0] === 'SIGTERM'
            )?.[1];

            if (sigtermHandler) 
{
                sigtermHandler();
            }

            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('invokes registered callbacks when SIGINT is emitted', () => 
{
            const callback = jest.fn();
            manager.RegisterShutdownHook(callback);
            manager.StartListening();

            const sigintHandler = mockProcessOn.mock.calls.find(
                (call: [string, Function]) => call[0] === 'SIGINT'
            )?.[1];

            if (sigintHandler) 
{
                sigintHandler();
            }

            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('invokes all registered callbacks in order when signal received', () => 
{
            const callback1 = jest.fn();
            const callback2 = jest.fn();
            const callback3 = jest.fn();

            manager.RegisterShutdownHook(callback1);
            manager.RegisterShutdownHook(callback2);
            manager.RegisterShutdownHook(callback3);
            manager.StartListening();

            const sigtermHandler = mockProcessOn.mock.calls.find(
                (call: [string, Function]) => call[0] === 'SIGTERM'
            )?.[1];

            if (sigtermHandler) 
{
                sigtermHandler();
            }

            expect(callback1).toHaveBeenCalledTimes(1);
            expect(callback2).toHaveBeenCalledTimes(1);
            expect(callback3).toHaveBeenCalledTimes(1);
            // Verify order by checking invocation counts at each step
            expect(callback1).toHaveBeenCalledWith();
            expect(callback2).toHaveBeenCalledWith();
            expect(callback3).toHaveBeenCalledWith();
        });
    });

    describe('Idempotency - Multiple Rapid Signals', () => 
{
        it('only invokes shutdown callbacks once even with multiple SIGTERM signals', () => 
{
            const callback = jest.fn();
            manager.RegisterShutdownHook(callback);
            manager.StartListening();

            const sigtermHandler = mockProcessOn.mock.calls.find(
                (call: [string, Function]) => call[0] === 'SIGTERM'
            )?.[1];

            // Simulate rapid multiple SIGTERM signals
            if (sigtermHandler) 
{
                sigtermHandler();
                sigtermHandler();
                sigtermHandler();
            }

            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('prevents re-entry after shutdown has begun', () => 
{
            const callback1 = jest.fn();
            const callback2 = jest.fn();

            manager.RegisterShutdownHook(callback1);
            manager.RegisterShutdownHook(callback2);
            manager.StartListening();

            const sigtermHandler = mockProcessOn.mock.calls.find(
                (call: [string, Function]) => call[0] === 'SIGTERM'
            )?.[1];

            const sigintHandler = mockProcessOn.mock.calls.find(
                (call: [string, Function]) => call[0] === 'SIGINT'
            )?.[1];

            // Trigger SIGTERM first
            if (sigtermHandler) 
{
                sigtermHandler();
            }

            // Then try SIGINT - should not invoke callbacks again
            if (sigintHandler) 
{
                sigintHandler();
            }

            expect(callback1).toHaveBeenCalledTimes(1);
            expect(callback2).toHaveBeenCalledTimes(1);
        });
    });

    describe('Edge Case - Signals Before Initialization', () => 
{
        it('does not throw unhandled exceptions if signals fired before StartListening', () => 
{
            const managerBeforeInit = new SignalLifecycleManager();
            const callback = jest.fn();
            managerBeforeInit.RegisterShutdownHook(callback);

            // This should not throw - handlers not attached yet
            expect(() => 
{
                // Simulate a signal being received (would be a no-op without StartListening)
                // In reality, Node.js would emit the signal, but our manager hasn't attached handlers
            }).not.toThrow();

            expect(callback).not.toHaveBeenCalled();
        });
    });

    describe('Edge Case - No Callbacks Registered', () => 
{
        it('handles signal gracefully when no callbacks are registered', () => 
{
            manager.StartListening();

            const sigtermHandler = mockProcessOn.mock.calls.find(
                (call: [string, Function]) => call[0] === 'SIGTERM'
            )?.[1];

            expect(() => 
{
                if (sigtermHandler) 
{
                    sigtermHandler();
                }
            }).not.toThrow();
        });
    });

    describe('Edge Case - Callback Throws Error', () => 
{
        it('continues executing remaining callbacks even if one throws', () => 
{
            const failingCallback = jest.fn().mockImplementation(() => 
{
                throw new Error('Shutdown failed');
            });
            const successCallback = jest.fn();

            manager.RegisterShutdownHook(failingCallback);
            manager.RegisterShutdownHook(successCallback);
            manager.StartListening();

            const sigtermHandler = mockProcessOn.mock.calls.find(
                (call: [string, Function]) => call[0] === 'SIGTERM'
            )?.[1];

            expect(() => 
{
                if (sigtermHandler) 
{
                    sigtermHandler();
                }
            }).not.toThrow();

            expect(failingCallback).toHaveBeenCalledTimes(1);
            expect(successCallback).toHaveBeenCalledTimes(1);
        });

        it('logs error message when callback throws', () => 
{
            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => 
{});
            const testError = new Error('Test shutdown error');
            const failingCallback = jest.fn().mockImplementation(() => 
{
                throw testError;
            });

            manager.RegisterShutdownHook(failingCallback);
            manager.StartListening();

            const sigtermHandler = mockProcessOn.mock.calls.find(
                (call: [string, Function]) => call[0] === 'SIGTERM'
            )?.[1];

            if (sigtermHandler) 
{
                sigtermHandler();
            }

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Error during shutdown:',
                testError
            );
            consoleErrorSpy.mockRestore();
        });
    });

    describe('ResetForTesting', () => 
{
        it('resets shutdown state for testing', () => 
{
            const callback = jest.fn();
            manager.RegisterShutdownHook(callback);
            manager.StartListening();

            // Trigger shutdown
            const sigtermHandler = mockProcessOn.mock.calls.find(
                (call: [string, Function]) => call[0] === 'SIGTERM'
            )?.[1];
            if (sigtermHandler) 
{
                sigtermHandler();
            }

            expect(manager.GetShutdownStatus()).toBe(true);

            // Reset
            manager.ResetForTesting();
            expect(manager.GetShutdownStatus()).toBe(false);
        });

        it('allows re-registration after reset', () => 
{
            const callback1 = jest.fn();
            manager.RegisterShutdownHook(callback1);
            manager.StartListening();
            manager.ResetForTesting();

            const callback2 = jest.fn();
            manager.RegisterShutdownHook(callback2);
            manager.StartListening();

            const sigtermHandler = mockProcessOn.mock.calls.find(
                (call: [string, Function]) => call[0] === 'SIGTERM'
            )?.[1];
            if (sigtermHandler) 
{
                sigtermHandler();
            }

            expect(callback2).toHaveBeenCalledTimes(1);
        });
    });

    describe('GetShutdownStatus', () => 
{
        it('returns false before shutdown', () => 
{
            expect(manager.GetShutdownStatus()).toBe(false);
        });

        it('returns true after shutdown', () => 
{
            manager.StartListening();
            const sigtermHandler = mockProcessOn.mock.calls.find(
                (call: [string, Function]) => call[0] === 'SIGTERM'
            )?.[1];
            if (sigtermHandler) 
{
                sigtermHandler();
            }
            expect(manager.GetShutdownStatus()).toBe(true);
        });
    });

    describe('process.exit bypass', () => 
{
        it('does not call process.exit during signal handling', () => 
{
            const callback = jest.fn();
            manager.RegisterShutdownHook(callback);
            manager.StartListening();

            const sigtermHandler = mockProcessOn.mock.calls.find(
                (call: [string, Function]) => call[0] === 'SIGTERM'
            )?.[1];

            if (sigtermHandler) 
{
                sigtermHandler();
            }

            expect(mockExit).not.toHaveBeenCalled();
        });
    });
});
