import request from 'supertest';
import App from '../src/app';

describe('Search Endpoints Integration', () => {
    const app = new App().GetApp();
    const createValidSearchPayload = (): {
        matrix: number[][];
        start: [number, number];
        end: [number, number];
    } => {
        const matrix: number[][] = [];
        for (let i = 0; i < 32; i++) {
            const row: number[] = [];
            for (let j = 0; j < 32; j++) {
                row.push(0);
            }
            matrix.push(row);
        }
        return {
            matrix,
            start: [0, 0],
            end: [31, 31],
        };
    };

    describe('POST /bfs-search', () => {
        it('should return 200 OK with correct JSON shape for valid payload', () => {
            return request(app)
                .post('/bfs-search')
                .send(createValidSearchPayload())
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('explored');
                    expect(response.body).toHaveProperty('result');
                    expect(Array.isArray(response.body.explored)).toBe(true);
                    expect(Array.isArray(response.body.result)).toBe(true);
                });
        });

        it('should return 400 for invalid payload - missing matrix', () => {
            return request(app).post('/bfs-search').send({
                start: [0, 0],
                end: [31, 31],
            }).expect(400);
        });

        it('should return 400 for invalid payload - missing start', () => {
            return request(app).post('/bfs-search').send({
                matrix: [],
                end: [31, 31],
            }).expect(400);
        });

        it('should return 400 for invalid payload - missing end', () => {
            return request(app).post('/bfs-search').send({
                matrix: [],
                start: [0, 0],
            }).expect(400);
        });
    });

    describe('POST /astar-search', () => {
        it('should return 200 OK with correct JSON shape for valid payload', () => {
            return request(app)
                .post('/astar-search')
                .send(createValidSearchPayload())
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('explored');
                    expect(response.body).toHaveProperty('result');
                    expect(Array.isArray(response.body.explored)).toBe(true);
                    expect(Array.isArray(response.body.result)).toBe(true);
                });
        });

        it('should return 400 for invalid payload - missing matrix', () => {
            return request(app).post('/astar-search').send({
                start: [0, 0],
                end: [31, 31],
            }).expect(400);
        });

        it('should return 400 for invalid payload - missing start', () => {
            return request(app).post('/astar-search').send({
                matrix: [],
                end: [31, 31],
            }).expect(400);
        });

        it('should return 400 for invalid payload - missing end', () => {
            return request(app).post('/astar-search').send({
                matrix: [],
                start: [0, 0],
            }).expect(400);
        });
    });

    describe('POST /dfs-search', () => {
        it('should return 200 OK with correct JSON shape for valid payload', () => {
            return request(app)
                .post('/dfs-search')
                .send(createValidSearchPayload())
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('explored');
                    expect(response.body).toHaveProperty('result');
                    expect(Array.isArray(response.body.explored)).toBe(true);
                    expect(Array.isArray(response.body.result)).toBe(true);
                });
        });

        it('should return 400 for invalid payload - missing matrix', () => {
            return request(app).post('/dfs-search').send({
                start: [0, 0],
                end: [31, 31],
            }).expect(400);
        });

        it('should return 400 for invalid payload - missing start', () => {
            return request(app).post('/dfs-search').send({
                matrix: [],
                end: [31, 31],
            }).expect(400);
        });

        it('should return 400 for invalid payload - missing end', () => {
            return request(app).post('/dfs-search').send({
                matrix: [],
                start: [0, 0],
            }).expect(400);
        });
    });

    describe('POST /dijkstra-search', () => {
        it('should return 200 OK with correct JSON shape for valid payload', () => {
            return request(app)
                .post('/dijkstra-search')
                .send(createValidSearchPayload())
                .expect(200)
                .then((response) => {
                    expect(response.body).toHaveProperty('explored');
                    expect(response.body).toHaveProperty('result');
                    expect(Array.isArray(response.body.explored)).toBe(true);
                    expect(Array.isArray(response.body.result)).toBe(true);
                });
        });

        it('should return 400 for invalid payload - missing matrix', () => {
            return request(app).post('/dijkstra-search').send({
                start: [0, 0],
                end: [31, 31],
            }).expect(400);
        });

        it('should return 400 for invalid payload - missing start', () => {
            return request(app).post('/dijkstra-search').send({
                matrix: [],
                end: [31, 31],
            }).expect(400);
        });

        it('should return 400 for invalid payload - missing end', () => {
            return request(app).post('/dijkstra-search').send({
                matrix: [],
                start: [0, 0],
            }).expect(400);
        });
    });

    describe('Error handling', () => {
        it('should trigger HandlerCollection for unhandled exceptions', () => {
            const invalidPayload = {
                matrix: 'not-an-array',
                start: 'invalid',
                end: 'invalid',
            };
            return request(app).post('/bfs-search').send(invalidPayload).expect(400);
        });

        it('should trigger HandlerCollection for astar unhandled exceptions', () => {
            const invalidPayload = {
                matrix: 'not-an-array',
                start: 'invalid',
                end: 'invalid',
            };
            return request(app).post('/astar-search').send(invalidPayload).expect(400);
        });

        it('should trigger HandlerCollection for dfs unhandled exceptions', () => {
            const invalidPayload = {
                matrix: 'not-an-array',
                start: 'invalid',
                end: 'invalid',
            };
            return request(app).post('/dfs-search').send(invalidPayload).expect(400);
        });

        it('should trigger HandlerCollection for dijkstra unhandled exceptions', () => {
            const invalidPayload = {
                matrix: 'not-an-array',
                start: 'invalid',
                end: 'invalid',
            };
            return request(app).post('/dijkstra-search').send(invalidPayload).expect(400);
        });

        it('should return 400 for null values - catches in validation', () => {
            return request(app)
                .post('/bfs-search')
                .send({ matrix: null, start: null, end: null })
                .expect(400)
                .then((response) => {
                    expect(response.body.error).toBe('BadRequestError');
                });
        });

        it('should return 400 for undefined values with exact error type', () => {
            return request(app)
                .post('/astar-search')
                .send({ matrix: undefined, start: undefined, end: undefined })
                .expect(400)
                .then((response) => {
                    expect(response.body.error).toBe('BadRequestError');
                });
        });
    });

    describe('Infrastructure Mutant Killers', () => {
        it('MUTANT-KILLER: verify 400 status is not 401 for all search endpoints', () => {
            const endpoints = ['/bfs-search', '/astar-search', '/dfs-search', '/dijkstra-search'];
            const promises = endpoints.map((endpoint) =>
                request(app)
                    .post(endpoint)
                    .send({ start: [0, 0], end: [31, 31] })
                    .expect(400)
                    .then((response) => {
                        expect(response.status).toBe(400);
                        expect(response.status).not.toBe(401);
                        expect(response.status).not.toBe(500);
                    })
            );
            return Promise.all(promises);
        });

        it('MUTANT-KILLER: verify exact error message is "BadRequestError" for validation errors', () => {
            return request(app)
                .post('/bfs-search')
                .send({ start: [0, 0], end: [31, 31] })
                .expect(400)
                .then((response) => {
                    expect(response.body.error).toBe('BadRequestError');
                });
        });

        it('MUTANT-KILLER: verify matrix validation catches non-2D arrays', () => {
            return request(app)
                .post('/bfs-search')
                .send({ matrix: [1, 2, 3], start: [0, 0], end: [31, 31] })
                .expect(400)
                .then((response) => {
                    expect(response.body.message).toContain('2D array');
                });
        });

        it('MUTANT-KILLER: verify coordinate tuple validation', () => {
            const matrix = Array(32).fill(null).map(() => Array(32).fill(0));
            return request(app)
                .post('/bfs-search')
                .send({ matrix, start: [0], end: [31, 31] })
                .expect(400)
                .then((response) => {
                    expect(response.body.message).toContain('tuple');
                });
        });

        it('MUTANT-KILLER: verify matrix value validation catches value 2', () => {
            const matrix = Array(32).fill(null).map(() => Array(32).fill(0));
            matrix[1][1] = 2;
            return request(app)
                .post('/bfs-search')
                .send({ matrix, start: [0, 0], end: [31, 31] })
                .expect(400)
                .then((response) => {
                    expect(response.body.message).toContain('0 (free) or 1 (obstacle)');
                });
        });

        it('MUTANT-KILLER: verify matrix value validation catches negative values', () => {
            const matrix = Array(32).fill(null).map(() => Array(32).fill(0));
            matrix[1][1] = -1;
            return request(app)
                .post('/bfs-search')
                .send({ matrix, start: [0, 0], end: [31, 31] })
                .expect(400)
                .then((response) => {
                    expect(response.body.message).toContain('0 (free) or 1 (obstacle)');
                });
        });
    });
});
