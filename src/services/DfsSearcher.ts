import { ISearcher } from './ISearcher';

type Coordinate = [number, number];
type ParentMap = Map<string, Coordinate>;

export class DfsSearcher implements ISearcher {
    /**
     * Performs Depth-First Search to find a path
     * from start to end coordinates in a grid matrix.
     *
     * @param start - Starting coordinate [x, y]
     * @param end - Ending coordinate [x, y]
     * @param matrix - 2D grid where 0 = free, 1 = obstacle
     * @returns Object with explored nodes and result path
     */
    public search(
        start: Coordinate,
        end: Coordinate,
        matrix: number[][]
    ): { explored: Coordinate[]; result: Coordinate[] } {
        const explored: Coordinate[] = [];
        const parentMap: ParentMap = new Map();

        if (this.IsSameCoordinate(start, end)) {
            explored.push(start);
            return { explored, result: [start] };
        }

        const stack: Coordinate[] = [start];
        explored.push(start);
        parentMap.set(this.CoordinateToString(start), start);

        while (stack.length > 0) {
            const current = stack.pop()!;

            if (this.IsSameCoordinate(current, end)) {
                const result = this.ReconstructPath(parentMap, start, end);
                return { explored, result };
            }

            const neighbors = this.GetValidNeighbors(
                current,
                matrix,
                parentMap
            );

            for (const neighbor of neighbors) {
                const neighborKey = this.CoordinateToString(neighbor);

                if (!parentMap.has(neighborKey)) {
                    parentMap.set(neighborKey, current);
                    stack.push(neighbor);
                    explored.push(neighbor);
                }
            }
        }

        return { explored, result: [] };
    }

    /**
     * Checks if two coordinates are the same position.
     */
    private IsSameCoordinate(a: Coordinate, b: Coordinate): boolean {
        return a[0] === b[0] && a[1] === b[1];
    }

    /**
     * Converts coordinate tuple to string key for Map storage.
     */
    private CoordinateToString(coord: Coordinate): string {
        return `${coord[0]},${coord[1]}`;
    }

    /**
     * Retrieves all valid neighboring coordinates (N, S, E, W).
     * Returns only unblocked, in-bounds, and unvisited neighbors.
     */
    private GetValidNeighbors(
        coord: Coordinate,
        matrix: number[][],
        parentMap: ParentMap
    ): Coordinate[] {
        const [x, y] = coord;
        const neighbors: Coordinate[] = [];
        const directions: [number, number][] = [
            [0, -1],
            [0, 1],
            [-1, 0],
            [1, 0],
        ];

        for (const [dx, dy] of directions) {
            const newX = x + dx;
            const newY = y + dy;

            if (this.IsWithinBounds(newX, newY, matrix)) {
                if (matrix[newY][newX] === 0) {
                    const neighborKey = `${newX},${newY}`;
                    if (!parentMap.has(neighborKey)) {
                        neighbors.push([newX, newY]);
                    }
                }
            }
        }

        return neighbors;
    }

    /**
     * Validates that coordinates are within matrix boundaries.
     */
    private IsWithinBounds(x: number, y: number, matrix: number[][]): boolean {
        return x >= 0 && x < matrix[0].length && y >= 0 && y < matrix.length;
    }

    /**
     * Reconstructs the path from start to end using parent map.
     */
    private ReconstructPath(
        parentMap: ParentMap,
        start: Coordinate,
        end: Coordinate
    ): Coordinate[] {
        const path: Coordinate[] = [];
        let current: Coordinate | null = end;

        while (current !== null) {
            path.unshift(current);
            const currentKey = this.CoordinateToString(current);
            const parent = parentMap.get(currentKey);

            if (parent === start || !parent) {
                if (parent === start) {
                    path.unshift(start);
                }
                break;
            }

            current = parent;
        }

        return path;
    }
}
