// useLocalTeam — finds the nearest sports team based on user location
// and injects their brand colors as CSS variables on <html>.

"use client";

import { useEffect, useMemo } from "react";
import { findLocalTeam, generatePalette, type LocalTeam } from "@/lib/localTeams";

export function useLocalTeam(lat: number | null, lng: number | null): LocalTeam | null {
  const team = useMemo(() => {
    if (lat == null || lng == null) return null;
    return findLocalTeam(lat, lng);
  }, [lat, lng]);

  // Inject team colors as CSS custom properties on <html>
  useEffect(() => {
    const root = document.documentElement;

    if (!team) {
      // Remove any previously injected team styles
      root.removeAttribute("data-team");
      root.style.removeProperty("--team-primary");
      root.style.removeProperty("--team-secondary");
      // Reset brand CSS variable to default
      root.style.removeProperty("--primary");
      root.style.removeProperty("--ring");
      // Remove injected palette
      for (let i = 0; i < 11; i++) {
        root.style.removeProperty(`--brand-override-${i}`);
      }
      return;
    }

    root.setAttribute("data-team", `${team.city}-${team.team}`.toLowerCase().replace(/\s+/g, "-"));
    root.style.setProperty("--team-primary", team.colors.primary);
    root.style.setProperty("--team-secondary", team.colors.secondary);

    // Override the primary HSL variable so all brand-colored elements adapt
    root.style.setProperty("--primary", team.colors.primaryHSL);
    root.style.setProperty("--ring", team.colors.primaryHSL);

    // Generate and inject the full palette as CSS variables for Tailwind overrides
    const palette = generatePalette(team.colors.primary);
    const shades = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];
    for (const shade of shades) {
      root.style.setProperty(`--brand-${shade}`, palette[shade]);
    }

    return () => {
      root.removeAttribute("data-team");
      root.style.removeProperty("--team-primary");
      root.style.removeProperty("--team-secondary");
      root.style.removeProperty("--primary");
      root.style.removeProperty("--ring");
      for (const shade of shades) {
        root.style.removeProperty(`--brand-${shade}`);
      }
    };
  }, [team]);

  return team;
}
