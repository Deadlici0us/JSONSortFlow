import { ISorter } from './ISorter';

/**
 * Implements merge sort algorithm.
 */
class MergeSorter implements ISorter 
{
    /**
     * Sorts the array using merge sort.
     *
     * @param numbers - Array to sort
     * @returns Object with steps and indexes
     */
    public sort(numbers: number[]): { steps: number[][]; indexes: number[][] } 
{
        const steps: number[][] = [];
        const indexes: number[][] = [];
        this.MergeSort(numbers, 0, numbers.length - 1, steps, indexes);
        return { steps, indexes };
    }

    /**
     * Recursively sorts array segments.
     *
     * @param arr - Array to sort
     * @param start - Start index
     * @param end - End index
     * @param steps - Steps array
     * @param indexes - Indexes array
     */
    private MergeSort(
        arr: number[],
        start: number,
        end: number,
        steps: number[][],
        indexes: number[][]
    ): void 
{
        if (start < end) 
{
            const middle = Math.floor((start + end) / 2);
            this.MergeSort(arr, start, middle, steps, indexes);
            this.MergeSort(arr, middle + 1, end, steps, indexes);
            this.Merge(arr, start, middle, end, steps, indexes);
        }
    }

    /**
     * Merges two sorted subarrays.
     *
     * @param arr - Array containing subarrays
     * @param start - Start index
     * @param middle - Middle index
     * @param end - End index
     * @param steps - Steps array
     * @param indexes - Indexes array
     */
    private Merge(
        arr: number[],
        start: number,
        middle: number,
        end: number,
        steps: number[][],
        indexes: number[][]
    ): void 
{
        const leftPart = arr.slice(start, middle + 1);
        const rightPart = arr.slice(middle + 1, end + 1);
        this.ExecuteMerge(
            arr,
            leftPart,
            rightPart,
            start,
            middle,
            steps,
            indexes
        );
    }

    /**
     * Executes the merge operation.
     *
     * @param arr - Array to modify
     * @param leftPart - Left subarray
     * @param rightPart - Right subarray
     * @param start - Start index
     * @param middle - Middle index
     * @param steps - Steps array
     * @param indexes - Indexes array
     */
    private ExecuteMerge(
        arr: number[],
        leftPart: number[],
        rightPart: number[],
        start: number,
        middle: number,
        steps: number[][],
        indexes: number[][]
    ): void 
{
        let i = 0;
        let j = 0;
        let k = start;
        this.MergeLeftRight(
            arr,
            leftPart,
            rightPart,
            i,
            j,
            k,
            middle,
            steps,
            indexes
        );
    }

    /**
     * Merges left and right parts while tracking steps.
     *
     * @param arr - Array to modify
     * @param leftPart - Left subarray
     * @param rightPart - Right subarray
     * @param i - Left index
     * @param j - Right index
     * @param k - Merge index
     * @param middle - Middle index
     * @param steps - Steps array
     * @param indexes - Indexes array
     */
    private MergeLeftRight(
        arr: number[],
        leftPart: number[],
        rightPart: number[],
        i: number,
        j: number,
        k: number,
        middle: number,
        steps: number[][],
        indexes: number[][]
    ): void 
{
        // Local variables for iteration since we can't modify parameters
        let localI = i;
        let localJ = j;
        let localK = k;

        while (localI < leftPart.length || localJ < rightPart.length) 
{
            // Determine which element to take
            const shouldTakeLeft = this.ShouldTakeLeft(localI, localJ, leftPart, rightPart);

            if (shouldTakeLeft) {
                // Take from left
                arr[localK] = leftPart[localI];
                indexes.push([localK, -1]);
                steps.push([...arr]);
                localI++;
            } else {
                // Take from right
                arr[localK] = rightPart[localJ];
                indexes.push([localK, middle + 1 + localJ]);
                steps.push([...arr]);
                localJ++;
            }
            localK++;
        }
    }

    /**
     * Determines if left element should be taken.
     */
    private ShouldTakeLeft(
        i: number,
        j: number,
        leftPart: number[],
        rightPart: number[]
    ): boolean 
{
        const leftValid = i < leftPart.length;
        const rightExhausted = j >= rightPart.length;
        return leftValid && (rightExhausted || leftPart[i] <= rightPart[j]);
    }
}

export default MergeSorter;
