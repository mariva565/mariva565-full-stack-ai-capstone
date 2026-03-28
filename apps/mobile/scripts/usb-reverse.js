const { existsSync } = require("node:fs");
const { join } = require("node:path");
const { spawnSync } = require("node:child_process");

const PORTS = [8081, 3000, 19000, 19001, 19002];

function findAdbBinary() {
  const inPath = spawnSync("adb", ["version"], { stdio: "ignore", shell: true });
  if (inPath.status === 0) {
    return "adb";
  }

  const sdkRoot = process.env.ANDROID_SDK_ROOT || process.env.ANDROID_HOME;
  if (sdkRoot) {
    const sdkAdb = join(sdkRoot, "platform-tools", process.platform === "win32" ? "adb.exe" : "adb");
    if (existsSync(sdkAdb)) {
      return sdkAdb;
    }
  }

  const localAppData = process.env.LOCALAPPDATA;
  if (localAppData) {
    const windowsSdkAdb = join(
      localAppData,
      "Android",
      "Sdk",
      "platform-tools",
      "adb.exe"
    );
    if (existsSync(windowsSdkAdb)) {
      return windowsSdkAdb;
    }

    const wingetAdb = join(
      localAppData,
      "Microsoft",
      "WinGet",
      "Packages",
      "Google.PlatformTools_Microsoft.Winget.Source_8wekyb3d8bbwe",
      "platform-tools",
      "adb.exe"
    );
    if (existsSync(wingetAdb)) {
      return wingetAdb;
    }
  }

  return null;
}

function startAdbServer(adb) {
  spawnSync(adb, ["start-server"], { stdio: "ignore" });
}

function reversePort(adb, port) {
  const result = spawnSync(adb, ["reverse", `tcp:${port}`, `tcp:${port}`], { encoding: "utf8" });
  if (result.status !== 0) {
    const output = (result.stderr || result.stdout || "").trim();
    if (output.includes("no devices/emulators found")) {
      console.error(
        "No Android device detected. Connect USB, enable USB debugging, accept the RSA prompt, then retry."
      );
    } else if (output) {
      console.error(output);
    }
    process.exit(result.status ?? 1);
  }
}

const adb = findAdbBinary();
if (!adb) {
  console.error(
    "ADB not found. Install Android platform-tools or add adb to PATH, then retry."
  );
  process.exit(1);
}

startAdbServer(adb);

for (const port of PORTS) {
  reversePort(adb, port);
}

console.log("ADB reverse ready for ports:", PORTS.join(", "));
