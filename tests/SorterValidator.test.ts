import { SorterValidator } from "../src/utils/SorterValidator";
describe("SorterValidator class (Unit Test)", () => {
  let sorterValidator: SorterValidator;

  beforeEach(() => {
    sorterValidator = new SorterValidator();
  });

  it("should not throw an error for valid input", () => {
    const validInput = {
      numbers: [1, 2, 3, 4, 5],
    };

    expect(() => sorterValidator.validate(validInput)).not.toThrow();
  });

  it("should throw an error if input is not provided", () => {
    const invalidInput = null;

    expect(() => sorterValidator.validate(invalidInput)).toThrow(
      "Input must be provided."
    );
  });

  it("should throw an error if input contains more than one key", () => {
    const invalidInput = {
      numbers: [1, 2, 3],
      otherKey: "value",
    };

    expect(() => sorterValidator.validate(invalidInput)).toThrow(
      "Input must contain exactly one key."
    );
  });

  it('should throw an error if input key is not "numbers"', () => {
    const invalidInput = {
      notNumbers: [1, 2, 3],
    };

    expect(() => sorterValidator.validate(invalidInput)).toThrow(
      'Input key must be "numbers".'
    );
  });

  it('should throw an error if "numbers" is not an array of numbers between 0 and 99', () => {
    const invalidInput = {
      numbers: [1, 2, 3, "invalid", 5],
    };

    expect(() => sorterValidator.validate(invalidInput)).toThrow(
      'The "numbers" property must be an array of numbers between 0 and 99.'
    );
  });

  it('should throw an error if "numbers" array contains numbers greater than 99 or less than 0', () => {
    const invalidInput = {
      numbers: [1, 2, 101, 4, -5],
    };

    expect(() => sorterValidator.validate(invalidInput)).toThrow(
      'The "numbers" property must be an array of numbers between 0 and 99.'
    );
  });

  it('should throw an error if "numbers" array length is greater than 100', () => {
    const invalidInput = {
      numbers: Array.from({ length: 101 }, (_, index) => index),
    };

    expect(() => sorterValidator.validate(invalidInput)).toThrow(
      'The "numbers" array cannot contain more than 100 items.'
    );
  });
});
