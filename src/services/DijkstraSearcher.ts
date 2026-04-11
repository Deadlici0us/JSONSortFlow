import { ISearcher } from './ISearcher';

type Coordinate = [number, number];
type ParentMap = Map<string, Coordinate>;
type DistanceMap = Map<string, number>;

/**
 * Implements Dijkstra's shortest path algorithm.
 */
export class DijkstraSearcher implements ISearcher 
{
    /**
     * Performs Dijkstra's algorithm to find shortest path.
     *
     * @param start - Start coordinate
     * @param end - End coordinate
     * @param matrix - Grid matrix
     * @returns Object with explored and result
     */
    public search(
        start: Coordinate,
        end: Coordinate,
        __matrix: number[][]
    ): { explored: Coordinate[]; result: Coordinate[] } 
{
        const explored: Coordinate[] = [];
        const parentMap: ParentMap = new Map();
        const distances: DistanceMap = new Map();

        if (this.IsSameCoordinate(start, end)) 
{
            explored.push(start);
            return { explored, result: [start] };
        }

        const startKey = this.CoordinateToString(start);
        distances.set(startKey, 0);
        // Don't add start to parentMap - it has no parent
        // Only add nodes to parentMap when they're discovered from another node
        const unvisited: Coordinate[] = [start];

        return this.ExecuteDijkstra(
            unvisited,
            distances,
            explored,
            parentMap,
            end,
            __matrix
        );
    }

   /**
     * Executes main Dijkstra loop.
     *
     * @param unvisited - Unvisited nodes
     * @param distances - Distance map
     * @param explored - Explored nodes
     * @param parentMap - Parent map
     * @param end - End coordinate
     * @param matrix - Grid matrix
     * @returns Search result
     */
    private ExecuteDijkstra(
        unvisited: Coordinate[],
        distances: DistanceMap,
        explored: Coordinate[],
        parentMap: ParentMap,
        end: Coordinate,
        matrix: number[][]
    ): { explored: Coordinate[]; result: Coordinate[] } 
    {
        while (unvisited.length > 0) 
        {
            const current = this.GetLowestCostNode(unvisited, distances);
            if (current === null) 
            {
                break;
            }

            this.RemoveFromUnvisited(current, unvisited);

            if (this.IsSameCoordinate(current, end)) 
            {
                explored.push(current);
                const result = this.ReconstructPath(parentMap, end);
                return { explored, result };
            }

            explored.push(current);
            this.ProcessNeighbors(current, distances, parentMap, unvisited, explored, matrix);
        }

        return { explored, result: [] };
    }

    /**
     * Removes coordinate from unvisited array.
     *
     * @param target - Target coordinate
     * @param unvisited - Unvisited array
     */
    private RemoveFromUnvisited(
        target: Coordinate,
        unvisited: Coordinate[]
    ): void 
{
        const index = this.FindCoordinateIndex(target, unvisited);
        if (index !== -1) 
{
            unvisited.splice(index, 1);
        }
    }

    /**
     * Processes neighbors of current node.
     *
     * @param current - Current coordinate
     * @param distances - Distance map
     * @param parentMap - Parent map
     * @param unvisited - Unvisited array
     * @param explored - Explored nodes
     * @param matrix - Grid matrix
     */
    private ProcessNeighbors(
        current: Coordinate,
        distances: DistanceMap,
        parentMap: ParentMap,
        unvisited: Coordinate[],
        explored: Coordinate[],
        matrix: number[][]
    ): void 
    {
        const currentKey = this.CoordinateToString(current);
        const currentDist = distances.get(currentKey) ?? 0;
        const neighbors = this.GetValidNeighbors(current, matrix);

        for (const neighbor of neighbors) 
        {
            // Check if neighbor is already explored to prevent infinite loops
            const alreadyExplored = explored.some(
                coord => coord[0] === neighbor[0] && coord[1] === neighbor[1]
            );
            if (alreadyExplored) 
            {
                continue;
            }
            this.UpdateNeighbor(
                neighbor,
                current,
                currentDist,
                distances,
                parentMap,
                unvisited
            );
        }
    }

