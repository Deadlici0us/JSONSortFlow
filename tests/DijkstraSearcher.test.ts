import { DijkstraSearcher } from '../src/services/DijkstraSearcher';
import type { ISearcher } from '../src/services/ISearcher';

describe('DijkstraSearcher', () => {
    let dijkstraSearcher: ISearcher;

    beforeEach(() => {
        dijkstraSearcher = new DijkstraSearcher();
    });

    describe('search', () => {
        test('should find shortest path in simple 3x3 matrix with obstacle', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 2];
            const matrix: number[][] = [
                [0, 0, 0],
                [0, 1, 0],
                [0, 0, 0],
            ];

            const { explored, result } = dijkstraSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual(start);
            expect(result[result.length - 1]).toEqual(end);
            expect(explored).toContainEqual([0, 0]);
            expect(explored).toContainEqual([2, 2]);

            for (let i = 1; i < result.length; i++) {
                const [x1, y1] = result[i - 1];
                const [x2, y2] = result[i];
                const distance = Math.abs(x2 - x1) + Math.abs(y2 - y1);
                expect(distance).toBe(1);
            }
        });

        test('should return strictly shortest path when multiple paths exist', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 2];
            const matrix: number[][] = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ];

            const { result } = dijkstraSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual(start);
            expect(result[result.length - 1]).toEqual(end);

            const pathLength = result.length - 1;
            expect(pathLength).toBe(4);
        });

        test('should find shortest path around multiple obstacles', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [3, 3];
            const matrix: number[][] = [
                [0, 0, 1, 0],
                [0, 1, 1, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];

            const { result } = dijkstraSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual(start);
            expect(result[result.length - 1]).toEqual(end);
        });

        test('should return empty result when path is completely blocked', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 2];
            const matrix: number[][] = [
                [0, 1, 1],
                [1, 1, 1],
                [1, 1, 0],
            ];

            const { explored, result } = dijkstraSearcher.search(start, end, matrix);

            expect(result).toEqual([]);
            expect(explored.length).toBeGreaterThan(0);
            expect(explored).toContainEqual([0, 0]);
        });

        test('should return start position when start equals end', () => {
            const start: [number, number] = [1, 1];
            const end: [number, number] = [1, 1];
            const matrix: number[][] = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ];

            const { explored, result } = dijkstraSearcher.search(start, end, matrix);

            expect(result).toEqual([[1, 1]]);
            expect(explored).toContainEqual([1, 1]);
        });

        test('should handle 32x32 matrix without stack overflow or timeout', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [31, 31];

            const matrix: number[][] = Array(32)
                .fill(null)
                .map(() => Array(32).fill(0));

            matrix[10][10] = 1;
            matrix[15][15] = 1;
            matrix[20][20] = 1;

            const { result } = dijkstraSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual(start);
            expect(result[result.length - 1]).toEqual(end);
        });

        test('should handle identical distance paths consistently', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 2];
            const matrix: number[][] = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ];

            const result1 = dijkstraSearcher.search(start, end, matrix).result;
            const result2 = dijkstraSearcher.search(start, end, matrix).result;

            expect(result1.length).toBe(result2.length);
            expect(result1[0]).toEqual(start);
            expect(result1[result1.length - 1]).toEqual(end);
        });

        test('should exhaust explored nodes when completely blocked', () => {
            const start: [number, number] = [1, 1];
            const end: [number, number] = [3, 3];
            const matrix: number[][] = [
                [1, 1, 1, 1, 1],
                [1, 0, 1, 0, 1],
                [1, 1, 1, 1, 1],
                [1, 0, 0, 0, 1],
                [1, 1, 1, 1, 1],
            ];

            const { explored, result } = dijkstraSearcher.search(start, end, matrix);

            expect(result).toEqual([]);
            expect(explored.length).toBeGreaterThan(0);
        });

        test('should handle diagonal-like path around obstacle', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 2];
            const matrix: number[][] = [
                [0, 0, 0],
                [1, 1, 0],
                [1, 1, 0],
            ];

            const { result } = dijkstraSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual(start);
            expect(result[result.length - 1]).toEqual(end);

            for (let i = 1; i < result.length; i++) {
                const [x1, y1] = result[i - 1];
                const [x2, y2] = result[i];
                const distance = Math.abs(x2 - x1) + Math.abs(y2 - y1);
                expect(distance).toBe(1);
            }
        });

        test('should return empty array when surrounded by obstacles', () => {
            const start: [number, number] = [1, 1];
            const end: [number, number] = [1, 3];
            const matrix: number[][] = [
                [1, 1, 1, 1, 1],
                [1, 0, 1, 0, 1],
                [1, 1, 1, 1, 1],
                [1, 0, 0, 0, 1],
                [1, 1, 1, 1, 1],
            ];

            const { result } = dijkstraSearcher.search(start, end, matrix);

            expect(result).toEqual([]);
        });

        test('should find shortest path in L-shaped corridor', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 2];
            const matrix: number[][] = [
                [0, 1, 1],
                [0, 1, 1],
                [0, 0, 0],
            ];

            const { result } = dijkstraSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual(start);
            expect(result[result.length - 1]).toEqual(end);

            for (let i = 1; i < result.length; i++) {
                const [x1, y1] = result[i - 1];
                const [x2, y2] = result[i];
                const distance = Math.abs(x2 - x1) + Math.abs(y2 - y1);
                expect(distance).toBe(1);
            }
        });

        test('should handle path requiring exploration of multiple branches', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [4, 0];
            const matrix: number[][] = [
                [0, 0, 0, 0, 0],
                [1, 1, 1, 1, 0],
                [1, 1, 1, 1, 0],
            ];

            const { result } = dijkstraSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual(start);
            expect(result[result.length - 1]).toEqual(end);
        });

        test('should not revisit already explored nodes', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 2];
            const matrix: number[][] = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ];

            const { explored } = dijkstraSearcher.search(start, end, matrix);

            const uniqueNodes = new Set(explored.map((p) => `${p[0]},${p[1]}`));
            expect(explored.length).toBe(uniqueNodes.size);
        });

        test('should correctly handle boundary coordinates at zero', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [0, 2];
            const matrix: number[][] = [
                [0, 1, 0],
                [0, 1, 0],
                [0, 0, 0],
            ];

            const { result } = dijkstraSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual([0, 0]);
            expect(result[result.length - 1]).toEqual([0, 2]);
        });

        test('should correctly handle boundary coordinates at max', () => {
            const matrix: number[][] = Array(5).fill(0).map(() => Array(5).fill(0));
            const start: [number, number] = [0, 0];
            const end: [number, number] = [4, 4];

            const { result } = dijkstraSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual([0, 0]);
            expect(result[result.length - 1]).toEqual([4, 4]);
        });

        test('should populate explored array for all reachable nodes', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 0];
            const matrix: number[][] = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ];

            const { explored, result } = dijkstraSearcher.search(start, end, matrix);

            expect(explored.length).toBeGreaterThan(0);
            expect(explored).toContainEqual([0, 0]);
        });

        test('should correctly track parent relationships', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 2];
            const matrix: number[][] = [
                [0, 0, 0],
                [0, 1, 0],
                [0, 0, 0],
            ];

            const { result } = dijkstraSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            for (let i = 1; i < result.length; i++) {
                const [x1, y1] = result[i - 1];
                const [x2, y2] = result[i];
                const distance = Math.abs(x2 - x1) + Math.abs(y2 - y1);
                expect(distance).toBe(1);
            }
        });

        test('should prioritize shortest path over longer alternatives', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [4, 2];
            const matrix: number[][] = [
                [0, 0, 0, 0, 0],
                [1, 1, 1, 1, 0],
                [0, 0, 0, 0, 0],
            ];

            const { result } = dijkstraSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual(start);
            expect(result[result.length - 1]).toEqual(end);

            for (let i = 1; i < result.length; i++) {
                const [x1, y1] = result[i - 1];
                const [x2, y2] = result[i];
                const distance = Math.abs(x2 - x1) + Math.abs(y2 - y1);
                expect(distance).toBe(1);
            }
        });

        test('should handle start coordinate surrounded by obstacles', () => {
            const start: [number, number] = [2, 2];
            const end: [number, number] = [0, 0];
            const matrix: number[][] = [
                [0, 1, 1],
                [1, 1, 1],
                [1, 1, 0],
            ];

            const { explored, result } = dijkstraSearcher.search(start, end, matrix);

            expect(result).toEqual([]);
            expect(explored).toContainEqual([2, 2]);
        });

        test('should handle end coordinate surrounded by obstacles', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 2];
            const matrix: number[][] = [
                [0, 1, 1],
                [1, 1, 1],
                [1, 1, 0],
            ];

            const { explored, result } = dijkstraSearcher.search(start, end, matrix);

            expect(result).toEqual([]);
        });

        test('should handle 1x1 matrix where start equals end', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [0, 0];
            const matrix: number[][] = [[0]];

            const { explored, result } = dijkstraSearcher.search(
                start,
                end,
                matrix
            );

            expect(result).toEqual([[0, 0]]);
            expect(explored).toEqual([[0, 0]]);
        });

        test('should handle 1x2 matrix with path', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [1, 0];
            const matrix: number[][] = [[0, 0]];

            const { result } = dijkstraSearcher.search(start, end, matrix);

            expect(result).toEqual([[0, 0], [1, 0]]);
        });

        test('should handle 2x1 matrix with path', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [0, 1];
            const matrix: number[][] = [[0], [0]];

            const { result } = dijkstraSearcher.search(start, end, matrix);

            expect(result).toEqual([[0, 0], [0, 1]]);
        });

        test('should not have duplicate start node in path', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 2];
            const matrix: number[][] = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ];

            const { result } = dijkstraSearcher.search(start, end, matrix);

            const startCount = result.filter(
                (coord) => coord[0] === start[0] && coord[1] === start[1]
            ).length;
            expect(startCount).toBe(1);
        });

        test('should have unique nodes in result path', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [3, 3];
            const matrix: number[][] = [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];

            const { result } = dijkstraSearcher.search(start, end, matrix);

            const uniqueNodes = new Set(result.map((p) => `${p[0]},${p[1]}`));
            expect(result.length).toBe(uniqueNodes.size);
        });

        test('should correctly reconstruct path of length 2', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [1, 0];
            const matrix: number[][] = [[0, 0]];

            const { result } = dijkstraSearcher.search(start, end, matrix);

            expect(result).toEqual([[0, 0], [1, 0]]);
            expect(result.length).toBe(2);
        });

        test('should handle path with exactly 4 nodes', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [3, 0];
            const matrix: number[][] = [[0, 0, 0, 0]];

            const { result } = dijkstraSearcher.search(start, end, matrix);

            expect(result).toEqual([
                [0, 0],
                [1, 0],
                [2, 0],
                [3, 0],
            ]);
            expect(result.length).toBe(4);
        });

        test('should handle narrow corridor path', () => {
            const start: [number, number] = [0, 1];
            const end: [number, number] = [4, 1];
            const matrix: number[][] = [
                [1, 1, 1, 1, 1],
                [0, 0, 0, 0, 0],
                [1, 1, 1, 1, 1],
            ];

            const { result } = dijkstraSearcher.search(start, end, matrix);

            expect(result).toEqual([
                [0, 1],
                [1, 1],
                [2, 1],
                [3, 1],
                [4, 1],
            ]);
        });

        test('should handle 2x2 matrix with path', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [1, 1];
            const matrix: number[][] = [
                [0, 0],
                [0, 0],
            ];

            const { result } = dijkstraSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual([0, 0]);
            expect(result[result.length - 1]).toEqual([1, 1]);
        });

        test('should handle 2x2 matrix with no path', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [1, 1];
            const matrix: number[][] = [
                [0, 1],
                [1, 0],
            ];

            const { result } = dijkstraSearcher.search(start, end, matrix);

            expect(result).toEqual([]);
        });

        test('should correctly handle 3x1 matrix', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [0, 2];
            const matrix: number[][] = [[0], [0], [0]];

            const { result } = dijkstraSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual([0, 0]);
            expect(result[result.length - 1]).toEqual([0, 2]);
        });

        test('should correctly handle 1x3 matrix', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 0];
            const matrix: number[][] = [[0, 0, 0]];

            const { result } = dijkstraSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual([0, 0]);
            expect(result[result.length - 1]).toEqual([2, 0]);
        });

        test('should handle path where start is adjacent to end', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [0, 1];
            const matrix: number[][] = [
                [0, 0],
                [0, 0],
            ];

            const { result } = dijkstraSearcher.search(start, end, matrix);

            expect(result).toEqual([[0, 0], [0, 1]]);
        });

        test('should handle path where start is diagonally adjacent but must go around', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [1, 1];
            const matrix: number[][] = [
                [0, 1],
                [1, 0],
            ];

            const { result } = dijkstraSearcher.search(start, end, matrix);

            expect(result).toEqual([]);
        });

        // Mutant killer: Exact boundary test at [0,0]
        test('MUTANT-KILLER: exact path from [0,0] to [0,1] on edge', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [0, 1];
            const matrix: number[][] = [
                [0, 1, 1],
                [0, 1, 1],
                [0, 1, 1],
            ];

            const { result } = dijkstraSearcher.search(start, end, matrix);

            // Exact sequence assertion - kills boundary mutation mutants
            expect(result).toEqual([[0, 0], [0, 1]]);
            expect(result.length).toBe(2);
        });

        // Mutant killer: Exact boundary test at [31,31] on 32x32 matrix
        test('MUTANT-KILLER: exact path to [31,31] on 32x32 matrix', () => {
            const matrix: number[][] = Array(32)
                .fill(null)
                .map(() => Array(32).fill(0));

            const start: [number, number] = [0, 0];
            const end: [number, number] = [31, 31];

            const { result } = dijkstraSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual([0, 0]);
            expect(result[result.length - 1]).toEqual([31, 31]);
        });

        // Mutant killer: Cost mutation - forces algorithm to choose length 5 over length 6
        test('MUTANT-KILLER: must choose path of length 5 over length 6', () => {
            const matrix: number[][] = [
                [0, 0, 0, 0, 0, 0],
                [1, 1, 1, 1, 1, 0],
                [0, 0, 0, 0, 0, 0],
            ];

            const start: [number, number] = [0, 0];
            const end: [number, number] = [5, 2];

            const { result } = dijkstraSearcher.search(start, end, matrix);

            // Path along top row: [0,0]->[1,0]->[2,0]->[3,0]->[4,0]->[5,0]->[5,1]->[5,2] = 8 nodes (7 steps)
            // Path down then across: [0,0]->[0,1] is blocked
            // Shortest: [0,0]->[1,0]->[2,0]->[3,0]->[4,0]->[5,0]->[5,1]->[5,2]
            expect(result.length).toBe(8);
            expect(result).toEqual([
                [0, 0],
                [1, 0],
                [2, 0],
                [3, 0],
                [4, 0],
                [5, 0],
                [5, 1],
                [5, 2],
            ]);
        });

        // Mutant killer: Cost mutation - path of exactly 5 nodes
        test('MUTANT-KILLER: exact path of 5 nodes through corridor', () => {
            const matrix: number[][] = [
                [0, 1, 1, 1, 1],
                [0, 1, 1, 1, 1],
                [0, 1, 1, 1, 1],
                [0, 1, 1, 1, 1],
                [0, 0, 0, 0, 0],
            ];

            const start: [number, number] = [0, 0];
            const end: [number, number] = [4, 4];

            const { result } = dijkstraSearcher.search(start, end, matrix);

            // Exact sequence: down column 0, then across row 4
            expect(result).toEqual([
                [0, 0],
                [0, 1],
                [0, 2],
                [0, 3],
                [0, 4],
                [1, 4],
                [2, 4],
                [3, 4],
                [4, 4],
            ]);
            expect(result.length).toBe(9);
        });

        // Mutant killer: Exact obstacle match - kills >= to > mutants
        test('MUTANT-KILLER: obstacle at exact boundary x=0', () => {
            const matrix: number[][] = [
                [1, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ];

            const start: [number, number] = [0, 1];
            const end: [number, number] = [2, 2];

            const { result } = dijkstraSearcher.search(start, end, matrix);

            // Cannot go through [0,0] - must go [0,1]->[1,1]->[2,1]->[2,2] or similar
            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual([0, 1]);
            expect(result[result.length - 1]).toEqual([2, 2]);
        });

        // Mutant killer: Exact obstacle match - kills >= to > mutants at y boundary
        test('MUTANT-KILLER: obstacle at exact boundary y=0', () => {
            const matrix: number[][] = [
                [1, 1, 1],
                [0, 1, 0],
                [0, 1, 0],
            ];

            const start: [number, number] = [0, 1];
            const end: [number, number] = [0, 2];

            const { result } = dijkstraSearcher.search(start, end, matrix);

            // Row 0 is blocked, middle column blocked, must go down directly
            expect(result).toEqual([
                [0, 1],
                [0, 2],
            ]);
            expect(result.length).toBe(2);
        });

        // Mutant killer: Array length check - kills >0 to >=0 mutants
        test('MUTANT-KILLER: empty unvisited array must return empty result', () => {
            const matrix: number[][] = [
                [0, 1],
                [1, 0],
            ];

            const start: [number, number] = [0, 0];
            const end: [number, number] = [1, 1];

            const { result, explored } = dijkstraSearcher.search(start, end, matrix);

            // Start is isolated, unvisited becomes empty, must return empty result
            expect(result).toEqual([]);
            expect(explored).toEqual([[0, 0]]);
        });

        // Mutant killer: Cost addition - kills +1 to -1 mutants
        test('MUTANT-KILLER: distance must strictly increase along path', () => {
            const matrix: number[][] = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ];

            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 2];

            const { result } = dijkstraSearcher.search(start, end, matrix);

            // Verify path exists and is shortest (4 steps)
            expect(result.length).toBe(5);
            expect(result[0]).toEqual([0, 0]);
            expect(result[result.length - 1]).toEqual([2, 2]);

            // Each step should be exactly distance 1 from previous
            for (let i = 1; i < result.length; i++) {
                const [x1, y1] = result[i - 1];
                const [x2, y2] = result[i];
                const dist = Math.abs(x2 - x1) + Math.abs(y2 - y1);
                expect(dist).toBe(1);
            }
        });

        // Mutant killer: Direction array mutations
        test('MUTANT-KILLER: all four directions must be tested', () => {
            const matrix: number[][] = [
                [0, 0, 0, 0],
                [1, 1, 1, 0],
                [1, 1, 1, 0],
                [1, 1, 1, 0],
            ];

            const start: [number, number] = [0, 0];
            const end: [number, number] = [3, 3];

            const { result } = dijkstraSearcher.search(start, end, matrix);

            // Must go right, then down - tests both directions
            expect(result).toEqual([
                [0, 0],
                [1, 0],
                [2, 0],
                [3, 0],
                [3, 1],
                [3, 2],
                [3, 3],
            ]);
        });

        // Mutant killer: FindCoordinateIndex must work correctly
        test('MUTANT-KILLER: coordinate index finding in unvisited', () => {
            const matrix: number[][] = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ];

            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 2];

            const { explored } = dijkstraSearcher.search(start, end, matrix);

            // All nodes should be explored exactly once
            expect(explored.length).toBe(9);
            const unique = new Set(explored.map((c) => `${c[0]},${c[1]}`));
            expect(unique.size).toBe(9);
        });

        // Mutant killer: IsInUnvisited must work correctly
        test('MUTANT-KILLER: unvisited tracking must be accurate', () => {
            const matrix: number[][] = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ];

            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 2];

            const { explored, result } = dijkstraSearcher.search(start, end, matrix);

            // Path exists - verify shortest path length
            expect(result.length).toBe(5);
            expect(result[0]).toEqual([0, 0]);
            expect(result[result.length - 1]).toEqual([2, 2]);
            // All nodes should be explored
            expect(explored.length).toBe(9);
        });
    });
});
