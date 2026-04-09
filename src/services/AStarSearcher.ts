import { ISearcher } from './ISearcher';

type Coordinate = [number, number];
type Node = {
    coord: Coordinate;
    g: number;
    h: number;
    f: number;
    parent: Coordinate | null;
};
type OpenSet = Map<string, Node>;
type ClosedSet = Set<string>;
type ParentMap = Map<string, Coordinate>;

export class AStarSearcher implements ISearcher {
    /**
     * Performs A* Search to find the shortest path using Manhattan distance.
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

        const openSet: OpenSet = new Map();
        const closedSet: ClosedSet = new Set();

        const startNode: Node = {
            coord: start,
            g: 0,
            h: this.ManhattanDistance(start, end),
            f: this.ManhattanDistance(start, end),
            parent: null,
        };

        openSet.set(this.CoordinateToString(start), startNode);

        while (openSet.size > 0) {
            const current = this.GetLowestFOpenNode(openSet);
            const currentKey = this.CoordinateToString(current.coord);

            openSet.delete(currentKey);
            closedSet.add(currentKey);
            explored.push(current.coord);

            if (this.IsSameCoordinate(current.coord, end)) {
                const result = this.ReconstructPath(parentMap, start, end);
                return { explored, result };
            }

            const neighbors = this.GetValidNeighbors(current.coord, matrix);

            for (const neighbor of neighbors) {
                const neighborKey = this.CoordinateToString(neighbor);

                if (closedSet.has(neighborKey)) {
                    continue;
                }

                const tentativeG = current.g + 1;
                const neighborNode = openSet.get(neighborKey);

                if (!neighborNode) {
                    const newNode: Node = {
                        coord: neighbor,
                        g: tentativeG,
                        h: this.ManhattanDistance(neighbor, end),
                        f: tentativeG + this.ManhattanDistance(neighbor, end),
                        parent: current.coord,
                    };
                    openSet.set(neighborKey, newNode);
                    parentMap.set(neighborKey, current.coord);
                } else if (tentativeG < neighborNode.g) {
                    neighborNode.g = tentativeG;
                    neighborNode.f = tentativeG + neighborNode.h;
                    neighborNode.parent = current.coord;
                    parentMap.set(neighborKey, current.coord);
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
     * Converts coordinate tuple to string key for Map/Set storage.
     */
    private CoordinateToString(coord: Coordinate): string {
        return `${coord[0]},${coord[1]}`;
    }

    /**
     * Calculates Manhattan distance between two coordinates.
     */
    private ManhattanDistance(a: Coordinate, b: Coordinate): number {
        return Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]);
    }

    /**
     * Retrieves node with lowest f-score from open set.
     */
    private GetLowestFOpenNode(openSet: OpenSet): Node {
        let lowestNode: Node | null = null;

        const nodes = Array.from(openSet.values());
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (node === undefined) continue;
            if (!lowestNode || node.f < lowestNode.f) {
                lowestNode = node;
            }
        }

        return lowestNode!;
    }

    /**
     * Retrieves all valid neighboring coordinates (N, S, E, W).
     */
    private GetValidNeighbors(
        coord: Coordinate,
        matrix: number[][]
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
                    neighbors.push([newX, newY]);
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
     * Reconstructs the path from end back to start using parent map.
     */
    private ReconstructPath(
        parentMap: ParentMap,
        start: Coordinate,
        end: Coordinate
    ): Coordinate[] {
        const path: Coordinate[] = [end];
        let current: Coordinate | null = end;

        while (current !== null) {
            const currentKey = this.CoordinateToString(current);
            const parent = parentMap.get(currentKey);

            if (parent === undefined) {
                if (!this.IsSameCoordinate(path[0], start)) {
                    path.unshift(start);
                }
                break;
            }

            if (this.IsSameCoordinate(parent, start)) {
                path.unshift(start);
                break;
            }

            path.unshift(parent);
            current = parent;
        }

        return path;
    }
}
