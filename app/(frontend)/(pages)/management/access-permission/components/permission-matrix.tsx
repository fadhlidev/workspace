"use client";

import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@backend/api/client";
import { goeyToast } from "goey-toast";
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

type Resource = {
  id: string;
  name: string;
  label: string;
  description: string | null;
};

type Action = {
  id: string;
  name: string;
  label: string;
  description: string | null;
};

type RolePermission = {
  id: string;
  role: string;
  resourceId: string;
  actionId: string;
  resource: string;
  action: string;
};

const ROLES = [
  { key: "admin", label: "Admin", color: "error" as const },
  { key: "user", label: "User", color: "primary" as const },
];

export function PermissionMatrix() {
  const queryClient = useQueryClient();

  const { data: resourcesData, isLoading: resourcesLoading } = useQuery({
    queryKey: ["/api/management/access-permission/resources"],
    queryFn: async () => {
      const res = await api.get("/api/management/access-permission/resources");
      return res.data.data as Resource[];
    },
  });

  const { data: actionsData, isLoading: actionsLoading } = useQuery({
    queryKey: ["/api/management/access-permission/actions"],
    queryFn: async () => {
      const res = await api.get("/api/management/access-permission/actions");
      return res.data.data as Action[];
    },
  });

  const { data: rolePermissionsData, isLoading: rpLoading } = useQuery({
    queryKey: ["/api/management/access-permission/role-permissions"],
    queryFn: async () => {
      const res = await api.get(
        "/api/management/access-permission/role-permissions",
      );
      return res.data.data as RolePermission[];
    },
  });

  const resources = useMemo(() => resourcesData ?? [], [resourcesData]);
  const actions = useMemo(() => actionsData ?? [], [actionsData]);
  const rolePermissionsList = useMemo(
    () => rolePermissionsData ?? [],
    [rolePermissionsData],
  );

  const [pendingToggles, setPendingToggles] = useState<Map<string, boolean>>(
    new Map(),
  );

  const serverSelected = useMemo(() => {
    const s = new Set<string>();
    for (const rp of rolePermissionsList) {
      s.add(`${rp.role}:${rp.resourceId}:${rp.actionId}`);
    }
    return s;
  }, [rolePermissionsList]);

  const isSelected = useCallback(
    (role: string, resourceId: string, actionId: string) => {
      const key = `${role}:${resourceId}:${actionId}`;
      const pending = pendingToggles.get(key);
      return pending ?? serverSelected.has(key);
    },
    [pendingToggles, serverSelected],
  );

  const { mutate: toggleMutate } = useMutation({
    mutationFn: async ({
      targetRole,
      resourceId,
      actionId,
      enabled,
    }: {
      targetRole: string;
      resourceId: string;
      actionId: string;
      enabled: boolean;
    }) => {
      const res = await api.post(
        "/api/management/access-permission/role-permissions/toggle",
        { targetRole, resourceId, actionId, enabled },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/management/access-permission/role-permissions"],
      });
    },
  });

  const handleToggle = useCallback(
    (
      targetRole: string,
      resourceId: string,
      actionId: string,
      enabled: boolean,
    ) => {
      const key = `${targetRole}:${resourceId}:${actionId}`;
      setPendingToggles((prev) => {
        const next = new Map(prev);
        next.set(key, enabled);
        return next;
      });

      toggleMutate(
        { targetRole, resourceId, actionId, enabled },
        {
          onSuccess: (data) => {
            setPendingToggles((prev) => {
              const next = new Map(prev);
              next.delete(key);
              return next;
            });
            goeyToast.success(data.message);
          },
          onError: (err: {
            response?: { data?: { message?: string } };
            message?: string;
          }) => {
            setPendingToggles((prev) => {
              const next = new Map(prev);
              next.delete(key);
              return next;
            });
            goeyToast.error(
              err.response?.data?.message ??
                err.message ??
                "Failed to update permission",
            );
          },
        },
      );
    },
    [toggleMutate],
  );

  const makeRoleColumn = useCallback(
    (roleKey: string, resourceId: string): GridColDef => ({
      field: `role_${roleKey}`,
      headerName: ROLES.find((r) => r.key === roleKey)!.label,
      minWidth: 80,
      align: "center" as const,
      headerAlign: "center" as const,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row as { actionId: string };
        return (
          <Box className="flex h-full w-full items-center justify-center">
            <Checkbox
              checked={isSelected(roleKey, resourceId, row.actionId)}
              onChange={() =>
                handleToggle(
                  roleKey,
                  resourceId,
                  row.actionId,
                  !isSelected(roleKey, resourceId, row.actionId),
                )
              }
              size="small"
            />
          </Box>
        );
      },
    }),
    [isSelected, handleToggle],
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
          ...ROLES.map((role) => makeRoleColumn(role.key, resource.id)),
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