    /**
     * Updates neighbor distance if shorter path found.
     *
     * @param neighbor - Neighbor coordinate
     * @param current - Current coordinate
     * @param currentDist - Current distance
     * @param distances - Distance map
     * @param parentMap - Parent map
     * @param unvisited - Unvisited array
     */
    private UpdateNeighbor(
        neighbor: Coordinate,
        current: Coordinate,
        currentDist: number,
        distances: DistanceMap,
        parentMap: ParentMap,
        unvisited: Coordinate[]
    ): void 
{
        const neighborKey = this.CoordinateToString(neighbor);
        const newDist = currentDist + 1;
        const existingDist = distances.get(neighborKey);

        if (existingDist === undefined || newDist < existingDist) 
{
            distances.set(neighborKey, newDist);
            parentMap.set(neighborKey, current);
            if (!this.IsInUnvisited(neighbor, unvisited)) 
{
                unvisited.push(neighbor);
            }
        }
    }

    /**
     * Checks if coordinates are equal.
     *
     * @param a - First coordinate
     * @param b - Second coordinate
     * @returns True if equal
     */
    private IsSameCoordinate(a: Coordinate, b: Coordinate): boolean 
{
        return a[0] === b[0] && a[1] === b[1];
    }

   /**
     * Checks if coordinates are within bounds.
     *
     * @param x - X coordinate
     * @param y - Y coordinate
     * @param matrix - Grid matrix
     * @returns True if within bounds
     */
    private IsWithinBounds(x: number, y: number, matrix: number[][]): boolean 
    {
        return x >= 0 && x < matrix[0].length && y >= 0 && y < matrix.length;
    }

    /**
     * Converts coordinate to string.
     *
     * @param coord - Coordinate
     * @returns String key
     */
    private CoordinateToString(coord: Coordinate): string 
{
        return `${coord[0]},${coord[1]}`;
    }

   /**
     * Gets valid neighbors.
     *
     * @param coord - Current coordinate
     * @param matrix - Grid matrix
     * @returns Valid neighbors
     */
    private GetValidNeighbors(
        coord: Coordinate,
        matrix: number[][]
    ): Coordinate[] 
    {
        const [x, y] = coord;
        const neighbors: Coordinate[] = [];
        const directions: [number, number][] = [
            [0, -1],
            [0, 1],
            [-1, 0],
            [1, 0],
        ];

        for (const [dx, dy] of directions) 
        {
            const newX = x + dx;
            const newY = y + dy;
            if (!this.IsWithinBounds(newX, newY, matrix)) 
            {
                continue;
            }
            if (matrix[newY][newX] !== 0) 
            {
                continue;
            }
            neighbors.push([newX, newY]);
        }

        return neighbors;
    }

    /**
     * Gets node with lowest distance.
     *
     * @param unvisited - Unvisited nodes
     * @param distances - Distance map
     * @returns Node with lowest cost or null
     */
    private GetLowestCostNode(
        unvisited: Coordinate[],
        distances: DistanceMap
    ): Coordinate | null 
{
        let lowestNode: Coordinate | null = null;
        let lowestDistance = Infinity;

        for (const node of unvisited) 
{
            const nodeKey = this.CoordinateToString(node);
            const distance = distances.get(nodeKey) ?? Infinity;
            if (distance < lowestDistance) 
{
                lowestDistance = distance;
                lowestNode = node;
            }
        }

        return lowestNode;
    }

    /**
     * Finds index of coordinate in array.
     *
     * @param target - Target coordinate
     * @param coords - Array of coordinates
     * @returns Index or -1
     */
    private FindCoordinateIndex(
        target: Coordinate,
        coords: Coordinate[]
    ): number 
{
        return coords.findIndex(
            (c) => c[0] === target[0] && c[1] === target[1]
        );
    }

    /**
     * Checks if coordinate is in array.
     *
     * @param target - Target coordinate
     * @param unvisited - Array to check
     * @returns True if present
     */
    private IsInUnvisited(
        target: Coordinate,
        unvisited: Coordinate[]
    ): boolean 
{
        return unvisited.some((c) => c[0] === target[0] && c[1] === target[1]);
    }

    /**
     * Reconstructs path from parent map.
     *
     * @param parentMap - Parent map
     * @param end - End coordinate
     * @returns Path array
     */
    private ReconstructPath(
        parentMap: ParentMap,
        end: Coordinate
    ): Coordinate[] 
{
        const path: Coordinate[] = [end];
        let current: Coordinate | null = end;

        while (current !== null) 
{
            const currentKey = this.CoordinateToString(current);
            const parent = parentMap.get(currentKey);

            if (parent === undefined) 
{
                break;
            }

            path.unshift(parent);
            current = parent;
        }

        return path;
    }
}
