import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fadhlidev Workspace",
  icons: {
    icon: "/favicon.ico",
  },
};

export function extendMetadata(
  extend: Partial<Metadata> & { title: string },
): Metadata {
  return {
    ...metadata,
    ...extend,
    title: `${extend.title} | ${metadata.title}`,
  };
}
