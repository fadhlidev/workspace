"use client";

import { cx } from "classix";
import { useState } from "react";
import { Eye, EyeOff, LogIn, User, Lock } from "lucide-react";
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
} from "@mui/material";
import {
  loginRequestSchema,
  type LoginRequest,
} from "@shared/schemas/auth/login";

const textFieldClasses = cx(
  "[&_.MuiOutlinedInput-root]:rounded-lg [&_.MuiOutlinedInput-root]:bg-white/20 [&_.MuiOutlinedInput-root]:backdrop-blur-sm",
  "[&_.MuiOutlinedInput-input]:font-lato [&_.MuiOutlinedInput-input::placeholder]:opacity-100",
);

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
  });

  const { isPending, mutate } = useMutation({
    mutationFn: async (data: LoginRequest) => {
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
    <Box
      component="form"
      onSubmit={handleSubmit((data) => mutate(data))}
      className="flex flex-col gap-5"
    >
      <Box>
        <Typography
          component="label"
          htmlFor="username"
          className="font-lato text-primary mb-1.5 block text-base font-semibold"
        >
          Username
        </Typography>
        <TextField
          id="username"
          placeholder="E.g. johndoe"
          autoComplete="username"
          fullWidth
          className={textFieldClasses}
          {...register("username")}
          error={!!errors.username}
          helperText={errors.username?.message}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <User size={16} className="text-primary" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <Box>
        <Typography
          component="label"
          htmlFor="password"
          className="font-lato text-primary mb-1.5 block text-base font-semibold"
        >
          Password
        </Typography>
        <TextField
          id="password"
          placeholder="Enter your password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          fullWidth
          className={textFieldClasses}
          {...register("password")}
          error={!!errors.password}
          helperText={errors.password?.message}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Lock size={16} className="text-primary" />
                </InputAdornment>
              ),
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
                      <EyeOff size={18} className="text-primary" />
                    ) : (
                      <Eye size={18} className="text-primary" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {errors.root && (
        <Alert
          severity="error"
          className="items-center"
          style={{ borderRadius: "0px" }}
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
        className="gap-2.5 rounded-lg py-3.5 text-[0.95rem] font-bold"
      >
        <LogIn size={18} />
        {isPending ? "Signing in…" : "Log in"}
      </Button>
    </Box>
  );
}
