export interface ISorter {
  sort(numbers: number[]): { steps: number[][]; indexes: number[][] };
}

export default ISorter;
