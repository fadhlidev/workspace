"use client";

import { useCallback, useMemo } from "react";
import { useDbClient, useLiveQuery } from "@tanstack/react-db";
import { goeyToast } from "goey-toast";
import { getApiErrorMessage } from "@backend/helpers/api";
import {
  Box,
  Card,
  Checkbox,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { ShieldCheck } from "lucide-react";
import {
  permissionResourcesCollection,
  type PermissionResource,
} from "@pages/management/access-permission/collections/permission-resources";
import { permissionActionsCollection } from "@pages/management/access-permission/collections/permission-actions";
import { rolePermissionsCollection } from "@pages/management/access-permission/collections/role-permissions";

const ROLES = [
  { key: "admin", label: "Admin", color: "error" as const },
  { key: "user", label: "User", color: "primary" as const },
];

function entryKey(role: string, resourceId: string, actionId: string) {
  return `${role}:${resourceId}:${actionId}`;
}

export function PermissionMatrix() {
  const dbClient = useDbClient();

  const { data: resources = [], isLoading: resourcesLoading } = useLiveQuery({
    query: (q) => q.from({ resource: permissionResourcesCollection }),
  });

  const { data: actions = [], isLoading: actionsLoading } = useLiveQuery({
    query: (q) => q.from({ action: permissionActionsCollection }),
  });

  const { data: rolePermissionsList = [], isLoading: rpLoading } = useLiveQuery(
    {
      query: (q) => q.from({ rolePermission: rolePermissionsCollection }),
    },
  );

  const actionById = useMemo(
    () => new Map(actions.map((action) => [action.id, action])),
    [actions],
  );

  const serverSelected = useMemo(() => {
    const s = new Set<string>();
    for (const rp of rolePermissionsList) {
      s.add(entryKey(rp.role, rp.resourceId, rp.actionId));
    }
    return s;
  }, [rolePermissionsList]);

  const isSelected = useCallback(
    (role: string, resourceId: string, actionId: string) =>
      serverSelected.has(entryKey(role, resourceId, actionId)),
    [serverSelected],
  );

  const handleToggle = useCallback(
    async (
      targetRole: string,
      resourceId: string,
      actionId: string,
      enabled: boolean,
      resourceName: string,
      actionName: string,
    ) => {
      const rolePermissions = dbClient.collection(rolePermissionsCollection);
      try {
        if (enabled) {
          await rolePermissions.insert({
            id: crypto.randomUUID(),
            role: targetRole,
            resourceId,
            actionId,
            resource: resourceName,
            action: actionName,
          }).isPersisted.promise;
        } else {
          const key = entryKey(targetRole, resourceId, actionId);
          const existing = rolePermissionsList.find(
            (rp) => entryKey(rp.role, rp.resourceId, rp.actionId) === key,
          );
          if (!existing) return;
          await rolePermissions.delete(existing.id).isPersisted.promise;
        }
        goeyToast.success(
          enabled ? "Permission granted" : "Permission revoked",
        );
      } catch (err) {
        goeyToast.error(getApiErrorMessage(err));
      }
    },
    [dbClient, rolePermissionsList],
  );

  const makeRoleColumn = useCallback(
    (roleKey: string, resource: PermissionResource): GridColDef => ({
      field: `role_${roleKey}`,
      headerName: ROLES.find((r) => r.key === roleKey)!.label,
      minWidth: 80,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row as { actionId: string };
        const action = actionById.get(row.actionId);
        return (
          <Box className="flex h-full w-full items-center justify-center">
            <Checkbox
              checked={isSelected(roleKey, resource.id, row.actionId)}
              onChange={() =>
                handleToggle(
                  roleKey,
                  resource.id,
                  row.actionId,
                  !isSelected(roleKey, resource.id, row.actionId),
                  resource.name,
                  action?.name ?? "",
                )
              }
              size="small"
            />
          </Box>
        );
      },
    }),
    [isSelected, handleToggle, actionById],
  );

  const resourceGrids = useMemo(
    () =>
      resources.map((resource) => {
        const rows = actions.map((action) => ({
          id: action.id,
          actionId: action.id,
          actionName: action.label,
        }));

        const columns: GridColDef[] = [
          {
            field: "actionName",
            headerName: "Action",
            minWidth: 160,
            flex: 1,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
              <Typography className="font-lato text-sm text-gray-700">
                {params.row.actionName}
              </Typography>
            ),
          },
          ...ROLES.map((role) => makeRoleColumn(role.key, resource)),
        ];

        return { resource, rows, columns };
      }),
    [resources, actions, makeRoleColumn],
  );

  const loading = resourcesLoading || actionsLoading || rpLoading;

  if (loading) {
    return (
      <Box>
        <Stack
          direction="row"
          className="mb-3 h-10 w-full items-center gap-2"
          sx={{ flexWrap: "wrap" }}
        >
          <Typography
            variant="h6"
            component="div"
            className="font-lato text-[1rem] font-semibold text-nowrap text-gray-800"
          >
            Semua Resources
          </Typography>
        </Stack>
        <Stack spacing={2}>
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              variant="outlined"
              className="overflow-hidden rounded-lg"
            >
              <Box className="p-4">
                <Stack direction="row" className="items-center gap-4">
                  <ShieldCheck className="size-6 text-gray-400" />
                  <Box>
                    <Skeleton className="mb-1 h-5 w-48 rounded" />
                    <Skeleton className="h-4 w-72 rounded" />
                  </Box>
                </Stack>
              </Box>
              <Skeleton className="mx-4 mb-4 h-40 rounded" />
            </Card>
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      <Stack
        direction="row"
        className="mb-3 h-10 w-full items-center gap-2"
        sx={{ flexWrap: "wrap" }}
      >
        <Typography
          variant="h6"
          component="div"
          className="font-lato text-[1rem] font-semibold text-nowrap text-gray-800"
        >
          Semua Resources
        </Typography>
        <Typography
          component="div"
          className="font-lato text-[1rem] font-semibold text-gray-500"
        >
          {resourceGrids?.length ?? 0}
        </Typography>
      </Stack>
      <Stack spacing={2}>
        {resourceGrids.map(({ resource, rows, columns }) => (
          <Card
            key={resource.id}
            variant="outlined"
            className="overflow-hidden rounded-lg"
          >
            <Box className="border-b border-gray-200 px-4 py-3">
              <Stack direction="row" className="items-center gap-4">
                <ShieldCheck className="size-6 text-gray-400" />
                <Box>
                  <Typography className="font-lato text-sm font-semibold text-gray-800">
                    {resource.label}
                  </Typography>
                  {resource.description && (
                    <Typography
                      variant="caption"
                      className="font-lato text-gray-400"
                      sx={{ display: "block" }}
                    >
                      {resource.description}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Box>
            <Box sx={{ height: 56 + rows.length * 52 }}>
              <DataGrid
                rows={rows}
                columns={columns}
                getRowId={(row) => row.id}
                hideFooter
                disableRowSelectionOnClick
                disableColumnMenu
                getRowHeight={() => "auto"}
                className="font-poppins border-0"
                classes={{
                  columnHeader: "bg-slate-50 text-xs uppercase text-gray-600",
                }}
                sx={{
                  "& .MuiDataGrid-row": {
                    minHeight: "52px !important",
                  },
                  "& .MuiDataGrid-cell": {
                    minHeight: "52px !important",
                    display: "flex",
                    alignItems: "center",
                    py: 0.5,
                  },
                  "& .MuiDataGrid-cell:focus": {
                    outline: "none",
                  },
                  "& .MuiDataGrid-cell:focus-within": {
                    outline: "none",
                  },
                  "& .MuiDataGrid-columnHeader:focus": {
                    outline: "none",
                  },
                  "& .MuiDataGrid-columnHeader:focus-within": {
                    outline: "none",
                  },
                  "& .MuiDataGrid-overlay": {
                    display: "none",
                  },
                }}
              />
            </Box>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
