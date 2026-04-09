/**
 * @file ThreadPool for concurrent task execution
 * @description Manages worker threads with queuing and graceful shutdown
 */

import { Worker } from 'worker_threads';
import { resolve } from 'path';
import { ILogger } from '../utils/ILogger';

export interface TaskPayload {
  modulePath: string;
  functionName: string;
  data: Record<string, unknown>;
}

export interface TaskHandle {
  id: string;
  status: string;
  result?: unknown;
  error?: string;
}

export interface WorkerConfig {
  maxWorkers: number;
  timeout: number;
}

/**
 * ThreadPool manages a pool of worker threads for concurrent task execution.
 *
 * Supports queuing, graceful shutdown, and error handling without
 * crashing the main thread.
 */
export class ThreadPool {
  private logger: ILogger;
  private maxWorkers: number;
  private workers: Worker[];
  private taskQueue: TaskPayload[];
  private activeWorkers: number;
  private isShutdown: boolean;
  private taskCounter: number;
  private workerTimeout: number;

  /**
   * Creates a new ThreadPool instance.
   *
   * @param logger - Logger instance for error reporting
   * @param maxWorkers - Maximum number of worker threads (default: 4)
   */
  constructor(logger: ILogger, maxWorkers: number = 4) {
    this.logger = logger;
    this.maxWorkers = this.ValidateMaxWorkers(maxWorkers);
    this.workers = [];
    this.taskQueue = [];
    this.activeWorkers = 0;
    this.isShutdown = false;
    this.taskCounter = 0;
    this.workerTimeout = 30000;
  }

  /**
   * Validates max workers configuration.
   *
   * @param maxWorkers - Maximum workers to validate
   * @returns Validated max workers value
   * @throws Error if maxWorkers is invalid
   */
  private ValidateMaxWorkers(maxWorkers: number): number {
    if (maxWorkers <= 0) {
      throw new Error('maxWorkers must be greater than 0');
    }
    if (!Number.isInteger(maxWorkers)) {
      throw new Error('maxWorkers must be an integer');
    }
    return maxWorkers;
  }

  /**
   * Submits a task to the thread pool for execution.
   *
   * @param task - Task payload with module, function, and data
   * @returns Task handle for tracking
   * @throws Error if pool is shut down or task is invalid
   */
  public SubmitTask(task: TaskPayload): TaskHandle {
    if (this.isShutdown) {
      throw new Error('Cannot submit task to shut down pool');
    }

    this.ValidateTask(task);

    const handle = this.CreateTaskHandle();

    if (this.activeWorkers < this.maxWorkers) {
      this.ExecuteTask(task, handle);
    } else {
      this.taskQueue.push(task);
      handle.status = 'queued';
    }

    return handle;
  }

  /**
   * Validates task payload structure.
   *
   * @param task - Task to validate
   * @throws Error if task is invalid
   */
  private ValidateTask(task: TaskPayload): void {
    if (!task || task === null) {
      throw new Error('Task cannot be null or undefined');
    }
    if (!task.modulePath || typeof task.modulePath !== 'string') {
      throw new Error('Task must have a valid modulePath');
    }
    if (!task.functionName || typeof task.functionName !== 'string') {
      throw new Error('Task must have a valid functionName');
    }
  }

  /**
   * Creates a task handle for tracking execution.
   *
   * @returns Task handle with unique ID
   */
  private CreateTaskHandle(): TaskHandle {
    this.taskCounter++;
    return {
      id: `task-${Date.now()}-${this.taskCounter}`,
      status: 'pending',
    };
  }

  /**
   * Executes a task in a worker thread.
   *
   * @param task - Task to execute
   * @param handle - Task handle to update
   */
  private ExecuteTask(task: TaskPayload, handle: TaskHandle): void {
    this.activeWorkers++;
    handle.status = 'running';

    const worker = new Worker(resolve(process.cwd(), 'build/infrastructure/worker_wrapper.js'));

    worker.on('message', (result: unknown) => {
      handle.result = result;
      handle.status = 'completed';
      this.OnWorkerComplete(worker, handle);
    });

    worker.on('error', (error: Error) => {
      handle.error = error.message;
      handle.status = 'failed';
      this.logger.error('Worker error', {
        taskId: handle.id,
        error: error.message,
      });
      this.OnWorkerComplete(worker, handle);
    });

    worker.on('exit', (code: number) => {
      if (code !== 0) {
        handle.error = `Worker exited with code ${code}`;
        handle.status = 'failed';
        this.logger.error('Worker exit', {
          taskId: handle.id,
          exitCode: code,
        });
      }
      this.OnWorkerComplete(worker, handle);
    });

    this.workers.push(worker);

    try {
      worker.postMessage(task);
    } catch (error) {
      handle.error = (error as Error).message;
      handle.status = 'failed';
      this.logger.error('Task post failed', {
        taskId: handle.id,
        error: (error as Error).message,
      });
      this.OnWorkerComplete(worker, handle);
    }
  }

  /**
   * Handles worker completion and queue processing.
   *
   * @param worker - Completed worker
   * @param handle - Task handle
   */
  private OnWorkerComplete(worker: Worker, handle: TaskHandle): void {
    this.activeWorkers--;
    this.CleanupWorker(worker);

    if (this.taskQueue.length > 0 && !this.isShutdown) {
      const nextTask = this.taskQueue.shift();
      if (nextTask) {
        const nextHandle = this.CreateTaskHandle();
        this.ExecuteTask(nextTask, nextHandle);
      }
    }
  }

  /**
   * Cleans up a completed worker.
   *
   * @param worker - Worker to clean up
   */
  private CleanupWorker(worker: Worker): void {
    const index = this.workers.indexOf(worker);
    if (index > -1) {
      this.workers.splice(index, 1);
    }
    worker.terminate();
  }

  /**
   * Gracefully shuts down the thread pool.
   *
   * Waits for active tasks to complete within timeout.
   *
   * @param timeout - Maximum wait time in milliseconds (default: 10000)
   */
  public GracefulShutdown(timeout: number = 10000): void {
    this.isShutdown = true;

    const deadline = Date.now() + timeout;

    while (this.activeWorkers > 0 && Date.now() < deadline) {
      // Wait for active workers to complete
      const slept = 10;
      setTimeout(() => {}, slept);
    }

    this.ForceClose();
  }

  /**
   * Forcefully closes all workers immediately.
   */
  public ForceClose(): void {
    this.workers.forEach((worker) => {
      try {
        worker.terminate();
      } catch {
        // Ignore termination errors
      }
    });

    this.workers = [];
    this.taskQueue = [];
    this.activeWorkers = 0;
  }

  /**
   * Gets the count of active workers.
   *
   * @returns Number of active workers
   */
  public GetActiveWorkersCount(): number {
    return this.activeWorkers;
  }

  /**
   * Gets the current queue length.
   *
   * @returns Number of queued tasks
   */
  public GetQueueLength(): number {
    return this.taskQueue.length;
  }

  /**
   * Checks if the pool is shut down.
   *
   * @returns true if pool is shut down
   */
  public IsShutdown(): boolean {
    return this.isShutdown;
  }
}
