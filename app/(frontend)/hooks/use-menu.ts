import { usePathname } from "next/navigation";
import { useCallback } from "react";
import type { Menu } from "@frontend/configs/menus";

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

  return isSelected;
}
