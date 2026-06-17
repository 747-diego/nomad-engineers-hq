"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

// Toggles the cream light theme (default) vs. the dark theme, persisting the
// choice. The class is applied pre-paint by the inline script in layout.tsx,
// so this just reflects + flips it.
export function ThemeToggle() {
  const [light, setLight] = useState(true);

  useEffect(() => {
    setLight(document.documentElement.classList.contains("nomad-light"));
  }, []);

  function toggle() {
    const next = !light;
    setLight(next);
    const cls = document.documentElement.classList;
    if (next) {
      cls.add("nomad-light");
      localStorage.setItem("nomad-theme", "light");
    } else {
      cls.remove("nomad-light");
      localStorage.setItem("nomad-theme", "dark");
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={light ? "Switch to dark theme" : "Switch to light theme"}
      className="flex h-8 w-8 items-center justify-center text-nomad-muted-gray transition-colors hover:text-foreground"
    >
      {light ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
