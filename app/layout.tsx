import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import { cx } from "classix";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import { FullscreenListener } from "@frontend/components/ui/fullscreen-listener";
import { ClientProvider } from "@frontend/providers/client-provider";
import { lato, poppins, roboto } from "@frontend/styles/fonts";
import { theme } from "@frontend/styles/theme";
import "@frontend/styles/globals.css";
import "goey-toast/styles.css";

export const metadata: Metadata = {
  title: "Fadhlidev Workspace",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html
      lang="en"
      className={cx(
        lato.variable,
        poppins.variable,
        roboto.variable,
        "h-full antialiased",
      )}
      suppressHydrationWarning
    >
      <body>
        <FullscreenListener />
        <ThemeProvider theme={theme}>
          <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <ClientProvider>{children}</ClientProvider>
          </AppRouterCacheProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
