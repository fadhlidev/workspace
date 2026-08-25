"use client";

import { useEffect, useRef, useState } from "react";
import { useToggle } from "react-use";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@backend/api/client";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  FormControl,
  FormHelperText,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Skeleton,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridSortModel,
} from "@mui/x-data-grid";
import {
  AlertTriangle,
  AtSign,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Pencil,
  Search,
  Shield,
  Trash2,
  User,
  UserCheck,
  UserKey,
  UserPen,
  UserPlus,
  UserRoundX,
} from "lucide-react";
import { goeyToast } from "goey-toast";
import { formatDate } from "@shared/helpers/formatter";

type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  createdAt: string;
};

const updateInfoSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  username: z.string().min(3, "Username minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  role: z.enum(["user", "admin"]).optional(),
});

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

const registerUserSchema = z
  .object({
    name: z.string().min(1, "Nama wajib diisi"),
    username: z.string().min(3, "Username minimal 3 karakter"),
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z
      .string()
      .min(6, "Konfirmasi password minimal 6 karakter"),
    role: z.enum(["user", "admin"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

type UpdateInfoInput = z.infer<typeof updateInfoSchema>;
type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
type RegisterUserInput = z.infer<typeof registerUserSchema>;

function stringAvatar(name: string) {
  return {
    className:
      "bg-gradient-to-br from-teal-700 to-slate-900 text-sm font-black text-white shadow-sm ring-4 ring-teal-50",
    children: name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0])
      .join(""),
  };
}

function getApiErrorMessage(err: unknown): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ||
    (err as Error).message ||
    "Terjadi kesalahan"
  );
}

interface UpdateInfoDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
}

