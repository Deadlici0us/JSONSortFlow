import { ISorter } from '../services/ISorter';
import BubbleSorter from '../services/BubbleSorter';
import QuickSorter from '../services/QuickSorter';
import MergeSorter from '../services/MergeSorter';

/**
 * Factory for creating sorting algorithm instances.
 *
 * Provides a centralized way to instantiate sorters based on
 * algorithm type strings.
 */
export class SorterFactory 
{
    /**
     * Creates a sorter instance based on the algorithm type.
     *
     * @param algorithm - The algorithm type
     * @returns The sorter instance
     * @throws Error if algorithm is unknown
     */
    public create(algorithm: string): ISorter 
{
        const algo = this.NormalizeAlgorithm(algorithm);
        return this.InstantiateSorter(algo);
    }

    /**
     * Normalizes algorithm string to lowercase.
     *
     * @param algorithm - The algorithm string
     * @returns The normalized string
     */
    private NormalizeAlgorithm(algorithm: string): string 
{
        return algorithm.toLowerCase();
    }

    /**
     * Instantiates the appropriate sorter.
     *
     * @param algorithm - The normalized algorithm type
     * @returns The sorter instance
     */
    private InstantiateSorter(algorithm: string): ISorter 
{
        const isValid = this.IsSupportedAlgorithm(algorithm);
        if (!isValid) 
{
            throw new Error(
                `Unknown algorithm: ${algorithm}. Supported: bubble, quick, merge.`
            );
        }
        return this.CreateSorter(algorithm);
    }

    /**
     * Checks if algorithm is supported.
     *
     * @param algorithm - The algorithm to check
     * @returns True if supported
     */
    private IsSupportedAlgorithm(algorithm: string): boolean 
{
        const supported = ['bubble', 'quick', 'merge'];
        return supported.includes(algorithm);
    }

    /**
     * Creates the sorter instance.
     *
     * @param algorithm - The algorithm type
     * @returns The sorter instance
     */
    private CreateSorter(algorithm: string): ISorter 
{
        switch (algorithm) 
{
            case 'bubble':
                return this.CreateBubbleSorter();
            case 'quick':
                return this.CreateQuickSorter();
            default:
                return this.CreateMergeSorter();
        }
    }

    /**
     * Creates BubbleSorter.
     *
     * @returns New BubbleSorter instance
     */
    private CreateBubbleSorter(): ISorter 
{
        return new BubbleSorter();
    }

    /**
     * Creates QuickSorter.
     *
     * @returns New QuickSorter instance
     */
    private CreateQuickSorter(): ISorter 
{
        return new QuickSorter();
    }

    /**
     * Creates MergeSorter.
     *
     * @returns New MergeSorter instance
     */
    private CreateMergeSorter(): ISorter 
{
        return new MergeSorter();
    }
}
