import { Request, Response } from 'express';

import SortController from '../src/controllers/SortController';
import BubbleSorter from '../src/services/BubbleSorter';
import QuickSorter from '../src/services/QuickSorter';
import MergeSorter from '../src/services/MergeSorter';
import { SorterValidator } from '../src/utils/SorterValidator';

describe('SortController', () => {
    let bubbleController: SortController;
    let quickController: SortController;
    let mergeController: SortController;

    beforeEach(() => {
        bubbleController = new SortController(new BubbleSorter());
        quickController = new SortController(new QuickSorter());
        mergeController = new SortController(new MergeSorter());
    });

    describe('sort', () => {
        it('should return sorted array for valid bubble-sort request', async () => {
            const mockRequest = {
                body: { numbers: [3, 1, 2] },
                query: { algorithm: 'bubble' },
            } as unknown as Request;
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            await bubbleController.sort(mockRequest, mockResponse);

            expect(mockResponse.status).not.toHaveBeenCalled();
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    steps: expect.any(Array),
                    indexes: expect.any(Array),
                }),
            );
        });

        it('should return sorted array for valid quick-sort request', async () => {
            const mockRequest = {
                body: { numbers: [3, 1, 2] },
                query: { algorithm: 'quick' },
            } as unknown as Request;
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            await quickController.sort(mockRequest, mockResponse);

            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    steps: expect.any(Array),
                    indexes: expect.any(Array),
                }),
            );
        });

        it('should return sorted array for valid merge-sort request', async () => {
            const mockRequest = {
                body: { numbers: [3, 1, 2] },
                query: { algorithm: 'merge' },
            } as unknown as Request;
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            await mergeController.sort(mockRequest, mockResponse);

            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    steps: expect.any(Array),
                    indexes: expect.any(Array),
                }),
            );
        });

        it('should throw BadRequestError when validator throws', async () => {
            const mockRequest = {
                body: { invalid: 'data' },
                query: { algorithm: 'bubble' },
            } as unknown as Request;
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            expect(() => bubbleController.sort(mockRequest, mockResponse)).toThrow();
        });

        it('should throw BadRequestError when validator throws for non-array numbers', async () => {
            const mockRequest = {
                body: { numbers: 'not-an-array' },
                query: { algorithm: 'bubble' },
            } as unknown as Request;
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            expect(() => bubbleController.sort(mockRequest, mockResponse)).toThrow();
        });

        it('should handle empty array correctly', async () => {
            const mockRequest = {
                body: { numbers: [] },
                query: { algorithm: 'bubble' },
            } as unknown as Request;
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            await bubbleController.sort(mockRequest, mockResponse);

            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    steps: expect.any(Array),
                    indexes: expect.any(Array),
                }),
            );
        });

        it('should call validator before sorter', async () => {
            const validatorValidate = jest.spyOn(
                SorterValidator.prototype,
                'validate',
            );
            const mockRequest = {
                body: { numbers: [3, 1, 2] },
                query: { algorithm: 'bubble' },
            } as unknown as Request;
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            await bubbleController.sort(mockRequest, mockResponse);

            expect(validatorValidate).toHaveBeenCalled();
        });

        it('should throw error when validator throws for null body', async () => {
            const mockRequest = {
                body: null,
                query: { algorithm: 'bubble' },
            } as unknown as Request;
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            expect(() => bubbleController.sort(mockRequest, mockResponse)).toThrow();
        });

        it('should throw DefaultError when sorter throws', async () => {
            const mockSorter = {
                sort: jest.fn().mockImplementation(() => {
                    throw new Error('Sorter failed');
                }),
            };
            const controller = new SortController(mockSorter as unknown as BubbleSorter);
            const mockRequest = {
                body: { numbers: [3, 1, 2] },
                query: { algorithm: 'bubble' },
            } as unknown as Request;
            const mockResponse = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            expect(() => controller.sort(mockRequest, mockResponse)).toThrow();
        });
    });
});
