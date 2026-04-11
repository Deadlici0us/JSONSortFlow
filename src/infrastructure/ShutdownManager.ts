import { Server } from 'http';
import { ThreadPool } from './ThreadPool';

/**
 * Manages graceful shutdown of the application.
 *
 * This class coordinates the orderly shutdown of HTTP server connections
 * and worker thread pools, with a forceful exit timeout as a safety net.
 *
 * @example
 * const shutdown = new ShutdownManager(server, threadPool);
 * process.on('SIGTERM', () => shutdown.BeginShutdown());
 */
class ShutdownManager 
{
    private isShuttingDown: boolean = false;
    private readonly timeoutMs: number = 10000;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private forcefulTimer: any = null;

    /**
     *
     */
    constructor(
        private readonly server: Server,
        private readonly threadPool: ThreadPool
    ) 
{}

    /**
     * Begins the graceful shutdown sequence.
     *
     * This method initiates the shutdown process in the following order:
     * 1. Stop accepting new requests
     * 2. Drain active connections
     * 3. Close thread pool
     * 4. Exit application
     *
     * If shutdown doesn't complete within the timeout, a forceful exit occurs.
     */
    public async BeginShutdown(): Promise<void> 
{
        if (this.isShuttingDown) 
{
            return;
        }

        this.isShuttingDown = true;

        // eslint-disable-next-line no-console
        console.log('Shutdown initiated...');

        this.StartForcefulExitTimer();

        try 
{
            await this.StopAcceptingRequests();
            await this.CloseThreadPool();
            await this.ExitApplication();
            this.ClearForcefulExitTimer();
        }
 catch (error) 
{
            this.HandleShutdownError(error);
        }
    }

    /**
     * Stops the server from accepting new connections and drains existing ones.
     *
     * This method calls server.close() which stops accepting new connections
     * and waits for all active connections to finish before resolving.
     */
    private async StopAcceptingRequests(): Promise<void> 
{
        return new Promise((resolve, reject) => 
{
            this.server.close((error) => 
{
                if (error) 
{
                    reject(error);
                    return;
                }
                // eslint-disable-next-line no-console
                console.log('HTTP server closed');
                resolve();
            });
        });
    }

    /**
     * Terminates the thread pool and its worker threads.
     *
     * This method calls the thread pool's graceful shutdown method to safely
     * terminate all worker threads and clean up resources.
     */
    private async CloseThreadPool(): Promise<void> 
{
        this.threadPool.GracefulShutdown();
        // eslint-disable-next-line no-console
        console.log('Thread pool closed');
    }

    /**
     * Exits the application gracefully.
     *
     * This method calls process.exit(0) to terminate the application
     * with a success code after all resources have been cleaned up.
     */
    private async ExitApplication(): Promise<void> 
{
        // eslint-disable-next-line no-console
        console.log('Application shutdown complete');
        process.exit(0);
    }

    /**
     * Starts a timer that will force exit if shutdown hangs.
     *
     * This is a safety mechanism to prevent the application from
     * hanging indefinitely during shutdown.
     */
    private StartForcefulExitTimer(): void 
{
        this.forcefulTimer = setTimeout(() => 
{
            // eslint-disable-next-line no-console
            console.error(
                `Shutdown exceeded ${this.timeoutMs}ms, forcing exit`
            );
            process.exit(1);
        }, this.timeoutMs);
    }

    /**
     * Clears the forceful exit timer.
     *
     * This should be called when shutdown completes successfully
     * to prevent the timer from triggering unnecessarily.
     */
    private ClearForcefulExitTimer(): void 
{
        if (this.forcefulTimer !== null) 
{
            clearTimeout(this.forcefulTimer);
        }
    }

    /**
     * Handles errors that occur during shutdown.
     *
     * @param error - The error that occurred
     */
    private HandleShutdownError(error: unknown): void 
{
        this.ClearForcefulExitTimer();
        const message =
            error instanceof Error ? error.message : 'Unknown shutdown error';
        // eslint-disable-next-line no-console
        console.error('Shutdown error:', message);
        process.exit(1);
    }

    /**
     * Returns the current shutdown state.
     *
     * @returns true if shutdown has begun
     */
    public IsShuttingDown(): boolean 
{
        return this.isShuttingDown;
    }
}

export { ShutdownManager };
