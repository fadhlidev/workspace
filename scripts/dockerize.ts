import { name, version } from "@/package.json";
import { getContainerRuntime } from "@/scripts/runtime";

const tag = `${name}:${version}`;
const runtime = getContainerRuntime();

console.log(`Using ${runtime} to build...`);

const proc = Bun.spawn([runtime, "build", "-t", tag, "."], {
  stdio: ["inherit", "inherit", "inherit"],
});

const exitCode = await proc.exited;

if (exitCode !== 0) {
  console.error(`Build failed with exit code ${exitCode}`);
  process.exit(exitCode);
}

console.log(`Built image: ${tag}`);
