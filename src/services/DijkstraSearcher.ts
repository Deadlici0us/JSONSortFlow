import { ISearcher } from './ISearcher';

type Coordinate = [number, number];
type ParentMap = Map<string, Coordinate>;
type DistanceMap = Map<string, number>;

export class DijkstraSearcher implements ISearcher {
    /**
     * Performs Dijkstra's algorithm to find the shortest path
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
        const distances: DistanceMap = new Map();

        const earlyReturn = this.CheckStartEqualsEnd(start, end, explored);
        if (earlyReturn) {
            return earlyReturn;
        }

        const startKey = this.CoordinateToString(start);
        distances.set(startKey, 0);
        parentMap.set(startKey, start);

        const unvisited: Coordinate[] = [start];

        while (true) {
            const selection = this.GetNextTargetNode(unvisited, distances);

            if (selection === null) {
                break;
            }

            const currentIndex = this.FindCoordinateIndex(selection, unvisited);
            unvisited.splice(currentIndex, 1);

            const termination = this.CheckTermination(
                selection,
                end,
                explored,
                parentMap,
                start
            );

            if (termination) {
                return termination;
            }

            explored.push(selection);

            this.ProcessNeighbors(
                selection,
                matrix,
                distances,
                parentMap,
                unvisited
            );
        }

        return { explored, result: [] };
    }

    /**
     * Selects the next target node for processing.
     * Returns the lowest cost unvisited node or null if no unvisited nodes remain.
     */
    private GetNextTargetNode(
        unvisited: Coordinate[],
        distances: DistanceMap
    ): Coordinate | null {
        if (!this.HasUnvisitedNodes(unvisited)) {
            return null;
        }

        const node = this.GetLowestCostNode(unvisited, distances);

        if (this.ShouldBreakOnNull(node)) {
            return null;
        }

        return node;
    }

    /**
     * Checks termination conditions and returns result if target reached.
     * Returns result object if at end, null otherwise.
     */
    private CheckTermination(
        current: Coordinate,
        end: Coordinate,
        explored: Coordinate[],
        parentMap: ParentMap,
        start: Coordinate
    ): { explored: Coordinate[]; result: Coordinate[] } | null {
        return this.CheckAndReturnIfAtEnd(
            current,
            end,
            explored,
            parentMap,
            start
        );
    }

    /**
     * Checks if two coordinates are the same position.
     */
    private IsSameCoordinate(a: Coordinate, b: Coordinate): boolean {
        return a[0] === b[0] && a[1] === b[1];
    }

    /**
     * Checks if there are unvisited nodes remaining.
     */
    private HasUnvisitedNodes(unvisited: Coordinate[]): boolean {
        return unvisited.length > 0;
    }

    /**
     * Checks if start equals end and handles early return.
     */
    private CheckStartEqualsEnd(
        start: Coordinate,
        end: Coordinate,
        explored: Coordinate[]
    ): { explored: Coordinate[]; result: Coordinate[] } | null {
        if (this.IsSameCoordinate(start, end)) {
            explored.push(start);
            return { explored, result: [start] };
        }
        return null;
    }

    /**
     * Checks if we should break on null current node.
     */
    private ShouldBreakOnNull(current: Coordinate | null): boolean {
        return current === null;
    }

    /**
     * Checks if current is at end and returns result if so.
     */
    private CheckAndReturnIfAtEnd(
        current: Coordinate,
        end: Coordinate,
        explored: Coordinate[],
        parentMap: ParentMap,
        start: Coordinate
    ): { explored: Coordinate[]; result: Coordinate[] } | null {
        if (this.IsSameCoordinate(current, end)) {
            explored.push(current);
            const result = this.ReconstructPath(parentMap, start, end);
            return { explored, result };
        }
        return null;
    }

    /**
     * Converts coordinate tuple to string key for Map storage.
     */
    private CoordinateToString(coord: Coordinate): string {
        return `${coord[0]},${coord[1]}`;
    }

    /**
     * Retrieves all valid neighboring coordinates (N, S, E, W).
     * Returns only unblocked, in-bounds neighbors.
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

    /**
     * Gets the node with the lowest distance from unvisited nodes.
     */
    private GetLowestCostNode(
        unvisited: Coordinate[],
        distances: DistanceMap
    ): Coordinate | null {
        if (unvisited.length === 0) {
            return null;
        }

        let lowestNode: Coordinate | null = null;
        let lowestDistance = Infinity;

        for (const node of unvisited) {
            const nodeKey = this.CoordinateToString(node);
            const distance = distances.get(nodeKey) ?? Infinity;

            if (distance < lowestDistance) {
                lowestDistance = distance;
                lowestNode = node;
            }
        }

        return lowestNode;
    }

    /**
     * Finds the index of a coordinate in an array.
     */
    private FindCoordinateIndex(
        target: Coordinate,
        coords: Coordinate[]
    ): number {
        return coords.findIndex(
            (c) => c[0] === target[0] && c[1] === target[1]
        );
    }

    /**
     * Determines if neighbor distance should be updated.
     */
    private ShouldUpdateDistance(
        neighborKey: string,
        newDist: number,
        distances: DistanceMap
    ): boolean {
        return (
            !distances.has(neighborKey) || newDist < distances.get(neighborKey)!
        );
    }

    /**
     * Checks if a coordinate exists in the unvisited array.
     */
    private IsInUnvisited(
        target: Coordinate,
        unvisited: Coordinate[]
    ): boolean {
        return unvisited.some((c) => c[0] === target[0] && c[1] === target[1]);
    }

    /**
     * Processes all valid neighbors of the current coordinate.
     * Updates distances, parent map, and unvisited array by reference.
     */
    private ProcessNeighbors(
        current: Coordinate,
        matrix: number[][],
        distances: DistanceMap,
        parentMap: ParentMap,
        unvisited: Coordinate[]
    ): void {
        const neighbors = this.GetValidNeighbors(current, matrix);
        const currentKey = this.CoordinateToString(current);
        const currentDist = distances.get(currentKey)!;

        for (const neighbor of neighbors) {
            const neighborKey = this.CoordinateToString(neighbor);
            const newDist = currentDist + 1;

            if (this.ShouldUpdateDistance(neighborKey, newDist, distances)) {
                distances.set(neighborKey, newDist);
                parentMap.set(neighborKey, current);

                if (!this.IsInUnvisited(neighbor, unvisited)) {
                    unvisited.push(neighbor);
                }
            }
        }
    }
}
