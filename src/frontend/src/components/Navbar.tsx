import { UserRole } from "@/backend.d";
import { Button } from "@/components/ui/button";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useTheme } from "@/hooks/useTheme";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Menu, Moon, ShieldCheck, Sun, X } from "lucide-react";
import { useState } from "react";
import logoImg from "/assets/uploads/WhatsApp-Image-2026-03-19-at-6.36.29-PM-1.jpeg";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { identity, clear } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLoggedIn = !!identity;

  const { data: userRole } = useQuery({
    queryKey: ["userRole"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching && isLoggedIn,
  });

  const isAdmin = userRole === UserRole.admin;

  const navLinks = isLoggedIn
    ? [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/new-entry", label: "New Entry" },
        { to: "/diary", label: "My Diary" },
        { to: "/analysis", label: "Analysis" },
        { to: "/chat", label: "Companion" },
        ...(isAdmin ? [{ to: "/admin", label: "Access" }] : []),
      ]
    : [];

  return (
    <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-display text-xl font-semibold text-foreground no-underline"
          data-ocid="nav.link"
        >
          <img
            src={logoImg}
            alt="Hollows Hope"
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="text-primary">Hollows</span>&nbsp;Hope
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              activeProps={{
                className:
                  "px-4 py-2 rounded-lg text-sm font-medium text-primary bg-accent",
              }}
              data-ocid="nav.link"
            >
              {link.to === "/admin" ? (
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> {link.label}
                </span>
              ) : (
                link.label
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            data-ocid="nav.toggle"
            className="rounded-full"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {isLoggedIn ? (
            <Button
              variant="outline"
              size="sm"
              onClick={clear}
              className="hidden md:flex rounded-full"
              data-ocid="nav.button"
            >
              Sign Out
            </Button>
          ) : (
            <Link to="/auth">
              <Button
                size="sm"
                className="rounded-full bg-primary text-primary-foreground hover:opacity-90"
                data-ocid="nav.primary_button"
              >
                Sign In
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            data-ocid="nav.toggle"
          >
            {mobileOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={() => setMobileOpen(false)}
              data-ocid="nav.link"
            >
              {link.label}
            </Link>
          ))}
          {isLoggedIn && (
            <button
              type="button"
              className="mt-2 text-left px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-accent"
              onClick={() => {
                clear();
                setMobileOpen(false);
              }}
              data-ocid="nav.button"
            >
              Sign Out
            </button>
          )}
        </div>
      )}
    </header>
  );
}
