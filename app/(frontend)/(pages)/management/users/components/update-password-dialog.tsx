"use client";

import { useToggle } from "react-use";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@frontend/trpc/client";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  InputLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Eye, EyeOff, KeyRound, Lock, UserKey } from "lucide-react";
import { goeyToast } from "goey-toast";
import { getApiErrorMessage } from "@backend/helpers/api";
import type { User } from "@pages/management/users/types/user";

const updatePasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z
      .string()
      .min(6, "Konfirmasi password minimal 6 karakter"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;

export interface UpdatePasswordDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
}

export function UpdatePasswordDialog({
  open,
  user,
  onClose,
}: UpdatePasswordDialogProps) {
  const trpc = useTRPC();
  const [showNew, toggleShowNew] = useToggle(false);
  const [showConfirm, toggleShowConfirm] = useToggle(false);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const { isPending, mutate } = useMutation(
    trpc.management.users.updatePassword.mutationOptions({
      onSuccess: () => {
        goeyToast.success("Password pengguna berhasil diperbarui");
        handleClose();
      },
      onError: (err) => {
        setError("root", { message: getApiErrorMessage(err) });
      },
    }),
  );

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : handleClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: { className: "rounded-xl" },
      }}
    >
      <DialogTitle className="pb-2">
        <Stack direction="row" spacing={1.5} className="items-center">
          <Box className="flex size-9 items-center justify-center rounded-lg bg-amber-50">
            <UserKey className="size-5 text-amber-600" />
          </Box>
          <Box>
            <Typography className="font-lato text-base font-semibold text-gray-800">
              Ubah Password
            </Typography>
            <Typography className="font-poppins text-xs text-gray-500">
              {user?.name ?? ""}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <Divider />

      <Box
        component="form"
        onSubmit={handleSubmit((data) =>
          mutate({
            id: user!.id,
            newPassword: data.newPassword,
          }),
        )}
        noValidate
      >
        <DialogContent className="space-y-4 pt-4">
          {errors.root && (
            <Alert severity="error" className="rounded-lg">
              {errors.root.message}
            </Alert>
          )}

          {/* New Password */}
          <Box className="space-y-1">
            <InputLabel
              htmlFor="new-password"
              className="font-lato text-sm font-medium text-gray-700"
            >
              Password Baru
            </InputLabel>
            <TextField
              id="new-password"
              type={showNew ? "text" : "password"}
              variant="outlined"
              size="small"
              placeholder="Masukkan password baru"
              slotProps={{
                input: {
                  className: "rounded-lg font-lato",
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock className="size-4 text-gray-400" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        edge="end"
                        onClick={toggleShowNew}
                        tabIndex={-1}
                        aria-label="toggle password visibility"
                      >
                        {showNew ? (
                          <EyeOff className="size-4 text-gray-400" />
                        ) : (
                          <Eye className="size-4 text-gray-400" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              {...register("newPassword")}
              error={!!errors.newPassword}
              helperText={errors.newPassword?.message ?? "Minimal 6 karakter"}
              fullWidth
            />
          </Box>

          {/* Confirm Password */}
          <Box className="space-y-1">
            <InputLabel
              htmlFor="confirm-password"
              className="font-lato text-sm font-medium text-gray-700"
            >
              Konfirmasi Password Baru
            </InputLabel>
            <TextField
              id="confirm-password"
              type={showConfirm ? "text" : "password"}
              variant="outlined"
              size="small"
              placeholder="Ulangi password baru"
              slotProps={{
                input: {
                  className: "rounded-lg font-lato",
                  startAdornment: (
                    <InputAdornment position="start">
                      <KeyRound className="size-4 text-gray-400" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        edge="end"
                        onClick={toggleShowConfirm}
                        tabIndex={-1}
                        aria-label="toggle confirm password visibility"
                      >
                        {showConfirm ? (
                          <EyeOff className="size-4 text-gray-400" />
                        ) : (
                          <Eye className="size-4 text-gray-400" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              {...register("confirmPassword")}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              fullWidth
            />
          </Box>
        </DialogContent>

        <Divider />

        <DialogActions className="px-6 py-3">
          <Button
            type="button"
            variant="text"
            color="inherit"
            size="small"
            className="h-8 rounded-lg px-4 text-gray-600"
            onClick={handleClose}
            disabled={isPending}
          >
            Batalkan
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="warning"
            size="small"
            className="h-8 rounded-lg px-4"
            startIcon={<KeyRound className="size-4" />}
            loading={isPending}
          >
            Perbarui Password
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