function UpdateInfoDialog({ open, user, onClose }: UpdateInfoDialogProps) {
  const queryClient = useQueryClient();

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

  const { isPending, mutate } = useMutation({
    mutationFn: async (data: UpdateInfoInput) => {
      const res = await api.patch(`/api/management/users/${user?.id}`, {
        name: data.name,
        username: data.username,
        email: data.email,
        role: data.role,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/management/users"] });
      goeyToast.success("Informasi pengguna berhasil diperbarui");
      handleClose();
    },
    onError: (err) => {
      setError("root", { message: getApiErrorMessage(err) });
    },
  });

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
        onSubmit={handleSubmit((data) => mutate(data))}
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
                      <User className="size-4 text-gray-400" />
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

interface UpdatePasswordDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
}

function UpdatePasswordDialog({
  open,
  user,
  onClose,
}: UpdatePasswordDialogProps) {
  const queryClient = useQueryClient();
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

  const { isPending, mutate } = useMutation({
    mutationFn: async (data: UpdatePasswordInput) => {
      const res = await api.patch(
        `/api/management/users/${user?.id}/password`,
        {
          newPassword: data.newPassword,
        },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/management/users"] });
      goeyToast.success("Password pengguna berhasil diperbarui");
      handleClose();
    },
    onError: (err) => {
      setError("root", { message: getApiErrorMessage(err) });
    },
  });

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
        onSubmit={handleSubmit((data) => mutate(data))}
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

interface DeleteConfirmDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
}

function DeleteConfirmDialog({
  open,
  user,
  onClose,
}: DeleteConfirmDialogProps) {
  const queryClient = useQueryClient();

  const { isPending, mutate } = useMutation({
    mutationFn: async () => {
      const res = await api.delete(`/api/management/users/${user?.id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/management/users"] });
      goeyToast.success("Pengguna berhasil dihapus");
      onClose();
    },
    onError: (err) => {
      goeyToast.error(getApiErrorMessage(err));
      onClose();
    },
  });

  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: { className: "rounded-xl" },
      }}
    >
      <DialogTitle className="pb-2">
        <Stack direction="row" spacing={1.5} className="items-center">
          <Box className="flex size-9 items-center justify-center rounded-lg bg-red-50">
            <AlertTriangle className="size-5 text-red-500" />
          </Box>
          <Box>
            <Typography className="font-lato text-base font-semibold text-gray-800">
              Hapus Pengguna
            </Typography>
            <Typography className="font-poppins text-xs text-gray-500">
              Tindakan ini tidak dapat dibatalkan
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent className="pt-4">
        <Alert
          severity="error"
          className="rounded-lg"
          icon={<Trash2 className="size-5" />}
        >
          <Typography className="font-lato text-sm">
            Apakah kamu yakin ingin menghapus akun{" "}
            <span className="font-semibold">{user?.name}</span> (
            <span className="font-mono text-xs">@{user?.username}</span>)?
            <br />
            Data akun ini akan dihapus permanen dari sistem.
          </Typography>
        </Alert>
      </DialogContent>

      <Divider />

      <DialogActions className="px-6 py-3">
        <Button
          type="button"
          variant="text"
          color="inherit"
          size="small"
          className="rounded-lg px-4 text-gray-600"
          onClick={onClose}
          disabled={isPending}
        >
          Batalkan
        </Button>
        <Button
          type="button"
          variant="contained"
          color="error"
          size="small"
          className="rounded-lg px-4"
          startIcon={<Trash2 className="size-4" />}
          loading={isPending}
          onClick={() => mutate()}
        >
          Hapus Pengguna
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface RegisterUserDialogProps {
  open: boolean;
  onClose: () => void;
}

function RegisterUserDialog({ open, onClose }: RegisterUserDialogProps) {
  const queryClient = useQueryClient();
  const [showPassword, toggleShowPassword] = useToggle(false);
  const [showConfirm, toggleShowConfirm] = useToggle(false);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<RegisterUserInput>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      role: "user",
    },
  });

  const { isPending, mutate } = useMutation({
    mutationFn: async (data: RegisterUserInput) => {
      const res = await api.post("/api/management/users", {
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/management/users"] });
      goeyToast.success("Pengguna baru berhasil ditambahkan");
      handleClose();
    },
    onError: (err) => {
      setError("root", { message: getApiErrorMessage(err) });
    },
  });

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
          <Box className="flex size-9 items-center justify-center rounded-lg bg-green-50">
            <UserPlus className="size-5 text-green-600" />
          </Box>
          <Box>
            <Typography className="font-poppins text-base font-semibold text-gray-800">
              Tambah Pengguna Baru
            </Typography>
            <Typography className="font-lato text-xs text-gray-500">
              Daftarkan akun pengguna baru ke dalam sistem
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <Divider />

      <Box
        component="form"
        onSubmit={handleSubmit((data) => mutate(data))}
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
              htmlFor="reg-name"
              className="font-lato text-sm font-medium text-gray-700"
            >
              Nama Lengkap
            </InputLabel>
            <TextField
              id="reg-name"
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

          {/* Username + Email */}
          <Stack direction="row" spacing={2}>
            <Box className="flex-1 space-y-1">
              <InputLabel
                htmlFor="reg-username"
                className="font-lato text-sm font-medium text-gray-700"
              >
                Username
              </InputLabel>
              <TextField
                id="reg-username"
                variant="outlined"
                size="small"
                placeholder="Masukkan username"
                slotProps={{
                  input: {
                    className: "rounded-lg font-lato",
                    startAdornment: (
                      <InputAdornment position="start">
                        <User className="size-4 text-gray-400" />
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

            <Box className="flex-1 space-y-1">
              <InputLabel
                htmlFor="reg-email"
                className="font-lato text-sm font-medium text-gray-700"
              >
                Alamat Email
              </InputLabel>
              <TextField
                id="reg-email"
                type="email"
                variant="outlined"
                size="small"
                placeholder="Masukkan email"
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
          </Stack>

          {/* Password */}
          <Stack direction="row" spacing={2}>
            <Box className="flex-1 space-y-1">
              <InputLabel
                htmlFor="reg-password"
                className="font-lato text-sm font-medium text-gray-700"
              >
                Password
              </InputLabel>
              <TextField
                id="reg-password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                size="small"
                placeholder="Masukkan password"
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
                          onClick={toggleShowPassword}
                          tabIndex={-1}
                          aria-label="toggle password visibility"
                        >
                          {showPassword ? (
                            <EyeOff className="size-4 text-gray-400" />
                          ) : (
                            <Eye className="size-4 text-gray-400" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                {...register("password")}
                error={!!errors.password}
                helperText={errors.password?.message ?? "Minimal 6 karakter"}
                fullWidth
              />
            </Box>

            <Box className="flex-1 space-y-1">
              <InputLabel
                htmlFor="reg-confirm-password"
                className="font-lato text-sm font-medium text-gray-700"
              >
                Konfirmasi Password
              </InputLabel>
              <TextField
                id="reg-confirm-password"
                type={showConfirm ? "text" : "password"}
                variant="outlined"
                size="small"
                placeholder="Ulangi password"
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
          </Stack>

          <Box className="w-36 space-y-1">
            <InputLabel
              htmlFor="reg-role"
              className="font-lato text-sm font-medium text-gray-700"
            >
              Role
            </InputLabel>
            <FormControl size="small" fullWidth error={!!errors.role}>
              <Select
                id="reg-role"
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
            color="success"
            size="small"
            className="h-8 rounded-lg px-4"
            startIcon={<UserPlus className="size-4" />}
            loading={isPending}
          >
            Tambah Pengguna
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export function UserTable() {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  const [updateInfoTarget, setUpdateInfoTarget] = useState<User | null>(null);
  const [updatePasswordTarget, setUpdatePasswordTarget] = useState<User | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);

  const sort = sortModel.length > 0 ? sortModel[0].field : undefined;
  const order = sortModel.length > 0 ? sortModel[0].sort : undefined;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      "/api/management/users",
      paginationModel.page,
      paginationModel.pageSize,
      sort,
      order,
      search,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(paginationModel.page + 1));
      params.set("limit", String(paginationModel.pageSize));
      if (sort) params.set("sort", sort);
      if (order) params.set("order", order);
      if (search) params.set("search", search);

      const res = await api.get<{
        data: User[];
        total: number;
      }>(`/api/management/users?${params}`);
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  const columns: GridColDef<User>[] = [
    {
      field: "name",
      headerName: "Nama Pengguna",
      width: 250,
      flex: 1,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: "center", height: "100%" }}
        >
          <Avatar {...stringAvatar(params.row.name)} />
          <Box>
            <Typography variant="body2" className="font-semibold">
              {params.row.name}
            </Typography>
            <Typography
              variant="body2"
              className="text-xs font-medium text-gray-500"
            >
              @{params.row.username}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: "email",
      headerName: "Alamat Email",
      width: 280,
      disableColumnMenu: true,
    },
    {
      field: "createdAt",
      headerName: "Ditambahkan",
      width: 160,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Typography variant="body2" className="text-sm">
          {formatDate(params.value)}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Aksi",
      width: 160,
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" className="flex-nowrap items-center gap-2">
          <Tooltip title="Update Info" placement="top">
            <Button
              variant="contained"
              size="small"
              color="info"
              className="size-9 min-w-9 rounded-lg"
              onClick={() => setUpdateInfoTarget(params.row)}
            >
              <UserPen className="size-5" />
            </Button>
          </Tooltip>
          <Tooltip title="Change Password" placement="top">
            <Button
              variant="contained"
              size="small"
              color="warning"
              className="size-9 min-w-9 rounded-lg"
              onClick={() => setUpdatePasswordTarget(params.row)}
            >
              <UserKey className="size-5" />
            </Button>
          </Tooltip>
          <Tooltip title="Remove" placement="top">
            <Button
              variant="contained"
              size="small"
              color="error"
              className="size-9 min-w-9 rounded-lg"
              onClick={() => setDeleteTarget(params.row)}
            >
              <UserRoundX className="size-5" />
            </Button>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <>
      <Box>
        <Stack
          direction="row"
          className="mb-3 items-center justify-between gap-2"
        >
          <Stack
            direction="row"
            className="w-full items-center gap-2"
            sx={{ flexWrap: "wrap" }}
          >
            <Typography
              variant="h6"
              component="div"
              className="font-lato text-[1rem] font-semibold text-nowrap text-gray-800"
            >
              Semua Pengguna
            </Typography>
            {data ? (
              <Typography
                component="div"
                className="font-lato text-[1rem] font-semibold text-gray-500"
              >
                {data?.total ?? 0}
              </Typography>
            ) : null}
          </Stack>

          <TextField
            variant="outlined"
            size="small"
            placeholder="Cari nama, username, atau email"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            slotProps={{
              input: {
                className: "rounded-lg font-lato bg-white",
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className="size-4 text-gray-400" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ minWidth: 300 }}
          />

          <Button
            variant="contained"
            color="success"
            size="small"
            className="h-9 min-w-40 rounded-lg px-3 text-nowrap"
            startIcon={<UserPlus className="size-4" />}
            onClick={() => setRegisterOpen(true)}
            disabled={isLoading}
          >
            Tambah Pengguna
          </Button>
        </Stack>
        <Card
          variant="outlined"
          className="@container overflow-hidden rounded-lg"
        >
          <CardContent className="last:pb-0">
            <Box sx={{ mt: -2, mx: -2, height: "calc(100dvh - 170px)" }}>
              {!data ? (
                <Skeleton className="h-full rounded-none" variant="rounded" />
              ) : (
                <DataGrid
                  rows={data?.data ?? []}
                  columns={columns}
                  rowCount={data?.total ?? 0}
                  loading={isLoading || isFetching}
                  paginationMode="server"
                  paginationModel={paginationModel}
                  onPaginationModelChange={setPaginationModel}
                  sortingMode="server"
                  sortModel={sortModel}
                  onSortModelChange={setSortModel}
                  getRowId={(row) => row.id}
                  pageSizeOptions={[10, 20, 50, 100]}
                  getRowClassName={() =>
                    "hover:bg-white hover:shadow-[inset_4px_0_0_#0f766e,0_8px_22px_rgba(15,23,42,0.06)] transition duration-200 ease-out"
                  }
                  getRowHeight={() => "auto"}
                  className="font-poppins border-0"
                  classes={{
                    columnHeader: "bg-slate-50 text-xs uppercase text-gray-600",
                  }}
                  sx={{
                    "& .MuiDataGrid-row": {
                      minHeight: "72px !important",
                    },
                    "& .MuiDataGrid-cell": {
                      minHeight: "72px !important",
                      display: "flex",
                      alignItems: "center",
                      py: 1.5,
                    },
                    "& .MuiDataGrid-cellContent": {
                      whiteSpace: "normal",
                      lineHeight: 1.4,
                    },
                    "& .MuiDataGrid-cell:focus": {
                      outline: "none",
                    },
                    "& .MuiDataGrid-cell:focus-within": {
                      outline: "none",
                    },
                    "& .MuiDataGrid-columnHeader:focus": {
                      outline: "none",
                    },
                    "& .MuiDataGrid-columnHeader:focus-within": {
                      outline: "none",
                    },
                  }}
                  disableRowSelectionOnClick
                />
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Dialogs */}
      <UpdateInfoDialog
        open={!!updateInfoTarget}
        user={updateInfoTarget}
        onClose={() => setUpdateInfoTarget(null)}
      />
      <UpdatePasswordDialog
        open={!!updatePasswordTarget}
        user={updatePasswordTarget}
        onClose={() => setUpdatePasswordTarget(null)}
      />
      <DeleteConfirmDialog
        open={!!deleteTarget}
        user={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
      <RegisterUserDialog
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
      />
    </>
  );
}
