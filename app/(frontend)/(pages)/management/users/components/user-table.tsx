"use client";

import { useEffect, useRef, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTRPC } from "@frontend/trpc/client";
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
import { UpdateInfoDialog } from "./update-info-dialog";
import { UpdatePasswordDialog } from "./update-password-dialog";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { RegisterUserDialog } from "./register-user-dialog";
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

  const [updateInfoTarget, setUpdateInfoTarget] = useState<User | null>(null);
  const [updatePasswordTarget, setUpdatePasswordTarget] = useState<User | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);

  const sort = sortModel.length > 0 ? sortModel[0].field : undefined;
  const order = sortModel.length > 0 ? sortModel[0].sort : undefined;
  const trpc = useTRPC();

  const {
    data: usersRes,
    isLoading,
    isFetching,
  } = useQuery(
    trpc.management.users.list.queryOptions(
      {
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        sort,
        order: order as "asc" | "desc",
        search,
      },
      {
        placeholderData: keepPreviousData,
      },
    ),
  );

  const data = usersRes
    ? { data: usersRes.data as User[], total: usersRes.total }
    : undefined;

  const columns: GridColDef<User>[] = [
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
          <Tooltip title="Update Info" placement="top">
            <Button
              variant="contained"
              size="small"
              color="info"
              className="size-9 min-w-9 rounded-lg"
              onClick={() => setUpdateInfoTarget(params.row)}
            >
              <UserPen className="size-5" />
            </Button>
          </Tooltip>
          <Tooltip title="Change Password" placement="top">
            <Button
              variant="contained"
              size="small"
              color="warning"
              className="size-9 min-w-9 rounded-lg"
              onClick={() => setUpdatePasswordTarget(params.row)}
            >
              <UserKey className="size-5" />
            </Button>
          </Tooltip>
          <Tooltip title="Remove" placement="top">
            <Button
              variant="contained"
              size="small"
              color="error"
              className="size-9 min-w-9 rounded-lg"
              onClick={() => setDeleteTarget(params.row)}
            >
              <UserRoundX className="size-5" />
            </Button>
          </Tooltip>
        </Stack>
      ),
    },
  ];

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
            {data ? (
              <Typography
                component="div"
                className="font-lato text-[1rem] font-semibold text-gray-500"
              >
                {data?.total ?? 0}
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

          <Button
            variant="contained"
            color="success"
            size="small"
            className="h-9 min-w-40 rounded-lg px-3 text-nowrap"
            startIcon={<UserPlus className="size-4" />}
            onClick={() => setRegisterOpen(true)}
            disabled={isLoading}
          >
            Tambah Pengguna
          </Button>
        </Stack>
        <Card
          variant="outlined"
          className="@container overflow-hidden rounded-lg"
        >
          <CardContent className="last:pb-0">
            <Box sx={{ mt: -2, mx: -2, height: "calc(100dvh - 170px)" }}>
              {!data ? (
                <Skeleton className="h-full rounded-none" variant="rounded" />
              ) : (
                <DataGrid
                  rows={data?.data ?? []}
                  columns={columns}
                  rowCount={data?.total ?? 0}
                  loading={isLoading || isFetching}
                  paginationMode="server"
                  paginationModel={paginationModel}
                  onPaginationModelChange={setPaginationModel}
                  sortingMode="server"
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

      {/* Dialogs */}
      <UpdateInfoDialog
        open={!!updateInfoTarget}
        user={updateInfoTarget}
        onClose={() => setUpdateInfoTarget(null)}
      />
      <UpdatePasswordDialog
        open={!!updatePasswordTarget}
        user={updatePasswordTarget}
        onClose={() => setUpdatePasswordTarget(null)}
      />
      <DeleteConfirmDialog
        open={!!deleteTarget}
        user={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
      <RegisterUserDialog
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
      />
    </>
  );
}
