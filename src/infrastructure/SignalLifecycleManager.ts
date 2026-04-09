/**
 * SignalLifecycleManager
 *
 * Manages graceful shutdown signal handling for Node.js processes.
 * Ensures idempotent shutdown callback execution on SIGTERM/SIGINT.
 */

export class SignalLifecycleManager {
  private shutdownCallbacks: Array<() => void>;
  private shutdownInitiated: boolean;
  private sigtermHandler: (() => void) | null;
  private sigintHandler: (() => void) | null;

  constructor() {
    this.shutdownCallbacks = [];
    this.shutdownInitiated = false;
    this.sigtermHandler = null;
    this.sigintHandler = null;
  }

  /**
   * Registers a shutdown hook callback that will be invoked
   * when SIGTERM or SIGINT signals are received.
   *
   * @param callback - The shutdown callback function to register
   * @public
   */
  public RegisterShutdownHook(callback: () => void): void {
    if (callback === null || callback === undefined) {
      return;
    }

    this.shutdownCallbacks.push(callback);
  }

  /**
   * Attaches signal handlers for SIGTERM and SIGINT.
   * Must be called after registering shutdown callbacks.
   *
   * @public
   */
  public StartListening(): void {
    if (this.sigtermHandler !== null) {
      return;
    }

    this.sigtermHandler = (): void => {
      this.HandleShutdown();
    };

    this.sigintHandler = (): void => {
      this.HandleShutdown();
    };

    process.on('SIGTERM', this.sigtermHandler);
    process.on('SIGINT', this.sigintHandler);
  }

  /**
   * Internal handler that executes all registered shutdown callbacks
   * exactly once, ensuring idempotency.
   *
   * @private
   */
  private HandleShutdown(): void {
    if (this.shutdownInitiated) {
      return;
    }

    this.shutdownInitiated = true;

    for (const callback of this.shutdownCallbacks) {
      try {
        callback();
      } catch (error) {
        console.error('Error during shutdown:', error);
      }
    }
  }

  /**
   * Returns whether shutdown has been initiated.
   *
   * @returns boolean indicating shutdown status
   * @public
   */
  public GetShutdownStatus(): boolean {
    return this.shutdownInitiated;
  }

  /**
   * Clears all registered shutdown callbacks and resets state.
   * Intended for testing purposes only.
   *
   * @public
   */
  public ResetForTesting(): void {
    this.shutdownCallbacks = [];
    this.shutdownInitiated = false;
    this.sigtermHandler = null;
    this.sigintHandler = null;
  }
}
