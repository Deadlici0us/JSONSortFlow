import { Response, Request } from 'express';
import { ISearcher } from '../services/ISearcher';
import { SearchValidator } from '../utils/SearchValidator';
import { BadRequestError } from '../errorhandling/BadRequestError';
import { DefaultError } from '../errorhandling/DefaultError';

type Coordinate = [number, number];

/**
 * Controller for handling search algorithm requests.
 *
 * Receives an ISearcher via Dependency Injection and handles
 * HTTP request/response lifecycles.
 */
export class SearchController 
{
    private searcher: ISearcher;

    /**
     * Creates a new SearchController.
     *
     * @param searcher - The search algorithm to use
     */
    constructor(searcher: ISearcher) 
{
        this.searcher = searcher;
    }

    /**
     * Handles search requests.
     *
     * @param req - Express request object
     * @param res - Express response object
     */
    public search(req: Request, res: Response): void 
{
        const input = req.body;
        this.ValidateInput(input);
        const result = this.ExecuteSearch(input);
        res.json(result);
    }

    /**
     * Validates the input payload.
     *
     * @param input - The request body
     * @throws BadRequestError if validation fails
     */
    private ValidateInput(input: unknown): void 
{
        try 
{
            const validator = new SearchValidator();
            validator.validate(
                input as {
                    matrix?: unknown;
                    start?: unknown;
                    end?: unknown;
                }
            );
        }
 catch (err) 
{
            const message =
                err instanceof Error ? err.message : 'Unknown error';
            throw new BadRequestError(400, message);
        }
    }

    /**
     * Executes the search algorithm.
     *
     * @param input - The validated input
     * @returns The search result
     * @throws DefaultError if search fails
     */
    private ExecuteSearch(input: {
        matrix: number[][];
        start: Coordinate;
        end: Coordinate;
    }): { explored: Coordinate[]; result: Coordinate[] } 
{
        try 
{
            const { matrix, start, end } = input;
            return this.searcher.search(
                start as Coordinate,
                end as Coordinate,
                matrix as number[][]
            );
        }
 catch (err) 
{
            const message =
                err instanceof Error ? err.message : 'Unknown error';
            throw new DefaultError(500, message);
        }
    }
}
