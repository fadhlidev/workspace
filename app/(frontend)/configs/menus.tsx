import { usePathname } from "next/navigation";
import { useCallback } from "react";
import { ChartColumn, Users, UserCog, ShieldCheck } from "lucide-react";

export type Menu = {
  label: string;
  icon: React.ReactNode;
  path?: string;
  matchPattern?: string;
  selectedClassName?: string;
  children?: Menu[];
  roles?: ("admin" | "user")[];
  secondaryAction?: React.ReactNode;
};

export function useMenu() {
  const pathname = usePathname();

  const isSelected = useCallback(
    (item: Menu) => {
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

  return { isSelected };
}

export const menus: Menu[] = [
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
