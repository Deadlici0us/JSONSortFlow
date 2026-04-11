import { ISearcher } from '../services/ISearcher';
import { AStarSearcher } from '../services/AStarSearcher';
import { BfsSearcher } from '../services/BfsSearcher';
import { DfsSearcher } from '../services/DfsSearcher';
import { DijkstraSearcher } from '../services/DijkstraSearcher';

/**
 * Factory for creating search algorithm instances.
 *
 * Provides a centralized way to instantiate searchers based on
 * algorithm type strings.
 */
export class SearcherFactory 
{
    /**
     * Creates a searcher instance based on the algorithm type.
     *
     * @param algorithm - The algorithm type
     * @returns The searcher instance
     * @throws Error if algorithm is unknown
     */
    public create(algorithm: string): ISearcher 
{
        const algo = this.NormalizeAlgorithm(algorithm);
        return this.InstantiateSearcher(algo);
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
     * Instantiates the appropriate searcher.
     *
     * @param algorithm - The normalized algorithm type
     * @returns The searcher instance
     */
    private InstantiateSearcher(algorithm: string): ISearcher 
{
        const isValid = this.IsSupportedAlgorithm(algorithm);
        if (!isValid) 
{
            throw new Error(
                `Unknown algorithm: ${algorithm}. Supported: astar, bfs, dfs, dijkstra.`
            );
        }
        return this.CreateSearcher(algorithm);
    }

    /**
     * Checks if algorithm is supported.
     *
     * @param algorithm - The algorithm to check
     * @returns True if supported
     */
    private IsSupportedAlgorithm(algorithm: string): boolean 
{
        const supported = ['astar', 'bfs', 'dfs', 'dijkstra'];
        return supported.includes(algorithm);
    }

    /**
     * Creates the searcher instance.
     *
     * @param algorithm - The algorithm type
     * @returns The searcher instance
     */
    private CreateSearcher(algorithm: string): ISearcher 
{
        switch (algorithm) 
{
            case 'astar':
                return this.CreateAStarSearcher();
            case 'bfs':
                return this.CreateBfsSearcher();
            case 'dfs':
                return this.CreateDfsSearcher();
            default:
                return this.CreateDijkstraSearcher();
        }
    }

    /**
     * Creates A* searcher.
     *
     * @returns New AStarSearcher instance
     */
    private CreateAStarSearcher(): ISearcher 
{
        return new AStarSearcher();
    }

    /**
     * Creates BFS searcher.
     *
     * @returns New BfsSearcher instance
     */
    private CreateBfsSearcher(): ISearcher 
{
        return new BfsSearcher();
    }

    /**
     * Creates DFS searcher.
     *
     * @returns New DfsSearcher instance
     */
    private CreateDfsSearcher(): ISearcher 
{
        return new DfsSearcher();
    }

    /**
     * Creates Dijkstra searcher.
     *
     * @returns New DijkstraSearcher instance
     */
    private CreateDijkstraSearcher(): ISearcher 
{
        return new DijkstraSearcher();
    }
}
