const path = require("path");
const { spawn } = require("child_process");
const dotenv = require("dotenv");

const appRoot = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(appRoot, ".env"), quiet: true });
dotenv.config({ path: path.join(appRoot, ".env.local"), override: true, quiet: true });

const testDatabaseUrl = process.env.TEST_DATABASE_URL;

if (!testDatabaseUrl) {
  console.error("TEST_DATABASE_URL is required in apps/web/.env.local");
  process.exit(1);
}

const nextCli = require.resolve("next/dist/bin/next");
const child = spawn(process.execPath, [nextCli, "dev", "--port", "3001"], {
  cwd: appRoot,
  stdio: "inherit",
  env: {
    ...process.env,
    DATABASE_URL: testDatabaseUrl,
    TEST_BASE_URL: process.env.TEST_BASE_URL ?? "http://localhost:3001",
  },
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
