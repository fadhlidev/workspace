"use client";

import { Fragment, type ReactNode } from "react";
import { Toolbar, Stack, Box, Typography } from "@mui/material";
import { TopBar } from "@frontend/components/styled/top-bar";
import {
  PageDrawer,
  usePageDrawer,
} from "@frontend/components/layout/page-drawer";

interface PageBarProps {
  title: string;
  description?: string;
  tools?: ReactNode[];
  withDrawer?: boolean;
}

export function PageBar({
  title,
  description,
  tools,
  withDrawer = true,
}: PageBarProps) {
  const { open } = usePageDrawer();

  return (
    <TopBar
      open={withDrawer ? open : false}
      className="flex flex-row items-center border-b border-gray-300 bg-white shadow-none"
    >
      <Toolbar className="w-full">
        <Stack
          direction="row"
          sx={{ justifyContent: "start", alignItems: "center" }}
          spacing={2}
          className="w-full"
        >
          <Box sx={[open && { display: "none" }]}>
            <PageDrawer.Toggle />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              noWrap
              component="div"
              className="font-lato text-lg font-semibold text-gray-600"
            >
              {title}
            </Typography>
            {description && (
              <Typography
                variant="subtitle1"
                component="div"
                className="font-lato truncate text-sm text-gray-500"
              >
                {description}
              </Typography>
            )}
          </Box>
          {tools && (
            <Box>
              <Stack direction="row" spacing={1}>
                {tools.map((tool, index) => (
                  <Fragment key={index}>{tool}</Fragment>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </Toolbar>
    </TopBar>
  );
}
