"use client";

import { useState, Fragment, ReactNode, MouseEvent } from "react";
import { useToggle } from "react-use";

interface TriggerChildrenProps<T> {
  isOpen?: boolean;
  handleOpen: (event?: MouseEvent<HTMLElement>, value?: T) => void;
  handleClose: () => void;
}

interface TriggerContentProps<T> {
  value?: T | null;
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

interface TriggerProps<T> {
  children: (props: TriggerChildrenProps<T>) => ReactNode;
  content: (props: TriggerContentProps<T>) => ReactNode;
}

export function Trigger<T>({ children, content }: TriggerProps<T>) {
  const [value, setValue] = useState<T | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [open, toggleOpen] = useToggle(false);

  function handleOpen(event?: MouseEvent<HTMLElement>, value?: T) {
    if (event) setAnchorEl(event.currentTarget);
    toggleOpen(true);
    if (value) setValue(value);
  }

  function handleClose() {
    setAnchorEl(null);
    toggleOpen(false);
    setValue(null);
  }

  return (
    <Fragment>
      {children({ isOpen: open, handleOpen, handleClose })}
      {content({ open, value, anchorEl, onClose: handleClose })}
    </Fragment>
  );
}
