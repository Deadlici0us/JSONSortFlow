/**
 * Validates input for the sorter service.
 */
export class SorterValidator 
{
    /**
     * Validates the input object.
     *
     * @param input - Input object with numbers array
     * @throws Error if validation fails
     */
    public validate(input: { numbers?: number[] } | null | undefined): void 
{
        this.CheckInputProvided(input);
        if (input === null || input === undefined) 
{
            return;
        }
        const inputKeys = Object.keys(input);
        this.CheckInputStructure(inputKeys);
        const numbers = input.numbers;
        this.ValidateNumbersArray(numbers);
    }

    /**
     * Checks if input is provided.
     *
     * @param input - Input to check
     * @throws Error if input is missing
     */
    private CheckInputProvided(
        input: { numbers?: number[] } | null | undefined
    ): void 
{
        if (!input) 
{
            throw new Error('Input must be provided.');
        }
    }

    /**
     * Validates input has correct structure.
     *
     * @param keys - Object keys to validate
     * @throws Error if structure is invalid
     */
    private CheckInputStructure(keys: string[]): void 
{
        if (keys.length !== 1) 
{
            throw new Error('Input must contain exactly one key.');
        }
        if (keys[0] !== 'numbers') 
{
            throw new Error('Input key must be "numbers".');
        }
    }

    /**
     * Validates the numbers array content.
     *
     * @param numbers - Value to validate as array
     * @throws Error if array is invalid
     */
    private ValidateNumbersArray(numbers: unknown): void 
{
        if (!Array.isArray(numbers)) 
{
            this.ThrowInvalidTypeError();
            return;
        }
        this.CheckArrayLength(numbers);
        this.CheckArrayValues(numbers);
    }

    /**
     * Checks array length constraint.
     *
     * @param arr - Array to check
     * @throws Error if length > 100
     */
    private CheckArrayLength(arr: unknown[]): void 
{
        if (arr.length > 100) 
{
            throw new Error(
                'The "numbers" array cannot contain more than 100 items.'
            );
        }
    }

    /**
     * Checks array values are valid numbers.
     *
     * @param arr - Array to check
     * @throws Error if values are invalid
     */
    private CheckArrayValues(arr: unknown[]): void 
{
        const isValid = arr.every(
            (num) => typeof num === 'number' && num >= 0 && num <= 99
        );
        if (!isValid) 
{
            this.ThrowInvalidTypeError();
        }
    }

    /**
     * Throws invalid type error.
     *
     * @throws Error with invalid type message
     */
    private ThrowInvalidTypeError(): void 
{
        throw new Error(
            'The "numbers" property must be an array of numbers between 0 and 99.'
        );
    }
}
