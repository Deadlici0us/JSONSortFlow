/**
 * AbstractGridSearcher provides shared grid traversal utilities
 * for all concrete pathfinding algorithm implementations.
 *
 * @abstract
 * @class AbstractGridSearcher
 * @since 1.0.0
 */
export abstract class AbstractGridSearcher 
{
    /**
     * Checks if two coordinates represent the same position.
     *
     * @param a - First coordinate [x, y]
     * @param b - Second coordinate [x, y]
     * @returns True if coordinates are identical
     */
    protected IsSameCoordinate(
        a: [number, number],
        b: [number, number]
    ): boolean 
{
        return a[0] === b[0] && a[1] === b[1];
    }

    /**
     * Converts coordinate tuple to string key for Map/Set storage.
     *
     * @param coord - Coordinate [x, y]
     * @returns String representation "x,y"
     */
    protected CoordinateToString(coord: [number, number]): string 
{
        return `${coord[0]},${coord[1]}`;
    }

    /**
     * Validates that coordinates are within matrix boundaries.
     *
     * @param x - X coordinate
     * @param y - Y coordinate
     * @param matrix - 2D grid matrix
     * @returns True if within bounds
     */
    protected IsWithinBounds(
        x: number,
        y: number,
        matrix: number[][]
    ): boolean 
{
        return x >= 0 && x < matrix[0].length && y >= 0 && y < matrix.length;
    }

    /**
     * Retrieves all valid neighboring coordinates (N, S, E, W).
     * Filters out obstacles (1) and enforces edge boundaries.
     *
     * @param coord - Current coordinate [x, y]
     * @param matrix - 2D grid matrix where 0 = free, 1 = obstacle
     * @param visited - Optional set of already visited coordinates
     * @returns Array of valid neighbor coordinates
     */
    protected GetValidNeighbors(
        coord: [number, number],
        matrix: number[][],
        visited?: Set<string>
    ): [number, number][] 
{
        const [x, y] = coord;
        const neighbors: [number, number][] = [];
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
            const isValid = this.CheckNeighborValidity(
                newX,
                newY,
                matrix,
                visited
            );

            if (isValid) 
{
                neighbors.push([newX, newY]);
            }
        }

        return neighbors;
    }

    /**
     * Validates a single neighbor coordinate.
     *
     * @param x - X coordinate to check
     * @param y - Y coordinate to check
     * @param matrix - 2D grid matrix
     * @param visited - Optional visited set
     * @returns True if valid and unblocked
     */
    private CheckNeighborValidity(
        x: number,
        y: number,
        matrix: number[][],
        visited?: Set<string>
    ): boolean 
{
        if (!this.IsWithinBounds(x, y, matrix)) 
{
            return false;
        }

        if (matrix[y][x] !== 0) 
{
            return false;
        }

        return !this.IsCoordinateVisited(x, y, visited);
    }

    /**
     * Checks if coordinate exists in visited set.
     *
     * @param x - X coordinate
     * @param y - Y coordinate
     * @param visited - Optional visited set
     * @returns True if visited
     */
    private IsCoordinateVisited(
        x: number,
        y: number,
        visited?: Set<string>
    ): boolean 
{
        if (visited === undefined) 
{
            return false;
        }

        const key = `${x},${y}`;
        return visited.has(key);
    }

    /**
     * Reconstructs the path from start to end using parent map.
     * Safely terminates if parent reference is missing to prevent infinite loops.
     * Returns empty array if path cannot be reconstructed from start.
     *
     * @param parentMap - Map of coordinates to their parent coordinates
     * @param start - Starting coordinate [x, y]
     * @param end - Ending coordinate [x, y]
     * @returns Ordered array of coordinates representing the path, or empty if unreachable
     */
    protected ReconstructPath(
        parentMap: Map<string, [number, number]>,
        start: [number, number],
        end: [number, number]
    ): [number, number][] 
{
        const path: [number, number][] = [];
        let current: [number, number] | undefined = end;

        while (current !== undefined) 
{
            path.unshift(current);
            const parent = this.GetParentIfValid(
                current,
                parentMap,
                start,
                path
            );

            if (parent === null) 
{
                break;
            }

            current = parent;
        }

        if (!this.IsPathValid(path, start)) 
{
            return [];
        }

        return path;
    }

    /**
     * Validates that path starts with the expected start coordinate.
     *
     * @param path - Path to validate
     * @param start - Expected start coordinate
     * @returns True if path is valid (starts with start or is empty)
     */
    protected IsPathValid(
        path: [number, number][],
        start: [number, number]
    ): boolean 
{
        if (path.length === 0) 
{
            return false;
        }

        return this.IsSameCoordinate(path[0], start);
    }

    /**
     * Retrieves parent coordinate if path reconstruction is valid.
     *
     * @param current - Current coordinate
     * @param parentMap - Parent map
     * @param start - Start coordinate
     * @param path - Current path being reconstructed
     * @returns Parent coordinate, or null if termination condition met
     */
    private GetParentIfValid(
        current: [number, number],
        parentMap: Map<string, [number, number]>,
        start: [number, number],
        path: [number, number][]
    ): [number, number] | null 
{
        const currentKey = this.CoordinateToString(current);
        const parent = parentMap.get(currentKey);

        if (parent === undefined) 
{
            return null;
        }

        if (this.IsSameCoordinate(parent, start)) 
{
            if (this.NeedsStartPrepending(path, start)) 
{
                path.unshift(start);
            }
            return null;
        }

        return parent;
    }

    /**
     * Checks if path needs start coordinate prepended.
     *
     * @param path - Current path array
     * @param start - Start coordinate
     * @returns True if start should be prepended
     */
    protected NeedsStartPrepending(
        path: [number, number][],
        start: [number, number]
    ): boolean 
{
        if (path.length === 0) 
{
            return false;
        }

        return !this.IsSameCoordinate(path[0], start);
    }
}
