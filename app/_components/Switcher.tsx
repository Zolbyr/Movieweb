"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button, Tooltip } from "@heroui/react";

export function SwitchDemo() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = mounted && resolvedTheme === "dark";
  const label = dark ? "Цайвар горимд шилжих" : "Бараан горимд шилжих";
  return (
    <Tooltip><Button variant="ghost" isIconOnly className="icon-button theme-toggle" type="button" isDisabled={!mounted} onPress={() => setTheme(dark ? "light" : "dark")} aria-label={label}>
      {dark ? <Sun size={19} /> : <Moon size={19} />}
    </Button><Tooltip.Content>{label}</Tooltip.Content></Tooltip>
  );
}
