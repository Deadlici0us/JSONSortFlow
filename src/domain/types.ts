/**
 * Domain types for graph-based pathfinding algorithms.
 *
 * These interfaces define the contract for graph structures used by
 * Dijkstra's algorithm and other search implementations.
 */

/**
 * Represents a single node in a graph structure.
 *
 * @property id - Unique identifier for the node
 * @property x - X coordinate in the graph space
 * @property y - Y coordinate in the graph space
 * @property weight - Cost/weight associated with this node
 * @property neighbors - Array of connected node IDs
 */
export interface INode {
    id: string;
    x: number;
    y: number;
    weight: number;
    neighbors: string[];
}

/**
 * Represents a complete graph structure for pathfinding operations.
 *
 * @property nodes - Array of all nodes in the graph
 * @property edges - Array of edge definitions with weights
 * @property isWeighted - Whether the graph uses weighted edges
 * @property isDirected - Whether edges have direction
 */
export interface IGraph {
    nodes: INode[];
    edges: IEdge[];
    isWeighted: boolean;
    isDirected: boolean;
}

/**
 * Represents an edge connecting two nodes in a graph.
 *
 * @property from - Source node ID
 * @property to - Destination node ID
 * @property weight - Cost to traverse this edge
 */
export interface IEdge {
    from: string;
    to: string;
    weight: number;
}

/**
 * Result of a pathfinding search operation.
 *
 * @property path - Ordered array of node IDs representing the shortest path
 * @property totalCost - Total cost/weight of the path
 * @property distance - Physical distance (if applicable)
 * @property visited - Array of all visited node IDs during search
 * @property found - Whether a path was found between start and end
 */
export interface PathResult {
    path: string[];
    totalCost: number;
    distance: number;
    visited: string[];
    found: boolean;
}

/**
 * Priority queue entry for Dijkstra's algorithm.
 *
 * @property nodeId - ID of the node
 * @property priority - Current priority/distance value
 */
export interface PriorityEntry {
    nodeId: string;
    priority: number;
}

/**
 * Data structure for worker thread communication.
 *
 * @property graph - The graph to search
 * @property startId - Starting node ID
 * @property endId - Target node ID
 */
export interface WorkerData {
    graph: IGraph;
    startId: string;
    endId: string;
}

/**
 * Result returned from a worker thread search.
 *
 * @property result - The pathfinding result
 * @property error - Error message if search failed
 */
export interface SearchResult {
    result?: PathResult;
    error?: string;
}
