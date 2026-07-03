"use client";

import { version } from "@/package.json";
import { cx } from "classix";
import { create } from "zustand";
import {
  Fragment,
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import { usePathname } from "next/navigation";
import { usePrevious } from "react-use";
import { styled, useTheme } from "@mui/material/styles";
import { useProfile } from "@/hooks/use-profile";
import Image from "next/image";
import Link from "next/link";
import {
  Collapse,
  Drawer as MuiDrawer,
  Stack,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  useMediaQuery,
} from "@mui/material";
import {
  PanelLeft,
  ChartColumn,
  Users,
  ChevronRight,
  UserCog,
  ShieldCheck,
} from "lucide-react";
import { UserProfile } from "@/app/me/components/user-profile";

export const DRAWER_WIDTH = 260;

interface DrawerState {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

export const useDrawer = create<DrawerState>()((set) => ({
  open: true,
  setOpen: (open: boolean) => set({ open }),
  toggle: () => set((state) => ({ open: !state.open })),
}));

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  matchPattern?: string;
  selectedClassName?: string;
  children?: MenuItem[];
  roles?: ("admin" | "user")[];
  secondaryAction?: React.ReactNode;
}

const menu: MenuItem[] = [
  {
    label: "Overview",
    icon: <ChartColumn className="size-5" />,
    path: "/",
    matchPattern: "^/?$",
  },
  {
    label: "Management",
    icon: <UserCog className="size-5" />,
    roles: ["admin"],
    children: [
      {
        label: "Users",
        icon: <Users className="size-5" />,
        path: "/management/users",
        matchPattern: "^/management/users(?:/.*)?$",
        roles: ["admin"],
      },
      {
        label: "Access Permission",
        icon: <ShieldCheck className="size-5" />,
        path: "/management/access-permission",
        matchPattern: "^/management/access-permission(?:/.*)?$",
        roles: ["admin"],
      },
    ],
  },
];

function useIsSelected(pathname: string) {
  return useCallback(
    (item: MenuItem) => {
      if (item.matchPattern && new RegExp(item.matchPattern).test(pathname)) {
        return true;
      }
      if (item.children) {
        return item.children.some((child) => {
          if (
            child.matchPattern &&
            new RegExp(child.matchPattern).test(pathname)
          ) {
            return true;
          }
          return false;
        });
      }
      return false;
    },
    [pathname],
  );
}

export function Drawer() {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { open, setOpen } = useDrawer();
  const isSelected = useIsSelected(pathname);
  const prevIsMobile = usePrevious(isMobile);

  const { role } = useProfile();

  const visibleMenu = useMemo(() => {
    const filterByRole = (items: MenuItem[]): MenuItem[] =>
      items
        .filter(
          (item) =>
            !item.roles || item.roles.includes(role as "admin" | "user"),
        )
        .map((item) => ({
          ...item,
          children: item.children ? filterByRole(item.children) : undefined,
        }))
        .filter((item) => !item.children || item.children.length > 0);

    return filterByRole(menu);
  }, [role]);

  const autoExpanded = useMemo(() => {
    return visibleMenu
      .filter((item) =>
        item.children?.some(
          (child) =>
            child.matchPattern && new RegExp(child.matchPattern).test(pathname),
        ),
      )
      .map((item) => item.label);
  }, [pathname, visibleMenu]);

  const [override, setOverride] = useState<string[]>([]);

  const expanded = useMemo(() => {
    const result = new Set(autoExpanded);
    for (const label of override) {
      if (result.has(label)) {
        result.delete(label);
      } else {
        result.add(label);
      }
    }
    return [...result];
  }, [autoExpanded, override]);

  const toggleExpand = (label: string) => {
    setOverride((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  };

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
  }, [isMobile, setOpen]);

  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [pathname, isMobile, setOpen]);

  const drawerContent = (
    <Fragment>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          p: 2,
          height: 72,
          justifyContent: "space-between",
          alignItems: "center",
        }}
        className={`z-10 bg-white ${stuck ? "border-b border-gray-300" : ""}`}
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
        <DrawerToggle />
      </Stack>
      <List ref={listRef} disablePadding sx={{ flex: 1, overflowY: "auto" }}>
        {visibleMenu.map((item) => (
          <Fragment key={item.label}>
            {item.children ? (
              <ListItem
                className="px-2 py-1"
                secondaryAction={item.secondaryAction}
              >
                <ListItemButton
                  className="rounded-lg text-gray-500"
                  selected={isSelected(item)}
                  classes={{
                    selected: "bg-white text-primary [&_svg]:stroke-primary",
                  }}
                  onClick={() => toggleExpand(item.label)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    classes={{
                      primary: "text-sm font-lato font-semibold",
                    }}
                  />
                  <ChevronRight
                    className={`size-4 transition-transform duration-200 ${expanded.includes(item.label) ? "rotate-90" : ""}`}
                  />
                </ListItemButton>
              </ListItem>
            ) : (
              <ListItem
                className="px-2 py-1"
                secondaryAction={item.secondaryAction}
              >
                <ListItemButton
                  LinkComponent={Link}
                  href={item.path as string}
                  className="rounded-lg text-gray-500"
                  selected={isSelected(item)}
                  classes={{
                    selected: cx(
                      "text-primary [&_svg]:stroke-primary",
                      item.selectedClassName,
                    ),
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    classes={{
                      primary: "text-sm font-lato font-semibold",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            )}
            {item.children && (
              <Collapse in={expanded.includes(item.label)} timeout="auto">
                <List disablePadding>
                  {item.children.map((child) => (
                    <ListItem
                      key={child.label}
                      className="px-2 py-1"
                      secondaryAction={child.secondaryAction}
                    >
                      <ListItemButton
                        LinkComponent={Link}
                        href={child.path as string}
                        className="rounded-lg text-gray-500"
                        selected={isSelected(child)}
                        classes={{
                          selected: cx(
                            "text-primary [&_svg]:stroke-primary",
                            child.selectedClassName,
                          ),
                        }}
                        sx={{ pl: 4 }}
                      >
                        <ListItemIcon>{child.icon}</ListItemIcon>
                        <ListItemText
                          primary={child.label}
                          classes={{
                            primary: "text-sm font-lato font-semibold",
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </Fragment>
        ))}
      </List>

      <Box className="z-10 border-t border-gray-300 bg-white">
        <UserProfile />
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

export const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

export function DrawerToggle() {
  const { toggle } = useDrawer();

  return (
    <IconButton onClick={toggle}>
      <PanelLeft className="size-5" />
    </IconButton>
  );
}
