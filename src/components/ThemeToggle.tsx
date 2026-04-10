import { useState, useEffect } from "react";

type Theme = "dark" | "light";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme") as Theme | null;
      if (stored === "light" || stored === "dark") {
        setTheme(stored);
      }
    } catch (_) {}
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch (_) {}
    if (next === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }

  const isLight = theme === "light";

  return (
    <button
      onClick={toggle}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: "1.25rem",
        color: "var(--text-primary)",
        padding: "0.5rem",
        transform: isLight ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 300ms ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {isLight ? "🌙" : "☀️"}
    </button>
  );
}
