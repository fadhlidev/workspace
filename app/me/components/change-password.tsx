"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { KeyRound, Eye, EyeOff } from "lucide-react";
import { gooeyToast } from "goey-toast";
import api from "@/lib/api";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Min 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordInput = z.infer<typeof passwordSchema>;

function PasswordField({
  form,
  label,
  field,
  show,
  onToggle,
}: {
  form: UseFormReturn<PasswordInput>;
  label: string;
  field: "currentPassword" | "newPassword" | "confirmPassword";
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <TextField
      label={label}
      type={show ? "text" : "password"}
      size="small"
      fullWidth
      {...form.register(field)}
      error={!!form.formState.errors[field]}
      helperText={form.formState.errors[field]?.message}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={onToggle} edge="end" size="small">
                {show ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}

export function ChangePassword() {
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showCon, setShowCon] = useState(false);

  const form = useForm<PasswordInput>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: PasswordInput) => {
      const res = await api.put("/api/user/me/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return res.data;
    },
    onSuccess: () => {
      gooeyToast.success("Password updated");
      form.reset();
    },
    onError: (err: AxiosError<{ message: string }>) => {
      const msg = err?.response?.data?.message ?? "Failed to update password";
      gooeyToast.error(msg);
    },
  });

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        height: "100%",
      }}
    >
      <Box
        sx={{
          px: 3,
          pt: 3,
          pb: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: (theme) => `${theme.palette.warning.main}12`,
            color: "warning.dark",
          }}
        >
          <KeyRound className="size-4" />
        </Box>
        <Box>
          <Typography
            className="font-lato"
            sx={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}
          >
            Change Password
          </Typography>
          <Typography
            className="font-lato"
            sx={{ fontSize: 12, color: "#94a3b8" }}
          >
            Update your account password
          </Typography>
        </Box>
      </Box>
      <Divider />
      <CardContent sx={{ p: 3 }}>
        <Stack
          component="form"
          spacing={2.5}
          onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
        >
          <PasswordField
            form={form}
            label="Current Password"
            field="currentPassword"
            show={showCur}
            onToggle={() => setShowCur((v) => !v)}
          />
          <PasswordField
            form={form}
            label="New Password"
            field="newPassword"
            show={showNew}
            onToggle={() => setShowNew((v) => !v)}
          />
          <PasswordField
            form={form}
            label="Confirm New Password"
            field="confirmPassword"
            show={showCon}
            onToggle={() => setShowCon((v) => !v)}
          />
          <Button
            type="submit"
            variant="contained"
            disableElevation
            disabled={mutation.isPending}
            startIcon={
              mutation.isPending ? (
                <CircularProgress size={16} />
              ) : (
                <KeyRound className="size-4" />
              )
            }
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              py: 1,
              bgcolor: "warning.main",
              "&:hover": { bgcolor: "warning.dark" },
            }}
          >
            {mutation.isPending ? "Updating..." : "Update Password"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
