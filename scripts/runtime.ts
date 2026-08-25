export function getContainerRuntime(): "podman" | "docker" {
  const runtime = Bun.which("podman")
    ? "podman"
    : Bun.which("docker")
      ? "docker"
      : null;

  if (!runtime) {
    console.error("Neither podman nor docker found in PATH");
    process.exit(1);
  }

  return runtime;
}
