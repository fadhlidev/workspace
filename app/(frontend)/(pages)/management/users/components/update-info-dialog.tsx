"use client";

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
  FormControl,
  FormHelperText,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  AtSign,
  Pencil,
  Shield,
  User as UserIcon,
  UserCheck,
  UserPen,
} from "lucide-react";
import { goeyToast } from "goey-toast";
import { getApiErrorMessage } from "@backend/helpers/api";
import type { User } from "@pages/management/users/types/user";

const updateInfoSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  username: z.string().min(3, "Username minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  role: z.enum(["user", "admin"]).optional(),
});

type UpdateInfoInput = z.infer<typeof updateInfoSchema>;

export interface UpdateInfoDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
}

export function UpdateInfoDialog({
  open,
  user,
  onClose,
}: UpdateInfoDialogProps) {
  const trpc = useTRPC();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<UpdateInfoInput>({
    resolver: zodResolver(updateInfoSchema),
    values: user
      ? {
          name: user.name,
          username: user.username,
          email: user.email,
          role: "user",
        }
      : undefined,
  });

  const { isPending, mutate } = useMutation(
    trpc.management.users.update.mutationOptions({
      onSuccess: () => {
        goeyToast.success("Informasi pengguna berhasil diperbarui");
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
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: { className: "rounded-xl" },
      }}
    >
      <DialogTitle className="pb-2">
        <Stack direction="row" spacing={1.5} className="items-center">
          <Box className="flex size-9 items-center justify-center rounded-lg bg-blue-50">
            <UserPen className="size-5 text-blue-600" />
          </Box>
          <Box>
            <Typography className="font-lato text-base font-semibold text-gray-800">
              Update Info Pengguna
            </Typography>
            <Typography className="font-poppins text-xs text-gray-500">
              Perbarui informasi dasar akun pengguna
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
            name: data.name,
            username: data.username,
            email: data.email,
            role: data.role,
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

          {/* Name */}
          <Box className="space-y-1">
            <InputLabel
              htmlFor="update-name"
              className="font-lato text-sm font-medium text-gray-700"
            >
              Nama Lengkap
            </InputLabel>
            <TextField
              id="update-name"
              variant="outlined"
              size="small"
              placeholder="Masukkan nama lengkap"
              slotProps={{
                input: {
                  className: "rounded-lg font-lato",
                  startAdornment: (
                    <InputAdornment position="start">
                      <UserCheck className="size-4 text-gray-400" />
                    </InputAdornment>
                  ),
                },
              }}
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
              fullWidth
            />
          </Box>

          {/* Username */}
          <Box className="space-y-1">
            <InputLabel
              htmlFor="update-username"
              className="font-lato text-sm font-medium text-gray-700"
            >
              Username
            </InputLabel>
            <TextField
              id="update-username"
              variant="outlined"
              size="small"
              placeholder="Masukkan username"
              slotProps={{
                input: {
                  className: "rounded-lg font-lato",
                  startAdornment: (
                    <InputAdornment position="start">
                      <UserIcon className="size-4 text-gray-400" />
                    </InputAdornment>
                  ),
                },
              }}
              {...register("username")}
              error={!!errors.username}
              helperText={errors.username?.message}
              fullWidth
            />
          </Box>

          {/* Email */}
          <Box className="space-y-1">
            <InputLabel
              htmlFor="update-email"
              className="font-lato text-sm font-medium text-gray-700"
            >
              Alamat Email
            </InputLabel>
            <TextField
              id="update-email"
              type="email"
              variant="outlined"
              size="small"
              placeholder="Masukkan alamat email"
              slotProps={{
                input: {
                  className: "rounded-lg font-lato",
                  startAdornment: (
                    <InputAdornment position="start">
                      <AtSign className="size-4 text-gray-400" />
                    </InputAdornment>
                  ),
                },
              }}
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
              fullWidth
            />
          </Box>

          {/* Role */}
          <Box className="w-36 space-y-1">
            <InputLabel
              htmlFor="update-role"
              className="font-lato text-sm font-medium text-gray-700"
            >
              Role
            </InputLabel>
            <FormControl size="small" fullWidth error={!!errors.role}>
              <Select
                id="update-role"
                defaultValue="user"
                className="font-lato rounded-lg"
                startAdornment={
                  <InputAdornment position="start">
                    <Shield className="size-4 text-gray-400" />
                  </InputAdornment>
                }
                {...register("role")}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
              {errors.role && (
                <FormHelperText>{errors.role.message}</FormHelperText>
              )}
            </FormControl>
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
            color="info"
            size="small"
            className="h-8 rounded-lg px-4"
            startIcon={<Pencil className="size-4" />}
            loading={isPending}
          >
            Simpan Perubahan
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
