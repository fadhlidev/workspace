export const Resources = {
  USERS: "users",
  ACCESS_PERMISSION: "access-permission",
} as const;

export const Actions = {
  VIEW: "view",
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  EXPORT: "export",
} as const;

export type Resource = (typeof Resources)[keyof typeof Resources];
export type Action = (typeof Actions)[keyof typeof Actions];
