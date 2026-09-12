import type { Metadata } from "next";
import { Suspense } from "react";
import { Box, Typography } from "@mui/material";
import { WaveBackground } from "@frontend/components/ui/wave-background";
import { LoginForm } from "@pages/login/components/login-form";

export const metadata: Metadata = {
  title: "Login | Fadhlidev Dashboard",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <Box
        component="main"
        className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-500"
      >
        <Box
          className="pointer-events-none absolute inset-0 z-1 overflow-hidden mix-blend-screen"
          style={{ transform: "translate3d(0, 0, 0)", maxHeight: "3000px" }}
        >
          <WaveBackground />
        </Box>
        <Box className="relative z-10 flex min-h-screen w-full flex-col">
          <Box className="mx-auto flex flex-1 items-center justify-start px-8 pb-12 sm:px-10 md:w-md md:px-14 lg:w-lg">
            <Box className="w-full">
              <Typography
                component="h1"
                variant="h4"
                className="font-lato text-primary mb-10 text-[1.75rem] font-black sm:text-[2.2rem]"
              >
                Welcome back!
              </Typography>

              <LoginForm />
            </Box>
          </Box>
        </Box>
      </Box>
    </Suspense>
  );
}
