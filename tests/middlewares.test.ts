import request from 'supertest';
import App from '../src/app';
import { NotFoundError } from '../src/errorhandling/NotFoundError';
import { BadRequestError } from '../src/errorhandling/BadRequestError';

describe('Middleware Infrastructure Tests', () => {
    const app = new App().GetApp();
    describe('HTTP Status Code Strict Assertions', () => {
        it('should return exactly 400 (not 401) for missing matrix in bfs-search', () => {
            return request(app)
                .post('/bfs-search')
                .send({ start: [0, 0], end: [31, 31] })
                .expect(400)
                .then((response) => {
                    expect(response.status).toBe(400);
                    expect(response.status).not.toBe(401);
                    expect(response.body).toHaveProperty('error');
                    expect(response.body).toHaveProperty('message');
                });
        });

        it('should return exactly 400 (not 401) for missing matrix in astar-search', () => {
            return request(app)
                .post('/astar-search')
                .send({ start: [0, 0], end: [31, 31] })
                .expect(400)
                .then((response) => {
                    expect(response.status).toBe(400);
                    expect(response.status).not.toBe(401);
                });
        });

        it('should return exactly 400 (not 401) for missing matrix in dfs-search', () => {
            return request(app)
                .post('/dfs-search')
                .send({ start: [0, 0], end: [31, 31] })
                .expect(400)
                .then((response) => {
                    expect(response.status).toBe(400);
                    expect(response.status).not.toBe(401);
                });
        });

        it('should return exactly 400 (not 401) for missing matrix in dijkstra-search', () => {
            return request(app)
                .post('/dijkstra-search')
                .send({ start: [0, 0], end: [31, 31] })
                .expect(400)
                .then((response) => {
                    expect(response.status).toBe(400);
                    expect(response.status).not.toBe(401);
                });
        });

        it('should return exactly 400 (not 401) for missing numbers in bubble-sort', () => {
            return request(app)
                .post('/bubble-sort')
                .send({})
                .expect(400)
                .then((response) => {
                    expect(response.status).toBe(400);
                    expect(response.status).not.toBe(401);
                });
        });

        it('should return exactly 400 (not 401) for missing numbers in quick-sort', () => {
            return request(app)
                .post('/quick-sort')
                .send({})
                .expect(400)
                .then((response) => {
                    expect(response.status).toBe(400);
                    expect(response.status).not.toBe(401);
                });
        });

        it('should return exactly 400 (not 401) for missing numbers in merge-sort', () => {
            return request(app)
                .post('/merge-sort')
                .send({})
                .expect(400)
                .then((response) => {
                    expect(response.status).toBe(400);
                    expect(response.status).not.toBe(401);
                });
        });
    });

    describe('Strict Error Message Assertions', () => {
        it('should return exact error message for missing matrix', () => {
            return request(app)
                .post('/bfs-search')
                .send({ start: [0, 0], end: [31, 31] })
                .expect(400)
                .then((response) => {
                    expect(response.body.error).toBe('BadRequestError');
                    expect(response.body.message).toContain('Matrix');
                });
        });

        it('should return exact error message for invalid matrix type', () => {
            return request(app)
                .post('/bfs-search')
                .send({ matrix: 'not-an-array', start: [0, 0], end: [31, 31] })
                .expect(400)
                .then((response) => {
                    expect(response.body.error).toBe('BadRequestError');
                    expect(response.body.message).toContain('Matrix must be a 2D array');
                });
        });

        it('should return exact error message for out of bounds start', () => {
            const matrix = Array(32).fill(null).map(() => Array(32).fill(0));
            return request(app)
                .post('/bfs-search')
                .send({ matrix, start: [32, 0], end: [31, 31] })
                .expect(400)
                .then((response) => {
                    expect(response.body.error).toBe('BadRequestError');
                    expect(response.body.message).toContain('Start coordinate out of bounds');
                });
        });

        it('should return exact error message for out of bounds end', () => {
            const matrix = Array(32).fill(null).map(() => Array(32).fill(0));
            return request(app)
                .post('/bfs-search')
                .send({ matrix, start: [0, 0], end: [-1, 31] })
                .expect(400)
                .then((response) => {
                    expect(response.body.error).toBe('BadRequestError');
                    expect(response.body.message).toContain('End coordinate out of bounds');
                });
        });

        it('should return exact error message for blocked start position', () => {
            const matrix = Array(32).fill(null).map(() => Array(32).fill(0));
            matrix[0][0] = 1;
            return request(app)
                .post('/bfs-search')
                .send({ matrix, start: [0, 0], end: [31, 31] })
                .expect(400)
                .then((response) => {
                    expect(response.body.error).toBe('BadRequestError');
                    expect(response.body.message).toContain('Start position is blocked by obstacle');
                });
        });

        it('should return exact error message for blocked end position', () => {
            const matrix = Array(32).fill(null).map(() => Array(32).fill(0));
            matrix[31][31] = 1;
            return request(app)
                .post('/bfs-search')
                .send({ matrix, start: [0, 0], end: [31, 31] })
                .expect(400)
                .then((response) => {
                    expect(response.body.error).toBe('BadRequestError');
                    expect(response.body.message).toContain('End position is blocked by obstacle');
                });
        });

        it('should return exact error message for invalid matrix dimensions', () => {
            const smallMatrix = Array(31).fill(null).map(() => Array(31).fill(0));
            return request(app)
                .post('/bfs-search')
                .send({ matrix: smallMatrix, start: [0, 0], end: [30, 30] })
                .expect(400)
                .then((response) => {
                    expect(response.body.error).toBe('BadRequestError');
                    expect(response.body.message).toContain('Matrix dimensions must be exactly 32x32');
                });
        });

        it('should return exact error message for invalid matrix values', () => {
            const matrix = Array(32).fill(null).map(() => Array(32).fill(0));
            matrix[0][1] = 2;
            return request(app)
                .post('/bfs-search')
                .send({ matrix, start: [0, 0], end: [31, 31] })
                .expect(400)
                .then((response) => {
                    expect(response.body.error).toBe('BadRequestError');
                    expect(response.body.message).toContain('Matrix must contain only 0');
                });
        });
    });

    describe('404 Not Found Handler', () => {
        it('should return 404 for non-existent endpoint', () => {
            return request(app)
                .get('/non-existent')
                .expect(404)
                .then((response) => {
                    expect(response.status).toBe(404);
                    expect(response.body).toHaveProperty('error');
                    expect(response.body.error).toBe('Not Found Error.');
                });
        });

        it('should return 404 for POST to non-existent endpoint', () => {
            return request(app)
                .post('/fake-endpoint')
                .expect(404)
                .then((response) => {
                    expect(response.status).toBe(404);
                    expect(response.body.error).toBe('Not Found Error.');
                });
        });

        it('should return 404 for PUT to non-existent endpoint', () => {
            return request(app)
                .put('/invalid-route')
                .expect(404)
                .then((response) => {
                    expect(response.status).toBe(404);
                });
        });

        it('should return 404 for DELETE to non-existent endpoint', () => {
            return request(app)
                .delete('/does-not-exist')
                .expect(404)
                .then((response) => {
                    expect(response.status).toBe(404);
                });
        });
    });

    describe('500 Internal Server Error Handler', () => {
        it('should return 400 for completely invalid request payload', () => {
            return request(app)
                .post('/bfs-search')
                .send({
                    matrix: null,
                    start: null,
                    end: null
                })
                .expect(400)
                .then((response) => {
                    expect(response.status).toBe(400);
                    expect(response.body.error).toBe('BadRequestError');
                });
        });

        it('should return 400 for completely malformed JSON with 500', () => {
            return request(app)
                .post('/bfs-search')
                .set('Content-Type', 'application/json')
                .send('{ invalid json }')
                .expect(500)
                .then((response) => {
                    expect(response.status).toBe(500);
                    expect(response.body.error).toBe('Internal Server Error.');
                });
        });
    });

    describe('Middleware Error Fallthrough - Absolute Bounds', () => {
        it('should handle matrix with exactly 32 rows but 31 columns', () => {
            const matrix = Array(32).fill(null).map(() => Array(31).fill(0));
            return request(app)
                .post('/bfs-search')
                .send({ matrix, start: [0, 0], end: [30, 30] })
                .expect(400)
                .then((response) => {
                    expect(response.status).toBe(400);
                    expect(response.body.message).toContain('Matrix dimensions must be exactly 32x32');
                });
        });

        it('should handle matrix with exactly 31 rows but 32 columns', () => {
            const matrix = Array(31).fill(null).map(() => Array(32).fill(0));
            return request(app)
                .post('/bfs-search')
                .send({ matrix, start: [0, 0], end: [30, 31] })
                .expect(400)
                .then((response) => {
                    expect(response.status).toBe(400);
                    expect(response.body.message).toContain('Matrix dimensions must be exactly 32x32');
                });
        });

        it('should handle coordinate at exact upper bound [31, 31]', () => {
            const matrix = Array(32).fill(null).map(() => Array(32).fill(0));
            return request(app)
                .post('/bfs-search')
                .send({ matrix, start: [0, 0], end: [31, 31] })
                .expect(200);
        });

        it('should handle coordinate at exact lower bound [0, 0]', () => {
            const matrix = Array(32).fill(null).map(() => Array(32).fill(0));
            return request(app)
                .post('/bfs-search')
                .send({ matrix, start: [0, 0], end: [1, 1] })
                .expect(200);
        });

        it('should reject coordinate at exactly 32 (one past valid)', () => {
            const matrix = Array(32).fill(null).map(() => Array(32).fill(0));
            return request(app)
                .post('/bfs-search')
                .send({ matrix, start: [32, 0], end: [31, 31] })
                .expect(400)
                .then((response) => {
                    expect(response.body.message).toContain('Start coordinate out of bounds');
                });
        });

        it('should reject coordinate at exactly -1 (one below valid)', () => {
            const matrix = Array(32).fill(null).map(() => Array(32).fill(0));
            return request(app)
                .post('/bfs-search')
                .send({ matrix, start: [-1, 0], end: [31, 31] })
                .expect(400)
                .then((response) => {
                    expect(response.body.message).toContain('Start coordinate out of bounds');
                });
        });
    });

    describe('HandlerCollection Pass-Through Behavior', () => {
        it('should pass NotFoundError to NotFoundErrorHandler (not DefaultErrorHandler)', () => {
            return request(app)
                .get('/not-found-route')
                .expect(404)
                .then((response) => {
                    expect(response.body.error).toBe('Not Found Error.');
                    expect(response.body.error).not.toBe('Internal Server Error.');
                });
        });

        it('should pass BadRequestError to BadRequestErrorHandler (not UnexpectedErrorHandler)', () => {
            return request(app)
                .post('/bubble-sort')
                .send({})
                .expect(400)
                .then((response) => {
                    expect(response.body.error).toBe('Bad Request');
                    expect(response.body.error).not.toBe('Internal Server Error.');
                });
        });

        it('should pass undefined values to BadRequestErrorHandler with 400', () => {
            return request(app)
                .post('/bfs-search')
                .send({ matrix: undefined, start: undefined, end: undefined })
                .expect(400)
                .then((response) => {
                    expect(response.status).toBe(400);
                    expect(response.body.error).toBe('BadRequestError');
                });
        });
    });

    describe('Validation Operator Mutations (&& vs ||)', () => {
        it('should reject when start has invalid x but valid y', () => {
            const matrix = Array(32).fill(null).map(() => Array(32).fill(0));
            return request(app)
                .post('/bfs-search')
                .send({ matrix, start: [50, 0], end: [31, 31] })
                .expect(400)
                .then((response) => {
                    expect(response.body.error).toBe('BadRequestError');
                    expect(response.body.message).toContain('Start coordinate out of bounds');
                });
        });

        it('should reject when start has valid x but invalid y', () => {
            const matrix = Array(32).fill(null).map(() => Array(32).fill(0));
            return request(app)
                .post('/bfs-search')
                .send({ matrix, start: [0, 50], end: [31, 31] })
                .expect(400)
                .then((response) => {
                    expect(response.body.error).toBe('BadRequestError');
                    expect(response.body.message).toContain('Start coordinate out of bounds');
                });
        });

        it('should reject when end has invalid x but valid y', () => {
            const matrix = Array(32).fill(null).map(() => Array(32).fill(0));
            return request(app)
                .post('/bfs-search')
                .send({ matrix, start: [0, 0], end: [50, 0] })
                .expect(400)
                .then((response) => {
                    expect(response.body.error).toBe('BadRequestError');
                    expect(response.body.message).toContain('End coordinate out of bounds');
                });
        });

        it('should reject when end has valid x but invalid y', () => {
            const matrix = Array(32).fill(null).map(() => Array(32).fill(0));
            return request(app)
                .post('/bfs-search')
                .send({ matrix, start: [0, 0], end: [0, 50] })
                .expect(400)
                .then((response) => {
                    expect(response.body.error).toBe('BadRequestError');
                    expect(response.body.message).toContain('End coordinate out of bounds');
                });
        });

        it('should reject when both x and y are invalid', () => {
            const matrix = Array(32).fill(null).map(() => Array(32).fill(0));
            return request(app)
                .post('/bfs-search')
                .send({ matrix, start: [50, 50], end: [31, 31] })
                .expect(400)
                .then((response) => {
                    expect(response.body.error).toBe('BadRequestError');
                    expect(response.body.message).toContain('Start coordinate out of bounds');
                });
        });
    });

    describe('Sort Validation Mutations', () => {
        it('should reject numbers array with value 100 (above max 99)', () => {
            return request(app)
                .post('/bubble-sort')
                .send({ numbers: [1, 2, 100] })
                .expect(400)
                .then((response) => {
                    expect(response.body.error).toBe('Bad Request');
                });
        });

        it('should reject numbers array with value -1 (below min 0)', () => {
            return request(app)
                .post('/bubble-sort')
                .send({ numbers: [1, 2, -1] })
                .expect(400)
                .then((response) => {
                    expect(response.body.error).toBe('Bad Request');
                });
        });

        it('should accept numbers array with value 99 (exact max)', () => {
            return request(app)
                .post('/bubble-sort')
                .send({ numbers: [0, 99] })
                .expect(200);
        });

        it('should accept numbers array with value 0 (exact min)', () => {
            return request(app)
                .post('/bubble-sort')
                .send({ numbers: [0, 1] })
                .expect(200);
        });

        it('should reject numbers array with exactly 101 elements', () => {
            const largeArray = Array(101).fill(5);
            return request(app)
                .post('/bubble-sort')
                .send({ numbers: largeArray })
                .expect(400)
                .then((response) => {
                    expect(response.body.error).toBe('Bad Request');
                });
        });

        it('should accept numbers array with exactly 100 elements', () => {
            const maxArray = Array(100).fill(5);
            return request(app)
                .post('/bubble-sort')
                .send({ numbers: maxArray })
                .expect(200);
        });

        it('should reject numbers that is a string', () => {
            return request(app)
                .post('/bubble-sort')
                .send({ numbers: 'not-an-array' })
                .expect(400)
                .then((response) => {
                    expect(response.body.error).toBe('Bad Request');
                });
        });

        it('should reject numbers that is an object', () => {
            return request(app)
                .post('/bubble-sort')
                .send({ numbers: { not: 'array' } })
                .expect(400)
                .then((response) => {
                    expect(response.body.error).toBe('Bad Request');
                });
        });
    });
});
