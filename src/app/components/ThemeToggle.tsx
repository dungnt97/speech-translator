"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="p-2 rounded-lg bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700
        w-10 h-10"
      />
    );
  }

  const getIcon = () => {
    if (theme === "dark") return <Moon className="h-5 w-5 text-blue-600" />;
    if (theme === "light") return <Sun className="h-5 w-5 text-orange-500" />;
    return <Monitor className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="p-2 rounded-lg 
            bg-background border-border
            hover:bg-accent/5
            border focus:outline-none 
            focus:ring-2 focus:ring-accent
            transition-colors duration-200
            w-10 h-10 flex items-center justify-center"
          title="Change theme"
        >
          {getIcon()}
          <span className="sr-only">Toggle theme</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="z-50 w-32 overflow-hidden rounded-md 
          bg-background border-border border
          shadow-lg"
      >
        <div
          role="menuitem"
          onClick={() => setTheme("light")}
          className="flex cursor-pointer select-none items-center 
            justify-between rounded-sm px-3 py-2 text-sm
            text-foreground hover:bg-accent/5"
        >
          <span>Light</span>
          <Sun className="h-4 w-4 text-orange-500" />
        </div>
        <div
          role="menuitem"
          onClick={() => setTheme("dark")}
          className="flex cursor-pointer select-none items-center justify-between rounded-sm px-3 py-2 text-sm
            text-gray-600 hover:bg-gray-100 hover:text-gray-900
            dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-50"
        >
          <span>Dark</span>
          <Moon className="h-4 w-4 text-blue-600" />
        </div>
        <div
          role="menuitem"
          onClick={() => setTheme("system")}
          className="flex cursor-pointer select-none items-center justify-between rounded-sm px-3 py-2 text-sm
            text-gray-600 hover:bg-gray-100 hover:text-gray-900
            dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-50"
        >
          <span>System</span>
          <Monitor className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
