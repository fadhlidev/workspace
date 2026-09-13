"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLiveQuery } from "@tanstack/react-db";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridSortModel,
} from "@mui/x-data-grid";
import { Search, UserPen, UserPlus, UserKey, UserRoundX } from "lucide-react";
import { formatDate } from "@shared/helpers/formatter";
import { Trigger } from "@frontend/components/common/trigger";
import { RegisterUserDialog } from "@pages/management/users/components/register-user-dialog";
import { UpdateInfoDialog } from "@pages/management/users/components/update-info-dialog";
import { UpdatePasswordDialog } from "@pages/management/users/components/update-password-dialog";
import { DeleteConfirmDialog } from "@pages/management/users/components/delete-confirm-dialog";
import { usersCollection } from "@pages/management/users/collections/user";
import type { User } from "@pages/management/users/types/user";

function stringAvatar(name: string) {
  return {
    className:
      "bg-gradient-to-br from-teal-700 to-slate-900 text-sm font-black text-white shadow-sm ring-4 ring-teal-50",
    children: name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0])
      .join(""),
  };
}

const columns: GridColDef[] = [
  {
    field: "name",
    headerName: "Nama Pengguna",
    width: 250,
    flex: 1,
    disableColumnMenu: true,
    renderCell: (params) => (
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: "center", height: "100%" }}
      >
        <Avatar {...stringAvatar(params.row.name)} />
        <Box>
          <Typography variant="body2" className="font-semibold">
            {params.row.name}
          </Typography>
          <Typography
            variant="body2"
            className="text-xs font-medium text-gray-500"
          >
            @{params.row.username}
          </Typography>
        </Box>
      </Stack>
    ),
  },
  {
    field: "email",
    headerName: "Alamat Email",
    width: 280,
    disableColumnMenu: true,
  },
  {
    field: "createdAt",
    headerName: "Ditambahkan",
    width: 160,
    disableColumnMenu: true,
    renderCell: (params) => (
      <Typography variant="body2" className="text-sm">
        {formatDate(params.value)}
      </Typography>
    ),
  },
  {
    field: "actions",
    headerName: "Aksi",
    width: 160,
    disableColumnMenu: true,
    sortable: false,
    renderCell: (params) => (
      <Stack direction="row" className="flex-nowrap items-center gap-2">
        <Trigger
          content={(props) => (
            <UpdateInfoDialog {...props} user={props.value as User} />
          )}
        >
          {({ handleOpen }) => (
            <Tooltip title="Update Info" placement="top">
              <Button
                variant="contained"
                size="small"
                color="info"
                className="size-9 min-w-9 rounded-lg"
                onClick={(e) => handleOpen(e, params.row)}
              >
                <UserPen className="size-5" />
              </Button>
            </Tooltip>
          )}
        </Trigger>

        <Trigger
          content={(props) => (
            <UpdatePasswordDialog {...props} user={props.value as User} />
          )}
        >
          {({ handleOpen }) => (
            <Tooltip title="Change Password" placement="top">
              <Button
                variant="contained"
                size="small"
                color="warning"
                className="size-9 min-w-9 rounded-lg"
                onClick={(e) => handleOpen(e, params.row)}
              >
                <UserKey className="size-5" />
              </Button>
            </Tooltip>
          )}
        </Trigger>

        <Trigger
          content={(props) => (
            <DeleteConfirmDialog {...props} user={props.value as User} />
          )}
        >
          {({ handleOpen }) => (
            <Tooltip title="Remove" placement="top">
              <Button
                variant="contained"
                size="small"
                color="error"
                className="size-9 min-w-9 rounded-lg"
                onClick={(e) => handleOpen(e, params.row)}
              >
                <UserRoundX className="size-5" />
              </Button>
            </Tooltip>
          )}
        </Trigger>
      </Stack>
    ),
  },
];

export function UserTable() {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  const { data: users, isLoading } = useLiveQuery({
    query: (q) => q.from({ user: usersCollection }),
  });

  const rows = useMemo(() => {
    const list = users ?? [];
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter(
      (user) =>
        user.name.toLowerCase().includes(q) ||
        user.username.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q),
    );
  }, [users, search]);

  return (
    <>
      <Box>
        <Stack
          direction="row"
          className="mb-3 items-center justify-between gap-2"
        >
          <Stack
            direction="row"
            className="w-full items-center gap-2"
            sx={{ flexWrap: "wrap" }}
          >
            <Typography
              variant="h6"
              component="div"
              className="font-lato text-[1rem] font-semibold text-nowrap text-gray-800"
            >
              Semua Pengguna
            </Typography>
            {users ? (
              <Typography
                component="div"
                className="font-lato text-[1rem] font-semibold text-gray-500"
              >
                {users?.length ?? 0}
              </Typography>
            ) : null}
          </Stack>

          <TextField
            variant="outlined"
            size="small"
            placeholder="Cari nama, username, atau email"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            slotProps={{
              input: {
                className: "rounded-lg font-lato bg-white",
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className="size-4 text-gray-400" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ minWidth: 300 }}
          />

          <Trigger content={(props) => <RegisterUserDialog {...props} />}>
            {({ handleOpen }) => (
              <Button
                variant="contained"
                color="success"
                size="small"
                className="h-9 min-w-40 rounded-lg px-3 text-nowrap"
                startIcon={<UserPlus className="size-4" />}
                onClick={handleOpen}
                disabled={isLoading}
              >
                Tambah Pengguna
              </Button>
            )}
          </Trigger>
        </Stack>
        <Card
          variant="outlined"
          className="@container overflow-hidden rounded-lg"
        >
          <CardContent className="last:pb-0">
            <Box sx={{ mt: -2, mx: -2, height: "calc(100dvh - 170px)" }}>
              {!users ? (
                <Skeleton className="h-full rounded-none" variant="rounded" />
              ) : (
                <DataGrid
                  rows={rows}
                  columns={columns}
                  loading={isLoading}
                  paginationModel={paginationModel}
                  onPaginationModelChange={setPaginationModel}
                  sortModel={sortModel}
                  onSortModelChange={setSortModel}
                  getRowId={(row) => row.id}
                  pageSizeOptions={[10, 20, 50, 100]}
                  getRowClassName={() =>
                    "hover:bg-white hover:shadow-[inset_4px_0_0_#0f766e,0_8px_22px_rgba(15,23,42,0.06)] transition duration-200 ease-out"
                  }
                  getRowHeight={() => "auto"}
                  className="font-poppins border-0"
                  classes={{
                    columnHeader: "bg-slate-50 text-xs uppercase text-gray-600",
                  }}
                  sx={{
                    "& .MuiDataGrid-row": {
                      minHeight: "72px !important",
                    },
                    "& .MuiDataGrid-cell": {
                      minHeight: "72px !important",
                      display: "flex",
                      alignItems: "center",
                      py: 1.5,
                    },
                    "& .MuiDataGrid-cellContent": {
                      whiteSpace: "normal",
                      lineHeight: 1.4,
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
                  }}
                  disableRowSelectionOnClick
                />
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
