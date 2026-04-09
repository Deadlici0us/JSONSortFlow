import { WorkerData, SearchResult } from './types';
import { DijkstraSearcher } from './DijkstraSearcher';

/**
 * Worker wrapper function for Piscina thread pool execution.
 *
 * This function is designed to be exported and called from worker threads.
 * It receives serialized worker data, executes the Dijkstra search,
 * and returns the result in a thread-safe manner.
 *
 * @param data - WorkerData containing graph and search parameters
 * @returns SearchResult with either the path result or error message
 *
 * @example
 * // In main thread:
 * const pool = new Pool(workerPath, { minThreads: 2, maxThreads: 4 });
 * const result = await pool.run(workerData);
 */
export function workerHandler(data: WorkerData): SearchResult {
    try {
        // Validate input data
        if (!isValidWorkerData(data)) {
            return {
                error: 'Invalid worker data: missing required fields',
            };
        }

        // Validate graph structure
        if (!isValidGraph(data.graph)) {
            return {
                error: 'Invalid graph structure',
            };
        }

        // Validate start and end nodes exist
        const startNodeExists = data.graph.nodes.some(
            (node) => node.id === data.startId
        );
        const endNodeExists = data.graph.nodes.some(
            (node) => node.id === data.endId
        );

        if (!startNodeExists) {
            return {
                error: `Start node '${data.startId}' not found in graph`,
            };
        }

        if (!endNodeExists) {
            return {
                error: `End node '${data.endId}' not found in graph`,
            };
        }

        // Execute the search
        const searcher = new DijkstraSearcher(data.graph);
        const result = searcher.ExecuteSearch(data.startId, data.endId);

        return { result: result };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
        return {
            error: `Worker execution failed: ${errorMessage}`,
        };
    }
}

/**
 * Validates that WorkerData contains all required fields.
 *
 * @param data - WorkerData to validate
 * @returns true if valid, false otherwise
 */
function isValidWorkerData(data: WorkerData): boolean {
    return (
        data !== null &&
        data !== undefined &&
        'graph' in data &&
        'startId' in data &&
        'endId' in data &&
        typeof data.startId === 'string' &&
        typeof data.endId === 'string' &&
        data.startId.length > 0 &&
        data.endId.length > 0
    );
}

/**
 * Validates that the graph structure is valid for processing.
 *
 * @param graph - IGraph to validate
 * @returns true if valid, false otherwise
 */
function isValidGraph(graph: WorkerData['graph']): boolean {
    if (graph === null || graph === undefined) {
        return false;
    }

    if (!('nodes' in graph) || !Array.isArray(graph.nodes)) {
        return false;
    }

    if (!('edges' in graph) || !Array.isArray(graph.edges)) {
        return false;
    }

    return true;
}

// Export for Piscina worker threads
export default workerHandler;
