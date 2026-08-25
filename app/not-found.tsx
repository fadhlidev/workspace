"use client";

import Link from "next/link";
import { Home, SearchX } from "lucide-react";
import { Button } from "@mui/material";

export default function NotFound() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f6f8fb]">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 20% 10%, color-mix(in srgb, var(--color-primary) 8%, transparent), transparent 50%), radial-gradient(ellipse at 80% 90%, color-mix(in srgb, var(--color-success) 8%, transparent), transparent 50%)",
        }}
      />

      <div className="relative mx-2 flex max-w-96 flex-col items-center rounded border border-neutral-200 bg-white px-8 py-12 shadow-sm sm:px-12">
        <div className="bg-primary/10 mb-6 flex h-20 w-20 items-center justify-center rounded-full">
          <SearchX size={36} className="text-primary" />
        </div>

        <h1
          className="font-lato mb-2 bg-clip-text text-6xl leading-none font-black tracking-tighter text-transparent sm:text-7xl"
          style={{
            backgroundImage:
              "linear-gradient(135deg, var(--color-primary) 0%, var(--color-success) 100%)",
          }}
        >
          404
        </h1>

        <h5 className="font-lato text-primary mb-2 text-xl font-bold">
          Page not found
        </h5>

        <p className="mb-6 max-w-80 text-center text-sm text-neutral-500">
          The page you are looking for does not exist or has been moved. Check
          the URL or head back to the dashboard.
        </p>

        <Button
          component={Link}
          href="/"
          variant="contained"
          size="large"
          startIcon={<Home size={18} />}
          className="px-8"
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}
