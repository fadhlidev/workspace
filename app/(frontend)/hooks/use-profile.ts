import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useTRPC } from "@frontend/trpc/client";

export function useProfile() {
  const { data: session } = useSession();
  const trpc = useTRPC();

  const { data: profileData, isLoading } = useQuery(
    trpc.profile.getMe.queryOptions(undefined, {
      enabled: !!session,
    }),
  );

  const name = profileData?.user.name ?? session?.user?.name ?? "";
  const username = profileData?.user.username ?? session?.user?.username ?? "";
  const email = profileData?.user.email ?? session?.user?.email ?? "";
  const role = profileData?.user.role ?? session?.role ?? "";

  return { name, username, email, role, isLoading };
}
