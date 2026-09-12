"use client";

import { useState, Fragment, ReactNode, MouseEvent } from "react";
import { useToggle } from "react-use";

interface TriggerProps {
  children: ({
    isOpen,
    handleOpen,
  }: {
    isOpen?: boolean;
    handleOpen: (event?: MouseEvent<HTMLElement>) => void;
    handleClose: () => void;
  }) => ReactNode;
  dialog: ({
    anchorEl,
    open,
    onClose,
  }: {
    anchorEl: HTMLElement | null;
    open: boolean;
    onClose: () => void;
  }) => ReactNode;
}

export function Trigger({ children, dialog }: TriggerProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [open, toggleOpen] = useToggle(false);

  function handleOpen(event?: MouseEvent<HTMLElement>) {
    if (event) setAnchorEl(event.currentTarget);
    toggleOpen(true);
  }

  function handleClose() {
    setAnchorEl(null);
    toggleOpen(false);
  }

  return (
    <Fragment>
      {children({ isOpen: open, handleOpen, handleClose })}
      {dialog({ anchorEl, open, onClose: handleClose })}
    </Fragment>
  );
}
