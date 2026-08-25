"use client";

import { cx } from "classix";
import { Fragment, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useProfile } from "@frontend/hooks/use-profile";
import Link from "next/link";
import {
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { ChevronRight } from "lucide-react";
import {
  menus as defaultMenus,
  useMenu,
  type Menu,
} from "@frontend/configs/menus";

interface PageMenuListProps {
  menus?: Menu[];
}

export function PageMenuList({ menus = defaultMenus }: PageMenuListProps) {
  const pathname = usePathname();
  const { role } = useProfile();
  const { isSelected } = useMenu();
  const [override, setOverride] = useState<string[]>([]);

  const visibleMenus = useMemo(() => {
    const filterByRole = (items: Menu[]): Menu[] =>
      items
        .filter(
          (item) =>
            !item.roles || item.roles.includes(role as "admin" | "user"),
        )
        .map((item) => ({
          ...item,
          children: item.children ? filterByRole(item.children) : undefined,
        }))
        .filter((item) => !item.children || item.children.length > 0);

    return filterByRole(menus);
  }, [role, menus]);

  const autoExpanded = useMemo(() => {
    return visibleMenus
      .filter((item) =>
        item.children?.some(
          (child) =>
            child.matchPattern && new RegExp(child.matchPattern).test(pathname),
        ),
      )
      .map((item) => item.label);
  }, [pathname, visibleMenus]);

  const expanded = useMemo(() => {
    const result = new Set(autoExpanded);
    for (const label of override) {
      if (result.has(label)) {
        result.delete(label);
      } else {
        result.add(label);
      }
    }
    return [...result];
  }, [autoExpanded, override]);

  const toggleExpand = (label: string) => {
    setOverride((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  };

  return (
    <List className="h-full overflow-y-auto" disablePadding>
      {visibleMenus.map((item) => (
        <Fragment key={item.label}>
          {item.children ? (
            <ListItem
              className="px-2 py-1"
              secondaryAction={item.secondaryAction}
            >
              <ListItemButton
                className="rounded-lg text-gray-500"
                selected={isSelected(item)}
                classes={{
                  selected: "bg-white text-primary [&_svg]:stroke-primary",
                }}
                onClick={() => toggleExpand(item.label)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  classes={{
                    primary: "text-sm font-lato font-semibold",
                  }}
                />
                <ChevronRight
                  className={`size-4 transition-transform duration-200 ${expanded.includes(item.label) ? "rotate-90" : ""}`}
                />
              </ListItemButton>
            </ListItem>
          ) : (
            <ListItem
              className="px-2 py-1"
              secondaryAction={item.secondaryAction}
            >
              <ListItemButton
                LinkComponent={Link}
                href={item.path as string}
                className="rounded-lg text-gray-500"
                selected={isSelected(item)}
                classes={{
                  selected: cx(
                    "text-primary [&_svg]:stroke-primary",
                    item.selectedClassName,
                  ),
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  classes={{
                    primary: "text-sm font-lato font-semibold",
                  }}
                />
              </ListItemButton>
            </ListItem>
          )}
          {item.children && (
            <Collapse in={expanded.includes(item.label)} timeout="auto">
              <List disablePadding>
                {item.children.map((child) => (
                  <ListItem
                    key={child.label}
                    className="px-2 py-1"
                    secondaryAction={child.secondaryAction}
                  >
                    <ListItemButton
                      LinkComponent={Link}
                      href={child.path as string}
                      className="rounded-lg text-gray-500"
                      selected={isSelected(child)}
                      classes={{
                        selected: cx(
                          "text-primary [&_svg]:stroke-primary",
                          child.selectedClassName,
                        ),
                      }}
                      sx={{ pl: 4 }}
                    >
                      <ListItemIcon>{child.icon}</ListItemIcon>
                      <ListItemText
                        primary={child.label}
                        classes={{
                          primary: "text-sm font-lato font-semibold",
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          )}
        </Fragment>
      ))}
    </List>
  );
}
