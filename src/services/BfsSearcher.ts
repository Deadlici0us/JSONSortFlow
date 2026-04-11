import { ISearcher } from './ISearcher';

type Coordinate = [number, number];
type ParentMap = Map<string, Coordinate>;

/**
 * Implements Breadth-First Search algorithm.
 */
export class BfsSearcher implements ISearcher 
{
    /**
     * Performs BFS to find shortest path.
     *
     * @param start - Start coordinate
     * @param end - End coordinate
     * @param matrix - Grid matrix
     * @returns Object with explored and result
     */
    public search(
        start: Coordinate,
        end: Coordinate,
        matrix: number[][]
    ): { explored: Coordinate[]; result: Coordinate[] } 
    {
        // Validate matrix
        if (!this.IsValidMatrix(matrix)) 
        {
            return { explored: [], result: [] };
        }

        // Validate coordinates are within bounds
        if (!this.IsWithinBounds(start[0], start[1], matrix) || 
            !this.IsWithinBounds(end[0], end[1], matrix)) 
        {
            return { explored: [], result: [] };
        }

        const explored: Coordinate[] = [];
        const parentMap: ParentMap = new Map();

        if (this.IsSameCoordinate(start, end)) 
        {
            explored.push(start);
            return { explored, result: [start] };
        }

        const queue: Coordinate[] = [start];
        explored.push(start);
        // Don't add start to parentMap - it has no parent
        // Only add nodes to parentMap when they're discovered from another node

        return this.ExecuteBfs(queue, explored, parentMap, end, matrix);
    }

    /**
     * Executes main BFS loop.
     *
     * @param queue - Queue of coordinates
     * @param explored - Explored coordinates
     * @param parentMap - Parent map
     * @param end - End coordinate
     * @param matrix - Grid matrix
     * @returns Search result
     */
    private ExecuteBfs(
        queue: Coordinate[],
        explored: Coordinate[],
        parentMap: ParentMap,
        end: Coordinate,
        matrix: number[][]
    ): { explored: Coordinate[]; result: Coordinate[] } 
    {
        const maxNodes = matrix.length * matrix[0].length;
        const maxIterations = maxNodes * 2 + 100; // Safety limit
        let iteration = 0;
        
        while (queue.length > 0) 
        {
            iteration++;
            
            // Prevent infinite loops
            if (iteration > maxIterations) 
            {
                return { explored, result: [] };
            }
            
            const current = queue.shift()!;

            if (this.IsSameCoordinate(current, end)) 
            {
                const result = this.ReconstructPath(parentMap, end);
                return { explored, result };
            }

            this.ProcessNeighbors(current, parentMap, queue, explored, matrix);
        }

        return { explored, result: [] };
    }

    /**
     * Processes neighbors of current coordinate.
     *
     * @param current - Current coordinate
     * @param parentMap - Parent map
     * @param queue - Queue
     * @param explored - Explored coordinates
     * @param matrix - Grid matrix
     */
    private ProcessNeighbors(
        current: Coordinate,
        parentMap: ParentMap,
        queue: Coordinate[],
        explored: Coordinate[],
        matrix: number[][]
    ): void 
    {
        const neighbors = this.GetValidNeighbors(current, matrix);
        for (const neighbor of neighbors) 
        {
            const neighborKey = this.CoordinateToString(neighbor);

            // Check if already explored (more reliable than parentMap check)
            const alreadyExplored = explored.some(
                coord => coord[0] === neighbor[0] && coord[1] === neighbor[1]
            );

            if (!alreadyExplored) 
            {
                parentMap.set(neighborKey, current);
                queue.push(neighbor);
                explored.push(neighbor);
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
     * Checks if within bounds.
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
     * Validates matrix structure and size.
     * 
     * @param matrix - Grid matrix to validate
     * @returns True if valid
     */
    private IsValidMatrix(matrix: number[][]): boolean 
    {
        // Check if matrix is empty
        if (!matrix || matrix.length === 0) 
        {
            return false;
        }

        const numRows = matrix.length;
        const numCols = matrix[0]?.length || 0;

        // Check if matrix has at least 1x1 size
        if (numRows < 1 || numCols < 1) 
        {
            return false;
        }

        // Validate max matrix size (32x32 as per test requirements)
        const MAX_MATRIX_SIZE = 32;
        if (numRows > MAX_MATRIX_SIZE || numCols > MAX_MATRIX_SIZE) 
        {
            return false;
        }

        // Check all rows have same length and contain only 0 or 1
        for (let i = 0; i < numRows; i++) 
        {
            const row = matrix[i];
            
            // Check row exists and has correct length
            if (!row || row.length !== numCols) 
            {
                return false;
            }

            // Check all values are 0 or 1
            for (let j = 0; j < numCols; j++) 
            {
                if (row[j] !== 0 && row[j] !== 1) 
                {
                    return false;
                }
            }
        }

        return true;
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
