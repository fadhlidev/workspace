"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useTRPC } from "@frontend/trpc/client";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Save, AtSign, Mail, User } from "lucide-react";
import { gooeyToast } from "goey-toast";

const profileSchema = z.object({
  username: z.string().min(1, "Username is required"),
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email"),
});

type ProfileInput = z.infer<typeof profileSchema>;

export function EditProfile() {
  const { update } = useSession();
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const { data: profileData, isLoading } = useQuery(
    trpc.profile.getMe.queryOptions(),
  );

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    values: {
      username: profileData?.user.username ?? "",
      name: profileData?.user.name ?? "",
      email: profileData?.user.email ?? "",
    },
  });

  const mutation = useMutation(
    trpc.profile.updateMe.mutationOptions({
      onSuccess: async () => {
        gooeyToast.success("Profile updated");
        await queryClient.invalidateQueries(trpc.profile.getMe.queryFilter());
        await update();
      },
      onError: () => {
        gooeyToast.error("Failed to update profile");
      },
    }),
  );

  return (
    <Card variant="outlined" className="h-full rounded-3xl">
      <Box className="flex items-center gap-3 px-6 pt-6 pb-4">
        <Box className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#28282812] text-[#282828]">
          <AtSign className="size-4" />
        </Box>
        <Box>
          <Typography className="font-lato text-[15px] font-bold text-slate-800">
            Edit Profile
          </Typography>
          <Typography className="font-lato text-xs text-slate-400">
            Update your personal information
          </Typography>
        </Box>
      </Box>
      <Divider />
      <CardContent className="p-6">
        {isLoading ? (
          <Stack spacing={2.5}>
            <Skeleton
              variant="rounded"
              width="100%"
              height={40}
              className="bg-black/[0.06]"
            />
            <Skeleton
              variant="rounded"
              width="100%"
              height={40}
              className="bg-black/[0.06]"
            />
            <Skeleton
              variant="rounded"
              width="100%"
              height={40}
              className="bg-black/[0.06]"
            />
            <Skeleton
              variant="rounded"
              width={140}
              height={36}
              className="bg-black/[0.06]"
            />
          </Stack>
        ) : (
          <Stack
            component="form"
            spacing={2.5}
            onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
          >
            <TextField
              label="Username"
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <AtSign className="mr-2 size-4 text-gray-400" />
                  ),
                },
              }}
              {...form.register("username")}
              error={!!form.formState.errors.username}
              helperText={form.formState.errors.username?.message}
            />
            <TextField
              label="Name"
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <User className="mr-2 size-4 text-gray-400" />
                  ),
                },
              }}
              {...form.register("name")}
              error={!!form.formState.errors.name}
              helperText={form.formState.errors.name?.message}
            />
            <TextField
              label="Email"
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <Mail className="mr-2 size-4 text-gray-400" />
                  ),
                },
              }}
              {...form.register("email")}
              error={!!form.formState.errors.email}
              helperText={form.formState.errors.email?.message}
            />
            <Button
              type="submit"
              variant="contained"
              disableElevation
              disabled={mutation.isPending}
              className="h-12"
              startIcon={
                mutation.isPending ? (
                  <CircularProgress size={16} />
                ) : (
                  <Save className="size-4" />
                )
              }
            >
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
