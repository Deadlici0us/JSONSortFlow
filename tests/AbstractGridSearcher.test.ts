import { AbstractGridSearcher } from '../src/services/AbstractGridSearcher';

/**
 * Test implementation exposing protected methods for unit testing
 */
class TestableGridSearcher extends AbstractGridSearcher 
{
    /**
     *
     */
    public TestIsSameCoordinate(
        a: [number, number],
        b: [number, number]
    ): boolean 
{
        return this.IsSameCoordinate(a, b);
    }

    /**
     *
     */
    public TestCoordinateToString(coord: [number, number]): string 
{
        return this.CoordinateToString(coord);
    }

    /**
     *
     */
    public TestIsWithinBounds(
        x: number,
        y: number,
        matrix: number[][]
    ): boolean 
{
        return this.IsWithinBounds(x, y, matrix);
    }

    /**
     *
     */
    public TestGetValidNeighbors(
        coord: [number, number],
        matrix: number[][],
        visited?: Set<string>
    ): [number, number][] 
{
        return this.GetValidNeighbors(coord, matrix, visited);
    }

    /**
     *
     */
    public TestReconstructPath(
        parentMap: Map<string, [number, number]>,
        start: [number, number],
        end: [number, number]
    ): [number, number][] 
{
        return this.ReconstructPath(parentMap, start, end);
    }

    /**
     *
     */
    public TestIsPathValid(
        path: [number, number][],
        start: [number, number]
    ): boolean 
{
        return this.IsPathValid(path, start);
    }

    /**
     *
     */
    public TestNeedsStartPrepending(
        path: [number, number][],
        start: [number, number]
    ): boolean 
{
        return this.NeedsStartPrepending(path, start);
    }
}

