import ISorter from "./ISorter";

class QuickSorter implements ISorter {
  public sort(numbers: number[]): { steps: number[][]; indexes: number[][] } {
    const steps: number[][] = [];
    const indexes: number[][] = [];

    function partition(start: number, end: number): number {
      const pivot = numbers[end];
      let i = start - 1;

      for (let j = start; j <= end - 1; j++) {
        if (numbers[j] < pivot) {
          i++;
          // Swap numbers using a temporary variable
          const temp = numbers[i];
          numbers[i] = numbers[j];
          numbers[j] = temp;

          // Save the current state and indexes after the swap
          steps.push([...numbers]);
          indexes.push([i, j]);
        }
      }

      // Swap the pivot element with the element at i+1
      const temp = numbers[i + 1];
      numbers[i + 1] = numbers[end];
      numbers[end] = temp;

      // Save the current state and indexes after the final swap
      steps.push([...numbers]);
      indexes.push([i + 1, end]);

      return i + 1;
    }

    function quickSort(start: number, end: number): void {
      if (start < end) {
        const pivotIndex = partition(start, end);
        quickSort(start, pivotIndex - 1);
        quickSort(pivotIndex + 1, end);
      }
    }

    quickSort(0, numbers.length - 1);

    return { steps, indexes };
  }
}

export default QuickSorter;
