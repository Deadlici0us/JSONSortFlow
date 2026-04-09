import request, { Response } from 'supertest';
import App from '../src/app';

describe('Sort Endpoints Integration', () => {
    const app = new App().GetApp();
    describe('POST /bubble-sort', () => {
        it('should return 200 OK with sorted numbers for valid payload', () => {
            return request(app)
                .post('/bubble-sort')
                .send({ numbers: [5, 2, 8, 1, 9, 3] })
                .expect(200)
                .then((response: Response) => {
                    expect(response.body).toHaveProperty('steps');
                    expect(response.body).toHaveProperty('indexes');
                    expect(Array.isArray(response.body.steps)).toBe(true);
                    expect(Array.isArray(response.body.indexes)).toBe(true);
                });
        });

        it('should return 200 OK for empty array', () => {
            return request(app)
                .post('/bubble-sort')
                .send({ numbers: [] })
                .expect(200)
                .then((response: Response) => {
                    expect(response.body).toHaveProperty('steps');
                    expect(response.body).toHaveProperty('indexes');
                    expect(response.body.steps).toEqual([]);
                    expect(response.body.indexes).toEqual([]);
                });
        });

        it('should return 400 for invalid payload - missing numbers', () => {
            return request(app).post('/bubble-sort').send({}).expect(400);
        });

        it('should return 400 for invalid payload - numbers not an array', () => {
            return request(app)
                .post('/bubble-sort')
                .send({ numbers: 'not-an-array' })
                .expect(400);
        });

        it('should return 400 for invalid payload - numbers out of range', () => {
            return request(app)
                .post('/bubble-sort')
                .send({ numbers: [5, 150, 2] })
                .expect(400);
        });

        it('should return 400 for invalid payload - numbers array too large', () => {
            const largeArray = Array(101).fill(5);
            return request(app)
                .post('/bubble-sort')
                .send({ numbers: largeArray })
                .expect(400);
        });
    });

    describe('POST /quick-sort', () => {
        it('should return 200 OK with sorted numbers for valid payload', () => {
            return request(app)
                .post('/quick-sort')
                .send({ numbers: [5, 2, 8, 1, 9, 3] })
                .expect(200)
                .then((response: Response) => {
                    expect(response.body).toHaveProperty('steps');
                    expect(response.body).toHaveProperty('indexes');
                    expect(Array.isArray(response.body.steps)).toBe(true);
                    expect(Array.isArray(response.body.indexes)).toBe(true);
                });
        });

        it('should return 200 OK for empty array', () => {
            return request(app)
                .post('/quick-sort')
                .send({ numbers: [] })
                .expect(200)
                .then((response: Response) => {
                    expect(response.body).toHaveProperty('steps');
                    expect(response.body).toHaveProperty('indexes');
                    expect(response.body.steps).toEqual([]);
                    expect(response.body.indexes).toEqual([]);
                });
        });

        it('should return 400 for invalid payload - missing numbers', () => {
            return request(app).post('/quick-sort').send({}).expect(400);
        });

        it('should return 400 for invalid payload - numbers not an array', () => {
            return request(app)
                .post('/quick-sort')
                .send({ numbers: 'not-an-array' })
                .expect(400);
        });
    });

    describe('POST /merge-sort', () => {
        it('should return 200 OK with sorted numbers for valid payload', () => {
            return request(app)
                .post('/merge-sort')
                .send({ numbers: [5, 2, 8, 1, 9, 3] })
                .expect(200)
                .then((response: Response) => {
                    expect(response.body).toHaveProperty('steps');
                    expect(response.body).toHaveProperty('indexes');
                    expect(Array.isArray(response.body.steps)).toBe(true);
                    expect(Array.isArray(response.body.indexes)).toBe(true);
                });
        });

        it('should return 200 OK for empty array', () => {
            return request(app)
                .post('/merge-sort')
                .send({ numbers: [] })
                .expect(200)
                .then((response: Response) => {
                    expect(response.body).toHaveProperty('steps');
                    expect(response.body).toHaveProperty('indexes');
                    expect(response.body.steps).toEqual([]);
                    expect(response.body.indexes).toEqual([]);
                });
        });

        it('should return 400 for invalid payload - missing numbers', () => {
            return request(app).post('/merge-sort').send({}).expect(400);
        });

        it('should return 400 for invalid payload - numbers not an array', () => {
            return request(app)
                .post('/merge-sort')
                .send({ numbers: 'not-an-array' })
                .expect(400);
        });

        it('should return 400 for invalid payload - numbers out of range', () => {
            return request(app)
                .post('/merge-sort')
                .send({ numbers: [5, 150, 2] })
                .expect(400);
        });

        it('should return 400 for invalid payload - numbers array too large', () => {
            const largeArray = Array(101).fill(5);
            return request(app)
                .post('/merge-sort')
                .send({ numbers: largeArray })
                .expect(400);
        });
    });

    describe('Infrastructure Mutant Killers', () => {
        it('MUTANT-KILLER: verify 400 status is not 401 for all sort endpoints', () => {
            const endpoints = ['/bubble-sort', '/quick-sort', '/merge-sort'];
            const promises = endpoints.map((endpoint) =>
                request(app)
                    .post(endpoint)
                    .send({})
                    .expect(400)
                    .then((response) => {
                        expect(response.status).toBe(400);
                        expect(response.status).not.toBe(401);
                        expect(response.status).not.toBe(500);
                    })
            );
            return Promise.all(promises);
        });

        it('MUTANT-KILLER: verify exact error message "Bad Request" for missing numbers', () => {
            return request(app)
                .post('/bubble-sort')
                .send({})
                .expect(400)
                .then((response) => {
                    expect(response.body.error).toBe('Bad Request');
                    expect(response.body.error).not.toBe('BadRequestError');
                });
        });

        it('MUTANT-KILLER: verify numbers array with value 150 is rejected', () => {
            return request(app)
                .post('/quick-sort')
                .send({ numbers: [1, 150] })
                .expect(400)
                .then((response) => {
                    expect(response.status).toBe(400);
                });
        });

        it('MUTANT-KILLER: verify numbers array with value -1 is rejected', () => {
            return request(app)
                .post('/merge-sort')
                .send({ numbers: [1, -1] })
                .expect(400)
                .then((response) => {
                    expect(response.status).toBe(400);
                });
        });

        it('MUTANT-KILLER: verify numbers with exactly 101 elements is rejected', () => {
            const largeArray = Array(101).fill(5);
            return request(app)
                .post('/bubble-sort')
                .send({ numbers: largeArray })
                .expect(400)
                .then((response) => {
                    expect(response.status).toBe(400);
                });
        });

        it('MUTANT-KILLER: verify numbers with exactly 100 elements is accepted', () => {
            const maxArray = Array(100).fill(5);
            return request(app)
                .post('/quick-sort')
                .send({ numbers: maxArray })
                .expect(200);
        });

        it('MUTANT-KILLER: verify numbers with exactly 99 (max valid) is accepted', () => {
            return request(app)
                .post('/merge-sort')
                .send({ numbers: [0, 99] })
                .expect(200);
        });

        it('MUTANT-KILLER: verify numbers with exactly 100 (one past max) is rejected', () => {
            return request(app)
                .post('/merge-sort')
                .send({ numbers: [0, 100] })
                .expect(400);
        });

        it('MUTANT-KILLER: verify numbers that is object is rejected', () => {
            return request(app)
                .post('/bubble-sort')
                .send({ numbers: { not: 'array' } })
                .expect(400)
                .then((response) => {
                    expect(response.body.error).toBe('Bad Request');
                    expect(response.body.error).not.toBe('BadRequestError');
                });
        });

        it('MUTANT-KILLER: verify numbers that is null is rejected with 400', () => {
            return request(app)
                .post('/quick-sort')
                .send({ numbers: null })
                .expect(400)
                .then((response) => {
                    expect(response.status).toBe(400);
                    expect(response.body.error).toBe('Bad Request');
                });
        });
    });
});
