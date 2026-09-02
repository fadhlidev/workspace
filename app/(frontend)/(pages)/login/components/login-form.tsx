"use client";

import { cx } from "classix";
import Image from "next/image";
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

const textFieldClasses =
  "[&_.MuiOutlinedInput-root]:bg-white/80 [&_.MuiOutlinedInput-root]:backdrop-blur-sm [&_.MuiOutlinedInput-notchedOutline]:border-[#c4b8a8] hover:[&_.MuiOutlinedInput-notchedOutline]:border-[#7a6e62] [&_.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-[#1D2F4D]";

export default function LoginForm() {
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
      component="main"
      className="relative flex min-h-screen overflow-hidden"
      style={{ backgroundColor: "#FAFAE6" }}
    >
      <Image
        src="/images/login-bg.jpg"
        alt=""
        width={0}
        height={0}
        aria-hidden="true"
        style={{
          position: "absolute",
          right: "-10%",
          top: "50%",
          transform: "translateY(-50%)",
          height: "70%",
          width: "auto",
          pointerEvents: "none",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 28%)",
          maskImage: "linear-gradient(to right, transparent 0%, black 28%)",
        }}
      />

      <Box className="relative z-10 flex w-full flex-col">
        <Box
          component="header"
          className="flex items-center px-8 py-6 sm:px-10 md:px-14"
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

        <Box className="flex flex-1 items-center justify-start px-8 pb-12 sm:px-10 md:px-14">
          <Box className={cx("w-full", "max-w-sm md:max-w-md")}>
            <Typography
              component="h1"
              variant="h4"
              className="font-lato text-primary mb-10 text-[1.75rem] font-black sm:text-[2.2rem]"
              style={{ fontFamily: "var(--font-lato)" }}
            >
              Welcome back!
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit((data) => mutate(data))}
              className="flex flex-col gap-5"
            >
              <Box>
                <Typography
                  component="label"
                  htmlFor="username"
                  className="mb-1.5 block text-sm font-medium"
                  style={{
                    fontFamily: "var(--font-lato)",
                    color: "#3b2f24",
                  }}
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
                          <User size={16} style={{ color: "#9a8878" }} />
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
                  className="mb-1.5 block text-sm font-medium"
                  style={{
                    fontFamily: "var(--font-lato)",
                    color: "#3b2f24",
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
                  className={textFieldClasses}
                  {...register("password")}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock size={16} style={{ color: "#9a8878" }} />
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
                className="gap-2.5 py-3.5 text-[0.95rem] font-bold normal-case"
                style={{
                  fontFamily: "var(--font-lato)",
                  color: "#ffffff",
                  paddingTop: "14px",
                  paddingBottom: "14px",
                  opacity: isPending ? 0.6 : 1,
                }}
              >
                <LogIn size={18} />
                {isPending ? "Signing in…" : "Log in"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
