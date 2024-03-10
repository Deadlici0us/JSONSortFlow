import MergeSorter from "../src/services/MergeSorter";

describe("MergeSorter class (Unit Test)", () => {
  it("should implement ISorter interface", () => {
    const sorter = new MergeSorter();
    expect(sorter.sort).toBeDefined();
    expect(typeof sorter.sort).toBe("function");
  });

  it("should correctly sort an array", () => {
    const sorter = new MergeSorter();
    const input = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5];
    const result = sorter.sort(input);
    // Assert that the last step represents the correctly sorted array
    const sortedArray = result.steps[result.steps.length - 1];
    expect(sortedArray).toEqual([1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9]);
  });

  it("should handle an empty array", () => {
    const sorter = new MergeSorter();
    const input: number[] = [];
    const result = sorter.sort(input);

    // Assert that the result is an object with empty steps and indexes arrays
    expect(result).toEqual({ steps: [], indexes: [] });
  });
});
