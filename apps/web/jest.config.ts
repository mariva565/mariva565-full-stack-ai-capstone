import type { Config } from "jest";

const tsJestConfig = {
  tsconfig: {
    module: "CommonJS",
    moduleResolution: "node",
    isolatedModules: true,
  },
};

const config: Config = {
  testTimeout: 30_000,
  projects: [
    {
      displayName: "unit",
      testEnvironment: "node",
      rootDir: ".",
      testMatch: ["<rootDir>/lib/__tests__/*.test.ts"],
      setupFiles: ["<rootDir>/jest.setup.ts"],
      transform: {
        "^.+\\.tsx?$": ["ts-jest", tsJestConfig],
        "^.+\\.js$": [
          "ts-jest",
          { tsconfig: { module: "CommonJS", moduleResolution: "node", allowJs: true } },
        ],
      },
      transformIgnorePatterns: ["/node_modules/(?!jose/)"],
    },
    {
      displayName: "integration",
      testEnvironment: "node",
      rootDir: ".",
      testMatch: ["<rootDir>/lib/__tests__/integration/**/*.test.ts"],
      setupFiles: ["<rootDir>/jest.setup.ts"],
      transform: {
        "^.+\\.tsx?$": ["ts-jest", tsJestConfig],
        "^.+\\.js$": [
          "ts-jest",
          { tsconfig: { module: "CommonJS", moduleResolution: "node", allowJs: true } },
        ],
      },
      transformIgnorePatterns: ["/node_modules/(?!jose/)"],
    },
  ],
  collectCoverageFrom: [
    "lib/auth.ts",
    "lib/jwt.ts",
    "lib/email-validation.ts",
    "lib/password-validation.ts",
    "lib/slugify.ts",
  ],
  coverageThreshold: {
    global: {
      lines: 80,
      statements: 80,
      branches: 75,
      functions: 80,
    },
  },
  moduleFileExtensions: ["ts", "tsx", "js"],
};

export default config;