describe('AbstractGridSearcher', () => 
{
    let searcher: TestableGridSearcher;
    let testMatrix: number[][];

    beforeEach(() => 
{
        searcher = new TestableGridSearcher();
        testMatrix = [
            [0, 0, 0, 0, 0],
            [0, 1, 1, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 1, 0],
            [0, 0, 0, 0, 0],
        ];
    });

    describe('IsSameCoordinate', () => 
{
        it('returns true for identical coordinates', () => 
{
            expect(searcher.TestIsSameCoordinate([0, 0], [0, 0])).toBe(true);
            expect(searcher.TestIsSameCoordinate([3, 4], [3, 4])).toBe(true);
        });

        it('returns false for different X coordinates', () => 
{
            expect(searcher.TestIsSameCoordinate([0, 0], [1, 0])).toBe(false);
            expect(searcher.TestIsSameCoordinate([5, 2], [6, 2])).toBe(false);
        });

        it('returns false for different Y coordinates', () => 
{
            expect(searcher.TestIsSameCoordinate([0, 0], [0, 1])).toBe(false);
            expect(searcher.TestIsSameCoordinate([2, 3], [2, 4])).toBe(false);
        });
    });

    describe('CoordinateToString', () => 
{
        it('converts coordinate to string format "x,y"', () => 
{
            expect(searcher.TestCoordinateToString([0, 0])).toBe('0,0');
            expect(searcher.TestCoordinateToString([10, 20])).toBe('10,20');
            expect(searcher.TestCoordinateToString([31, 31])).toBe('31,31');
        });
    });

    describe('IsWithinBounds', () => 
{
        it('returns true for valid coordinates within matrix', () => 
{
            expect(searcher.TestIsWithinBounds(0, 0, testMatrix)).toBe(true);
            expect(searcher.TestIsWithinBounds(4, 4, testMatrix)).toBe(true);
            expect(searcher.TestIsWithinBounds(2, 2, testMatrix)).toBe(true);
        });

        it('returns false for negative X coordinates', () => 
{
            expect(searcher.TestIsWithinBounds(-1, 2, testMatrix)).toBe(false);
        });

        it('returns false for negative Y coordinates', () => 
{
            expect(searcher.TestIsWithinBounds(2, -1, testMatrix)).toBe(false);
        });

        it('returns false for X beyond matrix width', () => 
{
            expect(searcher.TestIsWithinBounds(5, 2, testMatrix)).toBe(false);
            expect(searcher.TestIsWithinBounds(10, 2, testMatrix)).toBe(false);
        });

        it('returns false for Y beyond matrix height', () => 
{
            expect(searcher.TestIsWithinBounds(2, 5, testMatrix)).toBe(false);
            expect(searcher.TestIsWithinBounds(2, 10, testMatrix)).toBe(false);
        });
    });

    describe('GetValidNeighbors', () => 
{
        it('returns three neighbors when one is blocked by obstacle', () => 
{
            const neighbors = searcher.TestGetValidNeighbors(
                [2, 2],
                testMatrix
            );
            expect(neighbors).toHaveLength(3);
            expect(neighbors).not.toContainEqual([2, 1]);
            expect(neighbors).toContainEqual([2, 3]);
            expect(neighbors).toContainEqual([1, 2]);
            expect(neighbors).toContainEqual([3, 2]);
        });

        it('returns exactly North, South, West, East directions in order', () => 
{
            const neighbors = searcher.TestGetValidNeighbors(
                [2, 2],
                testMatrix
            );
            // Expected order: North (filtered), South [2,3], West [1,2], East [3,2]
            expect(neighbors).toEqual([
                [2, 3],
                [1, 2],
                [3, 2],
            ]);
        });

        it('returns neighbors in correct order when North and South both valid', () => 
{
            const neighbors = searcher.TestGetValidNeighbors(
                [2, 3],
                testMatrix
            );
            // Expected order: North [2,2], South [2,4], West [1,3], East (filtered)
            expect(neighbors).toEqual([
                [2, 2],
                [2, 4],
                [1, 3],
            ]);
        });

        it('calculates correct neighbor coordinates at boundary', () => 
{
            const neighbors = searcher.TestGetValidNeighbors(
                [0, 0],
                testMatrix
            );
            expect(neighbors).toHaveLength(2);
            expect(neighbors).toContainEqual([1, 0]);
            expect(neighbors).toContainEqual([0, 1]);
            expect(neighbors).not.toContainEqual([-1, 0]);
            expect(neighbors).not.toContainEqual([0, -1]);
        });

        it('calculates correct neighbors with visited set', () => 
{
            const visited = new Set<string>(['0,1']);
            const neighbors = searcher.TestGetValidNeighbors(
                [0, 0],
                testMatrix,
                visited
            );
            expect(neighbors).toEqual([[1, 0]]);
            expect(neighbors).not.toContainEqual([0, 1]);
        });

        it('filters out obstacle cells (value 1)', () => 
{
            const neighbors = searcher.TestGetValidNeighbors(
                [1, 1],
                testMatrix
            );
            expect(neighbors).not.toContainEqual([2, 1]);
            expect(neighbors).toHaveLength(3);
        });

        it('filters out out-of-bounds neighbors', () => 
{
            const neighbors = searcher.TestGetValidNeighbors(
                [0, 0],
                testMatrix
            );
            expect(neighbors).toHaveLength(2);
            expect(neighbors).toContainEqual([1, 0]);
            expect(neighbors).toContainEqual([0, 1]);
            expect(neighbors).not.toContainEqual([-1, 0]);
            expect(neighbors).not.toContainEqual([0, -1]);
        });

        it('filters out visited coordinates when visited set provided', () => 
{
            const visited = new Set<string>(['1,0', '0,1']);
            const neighbors = searcher.TestGetValidNeighbors(
                [0, 0],
                testMatrix,
                visited
            );
            expect(neighbors).toHaveLength(0);
        });

        it('returns valid neighbors for cell with mixed obstacles', () => 
{
            const neighbors = searcher.TestGetValidNeighbors(
                [2, 1],
                testMatrix
            );
            expect(neighbors).toHaveLength(3);
        });
    });

    describe('ReconstructPath', () => 
{
        it('returns correct path when parentMap is complete', () => 
{
            const parentMap = new Map<string, [number, number]>();
            parentMap.set('0,0', [0, 0]);
            parentMap.set('1,0', [0, 0]);
            parentMap.set('2,0', [1, 0]);
            parentMap.set('2,1', [2, 0]);

            const path = searcher.TestReconstructPath(
                parentMap,
                [0, 0],
                [2, 1]
            );
            expect(path).toEqual([
                [0, 0],
                [1, 0],
                [2, 0],
                [2, 1],
            ]);
            expect(path.filter((p) => p[0] === 0 && p[1] === 0)).toHaveLength(
                1
            );
        });

        it('returns single coordinate when start equals end', () => 
{
            const parentMap = new Map<string, [number, number]>();
            const path = searcher.TestReconstructPath(
                parentMap,
                [0, 0],
                [0, 0]
            );
            expect(path).toEqual([[0, 0]]);
        });

        it('returns empty array when path cannot be reconstructed', () => 
{
            const parentMap = new Map<string, [number, number]>();
            const path = searcher.TestReconstructPath(
                parentMap,
                [0, 0],
                [2, 2]
            );
            expect(path).toEqual([]);
        });

        it('handles path that terminates at start correctly', () => 
{
            const parentMap = new Map<string, [number, number]>();
            parentMap.set('1,0', [0, 0]);
            parentMap.set('2,0', [1, 0]);

            const path = searcher.TestReconstructPath(
                parentMap,
                [0, 0],
                [2, 0]
            );
            expect(path).toEqual([
                [0, 0],
                [1, 0],
                [2, 0],
            ]);
            expect(path.filter((p) => p[0] === 0 && p[1] === 0)).toHaveLength(
                1
            );
        });

        it('safely handles undefined parent without infinite loop', () => 
{
            const parentMap = new Map<string, [number, number]>();
            parentMap.set('1,0', [0, 0]);
            const path = searcher.TestReconstructPath(
                parentMap,
                [0, 0],
                [2, 0]
            );
            expect(path).toEqual([]);
        });

        it('does not duplicate start coordinate when already in path', () => 
{
            const parentMap = new Map<string, [number, number]>();
            parentMap.set('1,0', [0, 0]);
            parentMap.set('0,0', [0, 0]);

            const path = searcher.TestReconstructPath(
                parentMap,
                [0, 0],
                [1, 0]
            );
            expect(path).toEqual([
                [0, 0],
                [1, 0],
            ]);
            const startCount = path.filter(
                (p) => p[0] === 0 && p[1] === 0
            ).length;
            expect(startCount).toBe(1);
        });

        it('handles self-referential parent map for start coordinate', () => 
{
            const parentMap = new Map<string, [number, number]>();
            parentMap.set('0,0', [0, 0]);

            const path = searcher.TestReconstructPath(
                parentMap,
                [0, 0],
                [0, 0]
            );
            expect(path).toEqual([[0, 0]]);
            expect(path.length).toBe(1);
        });
    });

    describe('IsPathValid', () => 
{
        it('returns false for empty path', () => 
{
            const result = searcher.TestIsPathValid([], [0, 0]);
            expect(result).toBe(false);
        });

        it('returns true when path starts with start', () => 
{
            const result = searcher.TestIsPathValid(
                [
                    [0, 0],
                    [1, 0],
                ],
                [0, 0]
            );
            expect(result).toBe(true);
        });

        it('returns false when path does not start with start', () => 
{
            const result = searcher.TestIsPathValid(
                [
                    [1, 0],
                    [2, 0],
                ],
                [0, 0]
            );
            expect(result).toBe(false);
        });
    });

    describe('NeedsStartPrepending', () => 
{
        it('returns false for empty path', () => 
{
            const result = searcher.TestNeedsStartPrepending([], [0, 0]);
            expect(result).toBe(false);
        });

        it('returns true when path does not start with start', () => 
{
            const result = searcher.TestNeedsStartPrepending([[1, 0]], [0, 0]);
            expect(result).toBe(true);
        });

        it('returns false when path already starts with start', () => 
{
            const result = searcher.TestNeedsStartPrepending(
                [
                    [0, 0],
                    [1, 0],
                ],
                [0, 0]
            );
            expect(result).toBe(false);
        });
    });
});
