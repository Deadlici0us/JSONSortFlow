/**
 * Jest config for Stryker mutation testing
 */
import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",
  testRegex: "(tests/.*\\.test\\.ts)$",
  roots: ["<rootDir>../src", "<rootDir>../tests"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
        useESM: false,
        isolatedModules: false,
      },
    ],
  },
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts"],
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};

export default config;
