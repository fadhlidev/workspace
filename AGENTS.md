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
- **Commit Messages**: Always format commit messages as `{action}({feature?}): {message}` followed by a description or list of changes (e.g. `feat(users): refactor user dialogs into standalone components`). Action examples: `feat`, `fix`, `refactor`, `chore`, `docs`.
- **Imports**: Never use relative imports. Always use path aliases defined in `tsconfig.json`: `@/*`, `@backend/*`, `@frontend/*`, `@shared/*`, `@storage/*`, `@pages/*`.
- **Shared Schemas**: Put zod schemas usable on both client and server (tRPC inputs, shared DTOs) in `@shared/schemas` (e.g. `@shared/schemas/auth/login`, `@shared/schemas/management/users`). Import them via the `@shared/*` alias and reuse their inferred types instead of duplicating shapes in modules.
- **Verification**: Always run the format task (`npm run format` or `bun run format`) followed by the lint task (`npm run lint` or `bun run lint`) at the end of making changes to verify code correctness and formatting.

## Component Usage

Prefer shared components and existing hooks over building new ones. Reference patterns seen in `app/(frontend)/components/common/` and `app/(frontend)/hooks/`.

### `Can` — RBAC conditional rendering

Wrap content that requires permission. `resource` and `action` come from `@shared/types/rbac`; `fallback` is optional.

```tsx
import { Can } from "@frontend/components/common/can";

<Can resource="user" action="create">
  <Button>Tambah Pengguna</Button>
</Can>;
```

### `Trigger` — popup/dialog state management

Render-prop component that manages `open`, `anchorEl`, and an optional value. The rendered content must satisfy `TriggerContentProps` (`value?`, `open`, `anchorEl`, `onClose`). Usage is not limited to dialogs — any component accepting these props works.

```tsx
import { Trigger } from "@frontend/components/common/trigger";

<Trigger
  content={(props) => (
    <UpdateInfoDialog {...props} user={props.value as User} />
  )}
>
  {({ handleOpen }) => (
    <Button onClick={(e) => handleOpen(e, params.row)}>
      <UserPen className="size-5" />
    </Button>
  )}
</Trigger>;
```

### Search params

Use [nuqs](https://nuqs.dev) for search params on both the client and server side. Do not hand-roll query-string parsing or suspense hooks.

### Hooks

Prefer existing lookup hooks (`usePermissions`, `useMenu`, `useProfile`) and `react-use` over creating new hooks.
