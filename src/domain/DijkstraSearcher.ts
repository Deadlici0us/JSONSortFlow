import { IGraph, INode, IEdge, PathResult, PriorityEntry } from './types';

/**
 * Implementation of Dijkstra's shortest path algorithm.
 *
 * This class provides a complete Dijkstra search implementation with
 * support for weighted directed and undirected graphs. Uses a priority
 * queue for efficient node selection.
 *
 * @example
 * const searcher = new DijkstraSearcher(graph);
 * const result = searcher.ExecuteSearch('start', 'end');
 */
export class DijkstraSearcher {
    private graph: IGraph;
    private distances: Map<string, number>;
    private previous: Map<string, string | null>;
    private visited: Set<string>;
    private priorityQueue: PriorityEntry[];

    /**
     * Creates a new DijkstraSearcher instance.
     *
     * @param graph - The graph to search
     */
    public constructor(graph: IGraph) {
        this.graph = graph;
        this.distances = new Map();
        this.previous = new Map();
        this.visited = new Set();
        this.priorityQueue = [];
    }

    /**
     * Executes the Dijkstra search algorithm from start to end node.
     *
     * @param startId - Starting node ID
     * @param endId - Target node ID
     * @returns PathResult containing the shortest path and cost
     */
    public ExecuteSearch(startId: string, endId: string): PathResult {
        this.InitializeSearch(startId);

        while (this.priorityQueue.length > 0) {
            const current = this.ExtractMinimum();
            if (current === null) {
                break;
            }

            if (current.nodeId === endId) {
                return this.ReconstructPath(startId, endId);
            }

            this.ProcessNeighbors(current.nodeId);
        }

        return {
            path: [],
            totalCost: Infinity,
            distance: 0,
            visited: Array.from(this.visited),
            found: false,
        };
    }

    /**
     * Initializes all data structures for a new search.
     *
     * @param startId - Starting node ID
     */
    private InitializeSearch(startId: string): void {
        this.distances.clear();
        this.previous.clear();
        this.visited.clear();
        this.priorityQueue = [];

        for (const node of this.graph.nodes) {
            this.distances.set(node.id, Infinity);
            this.previous.set(node.id, null);
        }

        this.distances.set(startId, 0);
        this.priorityQueue.push({
            nodeId: startId,
            priority: 0,
        });
    }

    /**
     * Extracts the node with minimum distance from the priority queue.
     *
     * @returns PriorityEntry or null if queue is empty
     */
    private ExtractMinimum(): PriorityEntry | null {
        if (this.priorityQueue.length === 0) {
            return null;
        }

        let minIndex = 0;
        for (let i = 1; i < this.priorityQueue.length; i++) {
            if (
                this.priorityQueue[i].priority <
                this.priorityQueue[minIndex].priority
            ) {
                minIndex = i;
            }
        }

        const minEntry = this.priorityQueue[minIndex];
        this.priorityQueue.splice(minIndex, 1);
        return minEntry;
    }

    /**
     * Processes all neighbors of the current node.
     *
     * @param nodeId - Current node ID to process
     */
    private ProcessNeighbors(nodeId: string): void {
        const node = this.GetNodeById(nodeId);
        if (node === null) {
            return;
        }

        this.visited.add(nodeId);

        for (const neighborId of node.neighbors) {
            if (this.visited.has(neighborId)) {
                continue;
            }

            const edgeWeight = this.GetEdgeWeight(nodeId, neighborId);
            const newDistance =
                this.GetDistance(nodeId) + edgeWeight + node.weight;

            if (newDistance < this.GetDistance(neighborId)) {
                this.UpdateDistance(neighborId, newDistance, nodeId);
            }
        }
    }

    /**
     * Gets a node by its ID.
     *
     * @param id - Node ID to find
     * @returns INode or null if not found
     */
    private GetNodeById(id: string): INode | null {
        const index = this.graph.nodes.findIndex((node) => node.id === id);
        if (index === -1) {
            return null;
        }
        return this.graph.nodes[index];
    }

    /**
     * Gets the weight of an edge between two nodes.
     *
     * @param from - Source node ID
     * @param to - Destination node ID
     * @returns Edge weight or 1 if edge not found
     */
    private GetEdgeWeight(from: string, to: string): number {
        const edge = this.graph.edges.find(
            (e) => e.from === from && e.to === to
        );
        if (edge !== undefined) {
            return edge.weight;
        }

        if (this.graph.isDirected === false) {
            const reverseEdge = this.graph.edges.find(
                (e) => e.from === to && e.to === from
            );
            if (reverseEdge !== undefined) {
                return reverseEdge.weight;
            }
        }

        return 1;
    }

    /**
     * Gets the current distance to a node.
     *
     * @param nodeId - Node ID
     * @returns Distance value
     */
    private GetDistance(nodeId: string): number {
        return this.distances.get(nodeId) ?? Infinity;
    }

    /**
     * Updates the distance and previous node for a given node.
     *
     * @param nodeId - Node ID to update
     * @param newDistance - New distance value
     * @param previousId - Previous node ID in path
     */
    private UpdateDistance(
        nodeId: string,
        newDistance: number,
        previousId: string
    ): void {
        this.distances.set(nodeId, newDistance);
        this.previous.set(nodeId, previousId);
        this.priorityQueue.push({
            nodeId: nodeId,
            priority: newDistance,
        });
    }

    /**
     * Reconstructs the path from start to end node.
     *
     * @param startId - Starting node ID
     * @param endId - Target node ID
     * @returns PathResult with the complete path
     */
    private ReconstructPath(startId: string, endId: string): PathResult {
        const path: string[] = [];
        let current: string | null = endId;

        while (current !== null) {
            path.unshift(current);
            current = this.previous.get(current) ?? null;
        }

        const totalCost = this.distances.get(endId) ?? Infinity;
        const found = path[0] === startId && path[path.length - 1] === endId;

        return {
            path: found ? path : [],
            totalCost: found ? totalCost : Infinity,
            distance: 0,
            visited: Array.from(this.visited),
            found: found,
        };
    }
}
