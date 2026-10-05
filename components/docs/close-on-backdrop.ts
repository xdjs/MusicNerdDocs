import type { MouseEvent } from "react";

/** Closes a modal dialog when the click lands on its backdrop (the dialog element itself), not its content. */
export function closeOnBackdrop(event: MouseEvent<HTMLDialogElement>, close: () => void) {
  if (event.target === event.currentTarget) close();
}
