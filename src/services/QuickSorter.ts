import { ISorter } from './ISorter';

/**
 * Implements quick sort algorithm.
 */
class QuickSorter implements ISorter 
{
    /**
     * Sorts the array using quick sort.
     *
     * @param numbers - Array to sort
     * @returns Object with steps and indexes
     */
    public sort(numbers: number[]): { steps: number[][]; indexes: number[][] } 
    {
        const steps: number[][] = [];
        const indexes: number[][] = [];
        this.QuickSort(numbers, 0, numbers.length - 1, steps, indexes);
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
    private QuickSort(
        arr: number[],
        start: number,
        end: number,
        steps: number[][],
        indexes: number[][]
    ): void 
{
        if (start < end) 
{
            const pivotIndex = this.Partition(arr, start, end, steps, indexes);
            this.QuickSort(arr, start, pivotIndex - 1, steps, indexes);
            this.QuickSort(arr, pivotIndex + 1, end, steps, indexes);
        }
    }

    /**
     * Partitions array around pivot.
     *
     * @param arr - Array to partition
     * @param start - Start index
     * @param end - End index
     * @param steps - Steps array
     * @param indexes - Indexes array
     * @returns Pivot index
     */
    private Partition(
        arr: number[],
        start: number,
        end: number,
        steps: number[][],
        indexes: number[][]
    ): number 
{
        const pivot = arr[end];
        let i = start - 1;
        for (let j = start; j <= end - 1; j++) {
            if (arr[j] < pivot) {
                i++;
                this.SwapElements(arr, i, j, steps, indexes);
            }
        }
        this.FinalizePartition(arr, i, end, steps, indexes);
        return i + 1;
    }

    /**
     * Swaps two elements in array.
     *
     * @param arr - Array containing elements
     * @param i - First index
     * @param j - Second index
     * @param steps - Steps array
     * @param indexes - Indexes array
     */
    private SwapElements(
        arr: number[],
        i: number,
        j: number,
        steps: number[][],
        indexes: number[][]
    ): void 
{
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
        steps.push([...arr]);
        indexes.push([i, j]);
    }

    /**
     * Finalizes partition by placing pivot.
     *
     * @param arr - Array containing pivot
     * @param i - Index before pivot position
     * @param end - End index (pivot position)
     * @param steps - Steps array
     * @param indexes - Indexes array
     */
    private FinalizePartition(
        arr: number[],
        i: number,
        end: number,
        steps: number[][],
        indexes: number[][]
    ): void 
{
        const temp = arr[i + 1];
        arr[i + 1] = arr[end];
        arr[end] = temp;
        steps.push([...arr]);
        indexes.push([i + 1, end]);
    }
}

export default QuickSorter;
