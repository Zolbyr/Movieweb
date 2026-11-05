"use client";

import { createContext, useContext, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";

const NavigationMotionContext = createContext<{
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
} | null>(null);

export function NavigationMotionProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen }), [open]);
  return <NavigationMotionContext.Provider value={value}>{children}</NavigationMotionContext.Provider>;
}

export function useNavigationMotion() {
  const context = useContext(NavigationMotionContext);
  if (!context) throw new Error("NavigationMotionProvider is required.");
  return context;
}
