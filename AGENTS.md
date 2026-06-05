<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Guidelines

- **Development Runtime**: This project uses **Bun** (`bun`) for development.
- **Nix Support**: If Nix is installed, you can use the environment defined in `flake.nix` by running commands within the Nix shell environment, e.g. `nix develop --command bun <command>`.
- **Managing Dependencies**:
  - When installing a dependency, run `bun add <package>` first, and then run `npm i` to ensure `package-lock.json` is kept updated.
  - When uninstalling a dependency, run `bun remove <package>` first, and then run `npm i` to ensure `package-lock.json` is kept updated.
- **Commit Messages**: Always format commit messages exactly as `{action}: {message}` (e.g., `feat: add temporary mobile drawer layout`).
- **Verification**: Always run the format task (`npm run format` or `bun run format`) followed by the lint task (`npm run lint` or `bun run lint`) at the end of making changes to verify code correctness and formatting.
