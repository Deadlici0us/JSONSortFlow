import ISorter from "./ISorter";

class MergeSorter implements ISorter {
  public sort(numbers: number[]): { steps: number[][]; indexes: number[][] } {
    const steps: number[][] = [];
    const indexes: number[][] = [];

    function merge(start: number, middle: number, end: number) {
      const leftPart = numbers.slice(start, middle + 1);
      const rightPart = numbers.slice(middle + 1, end + 1);

      let i = 0,
        j = 0,
        k = start;

      while (i < leftPart.length || j < rightPart.length) {
        if (
          i < leftPart.length &&
          (j >= rightPart.length || leftPart[i] <= rightPart[j])
        ) {
          numbers[k] = leftPart[i];

          indexes.push([k, middle + 1 + j]);
          steps.push([...numbers]);

          i++;
        } else {
          numbers[k] = rightPart[j];

          indexes.push([k, middle + 1 + j]);
          steps.push([...numbers]);

          j++;
        }
        k++;
      }
    }

    function mergeSort(start: number, end: number) {
      if (start < end) {
        const middle = Math.floor((start + end) / 2);
        mergeSort(start, middle);
        mergeSort(middle + 1, end);
        merge(start, middle, end);
      }
    }

    mergeSort(0, numbers.length - 1);

    return { steps, indexes };
  }
}

export default MergeSorter;
