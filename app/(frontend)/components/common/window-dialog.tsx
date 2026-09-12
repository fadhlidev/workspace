"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { GripHorizontal, Maximize2, Minimize2, X } from "lucide-react";
import { IconButton, Tooltip } from "@mui/material";

export interface WindowDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode;
  headerActions?: ReactNode;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}

type ResizeDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

const MIN_WIDTH = 380;
const MIN_HEIGHT = 280;

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function WindowDialog({
  open,
  onClose,
  title,
  icon,
  headerActions,
  children,
  className,
  ariaLabel,
}: WindowDialogProps) {
  const isMounted = useIsMounted();

  const [size, setSize] = useState(() => {
    if (typeof window === "undefined") return { width: 680, height: 740 };
    const width = Math.min(Math.max(window.innerWidth * 0.45, 480), 850);
    const height = Math.min(Math.max(window.innerHeight * 0.8, 500), 920);
    return { width, height };
  });

  const [position, setPosition] = useState(() => {
    if (typeof window === "undefined") return { x: 80, y: 80 };
    const width = Math.min(Math.max(window.innerWidth * 0.45, 480), 850);
    const height = Math.min(Math.max(window.innerHeight * 0.8, 500), 920);
    const x = Math.max(24, Math.round((window.innerWidth - width) / 2));
    const y = Math.max(24, Math.round((window.innerHeight - height) / 2));
    return { x, y };
  });

  const [isMaximized, setIsMaximized] = useState(false);
  const preMaxStateRef = useRef<{
    size: { width: number; height: number };
    position: { x: number; y: number };
  } | null>(null);

  const [isInteracting, setIsInteracting] = useState(false);

  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    initialPosX: number;
    initialPosY: number;
  }>({ startX: 0, startY: 0, initialPosX: 0, initialPosY: 0 });

  const resizeStartRef = useRef<{
    direction: ResizeDirection;
    startX: number;
    startY: number;
    initialWidth: number;
    initialHeight: number;
    initialPosX: number;
    initialPosY: number;
  }>({
    direction: "se",
    startX: 0,
    startY: 0,
    initialWidth: 0,
    initialHeight: 0,
    initialPosX: 0,
    initialPosY: 0,
  });

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const toggleMaximize = useCallback(() => {
    if (isMaximized) {
      if (preMaxStateRef.current) {
        setSize(preMaxStateRef.current.size);
        setPosition(preMaxStateRef.current.position);
      }
      setIsMaximized(false);
    } else {
      preMaxStateRef.current = { size, position };
      setPosition({ x: 12, y: 12 });
      setSize({
        width: Math.max(window.innerWidth - 24, MIN_WIDTH),
        height: Math.max(window.innerHeight - 24, MIN_HEIGHT),
      });
      setIsMaximized(true);
    }
  }, [isMaximized, position, size]);

  const handleDragPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || isMaximized) return;

    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) return;

    e.preventDefault();
    setIsInteracting(true);

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPosX: position.x,
      initialPosY: position.y,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - dragStartRef.current.startX;
      const dy = moveEvent.clientY - dragStartRef.current.startY;

      const maxX = Math.max(0, window.innerWidth - 100);
      const maxY = Math.max(0, window.innerHeight - 60);

      const nextX = Math.min(
        Math.max(10 - size.width + 120, dragStartRef.current.initialPosX + dx),
        maxX,
      );
      const nextY = Math.min(
        Math.max(10, dragStartRef.current.initialPosY + dy),
        maxY,
      );

      setPosition({ x: nextX, y: nextY });
    };

    const handlePointerUp = () => {
      setIsInteracting(false);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handleResizePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    direction: ResizeDirection,
  ) => {
    if (e.button !== 0 || isMaximized) return;

    e.preventDefault();
    e.stopPropagation();
    setIsInteracting(true);

    resizeStartRef.current = {
      direction,
      startX: e.clientX,
      startY: e.clientY,
      initialWidth: size.width,
      initialHeight: size.height,
      initialPosX: position.x,
      initialPosY: position.y,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const {
        direction: dir,
        startX,
        startY,
        initialWidth,
        initialHeight,
        initialPosX,
        initialPosY,
      } = resizeStartRef.current;

      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      let newWidth = initialWidth;
      let newHeight = initialHeight;
      let newX = initialPosX;
      let newY = initialPosY;

      if (dir.includes("e")) {
        newWidth = Math.max(
          MIN_WIDTH,
          Math.min(initialWidth + dx, window.innerWidth - initialPosX - 12),
        );
      } else if (dir.includes("w")) {
        const potentialWidth = initialWidth - dx;
        if (potentialWidth >= MIN_WIDTH) {
          newWidth = potentialWidth;
          newX = initialPosX + dx;
        } else {
          newWidth = MIN_WIDTH;
          newX = initialPosX + (initialWidth - MIN_WIDTH);
        }
      }

      if (dir.includes("s")) {
        newHeight = Math.max(
          MIN_HEIGHT,
          Math.min(initialHeight + dy, window.innerHeight - initialPosY - 12),
        );
      } else if (dir.includes("n")) {
        const potentialHeight = initialHeight - dy;
        if (potentialHeight >= MIN_HEIGHT) {
          newHeight = potentialHeight;
          newY = initialPosY + dy;
        } else {
          newHeight = MIN_HEIGHT;
          newY = initialPosY + (initialHeight - MIN_HEIGHT);
        }
      }

      setSize({ width: newWidth, height: newHeight });
      setPosition({ x: newX, y: newY });
    };

    const handlePointerUp = () => {
      setIsInteracting(false);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  if (!open || !isMounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-label={ariaLabel ?? title}
      className={`fixed flex flex-col rounded-xl border border-slate-200/90 bg-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] will-change-[left,top,width,height] select-none ${
        isInteracting ? "pointer-events-auto" : ""
      } ${className ?? ""}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: 1300,
        transition: isInteracting
          ? "none"
          : "left 280ms cubic-bezier(0.16, 1, 0.3, 1), top 280ms cubic-bezier(0.16, 1, 0.3, 1), width 280ms cubic-bezier(0.16, 1, 0.3, 1), height 280ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {!isMaximized && (
        <>
          <div
            onPointerDown={(e) => handleResizePointerDown(e, "n")}
            className="absolute -top-1.5 right-2 left-2 z-30 h-3 cursor-n-resize"
          />
          <div
            onPointerDown={(e) => handleResizePointerDown(e, "s")}
            className="absolute right-2 -bottom-1.5 left-2 z-30 h-3 cursor-s-resize"
          />
          <div
            onPointerDown={(e) => handleResizePointerDown(e, "w")}
            className="absolute top-2 bottom-2 -left-1.5 z-30 w-3 cursor-w-resize"
          />
          <div
            onPointerDown={(e) => handleResizePointerDown(e, "e")}
            className="absolute top-2 -right-1.5 bottom-2 z-30 w-3 cursor-e-resize"
          />

          <div
            onPointerDown={(e) => handleResizePointerDown(e, "nw")}
            className="absolute -top-1.5 -left-1.5 z-40 size-4 cursor-nw-resize"
          />
          <div
            onPointerDown={(e) => handleResizePointerDown(e, "ne")}
            className="absolute -top-1.5 -right-1.5 z-40 size-4 cursor-ne-resize"
          />
          <div
            onPointerDown={(e) => handleResizePointerDown(e, "sw")}
            className="absolute -bottom-1.5 -left-1.5 z-40 size-4 cursor-sw-resize"
          />
          <div
            onPointerDown={(e) => handleResizePointerDown(e, "se")}
            className="group absolute -right-1.5 -bottom-1.5 z-40 flex size-5 cursor-se-resize items-center justify-center"
          >
            <div className="size-2 border-r-2 border-b-2 border-slate-400 transition-colors group-hover:border-red-600" />
          </div>
        </>
      )}

      <div
        onPointerDown={handleDragPointerDown}
        onDoubleClick={toggleMaximize}
        className={`flex items-center justify-between rounded-t-xl border-b border-slate-200 bg-slate-50/95 px-3.5 py-2.5 select-none ${
          isMaximized ? "cursor-default" : "cursor-grab active:cursor-grabbing"
        }`}
      >
        <div className="flex min-w-0 items-center gap-2 pr-2">
          <GripHorizontal className="size-4 shrink-0 text-slate-400" />
          {icon}
          <Tooltip title={title} placement="bottom-start" arrow>
            <span className="font-lato truncate text-sm font-semibold text-slate-800">
              {title}
            </span>
          </Tooltip>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          {headerActions}

          <Tooltip
            title={isMaximized ? "Perkecil (Restore)" : "Perbesar (Maximize)"}
            arrow
          >
            <IconButton
              size="small"
              onClick={toggleMaximize}
              className="size-7 text-slate-500 hover:bg-slate-200/80 hover:text-slate-800"
            >
              {isMaximized ? (
                <Minimize2 className="size-3.5" />
              ) : (
                <Maximize2 className="size-3.5" />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title="Tutup (Esc)" arrow>
            <IconButton
              size="small"
              onClick={onClose}
              className="ml-0.5 size-7 text-slate-500 hover:bg-red-50 hover:text-red-700"
            >
              <X className="size-4" />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      <div className="relative h-full w-full flex-1 overflow-hidden rounded-b-xl bg-slate-100">
        {isInteracting && (
          <div className="absolute inset-0 z-50 cursor-grabbing bg-transparent" />
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}
