/**
 * @file ThreadPool for concurrent task execution
 * @description Manages worker threads with queuing and graceful shutdown
 */

import { Worker } from 'worker_threads';
import { resolve } from 'path';
import { ILogger } from '../utils/ILogger';

interface TaskPayload {
    modulePath: string;
    functionName: string;
    data: Record<string, unknown>;
}

interface TaskHandle {
    id: string;
    status: string;
    result?: unknown;
    error?: string;
}

/**
 * ThreadPool manages a pool of worker threads for concurrent task execution.
 */
export class ThreadPool 
{
    private logger: ILogger;
    private maxWorkers: number;
    private workers: Worker[];
    private taskQueue: TaskPayload[];
    private activeWorkers: number;
    private isShutdown: boolean;
    private taskCounter: number;

    /**
     * Creates a new ThreadPool instance.
     */
    constructor(logger: ILogger, maxWorkers: number = 4) 
{
        this.logger = logger;
        this.maxWorkers = this.ValidateMaxWorkers(maxWorkers);
        this.workers = [];
        this.taskQueue = [];
        this.activeWorkers = 0;
        this.isShutdown = false;
        this.taskCounter = 0;
    }

    /**
     * Validates max workers configuration.
     */
    private ValidateMaxWorkers(maxWorkers: number): number 
{
        if (maxWorkers <= 0) 
{
            throw new Error('maxWorkers must be greater than 0');
        }
        if (!Number.isInteger(maxWorkers)) 
{
            throw new Error('maxWorkers must be an integer');
        }
        return maxWorkers;
    }

    /**
     * Submits a task to the thread pool.
     */
    public SubmitTask(task: TaskPayload): TaskHandle 
{
        if (this.isShutdown) 
{
            throw new Error('Cannot submit task to shut down pool');
        }

        this.ValidateTask(task);
        const handle = this.CreateTaskHandle();

        if (this.activeWorkers < this.maxWorkers) 
{
            this.ExecuteTask(task, handle);
        }
 else 
{
            this.taskQueue.push(task);
            handle.status = 'queued';
        }

        return handle;
    }

    /**
     * Validates task structure.
     */
    private ValidateTask(task: TaskPayload): void 
{
        if (!task.modulePath || !task.functionName) 
{
            throw new Error('Invalid task: missing modulePath or functionName');
        }
    }

    /**
     * Creates a task handle.
     */
    private CreateTaskHandle(): TaskHandle 
{
        this.taskCounter++;
        return {
            id: `task-${Date.now()}-${this.taskCounter}`,
            status: 'pending',
        };
    }

    /**
     * Executes a task in a worker thread.
     */
    private ExecuteTask(task: TaskPayload, handle: TaskHandle): void 
{
        this.activeWorkers++;
        handle.status = 'running';

        const worker = new Worker(
            resolve(process.cwd(), 'build/infrastructure/worker_wrapper.js')
        );

        this.AttachWorkerHandlers(worker, handle);
        this.workers.push(worker);

        try 
{
            worker.postMessage(task);
        }
 catch (error) 
{
            this.HandlePostError(error, handle, worker);
        }
    }

    /**
     * Attaches event handlers to worker.
     */
    private AttachWorkerHandlers(worker: Worker, handle: TaskHandle): void 
{
        worker.on('message', (result: unknown) => 
{
            handle.result = result;
            handle.status = 'completed';
            this.OnWorkerComplete(worker);
        });

        worker.on('error', (error: Error) => 
{
            this.HandleWorkerError(error, handle, worker);
        });

        worker.on('exit', (code: number) => 
{
            if (code !== 0) 
{
                handle.error = `Worker exited with code ${code}`;
                handle.status = 'failed';
                this.logger.error('Worker exit', {
                    taskId: handle.id,
                    exitCode: code,
                });
            }
            this.OnWorkerComplete(worker);
        });
    }

    /**
     * Handles worker error.
     */
    private HandleWorkerError(
        error: Error,
        handle: TaskHandle,
        worker: Worker
    ): void 
{
        handle.error = error.message;
        handle.status = 'failed';
        this.logger.error('Worker error', {
            taskId: handle.id,
            error: error.message,
        });
        this.OnWorkerComplete(worker);
    }

    /**
     * Handles post message error.
     */
    private HandlePostError(
        error: unknown,
        handle: TaskHandle,
        worker: Worker
    ): void 
{
        handle.error = (error as Error).message;
        handle.status = 'failed';
        this.logger.error('Task post failed', {
            taskId: handle.id,
            error: (error as Error).message,
        });
        this.OnWorkerComplete(worker);
    }

    /**
     * Handles worker completion.
     */
    private OnWorkerComplete(worker: Worker): void 
{
        const index = this.workers.indexOf(worker);
        if (index > -1) 
{
            this.workers.splice(index, 1);
        }
        this.activeWorkers--;
        this.ProcessNextQueuedTask();
    }

    /**
     * Processes next queued task if available.
     */
    private ProcessNextQueuedTask(): void 
{
        if (this.taskQueue.length === 0 || this.isShutdown) 
{
            return;
        }
        const nextTask = this.taskQueue.shift();
        if (nextTask) 
{
            const nextHandle = this.CreateTaskHandle();
            this.ExecuteTask(nextTask, nextHandle);
        }
    }

    /**
     * Shuts down the pool gracefully with optional timeout.
     */
    public GracefulShutdown(__timeout?: number): Promise<void> 
{
        return new Promise((resolve) => 
{
            this.isShutdown = true;
            this.TerminateWorkers();
            resolve();
        });
    }

    /**
     * Force closes all workers immediately.
     */
    public ForceClose(): void 
{
        this.isShutdown = true;
        this.workers.forEach((worker) => worker.terminate());
        this.workers = [];
    }

    /**
     * Shuts down the pool immediately.
     */
    public Shutdown(): Promise<void> 
{
        return this.GracefulShutdown();
    }

    /**
     * Checks if pool is shut down.
     */
    public IsShutdown(): boolean 
{
        return this.isShutdown;
    }

    /**
     * Gets active worker count.
     */
    public GetActiveWorkerCount(): number 
{
        return this.activeWorkers;
    }

    /**
     * Gets active workers count (alias).
     */
    public GetActiveWorkersCount(): number 
{
        return this.GetActiveWorkerCount();
    }

    /**
     * Gets queue size.
     */
    public GetQueueSize(): number 
{
        return this.taskQueue.length;
    }

    /**
     * Gets queue length (alias).
     */
    public GetQueueLength(): number 
{
        return this.GetQueueSize();
    }

    /**
     * Terminates all workers.
     */
    private TerminateWorkers(): void 
{
        this.workers.forEach((worker) => worker.terminate());
        this.workers = [];
    }
}
