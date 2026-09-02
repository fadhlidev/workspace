"use client";

import { Fragment } from "react";
import { useToggle } from "react-use";
import { signOut } from "next-auth/react";
import { useProfile } from "@frontend/hooks/use-profile";
import { useProgress } from "@bprogress/next";
import Link from "next/link";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { LogOut } from "lucide-react";
import { UserInitial } from "@frontend/components/common/user-initial";

export function UserProfileMenu() {
  const [open, toggleOpen] = useToggle(false);
  const { name, email, isLoading } = useProfile();
  const { stop } = useProgress();

  function handleCancel() {
    toggleOpen();
    stop();
  }

  function handleLogout() {
    signOut({ callbackUrl: "/login" });
  }

  if (isLoading) {
    return (
      <Stack
        direction="row"
        sx={{
          p: 2,
          justifyContent: "start",
          alignItems: "center",
        }}
        className="gap-2 rounded-none"
      >
        <Skeleton variant="circular" width={40} height={40} />
        <Box className="flex flex-1 flex-col items-start justify-start gap-1">
          <Skeleton variant="text" width={120} height={16} />
          <Skeleton variant="text" width={160} height={12} />
        </Box>
      </Stack>
    );
  }

  return (
    <Fragment>
      <Stack
        component={Button}
        LinkComponent={Link}
        href="/me"
        direction="row"
        sx={{
          p: 2,
          justifyContent: "start",
          alignItems: "center",
        }}
        className="gap-2 rounded-none"
      >
        <UserInitial name={name} />
        <Box className="flex flex-1 flex-col items-start justify-start">
          <Typography
            variant="body1"
            component="div"
            className="font-lato text-left text-sm font-semibold text-gray-600"
          >
            {name}
          </Typography>
          <Typography
            variant="body2"
            component="div"
            className="font-lato text-left text-xs font-semibold text-gray-500"
          >
            {email}
          </Typography>
        </Box>
        {!isLoading ? (
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              toggleOpen();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <LogOut className="text-primary size-5" />
          </IconButton>
        ) : null}
      </Stack>
      <Dialog
        open={open}
        onClose={toggleOpen}
        maxWidth="xs"
        fullWidth
        slotProps={{
          backdrop: {
            sx: {
              bgcolor: "rgba(0,0,0,0.3)",
              backdropFilter: "blur(4px)",
            },
          },
          paper: {
            sx: {
              borderRadius: 3,
              p: 3,
              background:
                "linear-gradient(135deg, #fce4ec 0%, #ffffff 40%, #fce4ec 100%)",
            },
          },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{ bgcolor: "#fce4ec", color: "#d32f2f", width: 64, height: 64 }}
            className="flex items-center justify-center rounded-lg border border-red-300"
          >
            <LogOut className="size-8" />
          </Box>

          <Stack sx={{ textAlign: "center", gap: 0.5 }}>
            <Typography
              variant="h6"
              className="font-lato text-red-500"
              sx={{ fontWeight: 700 }}
            >
              Leave your account?
            </Typography>
            <Typography
              variant="body2"
              className="font-lato text-gray-600"
              sx={{ lineHeight: 1.5 }}
            >
              Your session will be ended. Sign in again to continue.
            </Typography>
          </Stack>

          <Divider flexItem />

          <Paper
            variant="outlined"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: 1.5,
              width: "100%",
              bgcolor: "grey.50",
            }}
          >
            <UserInitial name={name} />
            <Stack>
              <Typography
                variant="body2"
                className="font-lato"
                sx={{ fontWeight: 600 }}
              >
                {name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {email}
              </Typography>
            </Stack>
          </Paper>

          <Stack direction="row" sx={{ width: "100%", gap: 1.5, mt: 0.5 }}>
            <Button
              onClick={handleCancel}
              variant="outlined"
              className="h-12"
              fullWidth
            >
              Cancel
            </Button>
            <Button
              color="error"
              variant="contained"
              fullWidth
              onClick={handleLogout}
              autoFocus
              startIcon={<LogOut className="size-4" />}
              className="h-12"
            >
              Yes, Leave
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
}
