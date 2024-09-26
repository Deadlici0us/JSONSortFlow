import ISorter from "./ISorter";

class BubbleSorter implements ISorter {
  public sort(numbers: number[]): { steps: number[][]; indexes: number[][] } {
    const steps: number[][] = [];
    const indexes: number[][] = [];

    // Add the initial state of the array to the steps
    steps.push([...numbers]);

    let swapped: boolean;

    do {
      swapped = false;

      numbers.forEach((number, index) => {
        const nextIndex = index + 1;

        if (number > numbers[nextIndex]) {
          // Swap numbers
          const temp: number = numbers[index];
          numbers[index] = numbers[nextIndex];
          numbers[nextIndex] = temp;

          // Save the current state and indexes after the swap
          steps.push([...numbers]);
          indexes.push([index, nextIndex]);

          swapped = true;
        }
      });
    } while (swapped);

    return { steps, indexes };
  }
}

export default BubbleSorter;
