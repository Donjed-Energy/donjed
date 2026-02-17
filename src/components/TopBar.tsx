import { Button } from "@/components/ui/button";
import { Home, Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export function TopBar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-6 border-b border-border/30 shrink-0">
      {/* Logo/Title with Home Link */}
      <a
        href="https://donjedenergy.com.ng/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-lg sm:text-2xl font-bold text-primary hover:text-primary/80 transition-colors group"
      >
        <span className="truncate">DonJed Energy Analyst</span>
      </a>

      {/* Right Actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full hover:bg-primary/10 transition-all duration-300"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          <Sun
            className={`h-4 w-4 sm:h-5 sm:w-5 text-primary absolute transition-all duration-300 ${
              theme === "dark"
                ? "rotate-0 scale-100 opacity-100"
                : "rotate-90 scale-0 opacity-0"
            }`}
          />
          <Moon
            className={`h-4 w-4 sm:h-5 sm:w-5 text-primary absolute transition-all duration-300 ${
              theme === "light"
                ? "rotate-0 scale-100 opacity-100"
                : "-rotate-90 scale-0 opacity-0"
            }`}
          />
        </Button>

        {/* Home Link */}
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="h-9 w-9 sm:h-10 sm:w-10 rounded-full hover:bg-primary/10 transition-colors"
        >
          <a
            href="https://donjedenergy.com.ng/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Go to DonJed Energy homepage"
          >
            <Home className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </a>
        </Button>
      </div>
    </header>
  );
}
