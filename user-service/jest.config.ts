import type { Config } from "jest";
import path from "path";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/test"],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/app.ts",
    "!src/**/*.{test,spec}.ts",
    "!src/routes/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "json-summary"],
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/", "/test/", "/src/routes/"],
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
    "^@/(.*)$": "<rootDir>/src/$1", 
  },
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)",
  ],
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "<rootDir>/src/routes/"],
};

export default config;
