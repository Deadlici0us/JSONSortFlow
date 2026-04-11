import express from 'express';
import { Request, Response } from 'express';
import { Server } from 'http';
import { ThreadPool } from './infrastructure/ThreadPool';
import { ShutdownManager } from './infrastructure/ShutdownManager';
import { SignalLifecycleManager } from './infrastructure/SignalLifecycleManager';
import { ILogger } from './utils/ILogger';
import { ConsoleLogger } from './utils/ConsoleLogger';
import { SearcherFactory } from './infrastructure/SearcherFactory';
import { SorterFactory } from './infrastructure/SorterFactory';
import { SearchController } from './controllers/SearchController';
import SortController from './controllers/SortController';

/**
 * Application entry point.
 *
 * Initializes the Express server and configures routes
 * for pathfinding search and sorting requests using
 * Factory and Controller patterns.
 */
class App 
{
    private app: express.Application;
    private server: Server | null = null;
    private logger: ILogger;
    private threadPool: ThreadPool;
    private searcherFactory: SearcherFactory;
    private sorterFactory: SorterFactory;
    private shutdownManager: ShutdownManager | null = null;
    private signalLifecycleManager: SignalLifecycleManager;
    private controllers: Map<string, SearchController | SortController>;

    /**
     * Creates a new App instance.
     */
    constructor() 
{
        this.app = express();
        this.logger = new ConsoleLogger();
        this.threadPool = new ThreadPool(this.logger, 4);
        this.searcherFactory = new SearcherFactory();
        this.sorterFactory = new SorterFactory();
        this.signalLifecycleManager = new SignalLifecycleManager();
        this.controllers = new Map();

        this.InitializeControllers();
        this.Initialize();
        this.RegisterSignalHandlers();
        this.RegisterShutdownHook();
        this.signalLifecycleManager.StartListening();
    }

    /**
     * Initializes controllers with DI.
     */
    private InitializeControllers(): void 
{
        this.InitializeSearchControllers();
        this.InitializeSortControllers();
    }

    /**
     * Initializes search controllers.
     */
    private InitializeSearchControllers(): void 
{
        this.RegisterSearchController('bfs', 'bfs');
        this.RegisterSearchController('astar', 'astar');
        this.RegisterSearchController('dfs', 'dfs');
        this.RegisterSearchController('dijkstra', 'dijkstra');
    }

    /**
     * Registers a search controller.
     *
     * @param key - The controller map key
     * @param algorithm - The algorithm type
     */
    private RegisterSearchController(key: string, algorithm: string): void 
{
        const searcher = this.searcherFactory.create(algorithm);
        const controller = new SearchController(searcher);
        this.controllers.set(key, controller);
    }

    /**
     * Initializes sort controllers.
     */
    private InitializeSortControllers(): void 
{
        this.RegisterSortController('bubble', 'bubble');
        this.RegisterSortController('quick', 'quick');
        this.RegisterSortController('merge', 'merge');
    }

    /**
     * Registers a sort controller.
     *
     * @param key - The controller map key
     * @param algorithm - The algorithm type
     */
    private RegisterSortController(key: string, algorithm: string): void 
{
        const sorter = this.sorterFactory.create(algorithm);
        const controller = new SortController(sorter);
        this.controllers.set(key, controller);
    }

    /**
     * Initializes middleware and routes.
     */
    private Initialize(): void 
{
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.ConfigureRoutes();
        this.ConfigureErrorHandlers();
    }

    /**
     * Configures application routes.
     */
    private ConfigureRoutes(): void 
{
        this.app.get('/', this.HandleRoot.bind(this));
        this.app.get('/health', this.HandleHealth.bind(this));
        this.ConfigureSearchRoutes();
        this.ConfigureSortRoutes();
    }

    /**
     * Configures search routes.
     */
    private ConfigureSearchRoutes(): void 
{
        this.app.post('/bfs-search', this.CreateSearchRoute('bfs'));
        this.app.post('/astar-search', this.CreateSearchRoute('astar'));
        this.app.post('/dfs-search', this.CreateSearchRoute('dfs'));
        this.app.post('/dijkstra-search', this.CreateSearchRoute('dijkstra'));
    }

