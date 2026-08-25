import { api } from "@backend/api/client";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

type Profile = {
  username: string;
  name: string;
  email: string;
  role: string;
};

export function useProfile() {
  const { data: session } = useSession();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["/api/user/me"],
    queryFn: async () => {
      const res = await api.get("/api/user/me");
      return res.data.user as Profile;
    },
  });

  const name = profileData?.name ?? session?.user?.name ?? "";
  const username = profileData?.username ?? session?.user?.username ?? "";
  const email = profileData?.email ?? session?.user?.email ?? "";
  const role = profileData?.role ?? session?.role ?? "";

  return { name, username, email, role, isLoading };
}
