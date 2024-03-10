export class SorterValidator {
  validate(input: any): void {
    if (!input) {
      throw new Error("Input must be provided.");
    }

    const inputKeys = Object.keys(input);

    if (inputKeys.length !== 1) {
      throw new Error("Input must contain exactly one key.");
    }

    const onlyKey = inputKeys[0];

    if (onlyKey !== "numbers") {
      throw new Error('Input key must be "numbers".');
    }

    const numbers = input.numbers;

    if (numbers.length > 100) {
      throw new Error(
        'The "numbers" array cannot contain more than 100 items.'
      );
    }

    if (
      !Array.isArray(numbers) ||
      !numbers.every((num) => typeof num === "number" && num >= 0 && num <= 99)
    ) {
      throw new Error(
        'The "numbers" property must be an array of numbers between 0 and 99.'
      );
    }
  }
}
