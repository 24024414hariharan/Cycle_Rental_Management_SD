/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type {Config} from 'jest';

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/test"], // Point Jest to the test directory
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.ts",          // Include all TypeScript files in src for coverage
    "!src/app.ts",          // Exclude entry point if desired
  ],
  coverageDirectory: "coverage", // Specify output folder for coverage reports
  coverageReporters: ["text", "lcov"], // Outputs coverage to console and as an HTML report
};

export default config;
