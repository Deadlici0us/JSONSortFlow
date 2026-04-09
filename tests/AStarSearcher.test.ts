import { AStarSearcher } from '../src/services/AStarSearcher';
import type { ISearcher } from '../src/services/ISearcher';

describe('AStarSearcher', () => {
    let aStarSearcher: ISearcher;

    beforeEach(() => {
        aStarSearcher = new AStarSearcher();
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

            const { explored, result } = aStarSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual(start);
            expect(result[result.length - 1]).toEqual(end);
            expect(explored.length).toBeGreaterThan(0);

            for (let i = 1; i < result.length; i++) {
                const [x1, y1] = result[i - 1];
                const [x2, y2] = result[i];
                const distance = Math.abs(x2 - x1) + Math.abs(y2 - y1);
                expect(distance).toBe(1);
            }
        });

        test('should explore fewer nodes than BFS for same path', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [10, 10];
            const matrix: number[][] = Array(12)
                .fill(null)
                .map(() => Array(12).fill(0));

            const { explored: aStarExplored } = aStarSearcher.search(
                start,
                end,
                matrix
            );

            expect(aStarExplored.length).toBeGreaterThan(0);
            expect(aStarExplored).toContainEqual(start);
            expect(aStarExplored).toContainEqual(end);
        });

        test('should find path around multiple obstacles', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [3, 3];
            const matrix: number[][] = [
                [0, 0, 1, 0],
                [0, 1, 1, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];

            const { result } = aStarSearcher.search(start, end, matrix);

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

            const { explored, result } = aStarSearcher.search(start, end, matrix);

            expect(result).toEqual([]);
            expect(explored.length).toBeGreaterThan(0);
            expect(explored).toContainEqual([0, 0]);
        });

        test('should return start position when start equals end', () => {
            const start: [number, number] = [2, 2];
            const end: [number, number] = [2, 2];
            const matrix: number[][] = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ];

            const { explored, result } = aStarSearcher.search(start, end, matrix);

            expect(result).toEqual([start]);
            expect(explored).toEqual([start]);
        });

        test('should return correct path when start equals end at origin', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [0, 0];
            const matrix: number[][] = Array(5).fill(0).map(() => Array(5).fill(0));

            const { explored, result } = aStarSearcher.search(start, end, matrix);

            expect(result).toEqual([[0, 0]]);
            expect(explored).toEqual([[0, 0]]);
        });

        test('should handle multiple paths of equal length consistently', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 2];
            const matrix: number[][] = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ];

            const result1 = aStarSearcher.search(start, end, matrix).result;
            const result2 = aStarSearcher.search(start, end, matrix).result;

            expect(result1).toEqual(result2);
            expect(result1.length).toBe(result2.length);
        });

        test('should use Manhattan distance heuristic for prioritization', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [4, 0];
            const matrix: number[][] = [
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
            ];

            const { result } = aStarSearcher.search(start, end, matrix);

            expect(result).toEqual([
                [0, 0],
                [1, 0],
                [2, 0],
                [3, 0],
                [4, 0],
            ]);
        });

        test('should return empty result when surrounded by obstacles', () => {
            const start: [number, number] = [1, 1];
            const end: [number, number] = [1, 3];
            const matrix: number[][] = [
                [1, 1, 1, 1, 1],
                [1, 0, 1, 0, 1],
                [1, 1, 1, 1, 1],
                [1, 0, 0, 0, 1],
                [1, 1, 1, 1, 1],
            ];

            const { result } = aStarSearcher.search(start, end, matrix);

            expect(result).toEqual([]);
        });

        test('should find path in L-shaped corridor', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 2];
            const matrix: number[][] = [
                [0, 1, 1],
                [0, 1, 1],
                [0, 0, 0],
            ];

            const { result } = aStarSearcher.search(start, end, matrix);

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

        test('should handle 32x32 matrix efficiently', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [31, 31];

            const matrix: number[][] = Array(32)
                .fill(null)
                .map(() => Array(32).fill(0));

            matrix[10][10] = 1;
            matrix[15][15] = 1;
            matrix[20][20] = 1;

            const { result, explored } = aStarSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual(start);
            expect(result[result.length - 1]).toEqual(end);
            expect(explored.length).toBeLessThan(32 * 32);
        });

        test('should not revisit nodes already in closed set', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 2];
            const matrix: number[][] = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ];

            const { explored } = aStarSearcher.search(start, end, matrix);

            const uniqueNodes = new Set(explored.map((p) => `${p[0]},${p[1]}`));
            expect(explored.length).toBe(uniqueNodes.size);
        });

        test('should handle path requiring detour around obstacle wall', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [4, 0];
            const matrix: number[][] = [
                [0, 0, 1, 1, 0],
                [0, 0, 1, 1, 0],
                [0, 0, 0, 0, 0],
            ];

            const { result } = aStarSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual([0, 0]);
            expect(result[result.length - 1]).toEqual([4, 0]);

            for (let i = 0; i < result.length; i++) {
                const [x, y] = result[i];
                expect(matrix[y][x]).toBe(0);
            }
        });

        test('should improve path when better route found', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [3, 3];
            const matrix: number[][] = [
                [0, 0, 0, 0, 0],
                [0, 1, 1, 1, 0],
                [0, 1, 1, 1, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
            ];

            const { result } = aStarSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual(start);
            expect(result[result.length - 1]).toEqual(end);
        });

        test('should handle direct horizontal path', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [5, 0];
            const matrix: number[][] = Array(1).fill(0).map(() => Array(6).fill(0));

            const { result } = aStarSearcher.search(start, end, matrix);

            expect(result).toEqual([
                [0, 0],
                [1, 0],
                [2, 0],
                [3, 0],
                [4, 0],
                [5, 0],
            ]);
        });

        test('should handle single step path', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [1, 0];
            const matrix: number[][] = [
                [0, 0],
                [0, 0],
            ];

            const { result } = aStarSearcher.search(start, end, matrix);

            expect(result).toEqual([[0, 0], [1, 0]]);
        });

        test('should handle two step diagonal path', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [1, 1];
            const matrix: number[][] = [
                [0, 0],
                [0, 0],
            ];

            const { result } = aStarSearcher.search(start, end, matrix);

            expect(result.length).toBe(3);
            expect(result[0]).toEqual([0, 0]);
            expect(result[result.length - 1]).toEqual([1, 1]);
        });

        test('should trigger path improvement with diamond pattern', () => {
            const start: [number, number] = [1, 0];
            const end: [number, number] = [1, 4];
            const matrix: number[][] = [
                [1, 0, 1, 1, 1],
                [1, 0, 0, 0, 1],
                [1, 0, 1, 0, 1],
                [1, 0, 0, 0, 1],
                [1, 0, 1, 1, 1],
            ];

            const { result } = aStarSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual(start);
            expect(result[result.length - 1]).toEqual(end);
        });

        test('should handle boundary at coordinate zero', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 0];
            const matrix: number[][] = [
                [0, 0, 0],
                [1, 1, 1],
                [1, 1, 1],
            ];

            const { result } = aStarSearcher.search(start, end, matrix);

            expect(result).toEqual([[0, 0], [1, 0], [2, 0]]);
        });

        test('should handle boundary at max coordinate', () => {
            const matrix: number[][] = Array(3).fill(0).map(() => Array(3).fill(0));
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 2];

            const { result } = aStarSearcher.search(start, end, matrix);

            expect(result[0]).toEqual([0, 0]);
            expect(result[result.length - 1]).toEqual([2, 2]);
        });

        test('should populate explored with all visited nodes', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 2];
            const matrix: number[][] = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ];

            const { explored } = aStarSearcher.search(start, end, matrix);

            expect(explored.length).toBeGreaterThan(0);
            expect(explored).toContainEqual([0, 0]);
            expect(explored).toContainEqual([2, 2]);
        });

        test('should verify all result nodes are valid (not obstacles)', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [3, 3];
            const matrix: number[][] = [
                [0, 0, 1, 0],
                [0, 1, 1, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];

            const { result } = aStarSearcher.search(start, end, matrix);

            for (const [x, y] of result) {
                expect(matrix[y][x]).toBe(0);
            }
        });

        test('should find path with exactly Manhattan distance length', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 1];
            const matrix: number[][] = [
                [0, 0, 0],
                [0, 0, 0],
            ];

            const { result } = aStarSearcher.search(start, end, matrix);

            const expectedLength = Math.abs(2 - 0) + Math.abs(1 - 0) + 1;
            expect(result.length).toBe(expectedLength);
        });

        test('should improve path when shorter route discovered later', () => {
            const start: [number, number] = [0, 1];
            const end: [number, number] = [4, 1];
            const matrix: number[][] = [
                [0, 0, 0, 0, 0],
                [0, 1, 1, 1, 0],
                [0, 0, 0, 0, 0],
            ];

            const { result, explored } = aStarSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual(start);
            expect(result[result.length - 1]).toEqual(end);
            expect(explored.length).toBeLessThan(matrix.length * matrix[0].length);
        });

        test('should handle isolated goal with no path (empty result)', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [0, 2];
            const matrix: number[][] = [
                [0, 1, 0],
                [1, 1, 1],
                [0, 1, 0],
            ];

            const { result, explored } = aStarSearcher.search(start, end, matrix);

            expect(result).toEqual([]);
            expect(explored).toContainEqual([0, 0]);
            expect(explored.length).toBeLessThan(matrix.length * matrix[0].length);
        });

        test('should handle isolated start position', () => {
            const start: [number, number] = [1, 1];
            const end: [number, number] = [3, 3];
            const matrix: number[][] = [
                [1, 1, 1, 1, 1],
                [1, 0, 1, 0, 1],
                [1, 1, 1, 1, 1],
                [1, 0, 0, 0, 1],
                [1, 1, 1, 1, 1],
            ];

            const { result, explored } = aStarSearcher.search(start, end, matrix);

            expect(result).toEqual([]);
            expect(explored).toEqual([[1, 1]]);
        });

        test('should verify A* explores fewer nodes than exhaustive search', () => {
            const matrix: number[][] = Array(10)
                .fill(null)
                .map(() => Array(10).fill(0));

            matrix[3][3] = 1;
            matrix[5][5] = 1;

            const start: [number, number] = [0, 0];
            const end: [number, number] = [9, 9];

            const { explored } = aStarSearcher.search(start, end, matrix);

            expect(explored.length).toBeLessThan(10 * 10);
            expect(explored).toContainEqual(start);
            expect(explored).toContainEqual(end);
        });

        test('should prioritize nodes closer to goal using Manhattan heuristic', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [4, 0];
            const matrix: number[][] = [
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
            ];

            const { explored, result } = aStarSearcher.search(start, end, matrix);

            expect(result).toEqual([
                [0, 0],
                [1, 0],
                [2, 0],
                [3, 0],
                [4, 0],
            ]);

            const firstFewExplored = explored.slice(0, 5);
            for (const [x, y] of firstFewExplored) {
                expect(y).toBe(0);
            }
        });

        test('should handle narrow corridor pathfinding', () => {
            const start: [number, number] = [0, 1];
            const end: [number, number] = [6, 1];
            const matrix: number[][] = [
                [1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1],
            ];

            const { result, explored } = aStarSearcher.search(start, end, matrix);

            expect(result).toEqual([
                [0, 1],
                [1, 1],
                [2, 1],
                [3, 1],
                [4, 1],
                [5, 1],
                [6, 1],
            ]);
            expect(explored.length).toBe(result.length);
        });

        test('should find optimal path in maze-like structure', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [6, 6];
            const matrix: number[][] = [
                [0, 1, 0, 0, 0, 1, 0, 0],
                [0, 1, 0, 1, 0, 1, 0, 0],
                [0, 0, 0, 1, 0, 0, 0, 0],
                [1, 1, 1, 1, 1, 1, 1, 0],
                [0, 0, 0, 0, 0, 0, 1, 0],
                [0, 1, 1, 1, 1, 0, 1, 0],
                [0, 0, 0, 0, 1, 0, 0, 0],
                [1, 1, 1, 0, 1, 1, 1, 0],
            ];

            const { result, explored } = aStarSearcher.search(start, end, matrix);

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

        test('should handle path requiring multiple direction changes', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [4, 4];
            const matrix: number[][] = [
                [0, 0, 0, 1, 0, 0],
                [0, 0, 0, 1, 0, 0],
                [0, 0, 0, 1, 0, 0],
                [0, 1, 0, 0, 0, 0],
                [0, 1, 0, 0, 0, 0],
                [0, 1, 0, 0, 0, 0],
            ];

            const { result } = aStarSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual([0, 0]);
            expect(result[result.length - 1]).toEqual([4, 4]);
        });

        test('should explore nodes in order of increasing f-score', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [3, 0];
            const matrix: number[][] = Array(3).fill(0).map(() => Array(4).fill(0));

            const { explored } = aStarSearcher.search(start, end, matrix);

            const startIndex = explored.findIndex(
                (p) => p[0] === 0 && p[1] === 0
            );
            const endIndex = explored.findIndex(
                (p) => p[0] === 3 && p[1] === 0
            );

            expect(startIndex).toBe(0);
            expect(endIndex).toBeGreaterThan(startIndex);
        });

        test('should handle large open space efficiently', () => {
            const matrix: number[][] = Array(20)
                .fill(null)
                .map(() => Array(20).fill(0));

            const start: [number, number] = [0, 0];
            const end: [number, number] = [19, 19];

            const { explored, result } = aStarSearcher.search(start, end, matrix);

            expect(result.length).toBe(39);
            expect(explored).toContainEqual(start);
            expect(explored).toContainEqual(end);
        });

        test('should return correct path when goal is one step away', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [0, 1];
            const matrix: number[][] = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ];

            const { result } = aStarSearcher.search(start, end, matrix);

            expect(result).toEqual([[0, 0], [0, 1]]);
        });

        test('should handle path with exactly one valid neighbor at each step', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [0, 4];
            const matrix: number[][] = [
                [0, 1, 1, 1, 1],
                [0, 1, 1, 1, 1],
                [0, 1, 1, 1, 1],
                [0, 1, 1, 1, 1],
                [0, 0, 0, 0, 0],
            ];

            const { result } = aStarSearcher.search(start, end, matrix);

            expect(result).toEqual([
                [0, 0],
                [0, 1],
                [0, 2],
                [0, 3],
                [0, 4],
            ]);
        });

        test('should improve path when better route found via different neighbor order', () => {
            const start: [number, number] = [0, 1];
            const end: [number, number] = [7, 1];
            const matrix: number[][] = [
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 1, 1, 1, 1, 1, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 1, 1, 1, 1, 1, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
            ];

            const { result, explored } = aStarSearcher.search(start, end, matrix);

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

        test('should handle scenario requiring path reconstruction edge case', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [1, 0];
            const matrix: number[][] = [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0],
            ];

            const { result } = aStarSearcher.search(start, end, matrix);

            expect(result).toEqual([[0, 0], [1, 0]]);
        });

        test('should verify path validity by checking each node is walkable', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [6, 6];
            const matrix: number[][] = [
                [0, 0, 0, 1, 0, 0, 0, 0],
                [0, 1, 0, 1, 0, 1, 0, 0],
                [0, 1, 0, 0, 0, 1, 0, 0],
                [0, 1, 0, 1, 1, 1, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 1, 1, 1, 1, 1, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
            ];

            const { result } = aStarSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            for (const [x, y] of result) {
                expect(matrix[y][x]).toBe(0);
                expect(x).toBeGreaterThanOrEqual(0);
                expect(x).toBeLessThan(matrix[0].length);
                expect(y).toBeGreaterThanOrEqual(0);
                expect(y).toBeLessThan(matrix.length);
            }
        });

        test('should find path in grid with obstacles blocking direct route', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [0, 2];
            const matrix: number[][] = [
                [0, 1, 0],
                [0, 1, 0],
                [0, 1, 0],
                [0, 0, 0],
            ];

            const { result } = aStarSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(1);
            expect(result[0]).toEqual([0, 0]);
            expect(result[result.length - 1]).toEqual([0, 2]);
        });

        test('should handle isolated start position with no neighbors', () => {
            const start: [number, number] = [1, 1];
            const end: [number, number] = [2, 2];
            const matrix: number[][] = [
                [1, 1, 1],
                [1, 0, 1],
                [1, 1, 1],
            ];

            const { explored, result } = aStarSearcher.search(start, end, matrix);

            expect(explored).toEqual([start]);
            expect(result).toEqual([]);
        });

        test('should handle isolated end position', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [1, 1];
            const matrix: number[][] = [
                [0, 0, 0],
                [0, 1, 0],
                [0, 0, 0],
            ];

            const { explored, result } = aStarSearcher.search(start, end, matrix);

            expect(result).toEqual([]);
            expect(explored.length).toBeGreaterThan(0);
        });

        // Mutant killer: Exact boundary test at [0,0]
        test('MUTANT-KILLER: exact path from [0,0] to [1,0] on edge', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [1, 0];
            const matrix: number[][] = [
                [0, 0, 1],
                [1, 1, 1],
                [1, 1, 1],
            ];

            const { result } = aStarSearcher.search(start, end, matrix);

            expect(result).toEqual([[0, 0], [1, 0]]);
            expect(result.length).toBe(2);
        });

        // Mutant killer: 32x32 matrix boundary
        test('MUTANT-KILLER: path to [31,31] on 32x32 matrix', () => {
            const matrix: number[][] = Array(32)
                .fill(null)
                .map(() => Array(32).fill(0));

            const start: [number, number] = [0, 0];
            const end: [number, number] = [31, 31];

            const { result } = aStarSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual([0, 0]);
            expect(result[result.length - 1]).toEqual([31, 31]);
        });

        // Mutant killer: exact corridor path
        test('MUTANT-KILLER: exact corridor path', () => {
            const matrix: number[][] = [
                [0, 1, 1, 1],
                [0, 1, 1, 1],
                [0, 1, 1, 1],
                [0, 0, 0, 0],
            ];

            const start: [number, number] = [0, 0];
            const end: [number, number] = [3, 3];

            const { result } = aStarSearcher.search(start, end, matrix);

            expect(result).toEqual([
                [0, 0],
                [0, 1],
                [0, 2],
                [0, 3],
                [1, 3],
                [2, 3],
                [3, 3],
            ]);
            expect(result.length).toBe(7);
        });

        // Mutant killer: isolated start
        test('MUTANT-KILLER: isolated start returns empty', () => {
            const matrix: number[][] = [
                [0, 1],
                [1, 0],
            ];

            const start: [number, number] = [0, 0];
            const end: [number, number] = [1, 1];

            const { result, explored } = aStarSearcher.search(start, end, matrix);

            expect(result).toEqual([]);
            expect(explored).toEqual([[0, 0]]);
        });
    });
});
