import { name, version } from "@/package.json";
import { getContainerRuntime } from "@/scripts/runtime";

const runtime = getContainerRuntime();
const tag = `${name}:${version}`;
const containerName = `${name}-dev`;

console.log(`Using ${runtime} to run ${tag}...`);

const proc = Bun.spawn(
  [
    runtime,
    "run",
    "--rm",
    "--name",
    containerName,
    "--env-file",
    ".env",
    "--network",
    "host",
    tag,
  ],
  {
    stdio: ["inherit", "inherit", "inherit"],
  },
);

let shuttingDown = false;

async function shutdown(signal: NodeJS.Signals) {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log(`\nReceived ${signal}, stopping container...`);

  try {
    await Bun.spawn([runtime, "stop", "--time", "2", containerName], {
      stdio: ["ignore", "inherit", "inherit"],
    }).exited;
  } catch {
    // Ingore
  }

  const exitCode = await proc.exited;
  process.exit(exitCode);
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

const exitCode = await proc.exited;
process.exit(exitCode);
