"use client";

import { z } from "zod";
import { useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@frontend/trpc/client";
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
  const trpc = useTRPC();

  const form = useForm<PasswordInput>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation(
    trpc.profile.changePassword.mutationOptions({
      onSuccess: () => {
        gooeyToast.success("Password updated");
        form.reset();
      },
      onError: (err) => {
        gooeyToast.error(err.message || "Failed to update password");
      },
    }),
  );

  return (
    <Card variant="outlined" className="h-full rounded-3xl">
      <Box className="flex items-center gap-3 px-6 pt-6 pb-4">
        <Box className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ED6C0212] text-[#B26A00]">
          <KeyRound className="size-4" />
        </Box>
        <Box>
          <Typography className="font-lato text-[15px] font-bold text-slate-800">
            Change Password
          </Typography>
          <Typography className="font-lato text-xs text-slate-400">
            Update your account password
          </Typography>
        </Box>
      </Box>
      <Divider />
      <CardContent className="p-6">
        <Stack
          component="form"
          spacing={2.5}
          onSubmit={form.handleSubmit((data) =>
            mutation.mutate({
              currentPassword: data.currentPassword,
              newPassword: data.newPassword,
            }),
          )}
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
            className="h-12 bg-[#ED6C02] text-white hover:bg-[#B26A00]"
            startIcon={
              mutation.isPending ? (
                <CircularProgress size={16} />
              ) : (
                <KeyRound className="size-4" />
              )
            }
          >
            {mutation.isPending ? "Updating..." : "Update Password"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
