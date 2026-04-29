const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  preset:'ts-jest',
  transform: {
    ...tsJestTransformCfg,
  },
  roots: ['<rootDir>/src', "<rootDir>/tests"],
  testMatch: ['**/tests/**/*.test.ts', '**/?(*.)+(spec|test).ts']
};