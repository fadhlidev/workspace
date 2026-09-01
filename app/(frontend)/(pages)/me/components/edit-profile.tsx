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
            bgcolor: (theme) => `${theme.palette.primary.main}12`,
            color: "primary.main",
          }}
        >
          <AtSign className="size-4" />
        </Box>
        <Box>
          <Typography
            className="font-lato"
            sx={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}
          >
            Edit Profile
          </Typography>
          <Typography
            className="font-lato"
            sx={{ fontSize: 12, color: "#94a3b8" }}
          >
            Update your personal information
          </Typography>
        </Box>
      </Box>
      <Divider />
      <CardContent sx={{ p: 3 }}>
        {isLoading ? (
          <Stack spacing={2.5}>
            <Skeleton
              variant="rounded"
              width="100%"
              height={40}
              sx={{ bgcolor: "rgba(0,0,0,0.06)" }}
            />
            <Skeleton
              variant="rounded"
              width="100%"
              height={40}
              sx={{ bgcolor: "rgba(0,0,0,0.06)" }}
            />
            <Skeleton
              variant="rounded"
              width="100%"
              height={40}
              sx={{ bgcolor: "rgba(0,0,0,0.06)" }}
            />
            <Skeleton
              variant="rounded"
              width={140}
              height={36}
              sx={{ bgcolor: "rgba(0,0,0,0.06)" }}
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
              size="small"
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
              size="small"
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
              size="small"
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
              startIcon={
                mutation.isPending ? (
                  <CircularProgress size={16} />
                ) : (
                  <Save className="size-4" />
                )
              }
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                py: 1,
              }}
            >
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
