"use client";

import { useProfile } from "@frontend/hooks/use-profile";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Skeleton,
} from "@mui/material";
import { ShieldCheck, Mail } from "lucide-react";

function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 50%, 45%)`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ProfileHeader() {
  const { name, username, email, role, isLoading } = useProfile();

  return (
    <Card variant="outlined" className="relative overflow-hidden rounded-4xl">
      <Box className="relative h-[136px] overflow-hidden bg-[linear-gradient(135deg,#000_0%,#282828_50%,#535353_100%)]">
        <Box className="absolute -top-10 -right-10 h-[200px] w-[200px] rounded-full bg-white/[0.06] max-sm:hidden" />
        <Box className="absolute -bottom-[60px] -left-5 h-[160px] w-[160px] rounded-full bg-white/[0.04]" />
      </Box>
      <CardContent className="relative z-10 -mt-10 flex items-center gap-6">
        {isLoading ? (
          <>
            <Skeleton
              variant="circular"
              width={88}
              height={88}
              className="shrink-0 border-4 border-white bg-black/20"
            />
            <Box className="min-w-0 flex-1">
              <Skeleton
                variant="text"
                width={180}
                height={32}
                className="bg-black/[0.08]"
              />
              <Skeleton
                variant="text"
                width={120}
                height={20}
                className="mt-0.5 bg-black/[0.06]"
              />
              <Box className="mt-2 flex gap-1">
                <Skeleton
                  variant="rounded"
                  width={80}
                  height={24}
                  className="bg-black/[0.06]"
                />
                <Skeleton
                  variant="rounded"
                  width={160}
                  height={24}
                  className="bg-black/[0.06]"
                />
              </Box>
            </Box>
          </>
        ) : (
          <>
            <Avatar
              className="h-[88px] w-[88px] shrink-0 border-4 border-white text-[32px] font-bold shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
              style={{ backgroundColor: stringToColor(name) }}
            >
              {getInitials(name || "?")}
            </Avatar>
            <Box className="min-w-0">
              <Typography className="font-lato text-xl leading-[1.3] font-bold text-white">
                {name || "..."}
              </Typography>
              <Typography className="font-lato mt-0.5 text-[13px] text-white/80">
                @{username || "..."}
              </Typography>
              <Box className="mt-3 flex flex-wrap gap-1">
                <Chip
                  label={role || "user"}
                  size="small"
                  icon={<ShieldCheck className="size-3" />}
                  className={`h-6 text-[11px] font-semibold capitalize [&_.MuiChip-icon]:ml-0.5 ${
                    role === "admin"
                      ? "bg-[#ED6C0216] text-[#B26A00]"
                      : "bg-[#28282810] text-[#282828]"
                  }`}
                />
                <Chip
                  label={email || ""}
                  size="small"
                  icon={<Mail className="size-3" />}
                  className="h-6 max-w-[240px] bg-[#f1f5f9] text-[11px] font-medium text-[#475569] [&_.MuiChip-icon]:ml-0.5"
                />
              </Box>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}
