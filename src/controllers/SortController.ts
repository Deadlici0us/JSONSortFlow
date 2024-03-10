import { Response, Request } from "express";
import ISorter from "../services/ISorter";
import { SorterValidator } from "../utils/SorterValidator";
import { DefaultError } from "../errorhandling/DefaultError";
import { BadRequestError } from "../errorhandling/BadRequestError";

class SortController {
  constructor(private sorter: ISorter) {}

  public sort(req: Request, res: Response): void {
    const input = req.body;
    try {
      // Validate the input
      const sorterValidator = new SorterValidator();
      sorterValidator.validate(input);
    } catch (err) {
      throw new BadRequestError(400, err.message);
    }
    try {
      // Extract and sort the numbers
      const numbers: number[] = input.numbers;
      const { steps, indexes } = this.sorter.sort(numbers);
      // Send the response
      res.json({ steps, indexes });
    } catch (err) {
      throw new DefaultError(500, err.message);
    }
  }
}

export default SortController;
