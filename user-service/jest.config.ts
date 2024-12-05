import type { Config } from "jest";
import path from "path";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/test"],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.ts", // Include all .ts files in the src directory
    "!src/app.ts", // Exclude app.ts if intentional
    "!src/**/*.{test,spec}.ts", // Exclude test files
    "!src/routes/**", // Exclude everything inside the routes folder from coverage
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "json-summary"],
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/", "/test/", "/src/routes/"], // Ignore irrelevant paths
  moduleDirectories: ["node_modules", path.join(__dirname, "src")],
  reporters: [
    "default",
    [
      "jest-sonar",
      {
        outputDirectory: "coverage",
        outputName: "test-report.xml",
      },
    ],
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1", // Map @/ alias to src directory for easier imports
  },
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)", // Include test files in __tests__ folders
    "**/?(*.)+(spec|test).+(ts|tsx|js)", // Match spec or test files
  ],
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "<rootDir>/src/routes/"], // Exclude dist, node_modules, and routes
};

export default config;
