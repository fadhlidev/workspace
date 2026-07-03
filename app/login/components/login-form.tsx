"use client";

import { z } from "zod";
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
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        bgcolor: "#f8f9fb",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top bar with logo */}
      <Box
        component="header"
        sx={{
          px: { xs: 3, sm: 4, md: 6 },
          py: { xs: 2.5, sm: 3 },
        }}
      >
        <Image
          src="/images/logo.svg"
          alt="Logo"
          width={160}
          height={40}
          className="h-8 w-auto object-contain"
          priority
        />
      </Box>

      {/* Divider below logo - small screens only */}
      <Divider sx={{ display: { xs: "block", sm: "none" } }} />

      {/* Centered form area */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "center",
          px: 2,
          pt: { xs: 4, sm: 0 },
          pb: { xs: 4, sm: 8 },
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 440,
          }}
        >
          {/* Heading */}
          <Typography
            className="font-lato"
            variant="h4"
            sx={{
              fontWeight: 900,
              color: "#1D2F4D",
              mb: 0.5,
              fontSize: { xs: "1.75rem", sm: "2.125rem" },
            }}
          >
            Login
          </Typography>
          <Typography
            sx={{
              color: "text.secondary",
              fontSize: "0.95rem",
              mb: 4,
            }}
          >
            Hi, Welcome back 👋
          </Typography>

          {/* Form */}
          <Box
            component="form"
            onSubmit={handleSubmit((data) => mutate(data))}
            sx={{ display: "flex", flexDirection: "column", gap: 0 }}
          >
            {/* Divider */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 3,
              }}
            >
              <Box sx={{ flex: 1, height: "1px", bgcolor: "#e0e0e0" }} />
              <Typography
                sx={{
                  fontSize: "0.8rem",
                  color: "text.disabled",
                  whiteSpace: "nowrap",
                }}
              >
                Login to your account
              </Typography>
              <Box sx={{ flex: 1, height: "1px", bgcolor: "#e0e0e0" }} />
            </Box>

            {/* Username field */}
            <Typography
              component="label"
              htmlFor="username"
              sx={{
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#1D2F4D",
                mb: 0.75,
              }}
            >
              Username
            </Typography>
            <TextField
              id="username"
              placeholder="E.g. johndoe"
              autoComplete="username"
              fullWidth
              size="small"
              sx={{
                mb: 2.5,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  bgcolor: "white",
                  "& fieldset": {
                    borderColor: "#e0e0e0",
                  },
                  "&:hover fieldset": {
                    borderColor: "#b0b0b0",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#1D2F4D",
                  },
                },
              }}
              {...register("username")}
              error={!!errors.username}
              helperText={errors.username?.message}
            />

            {/* Password field */}
            <Typography
              component="label"
              htmlFor="password"
              sx={{
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#1D2F4D",
                mb: 0.75,
              }}
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
              sx={{
                mb: 2.5,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  bgcolor: "white",
                  "& fieldset": {
                    borderColor: "#e0e0e0",
                  },
                  "&:hover fieldset": {
                    borderColor: "#b0b0b0",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#1D2F4D",
                  },
                },
              }}
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

            {/* Error alert */}
            {errors.root && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  alignItems: "center",
                  borderRadius: "10px",
                }}
              >
                {errors.root.message}
              </Alert>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isPending}
              sx={{
                py: 1.4,
                borderRadius: "10px",
                fontSize: "0.95rem",
                fontWeight: 700,
                textTransform: "none",
                bgcolor: "#1D2F4D",
                gap: 1,
                "&:hover": {
                  bgcolor: "#162440",
                },
                "&.Mui-disabled": {
                  bgcolor: "#1D2F4D",
                  opacity: 0.6,
                  color: "white",
                },
              }}
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
