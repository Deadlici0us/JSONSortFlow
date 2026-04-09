import { BfsSearcher } from '../src/services/BfsSearcher';
import type { ISearcher } from '../src/services/ISearcher';

describe('BfsSearcher', () => {
    let bfsSearcher: ISearcher;

    beforeEach(() => {
        bfsSearcher = new BfsSearcher();
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

            const { explored, result } = bfsSearcher.search(start, end, matrix);

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

        test('should return direct path when no obstacles exist', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 0];
            const matrix: number[][] = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ];

            const { result } = bfsSearcher.search(start, end, matrix);

            expect(result).toEqual([
                [0, 0],
                [1, 0],
                [2, 0],
            ]);
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

            const { result } = bfsSearcher.search(start, end, matrix);

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

            const { explored, result } = bfsSearcher.search(start, end, matrix);

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

            const { explored, result } = bfsSearcher.search(start, end, matrix);

            expect(result).toEqual([[1, 1]]);
            expect(explored).toContainEqual([1, 1]);
        });

        test('should explore nodes in breadth-first order', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 2];
            const matrix: number[][] = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ];

            const { explored } = bfsSearcher.search(start, end, matrix);

            const startIdx = explored.findIndex((p) => p[0] === 0 && p[1] === 0);
            const endIdx = explored.findIndex((p) => p[0] === 2 && p[1] === 2);
            expect(startIdx).toBeLessThan(endIdx);
        });

        test('should handle diagonal-like path around obstacle', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 2];
            const matrix: number[][] = [
                [0, 0, 0],
                [1, 1, 0],
                [1, 1, 0],
            ];

            const { result } = bfsSearcher.search(start, end, matrix);

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

        test('should handle 32x32 matrix with path', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [31, 31];

            const matrix: number[][] = Array(32)
                .fill(null)
                .map(() => Array(32).fill(0));

            matrix[10][10] = 1;
            matrix[15][15] = 1;
            matrix[20][20] = 1;

            const { result } = bfsSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual(start);
            expect(result[result.length - 1]).toEqual(end);
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

            const { result } = bfsSearcher.search(start, end, matrix);

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

            const { result } = bfsSearcher.search(start, end, matrix);

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

        test('should handle path requiring backtracking exploration', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [4, 0];
            const matrix: number[][] = [
                [0, 0, 0, 0, 0],
                [1, 1, 1, 1, 0],
                [1, 1, 1, 1, 0],
            ];

            const { result } = bfsSearcher.search(start, end, matrix);

            expect(result).toEqual([
                [0, 0],
                [1, 0],
                [2, 0],
                [3, 0],
                [4, 0],
            ]);
        });

        test('should not revisit already explored nodes', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 2];
            const matrix: number[][] = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ];

            const { explored } = bfsSearcher.search(start, end, matrix);

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

            const { result } = bfsSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual([0, 0]);
            expect(result[result.length - 1]).toEqual([0, 2]);
        });

        test('should correctly handle boundary coordinates at max', () => {
            const matrix: number[][] = Array(5).fill(0).map(() => Array(5).fill(0));
            const start: [number, number] = [0, 0];
            const end: [number, number] = [4, 4];

            const { result } = bfsSearcher.search(start, end, matrix);

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

            const { explored, result } = bfsSearcher.search(start, end, matrix);

            expect(explored.length).toBeGreaterThan(result.length);
            expect(explored).toContainEqual([0, 0]);
            expect(explored).toContainEqual([1, 0]);
            expect(explored).toContainEqual([2, 0]);
        });

        test('should correctly track parent relationships', () => {
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 2];
            const matrix: number[][] = [
                [0, 0, 0],
                [0, 1, 0],
                [0, 0, 0],
            ];

            const { result } = bfsSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(1);
            for (let i = 1; i < result.length; i++) {
                const [x1, y1] = result[i - 1];
                const [x2, y2] = result[i];
                const distance = Math.abs(x2 - x1) + Math.abs(y2 - y1);
                expect(distance).toBe(1);
            }
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

            const { result } = bfsSearcher.search(start, end, matrix);

            expect(result).toEqual([[0, 0], [1, 0]]);
            expect(result.length).toBe(2);
        });

        // Mutant killer: Exact boundary test at [31,31]
        test('MUTANT-KILLER: path to [31,31] on 32x32 matrix', () => {
            const matrix: number[][] = Array(32)
                .fill(null)
                .map(() => Array(32).fill(0));

            const start: [number, number] = [0, 0];
            const end: [number, number] = [31, 31];

            const { result } = bfsSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual([0, 0]);
            expect(result[result.length - 1]).toEqual([31, 31]);
        });

        // Mutant killer: Exact path sequence
        test('MUTANT-KILLER: exact corridor path', () => {
            const matrix: number[][] = [
                [0, 1, 1, 1],
                [0, 1, 1, 1],
                [0, 1, 1, 1],
                [0, 0, 0, 0],
            ];

            const start: [number, number] = [0, 0];
            const end: [number, number] = [3, 3];

            const { result } = bfsSearcher.search(start, end, matrix);

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

        // Mutant killer: kills >0 to >=0 mutants
        test('MUTANT-KILLER: isolated start returns empty', () => {
            const matrix: number[][] = [
                [0, 1],
                [1, 0],
            ];

            const start: [number, number] = [0, 0];
            const end: [number, number] = [1, 1];

            const { result, explored } = bfsSearcher.search(start, end, matrix);

            expect(result).toEqual([]);
            expect(explored).toEqual([[0, 0]]);
        });
    });
});
