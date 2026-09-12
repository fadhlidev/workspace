import { router, adminProcedure } from "@backend/trpc/trpc";
import {
  createUser,
  deleteUser,
  listUsers,
  updateUser,
  updateUserPassword,
} from "@backend/modules/management/users/services";
import {
  createUserRequestSchema,
  deleteUserRequestSchema,
  listUsersRequestSchema,
  updateUserPasswordRequestSchema,
  updateUserRequestSchema,
} from "@shared/schemas/management/users";

export const managementUsersRouter = router({
  list: adminProcedure
    .input(listUsersRequestSchema.optional())
    .query(async ({ input }) => listUsers(input)),

  create: adminProcedure
    .input(createUserRequestSchema)
    .mutation(async ({ input }) => createUser(input)),

  update: adminProcedure
    .input(updateUserRequestSchema)
    .mutation(async ({ ctx, input }) => updateUser(ctx.user.id, input)),

  updatePassword: adminProcedure
    .input(updateUserPasswordRequestSchema)
    .mutation(async ({ input }) => updateUserPassword(input)),

  delete: adminProcedure
    .input(deleteUserRequestSchema)
    .mutation(async ({ ctx, input }) => deleteUser(ctx.user.id, input)),
});
