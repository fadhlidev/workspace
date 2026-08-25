import { styled } from "@mui/material/styles";
import {
  AppBar as MuiAppBar,
  AppBarProps as MuiAppBarProps,
} from "@mui/material";
import { DRAWER_WIDTH } from "@frontend/styles/config";

interface TopBarProps extends MuiAppBarProps {
  open?: boolean;
}

export const TopBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<TopBarProps>(({ theme }) => ({
  position: "fixed",
  height: 72,
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  [theme.breakpoints.down("md")]: {
    width: "100% !important",
    marginLeft: "0 !important",
  },
  variants: [
    {
      props: ({ open }) => open,
      style: {
        width: `calc(100% - ${DRAWER_WIDTH}px)`,
        marginLeft: `${DRAWER_WIDTH}px`,
        transition: theme.transitions.create(["margin", "width"], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));
