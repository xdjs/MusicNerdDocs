export type Theme = "light" | "dark";

/** The theme to show: the visitor's saved choice, else the system's. */
export function effectiveTheme(saved: string | null, prefersDark: boolean): Theme {
  if (saved === "light" || saved === "dark") return saved;
  return prefersDark ? "dark" : "light";
}
