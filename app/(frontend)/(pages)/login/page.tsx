import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@pages/login/components/login-form";

export const metadata: Metadata = {
  title: "Login | Fadhlidev Dashboard",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAE6]" />}>
      <LoginForm />
    </Suspense>
  );
}
