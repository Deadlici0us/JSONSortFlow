/**
 * Validates search algorithm inputs.
 *
 * Ensures matrix dimensions, coordinate bounds, and input structure
 * meet strict requirements before processing.
 */
export class SearchValidator 
{
    /**
     * Validates the search input payload.
     *
     * @param input - The search input object
     * @throws Error if validation fails
     */
    public validate(
        input:
            | {
                  matrix?: unknown;
                  start?: unknown;
                  end?: unknown;
              }
            | null
            | undefined
    ): void 
{
        this.CheckInputProvided(input);
        this.CheckExactlyThreeKeys(input);
        this.ValidateMatrix(input.matrix);
        this.ValidateCoordinate(input.start, 'start');
        this.ValidateCoordinate(input.end, 'end');
    }

    /**
     * Checks if input is provided.
     *
     * @param input - The input to check
     */
    private CheckInputProvided(
        input: unknown
    ): asserts input is Record<string, unknown> 
{
        if (!input) 
{
            throw new Error('Input must be provided.');
        }
    }

    /**
     * Checks if input has exactly three keys.
     *
     * @param input - The input object
     */
    private CheckExactlyThreeKeys(input: Record<string, unknown>): void 
{
        const keys = Object.keys(input);
        if (keys.length !== 3) 
{
            throw new Error(
                'Input must contain exactly three keys: matrix, start, and end.'
            );
        }
    }

    /**
     * Validates the matrix structure.
     *
     * @param matrix - The matrix to validate
     */
    private ValidateMatrix(matrix: unknown): void 
{
        this.CheckMatrixIsArray(matrix);
        const matrixArray = matrix as unknown[];
        this.CheckMatrixHasRows(matrixArray);
        const matrix2D = matrixArray as number[][];
        this.CheckMatrixIs32x32(matrix2D);
        this.CheckMatrixValues(matrix2D);
    }

    /**
     * Checks if matrix is an array.
     *
     * @param matrix - The value to check
     */
    private CheckMatrixIsArray(matrix: unknown): void 
{
        if (!Array.isArray(matrix)) 
{
            throw new Error('Matrix must be a 2D array.');
        }
    }

    /**
     * Checks if matrix has rows.
     *
     * @param matrix - The matrix array
     */
    private CheckMatrixHasRows(matrix: unknown[]): void 
{
        if (matrix.length === 0 || !Array.isArray(matrix[0])) 
{
            throw new Error('Matrix must be a 2D array.');
        }
    }

    /**
     * Checks if matrix is exactly 32x32.
     *
     * @param matrix - The matrix to check
     */
    private CheckMatrixIs32x32(matrix: number[][]): void 
{
        if (matrix.length !== 32 || matrix[0].length !== 32) 
{
            throw new Error('Matrix dimensions must be exactly 32x32.');
        }
    }

    /**
     * Checks if matrix contains only 0 or 1.
     *
     * @param matrix - The matrix to check
     */
    private CheckMatrixValues(matrix: number[][]): void 
{
        for (const row of matrix) 
{
            for (const val of row) 
{
                this.CheckCellValue(val);
            }
        }
    }

    /**
     * Checks a single cell value.
     *
     * @param val - The cell value
     */
    private CheckCellValue(val: unknown): void 
{
        if (val !== 0 && val !== 1) 
{
            throw new Error(
                'Matrix must contain only 0 (free) or 1 (obstacle).'
            );
        }
    }

    /**
     * Validates a coordinate tuple.
     *
     * @param coord - The coordinate to validate
     * @param name - The name of the coordinate (start/end)
     */
    private ValidateCoordinate(
        coord: unknown,
        name: string
    ): asserts coord is [number, number] 
{
        this.CheckCoordinateIsArray(coord, name);
        const coordArray = coord as unknown[];
        this.CheckCoordinateLength(coordArray, name);
        this.CheckCoordinateBounds(coordArray);
    }

    /**
     * Checks if coordinate is an array.
     *
     * @param coord - The value to check
     * @param name - The coordinate name
     */
    private CheckCoordinateIsArray(coord: unknown, name: string): void 
{
        if (!coord || !Array.isArray(coord)) 
{
            throw new Error(`${name} must be a tuple [x, y].`);
        }
    }

    /**
     * Checks if coordinate has length 2.
     *
     * @param coord - The coordinate array
     * @param name - The coordinate name
     */
    private CheckCoordinateLength(coord: unknown[], name: string): void 
{
        if (coord.length !== 2) 
{
            throw new Error(`${name} must be a tuple [x, y].`);
        }
    }

    /**
     * Checks if coordinate is within bounds.
     *
     * @param coord - The coordinate array
     */
    private CheckCoordinateBounds(coord: unknown[]): void 
{
        const x = coord[0] as number;
        const y = coord[1] as number;
        this.CheckTypeIsNumber(x, 'x');
        this.CheckTypeIsNumber(y, 'y');
        this.CheckValueInRange(x, 'x');
        this.CheckValueInRange(y, 'y');
    }

    /**
     * Checks if value is a number.
     *
     * @param val - The value to check
     * @param name - The coordinate name
     */
    private CheckTypeIsNumber(val: unknown, name: string): void 
{
        if (typeof val !== 'number') 
{
            throw new Error(`${name} must be a number.`);
        }
    }

    /**
     * Checks if value is in range 0-31.
     *
     * @param val - The value to check
     * @param name - The coordinate name
     */
    private CheckValueInRange(val: number, name: string): void 
{
        if (val < 0 || val >= 32) 
{
            throw new Error(`${name} out of bounds (must be 0-31).`);
        }
    }
}
