"use client";

import { api } from "@backend/api/client";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
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
  const { data: session } = useSession();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["/api/user/me"],
    queryFn: async () => {
      const res = await api.get("/api/user/me");
      return res.data.user as {
        username: string;
        name: string;
        email: string;
        role: string;
      };
    },
  });

  const name = profileData?.name ?? session?.user?.name ?? "";
  const username = profileData?.username ?? session?.user?.username ?? "";
  const email = profileData?.email ?? session?.user?.email ?? "";
  const role = profileData?.role ?? session?.role ?? "";

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "relative",
          height: 136,
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.primary.light} 100%)`,
          overflow: "hidden",
        }}
      >
        <Box
          className="max-sm:hidden"
          sx={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -60,
            left: -20,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }}
        />
      </Box>
      <CardContent
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          mt: -10,
          position: "relative",
          zIndex: 1,
        }}
      >
        {isLoading ? (
          <>
            <Skeleton
              variant="circular"
              width={88}
              height={88}
              sx={{
                border: "4px solid white",
                flexShrink: 0,
                bgcolor: "rgba(0,0,0,0.20)",
              }}
            />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Skeleton
                variant="text"
                width={180}
                height={32}
                sx={{ bgcolor: "rgba(0,0,0,0.08)" }}
              />
              <Skeleton
                variant="text"
                width={120}
                height={20}
                sx={{ mt: 0.5, bgcolor: "rgba(0,0,0,0.06)" }}
              />
              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <Skeleton
                  variant="rounded"
                  width={80}
                  height={24}
                  sx={{ bgcolor: "rgba(0,0,0,0.06)" }}
                />
                <Skeleton
                  variant="rounded"
                  width={160}
                  height={24}
                  sx={{ bgcolor: "rgba(0,0,0,0.06)" }}
                />
              </Box>
            </Box>
          </>
        ) : (
          <>
            <Avatar
              sx={{
                width: 88,
                height: 88,
                border: "4px solid white",
                bgcolor: stringToColor(name),
                fontSize: 32,
                fontWeight: 700,
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                flexShrink: 0,
              }}
            >
              {getInitials(name || "?")}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                className="font-lato text-white"
                sx={{
                  fontWeight: 700,
                  fontSize: 20,
                  lineHeight: 1.3,
                }}
              >
                {name || "..."}
              </Typography>
              <Typography
                className="font-lato text-white/80"
                sx={{ fontSize: 13, mt: 0.25 }}
              >
                @{username || "..."}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mt: 3, flexWrap: "wrap" }}>
                <Chip
                  label={role || "user"}
                  size="small"
                  icon={<ShieldCheck className="size-3" />}
                  sx={{
                    height: 24,
                    textTransform: "capitalize",
                    fontWeight: 600,
                    fontSize: 11,
                    bgcolor: (theme) =>
                      role === "admin"
                        ? `${theme.palette.warning.main}16`
                        : `${theme.palette.primary.main}10`,
                    color: (theme) =>
                      role === "admin"
                        ? theme.palette.warning.dark
                        : theme.palette.primary.main,
                    "& .MuiChip-icon": { ml: 0.5 },
                  }}
                />
                <Chip
                  label={email || ""}
                  size="small"
                  icon={<Mail className="size-3" />}
                  sx={{
                    height: 24,
                    fontWeight: 500,
                    fontSize: 11,
                    bgcolor: "#f1f5f9",
                    color: "#475569",
                    "& .MuiChip-icon": { ml: 0.5 },
                    maxWidth: 240,
                  }}
                />
              </Box>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}
