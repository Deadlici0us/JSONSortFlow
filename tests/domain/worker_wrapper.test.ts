import { workerHandler } from '../../src/domain/worker_wrapper';
import { WorkerData, SearchResult } from '../../src/domain/types';

describe('workerHandler', () => {
    const validWorkerData: WorkerData = {
        graph: {
            nodes: [
                { id: 'A', x: 0, y: 0, weight: 0, neighbors: ['B'] },
                { id: 'B', x: 1, y: 0, weight: 0, neighbors: ['C'] },
                { id: 'C', x: 2, y: 0, weight: 0, neighbors: [] },
            ],
            edges: [
                { from: 'A', to: 'B', weight: 1 },
                { from: 'B', to: 'C', weight: 1 },
            ],
            isWeighted: true,
            isDirected: true,
        },
        startId: 'A',
        endId: 'C',
    };

    describe('Valid inputs', () => {
        it('should return successful search result', () => {
            const result: SearchResult = workerHandler(validWorkerData);

            expect(result.error).toBeUndefined();
            expect(result.result).toBeDefined();
            expect(result.result?.found).toBe(true);
            expect(result.result?.path).toEqual(['A', 'B', 'C']);
        });

        it('should handle start equals end', () => {
            const data: WorkerData = {
                ...validWorkerData,
                startId: 'B',
                endId: 'B',
            };
            const result: SearchResult = workerHandler(data);

            expect(result.error).toBeUndefined();
            expect(result.result?.found).toBe(true);
            expect(result.result?.path).toEqual(['B']);
        });
    });

    describe('Invalid inputs', () => {
        it('should handle missing start node', () => {
            const data: WorkerData = {
                ...validWorkerData,
                startId: 'X',
            };
            const result: SearchResult = workerHandler(data);

            expect(result.error).toBeDefined();
            expect(result.error).toContain('Start node');
            expect(result.result).toBeUndefined();
        });

        it('should handle missing end node', () => {
            const data: WorkerData = {
                ...validWorkerData,
                endId: 'X',
            };
            const result: SearchResult = workerHandler(data);

            expect(result.error).toBeDefined();
            expect(result.error).toContain('End node');
            expect(result.result).toBeUndefined();
        });

        it('should handle empty startId', () => {
            const data: WorkerData = {
                ...validWorkerData,
                startId: '',
            };
            const result: SearchResult = workerHandler(data);

            expect(result.error).toBeDefined();
            expect(result.error).toContain('Invalid worker data');
        });

        it('should handle empty endId', () => {
            const data: WorkerData = {
                ...validWorkerData,
                endId: '',
            };
            const result: SearchResult = workerHandler(data);

            expect(result.error).toBeDefined();
            expect(result.error).toContain('Invalid worker data');
        });

        it('should handle empty graph nodes', () => {
            const data: WorkerData = {
                graph: {
                    nodes: [],
                    edges: [],
                    isWeighted: false,
                    isDirected: false,
                },
                startId: 'A',
                endId: 'B',
            };
            const result: SearchResult = workerHandler(data);

            expect(result.error).toBeDefined();
        });

        it('should handle graph with no path', () => {
            const data: WorkerData = {
                graph: {
                    nodes: [
                        { id: 'A', x: 0, y: 0, weight: 0, neighbors: [] },
                        { id: 'B', x: 1, y: 0, weight: 0, neighbors: [] },
                    ],
                    edges: [],
                    isWeighted: false,
                    isDirected: false,
                },
                startId: 'A',
                endId: 'B',
            };
            const result: SearchResult = workerHandler(data);

            expect(result.error).toBeUndefined();
            expect(result.result?.found).toBe(false);
        });
    });

    describe('Edge cases', () => {
        it('should handle large weights', () => {
            const data: WorkerData = {
                graph: {
                    nodes: [
                        { id: 'A', x: 0, y: 0, weight: 1000000, neighbors: ['B'] },
                        { id: 'B', x: 1, y: 0, weight: 1000000, neighbors: [] },
                    ],
                    edges: [{ from: 'A', to: 'B', weight: 1000000 }],
                    isWeighted: true,
                    isDirected: true,
                },
                startId: 'A',
                endId: 'B',
            };
            const result: SearchResult = workerHandler(data);

            expect(result.error).toBeUndefined();
            expect(result.result?.found).toBe(true);
            expect(result.result?.totalCost).toBe(2000000);
        });

        it('should handle single edge graph', () => {
            const data: WorkerData = {
                graph: {
                    nodes: [
                        { id: 'A', x: 0, y: 0, weight: 0, neighbors: ['B'] },
                        { id: 'B', x: 1, y: 0, weight: 0, neighbors: [] },
                    ],
                    edges: [{ from: 'A', to: 'B', weight: 5 }],
                    isWeighted: true,
                    isDirected: true,
                },
                startId: 'A',
                endId: 'B',
            };
            const result: SearchResult = workerHandler(data);

            expect(result.error).toBeUndefined();
            expect(result.result?.path).toEqual(['A', 'B']);
        });
    });
});
