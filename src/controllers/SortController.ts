import { Response, Request } from 'express';
import ISorter from '../services/ISorter';
import { SorterValidator } from '../utils/SorterValidator';
import { DefaultError } from '../errorhandling/DefaultError';
import { BadRequestError } from '../errorhandling/BadRequestError';

/**
 *
 */
class SortController 
{
    /**
     *
     */
    constructor(private sorter: ISorter) 
{}

    /**
     * Handles the sort request.
     *
     * @param req - Express request object
     * @param res - Express response object
     * @throws BadRequestError if input validation fails
     * @throws DefaultError if sorting fails
     */
    public sort(req: Request, res: Response): void 
{
        const input = req.body;
        this.ValidateAndSort(input);
        const result = this.ExecuteSort(input);
        res.json(result);
    }

    /**
     * Validates the input parameters.
     *
     * @param input - Input object to validate
     * @throws BadRequestError if validation fails
     */
    private ValidateAndSort(input: unknown): void 
{
        try 
{
            const sorterValidator = new SorterValidator();
            sorterValidator.validate(
                input as { numbers?: number[] } | null | undefined
            );
        }
 catch (err) 
{
            const message = this.ExtractErrorMessage(err);
            throw new BadRequestError(400, message);
        }
    }

    /**
     * Executes the sorting operation.
     *
     * @param input - Input containing numbers to sort
     * @returns Sorting result with steps and indexes
     * @throws DefaultError if sorting fails
     */
    private ExecuteSort(input: Record<string, unknown>): {
        steps: number[][];
        indexes: number[][];
    } 
{
        try 
{
            const numbers: number[] = input.numbers as number[];
            return this.sorter.sort(numbers);
        }
 catch (err) 
{
            const message = this.ExtractErrorMessage(err);
            throw new DefaultError(500, message);
        }
    }

    /**
     * Extracts error message from error object.
     *
     * @param err - Error object
     * @returns Error message string
     */
    private ExtractErrorMessage(err: unknown): string 
{
        return err instanceof Error ? err.message : 'Unknown error';
    }
}

export default SortController;
