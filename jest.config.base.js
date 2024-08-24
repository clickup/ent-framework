"use strict";
module.exports = {
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  clearMocks: true,
  restoreMocks: true,
  ...(process.env.IN_JEST_PROJECT
    ? {}
    : { forceExit: true, testTimeout: 30000 }),
  transform: {
    "\\.ts$": "ts-jest",
  },
};
