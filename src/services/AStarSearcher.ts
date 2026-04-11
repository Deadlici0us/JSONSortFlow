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

/**
 * Implements A* pathfinding algorithm.
 */
export class AStarSearcher implements ISearcher 
{
    /**
     * Performs A* search to find shortest path.
     *
     * @param start - Start coordinate
     * @param end - End coordinate
     * @param matrix - Grid matrix
     * @returns Object with explored coordinates and result path
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

        const openSet: OpenSet = new Map();
        const closedSet: ClosedSet = new Set();
        this.InitializeOpenSet(openSet, start, end);

        return this.ExecuteSearch(
            openSet,
            closedSet,
            explored,
            parentMap,
            end,
            matrix
        );
    }

    /**
     * Initializes open set with start node.
     *
     * @param openSet - Open set map
     * @param start - Start coordinate
     * @param end - End coordinate
     */
    private InitializeOpenSet(
        openSet: OpenSet,
        start: Coordinate,
        end: Coordinate
    ): void 
{
        const startNode: Node = {
            coord: start,
            g: 0,
            h: this.ManhattanDistance(start, end),
            f: this.ManhattanDistance(start, end),
            parent: null,
        };
        openSet.set(this.CoordinateToString(start), startNode);
    }

    /**
     * Executes main search loop.
     *
     * @param openSet - Open set
     * @param closedSet - Closed set
     * @param explored - Explored coordinates
     * @param parentMap - Parent map
     * @param end - End coordinate
     * @param matrix - Grid matrix
     * @returns Search result
     */
    private ExecuteSearch(
        openSet: OpenSet,
        closedSet: ClosedSet,
        explored: Coordinate[],
        parentMap: ParentMap,
        end: Coordinate,
        matrix: number[][]
    ): { explored: Coordinate[]; result: Coordinate[] } 
{
        while (openSet.size > 0) 
{
            const current = this.GetLowestFOpenNode(openSet);
            const currentKey = this.CoordinateToString(current.coord);

            openSet.delete(currentKey);
            closedSet.add(currentKey);
            explored.push(current.coord);

            if (this.IsSameCoordinate(current.coord, end)) 
{
                const result = this.ReconstructPath(parentMap, end);
                return { explored, result };
            }

            this.ProcessNeighbors(
                current,
                openSet,
                closedSet,
                parentMap,
                end,
                matrix
            );
        }

        return { explored, result: [] };
    }

    /**
     * Processes neighbors of current node.
     *
     * @param current - Current node
     * @param openSet - Open set
     * @param closedSet - Closed set
     * @param parentMap - Parent map
     * @param end - End coordinate
     * @param matrix - Grid matrix
     */
    private ProcessNeighbors(
        current: Node,
        openSet: OpenSet,
        closedSet: ClosedSet,
        parentMap: ParentMap,
        end: Coordinate,
        matrix: number[][]
    ): void 
{
        const neighbors = this.GetValidNeighbors(current.coord, matrix);
        for (const neighbor of neighbors) 
{
            const neighborKey = this.CoordinateToString(neighbor);

            if (closedSet.has(neighborKey)) 
{
                continue;
            }

            const tentativeG = current.g + 1;
            const neighborNode = openSet.get(neighborKey);

            this.UpdateOrAddNode(
                neighbor,
                neighborKey,
                tentativeG,
                neighborNode,
                current,
                openSet,
                parentMap,
                end
            );
        }
    }

    /**
     * Updates existing node or adds new one.
     *
     * @param neighbor - Neighbor coordinate
     * @param neighborKey - Neighbor key
     * @param tentativeG - Tentative G score
     * @param neighborNode - Existing node or undefined
     * @param current - Current node
     * @param openSet - Open set
     * @param parentMap - Parent map
     * @param end - End coordinate
     */
    private UpdateOrAddNode(
        neighbor: Coordinate,
        neighborKey: string,
        tentativeG: number,
        neighborNode: Node | undefined,
        current: Node,
        openSet: OpenSet,
        parentMap: ParentMap,
        end: Coordinate
    ): void 
{
        if (!neighborNode) 
{
            this.AddNewNode(
                neighbor,
                neighborKey,
                tentativeG,
                current,
                openSet,
                parentMap,
                end
            );
        }
 else if (tentativeG < neighborNode.g) 
{
            this.UpdateExistingNode(
                neighborNode,
                tentativeG,
                current,
                neighborKey,
                parentMap
            );
        }
    }

    /**
     * Adds new node to open set.
     *
     * @param neighbor - Neighbor coordinate
     * @param neighborKey - Neighbor key
     * @param tentativeG - Tentative G score
     * @param current - Current node
     * @param openSet - Open set
     * @param parentMap - Parent map
     * @param end - End coordinate
     */
    private AddNewNode(
        neighbor: Coordinate,
        neighborKey: string,
        tentativeG: number,
        current: Node,
        openSet: OpenSet,
        parentMap: ParentMap,
        end: Coordinate
    ): void 
{
        const newNode: Node = {
            coord: neighbor,
            g: tentativeG,
            h: this.ManhattanDistance(neighbor, end),
            f: tentativeG + this.ManhattanDistance(neighbor, end),
            parent: current.coord,
        };
        openSet.set(neighborKey, newNode);
        parentMap.set(neighborKey, current.coord);
    }

    /**
     * Updates existing node with better path.
     *
     * @param neighborNode - Node to update
     * @param tentativeG - New G score
     * @param current - Current node
     * @param neighborKey - Neighbor key
     * @param parentMap - Parent map
     */
    private UpdateExistingNode(
        neighborNode: Node,
        tentativeG: number,
        current: Node,
        neighborKey: string,
        parentMap: ParentMap
    ): void 
{
        neighborNode.g = tentativeG;
        neighborNode.f = tentativeG + neighborNode.h;
        neighborNode.parent = current.coord;
        parentMap.set(neighborKey, current.coord);
    }

    /**
     * Checks if two coordinates are equal.
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
     * Converts coordinate to string key.
     *
     * @param coord - Coordinate to convert
     * @returns String key
     */
    private CoordinateToString(coord: Coordinate): string 
{
        return `${coord[0]},${coord[1]}`;
    }

    /**
     * Calculates Manhattan distance.
     *
     * @param a - First coordinate
     * @param b - Second coordinate
     * @returns Distance
     */
    private ManhattanDistance(a: Coordinate, b: Coordinate): number 
{
        return Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]);
    }

    /**
     * Gets node with lowest F score.
     *
     * @param openSet - Open set
     * @returns Node with lowest F
     */
    private GetLowestFOpenNode(openSet: OpenSet): Node 
{
        const nodes = Array.from(openSet.values());
        const lowest = nodes.reduce(
            (acc, node) => (!acc || node.f < acc.f ? node : acc),
            null as Node | null
        );
        return lowest!;
    }

    /**
     * Gets valid neighboring coordinates.
     *
     * @param coord - Current coordinate
     * @param matrix - Grid matrix
     * @returns Array of valid neighbors
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
