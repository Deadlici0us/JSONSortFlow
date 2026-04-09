import express from 'express';
import { Request, Response } from 'express';
import { Server } from 'http';
import { ThreadPool } from './infrastructure/ThreadPool';
import { ShutdownManager } from './infrastructure/ShutdownManager';
import { SignalLifecycleManager } from './infrastructure/SignalLifecycleManager';
import { BfsSearcher } from './services/BfsSearcher';
import { AStarSearcher } from './services/AStarSearcher';
import { DfsSearcher } from './services/DfsSearcher';
import { DijkstraSearcher } from './services/DijkstraSearcher';
import BubbleSorter from './services/BubbleSorter';
import QuickSorter from './services/QuickSorter';
import MergeSorter from './services/MergeSorter';
import { BadRequestError } from './errorhandling/BadRequestError';

/**
 * Application entry point.
 *
 * Initializes the Express server and configures routes
 * for pathfinding search and sorting requests.
 */
class App {
    private app: express.Application;
    private server: Server | null = null;
    private threadPool: ThreadPool;
    private bfsSearcher: BfsSearcher;
    private aStarSearcher: AStarSearcher;
    private dfsSearcher: DfsSearcher;
    private dijkstraSearcher: DijkstraSearcher;
    private bubbleSorter: BubbleSorter;
    private quickSorter: QuickSorter;
    private mergeSorter: MergeSorter;
    private shutdownManager: ShutdownManager | null = null;
    private signalLifecycleManager: SignalLifecycleManager;

   constructor() {
        this.app = express();
        this.threadPool = ThreadPool.GetInstance();
        this.bfsSearcher = new BfsSearcher();
        this.aStarSearcher = new AStarSearcher();
        this.dfsSearcher = new DfsSearcher();
        this.dijkstraSearcher = new DijkstraSearcher();
        this.bubbleSorter = new BubbleSorter();
        this.quickSorter = new QuickSorter();
        this.mergeSorter = new MergeSorter();
        this.signalLifecycleManager = new SignalLifecycleManager();

        this.Initialize();
        this.RegisterSignalHandlers();
        this.RegisterShutdownHook();
        this.signalLifecycleManager.StartListening();
    }

    /**
     * Initializes middleware and routes.
     */
    private Initialize(): void {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        this.ConfigureRoutes();
        this.ConfigureErrorHandlers();
    }

    /**
     * Configures application routes.
     */
    private ConfigureRoutes(): void {
        this.app.get('/', (req, res) => {
            res.json({
                success: true,
                message: 'JSONSortFlow API is running',
                version: '1.0.0',
            });
        });

        this.app.get('/health', (req, res) => {
            res.json({
                success: true,
                status: 'healthy',
                timestamp: new Date().toISOString(),
            });
        });

        // Search endpoints
        this.app.post('/bfs-search', (req, res) => {
            this.HandleSearch(req, res, this.bfsSearcher);
        });

        this.app.post('/astar-search', (req, res) => {
            this.HandleSearch(req, res, this.aStarSearcher);
        });

        this.app.post('/dfs-search', (req, res) => {
            this.HandleSearch(req, res, this.dfsSearcher);
        });

        this.app.post('/dijkstra-search', (req, res) => {
            this.HandleSearch(req, res, this.dijkstraSearcher);
        });

        // Sort endpoints
        this.app.post('/bubble-sort', (req, res) => {
            this.HandleSort(req, res, this.bubbleSorter);
        });

        this.app.post('/quick-sort', (req, res) => {
            this.HandleSort(req, res, this.quickSorter);
        });

        this.app.post('/merge-sort', (req, res) => {
            this.HandleSort(req, res, this.mergeSorter);
        });
    }

