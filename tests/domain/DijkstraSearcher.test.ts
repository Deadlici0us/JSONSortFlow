import { DijkstraSearcher } from '../../src/domain/DijkstraSearcher';
import { IGraph, PathResult } from '../../src/domain/types';

describe('DijkstraSearcher', () => {
    let graph: IGraph;
    let searcher: DijkstraSearcher;

    beforeEach(() => {
        graph = {
            nodes: [
                { id: 'A', x: 0, y: 0, weight: 0, neighbors: ['B', 'C'] },
                { id: 'B', x: 1, y: 0, weight: 1, neighbors: ['D'] },
                { id: 'C', x: 0, y: 1, weight: 2, neighbors: ['D'] },
                { id: 'D', x: 1, y: 1, weight: 0, neighbors: [] },
            ],
            edges: [
                { from: 'A', to: 'B', weight: 4 },
                { from: 'A', to: 'C', weight: 2 },
                { from: 'B', to: 'D', weight: 3 },
                { from: 'C', to: 'D', weight: 5 },
            ],
            isWeighted: true,
            isDirected: true,
        };
        searcher = new DijkstraSearcher(graph);
    });

    describe('ExecuteSearch', () => {
        it('should find shortest path from A to D', () => {
            const result: PathResult = searcher.ExecuteSearch('A', 'D');

            expect(result.found).toBe(true);
            expect(result.path).toEqual(['A', 'B', 'D']);
            expect(result.totalCost).toBe(8);
            expect(result.visited.length).toBeGreaterThan(0);
        });

        it('should handle identical start and end nodes', () => {
            const result: PathResult = searcher.ExecuteSearch('A', 'A');

            expect(result.found).toBe(true);
            expect(result.path).toEqual(['A']);
            expect(result.totalCost).toBe(0);
        });

        it('should return not found when no path exists', () => {
            const disconnectedGraph: IGraph = {
                nodes: [
                    { id: 'A', x: 0, y: 0, weight: 0, neighbors: [] },
                    { id: 'B', x: 1, y: 0, weight: 0, neighbors: [] },
                ],
                edges: [],
                isWeighted: false,
                isDirected: false,
            };
            const isolatedSearcher = new DijkstraSearcher(disconnectedGraph);
            const result: PathResult = isolatedSearcher.ExecuteSearch('A', 'B');

            expect(result.found).toBe(false);
            expect(result.path).toEqual([]);
            expect(result.totalCost).toBe(Infinity);
        });

        it('should handle empty graph', () => {
            const emptyGraph: IGraph = {
                nodes: [],
                edges: [],
                isWeighted: false,
                isDirected: false,
            };
            const emptySearcher = new DijkstraSearcher(emptyGraph);
            const result: PathResult = emptySearcher.ExecuteSearch('A', 'B');

            expect(result.found).toBe(false);
            expect(result.path).toEqual([]);
        });

        it('should handle zero-weight edges', () => {
            const zeroWeightGraph: IGraph = {
                nodes: [
                    { id: 'A', x: 0, y: 0, weight: 0, neighbors: ['B'] },
                    { id: 'B', x: 1, y: 0, weight: 0, neighbors: ['C'] },
                    { id: 'C', x: 2, y: 0, weight: 0, neighbors: [] },
                ],
                edges: [
                    { from: 'A', to: 'B', weight: 0 },
                    { from: 'B', to: 'C', weight: 0 },
                ],
                isWeighted: true,
                isDirected: true,
            };
            const zeroSearcher = new DijkstraSearcher(zeroWeightGraph);
            const result: PathResult = zeroSearcher.ExecuteSearch('A', 'C');

            expect(result.found).toBe(true);
            expect(result.path).toEqual(['A', 'B', 'C']);
            expect(result.totalCost).toBe(0);
        });

        it('should handle undirected graphs', () => {
            const undirectedGraph: IGraph = {
                nodes: [
                    { id: 'A', x: 0, y: 0, weight: 0, neighbors: ['B'] },
                    { id: 'B', x: 1, y: 0, weight: 0, neighbors: ['A'] },
                ],
                edges: [{ from: 'A', to: 'B', weight: 5 }],
                isWeighted: true,
                isDirected: false,
            };
            const undirectedSearcher = new DijkstraSearcher(undirectedGraph);
            const result: PathResult = undirectedSearcher.ExecuteSearch('B', 'A');

            expect(result.found).toBe(true);
            expect(result.path).toEqual(['B', 'A']);
        });

        it('should handle missing edge weights with default', () => {
            const noEdgeGraph: IGraph = {
                nodes: [
                    { id: 'A', x: 0, y: 0, weight: 0, neighbors: ['B'] },
                    { id: 'B', x: 1, y: 0, weight: 0, neighbors: [] },
                ],
                edges: [],
                isWeighted: false,
                isDirected: true,
            };
            const noEdgeSearcher = new DijkstraSearcher(noEdgeGraph);
            const result: PathResult = noEdgeSearcher.ExecuteSearch('A', 'B');

            expect(result.found).toBe(true);
            expect(result.path).toEqual(['A', 'B']);
            expect(result.totalCost).toBe(1);
        });
    });

    describe('Edge Cases', () => {
        it('should handle non-existent start node', () => {
            const result: PathResult = searcher.ExecuteSearch('X', 'D');

            expect(result.found).toBe(false);
        });

        it('should handle non-existent end node', () => {
            const result: PathResult = searcher.ExecuteSearch('A', 'X');

            expect(result.found).toBe(false);
        });

        it('should handle single node graph', () => {
            const singleNodeGraph: IGraph = {
                nodes: [{ id: 'A', x: 0, y: 0, weight: 0, neighbors: [] }],
                edges: [],
                isWeighted: false,
                isDirected: false,
            };
            const singleSearcher = new DijkstraSearcher(singleNodeGraph);
            const result: PathResult = singleSearcher.ExecuteSearch('A', 'A');

            expect(result.found).toBe(true);
            expect(result.path).toEqual(['A']);
        });

        it('should handle node with null neighbors array', () => {
            const nullNeighborGraph: IGraph = {
                nodes: [
                    { id: 'A', x: 0, y: 0, weight: 0, neighbors: [] },
                ],
                edges: [],
                isWeighted: false,
                isDirected: false,
            };
            const nullSearcher = new DijkstraSearcher(nullNeighborGraph);
            const result: PathResult = nullSearcher.ExecuteSearch('A', 'A');

            expect(result.found).toBe(true);
        });
    });
});
