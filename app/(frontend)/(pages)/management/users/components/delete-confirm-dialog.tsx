"use client";

import { useToggle } from "react-use";
import { useDbClient } from "@tanstack/react-db";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { AlertTriangle, Trash2 } from "lucide-react";
import { goeyToast } from "goey-toast";
import { getApiErrorMessage } from "@backend/helpers/api";
import { usersCollection } from "@pages/management/users/collections/user";
import type { User } from "@pages/management/users/types/user";

export interface DeleteConfirmDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
}

export function DeleteConfirmDialog({
  open,
  user,
  onClose,
}: DeleteConfirmDialogProps) {
  const dbClient = useDbClient();
  const [isSubmitting, toggleSubmitting] = useToggle(false);

  async function handleDelete() {
    toggleSubmitting();
    try {
      await dbClient.collection(usersCollection).delete(user!.id).isPersisted
        .promise;
      goeyToast.success("Pengguna berhasil dihapus");
      onClose();
    } catch (err) {
      goeyToast.error(getApiErrorMessage(err));
      onClose();
    } finally {
      toggleSubmitting();
    }
  }

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: { className: "rounded-xl" },
      }}
    >
      <DialogTitle className="pb-2">
        <Stack direction="row" spacing={1.5} className="items-center">
          <Box className="flex size-9 items-center justify-center rounded-lg bg-red-50">
            <AlertTriangle className="size-5 text-red-500" />
          </Box>
          <Box>
            <Typography className="font-lato text-base font-semibold text-gray-800">
              Hapus Pengguna
            </Typography>
            <Typography className="font-poppins text-xs text-gray-500">
              Tindakan ini tidak dapat dibatalkan
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent className="pt-4">
        <Alert
          severity="error"
          className="rounded-lg"
          icon={<Trash2 className="size-5" />}
        >
          <Typography className="font-lato text-sm">
            Apakah kamu yakin ingin menghapus akun{" "}
            <span className="font-semibold">{user?.name}</span> (
            <span className="font-mono text-xs">@{user?.username}</span>)?
            <br />
            Data akun ini akan dihapus permanen dari sistem.
          </Typography>
        </Alert>
      </DialogContent>

      <Divider />

      <DialogActions className="px-6 py-3">
        <Button
          type="button"
          variant="text"
          color="inherit"
          size="small"
          className="rounded-lg px-4 text-gray-600"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Batalkan
        </Button>
        <Button
          type="button"
          variant="contained"
          color="error"
          size="small"
          className="rounded-lg px-4"
          startIcon={<Trash2 className="size-4" />}
          loading={isSubmitting}
          onClick={handleDelete}
        >
          Hapus Pengguna
        </Button>
      </DialogActions>
    </Dialog>
  );
}
