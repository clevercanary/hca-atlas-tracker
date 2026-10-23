import { useSnackbar } from "@/app/components/common/Snackbar/provider/hook";
import { type SnackbarEntry } from "@/app/components/common/Snackbar/provider/types";
import { useEffect, useState } from "react";
import { type UseAutoHide } from "./types";

/**
 * Closes an entry once `duration` has passed, restarting the countdown after
 * the pointer has been over it so it can't vanish while being read.
 * @param id - Entry to close.
 * @param duration - Milliseconds before the entry closes; undefined for an
 * entry that only closes on its button.
 * @returns hover handlers to spread on the entry.
 */
export const useAutoHide = (
  id: SnackbarEntry["id"],
  duration?: number,
): UseAutoHide => {
  const { onClose } = useSnackbar();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (duration === undefined || isHovered) return;
    const timer = setTimeout(() => onClose(id), duration);
    return (): void => clearTimeout(timer);
  }, [duration, id, isHovered, onClose]);

  return {
    onMouseEnter: (): void => setIsHovered(true),
    onMouseLeave: (): void => setIsHovered(false),
  };
};
