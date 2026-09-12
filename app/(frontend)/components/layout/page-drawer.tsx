"use client";

import { version } from "@/package.json";
import { cx } from "classix";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Fragment, useRef, useState, useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { usePrevious } from "react-use";
import { useTheme } from "@mui/material/styles";
import Image from "next/image";
import {
  Drawer as MuiDrawer,
  Stack,
  Typography,
  IconButton,
  Box,
  useMediaQuery,
} from "@mui/material";
import { PanelLeft } from "lucide-react";
import { UserProfileMenu } from "@frontend/components/common/user-profile-menu";
import { DRAWER_WIDTH } from "@frontend/styles/config";

const initialData = { open: true };

export const usePageDrawer = () => {
  const queryClient = useQueryClient();

  const {
    data: { open },
  } = useQuery({
    queryKey: ["page-drawer"],
    queryFn: async () => initialData,
    placeholderData: initialData,
    initialData: initialData,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const setOpen = (open: boolean) => {
    queryClient.setQueryData(["page-drawer"], { open });
  };

  const toggle = () => {
    if (open) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  };

  return { open, setOpen, toggle };
};

interface PageDrawerProps {
  showLogo?: boolean;
  children: ReactNode;
}

export function PageDrawer({ showLogo = true, children }: PageDrawerProps) {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { open, setOpen } = usePageDrawer();
  const prevIsMobile = usePrevious(isMobile);

  const listRef = useRef<HTMLUListElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const onScroll = () => setStuck(list.scrollTop > 0);
    onScroll();

    list.addEventListener("scroll", onScroll);
    return () => list.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    } else {
      setOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, isMobile]);

  const drawerContent = (
    <Fragment>
      {showLogo && (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            p: 2,
            height: 72,
            justifyContent: "space-between",
            alignItems: "center",
          }}
          className={cx("z-10 bg-white", stuck && "border-b border-gray-300")}
        >
          <Stack
            spacing={0.5}
            sx={{
              justifyContent: "start",
              alignItems: "start",
            }}
          >
            <Image
              src="/images/logo.svg"
              alt="Logo"
              width={160}
              height={15}
              priority
            />
            <Typography
              variant="h6"
              noWrap
              component="div"
              className="-mt-2 pl-8 text-xs text-gray-500"
            >
              {`Dashboard v${version}`}
            </Typography>
          </Stack>
          <PageDrawer.Toggle />
        </Stack>
      )}

      <Box ref={listRef} className="flex-1 py-2">
        {children}
      </Box>

      <Box className="z-10 border-t border-gray-300 bg-white">
        <UserProfileMenu />
      </Box>
    </Fragment>
  );

  if (isMobile) {
    return (
      <MuiDrawer
        variant="temporary"
        anchor="left"
        open={open && prevIsMobile === true}
        onClose={() => setOpen(false)}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            height: "100%",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {drawerContent}
      </MuiDrawer>
    );
  }

  return (
    <MuiDrawer
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          height: "100%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        },
      }}
      variant="persistent"
      anchor="left"
      open={open}
    >
      {drawerContent}
    </MuiDrawer>
  );
}

interface PageDrawerToggleProps {
  light?: boolean;
}

function PageDrawerToggle({ light = false }: PageDrawerToggleProps) {
  const { toggle } = usePageDrawer();

  return (
    <IconButton onClick={toggle}>
      <PanelLeft className={cx("size-5", light && "text-white")} />
    </IconButton>
  );
}

PageDrawerToggle.displayName = "PageDrawer.Toggle";

PageDrawer.Toggle = PageDrawerToggle;