    /**
     * Creates a search route handler.
     *
     * @param key - The controller map key
     * @returns Route handler function
     */
    private CreateSearchRoute(
        key: string
    ): (req: Request, res: Response) => void 
{
        return (req: Request, res: Response) => 
{
            const controller = this.controllers.get(key) as SearchController;
            controller.search(req, res);
        };
    }

    /**
     * Configures sort routes.
     */
    private ConfigureSortRoutes(): void 
{
        this.app.post('/bubble-sort', this.CreateSortRoute('bubble'));
        this.app.post('/quick-sort', this.CreateSortRoute('quick'));
        this.app.post('/merge-sort', this.CreateSortRoute('merge'));
    }

    /**
     * Creates a sort route handler.
     *
     * @param key - The controller map key
     * @returns Route handler function
     */
    private CreateSortRoute(
        key: string
    ): (req: Request, res: Response) => void 
{
        return (req: Request, res: Response) => 
{
            const controller = this.controllers.get(key) as SortController;
            controller.sort(req, res);
        };
    }

    /**
     * Handles root endpoint.
     *
     * @param req - Express request
     * @param res - Express response
     */
    private HandleRoot(req: Request, res: Response): void 
{
        res.json({
            success: true,
            message: 'JSONSortFlow API is running',
            version: '1.0.0',
        });
    }

    /**
     * Handles health check endpoint.
     *
     * @param req - Express request
     * @param res - Express response
     */
    private HandleHealth(req: Request, res: Response): void 
{
        res.json({
            success: true,
            status: 'healthy',
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Configures error handlers.
     */
    private ConfigureErrorHandlers(): void 
{
        this.app.use(this.HandleNotFound.bind(this));
        this.app.use(this.HandleGlobalError.bind(this));
    }

    /**
     * Handles 404 errors.
     *
     * @param req - Express request
     * @param res - Express response
     */
    private HandleNotFound(req: Request, res: Response): void 
{
        res.status(404).json({
            error: 'Not Found Error.',
            message: `Cannot ${req.method} ${req.path}`,
        });
    }

    /**
     * Handles global errors.
     *
     * @param err - The error
     * @param req - Express request
     * @param res - Express response
     */
    private HandleGlobalError(err: Error, req: Request, res: Response): void 
{
        const isBadRequest = err.message.includes('BadRequestError');
        const isDefaultError = err.message.includes('DefaultError');
        this.HandleBadRequestOrDefault(isBadRequest, isDefaultError, err, res);
    }

    /**
     * Handles bad request or default error responses.
     *
     * @param isBadRequest - Whether it's a bad request
     * @param isDefaultError - Whether it's a default error
     * @param err - The error
     * @param res - Express response
     */
    private HandleBadRequestOrDefault(
        isBadRequest: boolean,
        isDefaultError: boolean,
        err: Error,
        res: Response
    ): void 
{
        if (isBadRequest) 
{
            res.status(400).json({
                error: 'BadRequestError',
                message: err.message,
            });
            return;
        }
        if (isDefaultError) 
{
            res.status(500).json({
                error: 'Internal Server Error.',
                message: err.message,
            });
            return;
        }
        res.status(500).json({
            error: 'Internal Server Error.',
            message: err.message,
        });
    }

    /**
     * Registers OS signal handlers for graceful shutdown.
     */
    private RegisterSignalHandlers(): void 
{
        const handleShutdown = async (): Promise<void> => 
{
            if (this.shutdownManager !== null) 
{
                await this.shutdownManager.BeginShutdown();
            }
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis.process as any).on('SIGTERM', handleShutdown);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis.process as any).on('SIGINT', handleShutdown);
    }

    /**
     * Registers the server shutdown hook with SignalLifecycleManager.
     */
    private RegisterShutdownHook(): void 
{
        const serverCloseCallback = (): void => 
{
            if (this.server !== null) 
{
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
    public Listen(port: number): express.Application 
{
        this.server = this.app.listen(port, () => 
{
            this.logger.info('Server running on port', { port });
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
    public GetApp(): express.Application 
{
        return this.app;
    }
}

export default App;
