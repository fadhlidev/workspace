import type { Metadata } from "next";
import { Lato, Poppins, Roboto } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ClientProvider } from "@/app/client-provider";
import { FullscreenListener } from "@/components/ui/fullscreen-listener";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/lib/theme";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@/app/globals.css";
import "goey-toast/styles.css";

const lato = Lato({
  variable: "--font-lato",
  weight: ["300", "400", "700"],
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
});

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Fadhlidev Workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${lato.variable} ${poppins.variable} ${roboto.variable} h-full antialiased`}
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
