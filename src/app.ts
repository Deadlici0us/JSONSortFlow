import express, { Application, Request, Response, NextFunction } from "express";
import { config } from "dotenv"; // Import the config function from dotenv
import bodyParser from "body-parser";

import { Logger } from "./utils/ILogger";
import { LoggerCollection } from "./utils/LoggerCollection";
import { FileLogger } from "./utils/FileLogger";
import { ConsoleLogger } from "./utils/ConsoleLogger";

import { HandlerCollection } from "./errorhandling/HandlerCollection";
import { DefaultErrorHandler } from "./errorhandling/DefaultErrorHandler";
import { NotFoundErrorHandler } from "./errorhandling/NotFoundErrorHandler";
import { NotFoundError } from "./errorhandling/NotFoundError";
import { UnexpectedErrorHandler } from "./errorhandling/UnexpectedErrorHandler";
import { BadRequestErrorHandler } from "./errorhandling/BadRequestErrorHandler";

import SortController from "./controllers/SortController";
import ISorter from "./services/ISorter";
import QuickSorter from "./services/QuickSorter";
import BubbleSorter from "./services/BubbleSorter";
import MergeSorter from "./services/MergeSorter";

config();
const port = process.env.PORT_OUT;
const app: Application = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const bubbleSorter: ISorter = new BubbleSorter();
const quickSorter: ISorter = new QuickSorter();
const mergeSorter: ISorter = new MergeSorter();

const bubbleController: SortController = new SortController(bubbleSorter);
const quickController: SortController = new SortController(quickSorter);
const mergeController: SortController = new SortController(mergeSorter);

const consoleLogger: Logger = new ConsoleLogger();
const logsFilePath = process.env.LOGS_FILE_PATH || "./logs/default_log.txt";
const fileLogger: Logger = new FileLogger(logsFilePath);

const loggerCollection: Logger = new LoggerCollection([
  consoleLogger,
  fileLogger,
]);

const defaultErrorHandler = new DefaultErrorHandler(loggerCollection);
const notFoundErrorHandler = new NotFoundErrorHandler(loggerCollection);
const unexpectedErrorHandler = new UnexpectedErrorHandler(loggerCollection);
const badrequestErrorHandler = new BadRequestErrorHandler(loggerCollection);

const errorHandlerCollection = new HandlerCollection(
  [defaultErrorHandler, notFoundErrorHandler, badrequestErrorHandler],
  unexpectedErrorHandler
);

app.post("/bubble-sort", (req: Request, res: Response, next: NextFunction) => {
  bubbleController.sort(req, res);
});

app.post("/quick-sort", (req: Request, res: Response, next: NextFunction) => {
  quickController.sort(req, res);
});

app.post("/merge-sort", (req: Request, res: Response, next: NextFunction) => {
  mergeController.sort(req, res);
});

app.use((req: Request, res: Response, next: NextFunction) => {
  throw new NotFoundError(404, "Not Found");
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorHandlerCollection.handle(err, req, res, next);
});

app.listen(port, () => {
  console.log("Server is running at http://localhost:" + port);
});
