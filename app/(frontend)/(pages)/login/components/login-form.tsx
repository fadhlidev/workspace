"use client";

import { z } from "zod";
import { cx } from "classix";
import Image from "next/image";
import { useState } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { signIn } from "next-auth/react";
import {
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Alert,
  Typography,
  Box,
  Divider,
} from "@mui/material";

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export type LoginResponse = {
  token: string;
  user: {
    name: string;
    email: string;
  };
};

const textFieldClasses =
  "[&_.MuiOutlinedInput-root]:rounded-[10px] [&_.MuiOutlinedInput-root]:bg-white [&_.MuiOutlinedInput-notchedOutline]:border-[#e0e0e0] hover:[&_.MuiOutlinedInput-notchedOutline]:border-[#b0b0b0] [&_.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-primary";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const { isPending, mutate } = useMutation({
    mutationFn: async (data: LoginInput) => {
      const result = await signIn("credentials", {
        username: data.username,
        password: data.password,
        redirect: false,
      });
      if (result?.error) throw new Error("Invalid username or password");
      return result;
    },
    onSuccess: () => {
      const next = searchParams.get("next");
      router.replace(next && next.startsWith("/") ? next : "/");
    },
    onError: (err) => {
      setError("root", { message: err.message });
    },
  });

  return (
    <Box component="main" className="flex min-h-screen flex-col bg-[#f8f9fb]">
      <Box component="header" className="px-3 py-2.5 sm:px-4 sm:py-3 md:px-6">
        <Image
          src="/images/logo.svg"
          alt="Logo"
          width={160}
          height={40}
          className="h-8 w-auto object-contain"
          priority
        />
      </Box>

      <Divider className="block sm:hidden" />

      <Box className="flex flex-1 justify-center px-2 pt-4 pb-4 sm:items-center sm:pt-0 sm:pb-8">
        <Box className="w-full max-w-110">
          <Typography
            className="font-lato text-primary text-[1.75rem] font-black sm:text-[2.125rem]"
            variant="h4"
          >
            Login
          </Typography>
          <Typography className="mb-8 text-[0.95rem] text-black/60">
            Hi, Welcome back 👋
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit((data) => mutate(data))}
            className="flex flex-col"
          >
            <Box className="mb-6 flex items-center gap-4">
              <Box className="h-px flex-1 bg-[#e0e0e0]" />
              <Typography className="text-[0.8rem] whitespace-nowrap text-black/40">
                Login to your account
              </Typography>
              <Box className="h-px flex-1 bg-[#e0e0e0]" />
            </Box>

            <Typography
              component="label"
              htmlFor="username"
              className="text-foreground mb-1.5 text-sm font-medium"
            >
              Username
            </Typography>
            <TextField
              id="username"
              placeholder="E.g. johndoe"
              autoComplete="username"
              fullWidth
              size="small"
              className={cx("mb-5", textFieldClasses)}
              {...register("username")}
              error={!!errors.username}
              helperText={errors.username?.message}
            />

            <Typography
              component="label"
              htmlFor="password"
              className="text-primary mb-1.5 text-sm font-medium"
            >
              Password
            </Typography>
            <TextField
              id="password"
              placeholder="Enter your password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              fullWidth
              size="small"
              className={cx("mb-5", textFieldClasses)}
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        edge="end"
                        size="small"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            {errors.root && (
              <Alert
                severity="error"
                className="mb-5 items-center rounded-[10px]"
              >
                {errors.root.message}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isPending}
              className="bg-primary disabled:bg-primary gap-2.5 rounded-[10px] py-3.5 text-[0.95rem] font-bold text-white normal-case hover:bg-[#162440] disabled:text-white disabled:opacity-60"
            >
              <LogIn size={18} />
              {isPending ? "Signing in..." : "Login"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
