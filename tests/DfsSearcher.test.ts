import { DfsSearcher } from '../src/services/DfsSearcher';
import type { ISearcher } from '../src/services/ISearcher';

describe('DfsSearcher', () => 
{
    let dfsSearcher: ISearcher;

    beforeEach(() => 
{
        dfsSearcher = new DfsSearcher();
    });

    describe('search', () => 
{
        test('should find path in simple 3x3 matrix with obstacle', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 2];
            const matrix: number[][] = [
                [0, 0, 0],
                [0, 1, 0],
                [0, 0, 0],
            ];

            const { explored, result } = dfsSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual(start);
            expect(result[result.length - 1]).toEqual(end);
            expect(explored).toContainEqual([0, 0]);
            expect(explored).toContainEqual([2, 2]);

            for (let i = 1; i < result.length; i++) 
{
                const [x1, y1] = result[i - 1];
                const [x2, y2] = result[i];
                const distance = Math.abs(x2 - x1) + Math.abs(y2 - y1);
                expect(distance).toBe(1);
            }
        });

        test('should return direct path when no obstacles exist', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 0];
            const matrix: number[][] = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ];

            const { result } = dfsSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual(start);
            expect(result[result.length - 1]).toEqual(end);
        });

        test('should find path around multiple obstacles', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [3, 3];
            const matrix: number[][] = [
                [0, 0, 1, 0],
                [0, 1, 1, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];

            const { result } = dfsSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual(start);
            expect(result[result.length - 1]).toEqual(end);
        });

        test('should return empty result when path is completely blocked', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 2];
            const matrix: number[][] = [
                [0, 1, 1],
                [1, 1, 1],
                [1, 1, 0],
            ];

            const { explored, result } = dfsSearcher.search(start, end, matrix);

            expect(result).toEqual([]);
            expect(explored.length).toBeGreaterThan(0);
            expect(explored).toContainEqual([0, 0]);
        });

        test('should return start position when start equals end', () => 
{
            const start: [number, number] = [1, 1];
            const end: [number, number] = [1, 1];
            const matrix: number[][] = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ];

            const { explored, result } = dfsSearcher.search(start, end, matrix);

            expect(result).toEqual([[1, 1]]);
            expect(explored).toContainEqual([1, 1]);
        });

        test('should explore nodes in depth-first order', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 2];
            const matrix: number[][] = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ];

            const { explored } = dfsSearcher.search(start, end, matrix);

            const startIdx = explored.findIndex(
                (p) => p[0] === 0 && p[1] === 0
            );
            const endIdx = explored.findIndex((p) => p[0] === 2 && p[1] === 2);
            expect(startIdx).toBeLessThan(endIdx);
        });

        test('should handle diagonal-like path around obstacle', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 2];
            const matrix: number[][] = [
                [0, 0, 0],
                [1, 1, 0],
                [1, 1, 0],
            ];

            const { result } = dfsSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual(start);
            expect(result[result.length - 1]).toEqual(end);

            for (let i = 1; i < result.length; i++) 
{
                const [x1, y1] = result[i - 1];
                const [x2, y2] = result[i];
                const distance = Math.abs(x2 - x1) + Math.abs(y2 - y1);
                expect(distance).toBe(1);
            }
        });

        test('should handle 32x32 matrix with path', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [31, 31];

            const matrix: number[][] = Array(32)
                .fill(null)
                .map(() => Array(32).fill(0));

            matrix[10][10] = 1;
            matrix[15][15] = 1;
            matrix[20][20] = 1;

            const { result } = dfsSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual(start);
            expect(result[result.length - 1]).toEqual(end);
        });

        test('should return empty array when surrounded by obstacles', () => 
{
            const start: [number, number] = [1, 1];
            const end: [number, number] = [1, 3];
            const matrix: number[][] = [
                [1, 1, 1, 1, 1],
                [1, 0, 1, 0, 1],
                [1, 1, 1, 1, 1],
                [1, 0, 0, 0, 1],
                [1, 1, 1, 1, 1],
            ];

            const { result } = dfsSearcher.search(start, end, matrix);

            expect(result).toEqual([]);
        });

        test('should find path in L-shaped corridor', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 2];
            const matrix: number[][] = [
                [0, 1, 1],
                [0, 1, 1],
                [0, 0, 0],
            ];

            const { result } = dfsSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual(start);
            expect(result[result.length - 1]).toEqual(end);

            for (let i = 1; i < result.length; i++) 
{
                const [x1, y1] = result[i - 1];
                const [x2, y2] = result[i];
                const distance = Math.abs(x2 - x1) + Math.abs(y2 - y1);
                expect(distance).toBe(1);
            }
        });

        test('should handle path requiring backtracking exploration', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [4, 0];
            const matrix: number[][] = [
                [0, 0, 0, 0, 0],
                [1, 1, 1, 1, 0],
                [1, 1, 1, 1, 0],
            ];

            const { result } = dfsSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual(start);
            expect(result[result.length - 1]).toEqual(end);
        });

        test('should not revisit already explored nodes', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 2];
            const matrix: number[][] = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ];

            const { explored } = dfsSearcher.search(start, end, matrix);

            const uniqueNodes = new Set(explored.map((p) => `${p[0]},${p[1]}`));
            expect(explored.length).toBe(uniqueNodes.size);
        });

        test('should correctly handle boundary coordinates at zero', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [0, 2];
            const matrix: number[][] = [
                [0, 1, 0],
                [0, 1, 0],
                [0, 0, 0],
            ];

            const { result } = dfsSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual([0, 0]);
            expect(result[result.length - 1]).toEqual([0, 2]);
        });

        test('should correctly handle boundary coordinates at max', () => 
{
            const matrix: number[][] = Array(5)
                .fill(0)
                .map(() => Array(5).fill(0));
            const start: [number, number] = [0, 0];
            const end: [number, number] = [4, 4];

            const { result } = dfsSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual([0, 0]);
            expect(result[result.length - 1]).toEqual([4, 4]);
        });

        test('should populate explored array for all reachable nodes', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 0];
            const matrix: number[][] = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ];

            const { explored, result } = dfsSearcher.search(start, end, matrix);

            expect(explored.length).toBeGreaterThan(0);
            expect(explored).toContainEqual([0, 0]);
        });

        test('should correctly track parent relationships', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 2];
            const matrix: number[][] = [
                [0, 0, 0],
                [0, 1, 0],
                [0, 0, 0],
            ];

            const { result } = dfsSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            for (let i = 1; i < result.length; i++) 
{
                const [x1, y1] = result[i - 1];
                const [x2, y2] = result[i];
                const distance = Math.abs(x2 - x1) + Math.abs(y2 - y1);
                expect(distance).toBe(1);
            }
        });

        test('should handle start coordinate surrounded by obstacles', () => 
{
            const start: [number, number] = [2, 2];
            const end: [number, number] = [0, 0];
            const matrix: number[][] = [
                [0, 1, 1],
                [1, 1, 1],
                [1, 1, 0],
            ];

            const { explored, result } = dfsSearcher.search(start, end, matrix);

            expect(result).toEqual([]);
            expect(explored).toContainEqual([2, 2]);
        });

        test('should handle end coordinate surrounded by obstacles', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 2];
            const matrix: number[][] = [
                [0, 1, 1],
                [1, 1, 1],
                [1, 1, 0],
            ];

            const { explored, result } = dfsSearcher.search(start, end, matrix);

            expect(result).toEqual([]);
        });

        test('should correctly handle path at exact matrix boundary', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [4, 4];
            const matrix: number[][] = Array(5)
                .fill(0)
                .map(() => Array(5).fill(0));

            const { result } = dfsSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual([0, 0]);
            expect(result[result.length - 1]).toEqual([4, 4]);

            for (let i = 1; i < result.length; i++) 
{
                const [x, y] = result[i];
                expect(x).toBeGreaterThanOrEqual(0);
                expect(x).toBeLessThanOrEqual(4);
                expect(y).toBeGreaterThanOrEqual(0);
                expect(y).toBeLessThanOrEqual(4);
            }
        });

        test('should reject path when end is exactly at boundary with obstacle beyond', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 0];
            const matrix: number[][] = [
                [0, 0, 0],
                [1, 1, 1],
            ];

            const { result } = dfsSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[result.length - 1]).toEqual([2, 0]);
        });

        test('should handle path with exactly 2 steps', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [1, 0];
            const matrix: number[][] = [
                [0, 0],
                [0, 0],
            ];

            const { result } = dfsSearcher.search(start, end, matrix);

            expect(result).toEqual([
                [0, 0],
                [1, 0],
            ]);
        });

        test('should handle path with exactly 3 steps', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 0];
            const matrix: number[][] = [
                [0, 0, 0],
                [0, 0, 0],
            ];

            const { result } = dfsSearcher.search(start, end, matrix);

            expect(result.length).toBe(3);
            expect(result[0]).toEqual([0, 0]);
            expect(result[1]).toEqual([1, 0]);
            expect(result[2]).toEqual([2, 0]);
        });

        test('should handle single row matrix', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [3, 0];
            const matrix: number[][] = [[0, 0, 0, 0]];

            const { result } = dfsSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual([0, 0]);
            expect(result[result.length - 1]).toEqual([3, 0]);
        });

        test('should handle single column matrix', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [0, 3];
            const matrix: number[][] = [[0], [0], [0], [0]];

            const { result } = dfsSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual([0, 0]);
            expect(result[result.length - 1]).toEqual([0, 3]);
        });

        test('should handle 2x2 matrix with path', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [1, 1];
            const matrix: number[][] = [
                [0, 0],
                [0, 0],
            ];

            const { result } = dfsSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual([0, 0]);
            expect(result[result.length - 1]).toEqual([1, 1]);
        });

        test('should handle 2x2 matrix with no path', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [1, 1];
            const matrix: number[][] = [
                [0, 1],
                [1, 0],
            ];

            const { result } = dfsSearcher.search(start, end, matrix);

            expect(result).toEqual([]);
        });

        test('should correctly handle path that requires going through middle of matrix', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [4, 4];
            const matrix: number[][] = [
                [0, 1, 1, 1, 1],
                [0, 0, 0, 0, 0],
                [1, 0, 1, 1, 1],
                [1, 0, 1, 1, 1],
                [1, 0, 0, 0, 0],
            ];

            const { result } = dfsSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual([0, 0]);
            expect(result[result.length - 1]).toEqual([4, 4]);
        });

        test('should not accept coordinates outside matrix bounds', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 2];
            const matrix: number[][] = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ];

            const { explored } = dfsSearcher.search(start, end, matrix);

            for (const [x, y] of explored) 
{
                expect(x).toBeGreaterThanOrEqual(0);
                expect(x).toBeLessThan(3);
                expect(y).toBeGreaterThanOrEqual(0);
                expect(y).toBeLessThan(3);
            }
        });

        test('should handle path where start is adjacent to end', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [0, 1];
            const matrix: number[][] = [
                [0, 0],
                [0, 0],
            ];

            const { result } = dfsSearcher.search(start, end, matrix);

            expect(result).toEqual([
                [0, 0],
                [0, 1],
            ]);
        });

        test('should handle path where start is diagonally adjacent but must go around', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [1, 1];
            const matrix: number[][] = [
                [0, 1],
                [1, 0],
            ];

            const { result } = dfsSearcher.search(start, end, matrix);

            expect(result).toEqual([]);
        });

        test('should explore all reachable nodes when no path exists', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 2];
            const matrix: number[][] = [
                [0, 1, 1],
                [1, 1, 1],
                [1, 1, 0],
            ];

            const { explored, result } = dfsSearcher.search(start, end, matrix);

            expect(result).toEqual([]);
            expect(explored).toContainEqual([0, 0]);
        });

        test('should handle narrow corridor path', () => 
{
            const start: [number, number] = [0, 1];
            const end: [number, number] = [4, 1];
            const matrix: number[][] = [
                [1, 1, 1, 1, 1],
                [0, 0, 0, 0, 0],
                [1, 1, 1, 1, 1],
            ];

            const { result } = dfsSearcher.search(start, end, matrix);

            expect(result).toEqual([
                [0, 1],
                [1, 1],
                [2, 1],
                [3, 1],
                [4, 1],
            ]);
        });

        test('should handle 1x1 matrix where start equals end', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [0, 0];
            const matrix: number[][] = [[0]];

            const { explored, result } = dfsSearcher.search(start, end, matrix);

            expect(result).toEqual([[0, 0]]);
            expect(explored).toEqual([[0, 0]]);
        });

        test('should handle 1x2 matrix with path', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [1, 0];
            const matrix: number[][] = [[0, 0]];

            const { result } = dfsSearcher.search(start, end, matrix);

            expect(result).toEqual([
                [0, 0],
                [1, 0],
            ]);
        });

        test('should handle 2x1 matrix with path', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [0, 1];
            const matrix: number[][] = [[0], [0]];

            const { result } = dfsSearcher.search(start, end, matrix);

            expect(result).toEqual([
                [0, 0],
                [0, 1],
            ]);
        });

        test('should handle path that visits exactly matrix width cells', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [3, 0];
            const matrix: number[][] = [[0, 0, 0, 0]];

            const { result } = dfsSearcher.search(start, end, matrix);

            expect(result).toEqual([
                [0, 0],
                [1, 0],
                [2, 0],
                [3, 0],
            ]);
        });

        test('should handle path that visits exactly matrix height cells', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [0, 3];
            const matrix: number[][] = [[0], [0], [0], [0]];

            const { result } = dfsSearcher.search(start, end, matrix);

            expect(result).toEqual([
                [0, 0],
                [0, 1],
                [0, 2],
                [0, 3],
            ]);
        });

        test('should correctly handle 3x1 matrix', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [0, 2];
            const matrix: number[][] = [[0], [0], [0]];

            const { result } = dfsSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual([0, 0]);
            expect(result[result.length - 1]).toEqual([0, 2]);
        });

        test('should correctly handle 1x3 matrix', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 0];
            const matrix: number[][] = [[0, 0, 0]];

            const { result } = dfsSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual([0, 0]);
            expect(result[result.length - 1]).toEqual([2, 0]);
        });

        test('should not have duplicate start node in path', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 2];
            const matrix: number[][] = [
                [0, 0, 0],
                [0, 0, 0],
                [0, 0, 0],
            ];

            const { result } = dfsSearcher.search(start, end, matrix);

            const startCount = result.filter(
                (coord) => coord[0] === start[0] && coord[1] === start[1]
            ).length;
            expect(startCount).toBe(1);
        });

        test('should have unique nodes in result path', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [3, 3];
            const matrix: number[][] = [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];

            const { result } = dfsSearcher.search(start, end, matrix);

            const uniqueNodes = new Set(result.map((p) => `${p[0]},${p[1]}`));
            expect(result.length).toBe(uniqueNodes.size);
        });

        test('should handle path with exactly 4 nodes', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [3, 0];
            const matrix: number[][] = [[0, 0, 0, 0]];

            const { result } = dfsSearcher.search(start, end, matrix);

            expect(result).toEqual([
                [0, 0],
                [1, 0],
                [2, 0],
                [3, 0],
            ]);
            expect(result.length).toBe(4);
        });

        test('should correctly reconstruct path of length 2', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [1, 0];
            const matrix: number[][] = [[0, 0]];

            const { result } = dfsSearcher.search(start, end, matrix);

            expect(result).toEqual([
                [0, 0],
                [1, 0],
            ]);
            expect(result.length).toBe(2);
        });

        test('should correctly handle path reconstruction when end is immediate neighbor', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [0, 1];
            const matrix: number[][] = [
                [0, 0],
                [0, 0],
            ];

            const { result } = dfsSearcher.search(start, end, matrix);

            expect(result).toEqual([
                [0, 0],
                [0, 1],
            ]);
            expect(result[0]).toEqual(start);
            expect(result[1]).toEqual(end);
        });

        // Mutant killer: Exact boundary test
        test('MUTANT-KILLER: exact path from [0,0] to [1,0] on edge', () => 
{
            const start: [number, number] = [0, 0];
            const end: [number, number] = [1, 0];
            const matrix: number[][] = [
                [0, 0, 1],
                [1, 1, 1],
                [1, 1, 1],
            ];

            const { result } = dfsSearcher.search(start, end, matrix);

            expect(result).toEqual([
                [0, 0],
                [1, 0],
            ]);
            expect(result.length).toBe(2);
        });

        // Mutant killer: 32x32 matrix boundary
        test('MUTANT-KILLER: path to [31,31] on 32x32 matrix', () => 
{
            const matrix: number[][] = Array(32)
                .fill(null)
                .map(() => Array(32).fill(0));

            const start: [number, number] = [0, 0];
            const end: [number, number] = [31, 31];

            const { result } = dfsSearcher.search(start, end, matrix);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual([0, 0]);
            expect(result[result.length - 1]).toEqual([31, 31]);
        });

        // Mutant killer: isolated start
        test('MUTANT-KILLER: isolated start returns empty', () => 
{
            const matrix: number[][] = [
                [0, 1],
                [1, 0],
            ];

            const start: [number, number] = [0, 0];
            const end: [number, number] = [1, 1];

            const { result, explored } = dfsSearcher.search(start, end, matrix);

            expect(result).toEqual([]);
            expect(explored).toEqual([[0, 0]]);
        });

        // Mutant killer: boundary conditions
        test('MUTANT-KILLER: boundary check at x=0', () => 
{
            const matrix: number[][] = [
                [0, 0, 0],
                [0, 1, 0],
                [0, 1, 0],
            ];

            const start: [number, number] = [0, 0];
            const end: [number, number] = [2, 2];

            const { result } = dfsSearcher.search(start, end, matrix);

            // Must go along left edge and bottom
            expect(result.length).toBeGreaterThan(0);
            expect(result[0]).toEqual([0, 0]);
            expect(result[result.length - 1]).toEqual([2, 2]);
        });

        // Mutant killer: boundary check at y=max
        test('MUTANT-KILLER: boundary check at y=max', () => 
{
            const matrix: number[][] = [
                [1, 1, 1],
                [1, 1, 1],
                [0, 0, 0],
            ];

            const start: [number, number] = [0, 2];
            const end: [number, number] = [2, 2];

            const { result } = dfsSearcher.search(start, end, matrix);

            expect(result).toEqual([
                [0, 2],
                [1, 2],
                [2, 2],
            ]);
        });

        // Mutant killer: parent reconstruction edge case
        test('MUTANT-KILLER: parent reconstruction with start as parent', () => 
{
            const matrix: number[][] = [
                [0, 0],
                [1, 0],
            ];

            const start: [number, number] = [0, 0];
            const end: [number, number] = [1, 1];

            const { result } = dfsSearcher.search(start, end, matrix);

            expect(result).toEqual([
                [0, 0],
                [1, 0],
                [1, 1],
            ]);
        });
    });
});
