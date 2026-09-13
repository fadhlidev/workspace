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

## Backend Organization

Keep tRPC routers free of business logic. All backend logic lives in `app/(backend)/modules/<module>/`, and routes only wire procedures to services.

- **Module structure**: One folder per module under `app/(backend)/modules/`. Files by responsibility — `services.ts` (business logic/DB access), plus optional `libs.ts`, `helpers.ts`, `constants.ts` as the module needs.
- **Thin routers**: `app/(backend)/trpc/routers/**` only define procedures (auth middleware, input schemas) and delegate to module services. No queries, no DB calls, no `TRPCError` throws, no token/guard logic in routers.
- **Services own business logic**: DB operations, validation/guards, error throwing, and token logic live in module `services.ts`. Services accept typed inputs (reuse inferred types from `@shared/schemas` when applicable).
- **Client forms reuse shared schemas**: Derive form schemas from the shared request schemas via `.omit()`, `.extend()`, and `.refine()`. Add form-only fields (e.g. `confirmPassword` + password-match refine) in the component, never re-declare the fields the API already validates.

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

### CRUD with TanStack DB

For CRUD and list/detail fetching, use `@tanstack/react-db` instead of manually wiring `useQuery` + `useMutation` + cache invalidation. Define one `collectionOptions(...)` descriptor per entity (wrapped in `queryCollectionOptions`) and drive all views through `useDbClient().collection(...)` + `useLiveQuery`. Mutations (`insert`/`update`/`delete`) apply optimistically and sync via the descriptor's `onInsert`/`onUpdate`/`onDelete` handlers. See the [Quick Start](https://tanstack.com/db/latest/docs/quick-start).

Backend stays on tRPC — the descriptor's `queryFn` (load) and CRUD handlers (persist) call the corresponding tRPC procedures, so no server code changes.

- **Collection files**: Store each `collectionOptions(...)` descriptor in a feature-local `collections/` folder, one file per collection named after the entity (e.g. `@pages/management/users/collections/user.ts`, `@pages/management/access-permission/collections/role-permissions.ts`). A module can have multiple collections — keep them in separate files. Export the collection's row/response types from the same file.

Requires `@tanstack/react-db`, `@tanstack/query-db-collection`, and `@tanstack/query-core`.

```tsx
const todoCollection = collectionOptions("todos", (client) =>
  queryCollectionOptions({
    id: "todos",
    queryKey: ["todos"],
    queryClient: client.requireDependency<QueryClient>("queryClient"),
    queryFn: () => trpc.todos.list.query(),
    getKey: (item) => item.id,
    onInsert: async ({ transaction }) => {
      const { modified } = transaction.mutations[0];
      await trpc.todos.create.mutate(modified);
    },
    onUpdate: async ({ transaction }) => {
      const { original, modified } = transaction.mutations[0];
      await trpc.todos.update.mutate({ id: original.id, ...modified });
    },
    onDelete: async ({ transaction }) => {
      const { original } = transaction.mutations[0];
      await trpc.todos.delete.mutate({ id: original.id });
    },
  }),
);
```
