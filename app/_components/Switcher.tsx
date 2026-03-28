"use client";

import { useTheme } from "next-themes";
import { Switch } from "../../@/components/ui/switch";

export function SwitchDemo() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={theme === "dark"}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      />
    </div>
  );
}