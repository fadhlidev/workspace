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
  FormControl,
  FormHelperText,
  IconButton,
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
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Shield,
  User,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { goeyToast } from "goey-toast";
import { getApiErrorMessage } from "@backend/helpers/api";

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

type RegisterUserInput = z.infer<typeof registerUserSchema>;

export interface RegisterUserDialogProps {
  open: boolean;
  onClose: () => void;
}

export function RegisterUserDialog({ open, onClose }: RegisterUserDialogProps) {
  const trpc = useTRPC();
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

  const { isPending, mutate } = useMutation(
    trpc.management.users.create.mutationOptions({
      onSuccess: () => {
        goeyToast.success("Pengguna baru berhasil ditambahkan");
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
        onSubmit={handleSubmit((data) =>
          mutate({
            name: data.name,
            username: data.username,
            email: data.email,
            password: data.password,
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
