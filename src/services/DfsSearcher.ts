import { ISearcher } from './ISearcher';

type Coordinate = [number, number];
type ParentMap = Map<string, Coordinate>;

/**
 * Implements Depth-First Search algorithm.
 */
export class DfsSearcher implements ISearcher 
{
    /**
     * Performs DFS to find a path.
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
        const explored: Coordinate[] = [];
        const parentMap: ParentMap = new Map();

        if (this.IsSameCoordinate(start, end)) 
{
            explored.push(start);
            return { explored, result: [start] };
        }

        const stack: Coordinate[] = [start];
        explored.push(start);
        // Don't add start to parentMap - it has no parent
        // Only add nodes to parentMap when they're discovered from another node

        return this.ExecuteDfs(stack, explored, parentMap, end, matrix);
    }

    /**
     * Executes main DFS loop.
     *
     * @param stack - Stack of coordinates
     * @param explored - Explored coordinates
     * @param parentMap - Parent map
     * @param end - End coordinate
     * @param matrix - Grid matrix
     * @returns Search result
     */
    private ExecuteDfs(
        stack: Coordinate[],
        explored: Coordinate[],
        parentMap: ParentMap,
        end: Coordinate,
        matrix: number[][]
    ): { explored: Coordinate[]; result: Coordinate[] } 
{
        while (stack.length > 0) 
{
            const current = stack.pop()!;

            if (this.IsSameCoordinate(current, end)) 
{
                const result = this.ReconstructPath(parentMap, end);
                return { explored, result };
            }

            this.ProcessNeighbors(current, parentMap, stack, explored, matrix);
        }

        return { explored, result: [] };
    }

    /**
     * Processes neighbors of current coordinate.
     *
     * @param current - Current coordinate
     * @param parentMap - Parent map
     * @param stack - Stack
     * @param explored - Explored coordinates
     * @param matrix - Grid matrix
     */
  private ProcessNeighbors(
        current: Coordinate,
        parentMap: ParentMap,
        stack: Coordinate[],
        explored: Coordinate[],
        matrix: number[][]
    ): void 
    {
        const neighbors = this.GetValidNeighbors(current, matrix, parentMap);
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
                stack.push(neighbor);
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
     * @param parentMap - Parent map
     * @returns Valid neighbors
     */
    private GetValidNeighbors(
        coord: Coordinate,
        matrix: number[][],
        parentMap: ParentMap
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
            if (this.IsDirectionValid(x, y, dx, dy, matrix, parentMap)) 
{
                neighbors.push([x + dx, y + dy]);
            }
        }

        return neighbors;
    }

    /**
     * Checks if direction is valid.
     *
     * @param x - X coordinate
     * @param y - Y coordinate
     * @param dx - Delta X
     * @param dy - Delta Y
     * @param matrix - Grid matrix
     * @param parentMap - Parent map
     * @returns True if valid
     */
    private IsDirectionValid(
        x: number,
        y: number,
        dx: number,
        dy: number,
        matrix: number[][],
        parentMap: ParentMap
    ): boolean 
{
        const newX = x + dx;
        const newY = y + dy;
        if (!this.IsWithinBounds(newX, newY, matrix)) 
{
            return false;
        }
        if (!this.IsWalkable(newX, newY, matrix)) 
{
            return false;
        }
        return !this.IsAlreadyVisited(newX, newY, parentMap);
    }

    /**
     * Checks if cell is walkable.
     *
     * @param x - X coordinate
     * @param y - Y coordinate
     * @param matrix - Grid matrix
     * @returns True if walkable
     */
    private IsWalkable(x: number, y: number, matrix: number[][]): boolean 
{
        return matrix[y][x] === 0;
    }

    /**
     * Checks if cell already visited.
     *
     * @param x - X coordinate
     * @param y - Y coordinate
     * @param parentMap - Parent map
     * @returns True if visited
     */
    private IsAlreadyVisited(
        x: number,
        y: number,
        parentMap: ParentMap
    ): boolean 
{
        return parentMap.has(`${x},${y}`);
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
