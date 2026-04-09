/**
 * ISearcher interface defines the contract for grid search algorithms.
 * Ensures strictly typed input/output for pathfinding operations.
 *
 * @interface ISearcher
 * @since 1.0.0
 */
export interface ISearcher {
    /**
     * Searches for a path from start to end coordinates in a grid matrix.
     *
     * @param start - Starting coordinate as [x, y] tuple
     * @param end - Ending coordinate as [x, y] tuple
     * @param matrix - 2D grid matrix where 0 = free space, 1 = obstacle
     * @returns Object containing explored cells and resulting path
     *
     * @example
     * ```typescript
     * const result = searcher.search([0, 0], [31, 31], matrix);
     * // { explored: [[0,0], [1,0], ...], result: [[0,0], [1,0], ...] }
     * ```
     */
    search(
        start: [number, number],
        end: [number, number],
        matrix: number[][]
    ): {
        explored: [number, number][];
        result: [number, number][];
    };
}
