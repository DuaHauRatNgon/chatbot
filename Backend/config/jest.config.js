module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
  collectCoverageFrom: [
    "service/**/*.js",
    "repository/**/*.js",
    "utils/**/*.js",
    "!**/node_modules/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"], // Optional setup file
  verbose: true,
  // Bỏ qua MongoDB warnings
  setupFiles: ["<rootDir>/tests/setupTests.js"],
};
