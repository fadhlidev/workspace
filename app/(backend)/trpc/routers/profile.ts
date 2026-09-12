import { router, protectedProcedure } from "@backend/trpc/trpc";
import {
  changePassword,
  getProfile,
  updateProfile,
} from "@backend/modules/profile/services";
import {
  changePasswordRequestSchema,
  updateProfileRequestSchema,
} from "@shared/schemas/profile";

export const profileRouter = router({
  getMe: protectedProcedure.query(async ({ ctx }) => getProfile(ctx.user.id)),

  updateMe: protectedProcedure
    .input(updateProfileRequestSchema)
    .mutation(async ({ ctx, input }) => updateProfile(ctx.user.id, input)),

  changePassword: protectedProcedure
    .input(changePasswordRequestSchema)
    .mutation(async ({ ctx, input }) => changePassword(ctx.user.id, input)),
});