    /**
     * Configures error handlers.
     */
    private ConfigureErrorHandlers(): void {
        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({
                error: 'Not Found Error.',
                message: `Cannot ${req.method} ${req.path}`,
            });
        });

        // Global error handler
        this.app.use(
            (
                err: Error,
                req: Request,
                res: Response,
                next: express.NextFunction
            ) => {
                if (err instanceof BadRequestError) {
                    res.status(400).json({
                        error: 'BadRequestError',
                        message: err.message,
                    });
                } else {
                    res.status(500).json({
                        error: 'Internal Server Error.',
                        message: err.message,
                    });
                }
            }
        );
    }

    /**
     * Handles search requests.
     *
     * @param req - Express request object
     * @param res - Express response object
     * @param searcher - The search algorithm to use
     */
    private async HandleSearch(
        req: Request,
        res: Response,
        searcher: BfsSearcher | AStarSearcher | DfsSearcher | DijkstraSearcher
    ): Promise<void> {
        try {
            const { matrix, start, end } = req.body;

            // Validate matrix
            if (!matrix || !Array.isArray(matrix)) {
                if (!matrix) {
                    res.status(400).json({
                        error: 'BadRequestError',
                        message: 'Matrix is required',
                    });
                } else {
                    res.status(400).json({
                        error: 'BadRequestError',
                        message: 'Matrix must be a 2D array',
                    });
                }
                return;
            }

            if (matrix.length === 0 || !Array.isArray(matrix[0])) {
                res.status(400).json({
                    error: 'BadRequestError',
                    message: 'Matrix must be a 2D array',
                });
                return;
            }

            // Validate matrix dimensions (must be exactly 32x32)
            if (matrix.length !== 32 || matrix[0].length !== 32) {
                res.status(400).json({
                    error: 'BadRequestError',
                    message: 'Matrix dimensions must be exactly 32x32',
                });
                return;
            }

            // Validate matrix values (only 0 or 1 allowed)
            for (const row of matrix) {
                for (const val of row) {
                    if (val !== 0 && val !== 1) {
                        res.status(400).json({
                            error: 'BadRequestError',
                            message:
                                'Matrix must contain only 0 (free) or 1 (obstacle)',
                        });
                        return;
                    }
                }
            }

            // Validate start coordinate
            if (!start || !Array.isArray(start) || start.length !== 2) {
                res.status(400).json({
                    error: 'BadRequestError',
                    message: 'start must be a tuple [x, y]',
                });
                return;
            }

            // Validate end coordinate
            if (!end || !Array.isArray(end) || end.length !== 2) {
                res.status(400).json({
                    error: 'BadRequestError',
                    message: 'end must be a tuple [x, y]',
                });
                return;
            }

            // Validate coordinate bounds (must be within matrix dimensions)
            const matrixRows = matrix.length;
            const matrixCols = matrix[0].length;

            if (
                start[0] < 0 ||
                start[0] >= matrixCols ||
                start[1] < 0 ||
                start[1] >= matrixRows
            ) {
                res.status(400).json({
                    error: 'BadRequestError',
                    message: 'Start coordinate out of bounds',
                });
                return;
            }

            if (
                end[0] < 0 ||
                end[0] >= matrixCols ||
                end[1] < 0 ||
                end[1] >= matrixRows
            ) {
                res.status(400).json({
                    error: 'BadRequestError',
                    message: 'End coordinate out of bounds',
                });
                return;
            }

            // Validate that start and end positions are not blocked
            const startX = start[0];
            const startY = start[1];
            const endX = end[0];
            const endY = end[1];

            if (matrix[startY][startX] === 1) {
                res.status(400).json({
                    error: 'BadRequestError',
                    message: 'Start position is blocked by obstacle',
                });
                return;
            }

            if (matrix[endY][endX] === 1) {
                res.status(400).json({
                    error: 'BadRequestError',
                    message: 'End position is blocked by obstacle',
                });
                return;
            }

            // Execute the search with correct parameter order: start, end, matrix
            const result = searcher.search(
                start as [number, number],
                end as [number, number],
                matrix as number[][]
            );

            res.status(200).json({
                explored: result.explored,
                result: result.result,
            });
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Invalid request';
            res.status(400).json({
                error: 'BadRequestError',
                message: message,
            });
        }
    }

    /**
     * Handles sort requests.
     *
     * @param req - Express request object
     * @param res - Express response object
     * @param sorter - The sorting algorithm to use
     */
    private HandleSort(
        req: Request,
        res: Response,
        sorter: BubbleSorter | QuickSorter | MergeSorter
    ): void {
        try {
            const { numbers } = req.body;

            // Validate numbers
            if (!numbers || !Array.isArray(numbers)) {
                res.status(400).json({
                    error: 'Bad Request',
                    message: 'numbers is required and must be an array',
                });
                return;
            }

            // Validate array size (max 100 elements)
            if (numbers.length > 100) {
                res.status(400).json({
                    error: 'Bad Request',
                    message: 'numbers array must have at most 100 elements',
                });
                return;
            }

            // Validate number range (0-99)
            for (const num of numbers) {
                if (typeof num !== 'number' || num < 0 || num >= 100) {
                    res.status(400).json({
                        error: 'Bad Request',
                        message: 'numbers must be in range 0-99',
                    });
                    return;
                }
            }

            const result = sorter.sort(numbers as number[]);

            res.status(200).json({
                steps: result.steps,
                indexes: result.indexes,
            });
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Bad Request';
            res.status(400).json({
                error: 'Bad Request',
                message: message,
            });
        }
    }

    /**
     * Registers OS signal handlers for graceful shutdown.
     */
    private RegisterSignalHandlers(): void {
        const handleShutdown = async (): Promise<void> => {
            if (this.shutdownManager !== null) {
                await this.shutdownManager.BeginShutdown();
            }
        };

        process.on('SIGTERM', handleShutdown);
        process.on('SIGINT', handleShutdown);
    }

    /**
     * Registers the server shutdown hook with SignalLifecycleManager.
     * This ensures the server is properly closed during graceful shutdown.
     */
    private RegisterShutdownHook(): void {
        const serverCloseCallback = (): void => {
            if (this.server !== null) {
                this.server.close();
            }
        };

        this.signalLifecycleManager.RegisterShutdownHook(serverCloseCallback);
    }

    /**
     * Starts the server on the specified port.
     *
     * @param port - Port number to listen on
     * @returns The Express application
     */
    public Listen(port: number): express.Application {
        this.server = this.app.listen(port, () => {
            console.log(`Server running on port ${port}`);

            // Initialize thread pool after server is listening
            this.threadPool.Initialize();

            // Create shutdown manager after server is ready
            this.shutdownManager = new ShutdownManager(
                this.server!,
                this.threadPool
            );
        });

        return this.app;
    }

    /**
     * Gets the Express application instance.
     *
     * @returns The Express application
     */
    public GetApp(): express.Application {
        return this.app;
    }
}

export default App;
