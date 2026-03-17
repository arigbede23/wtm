// LocalTeamProvider — detects the user's nearest sports team, injects their
// brand colors as CSS variables, and exposes the team via React context.

"use client";

import { createContext, useContext } from "react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useLocalTeam } from "@/hooks/useLocalTeam";
import type { LocalTeam } from "@/lib/localTeams";

const LocalTeamContext = createContext<LocalTeam | null>(null);

export function useLocalTeamContext() {
  return useContext(LocalTeamContext);
}

export function LocalTeamProvider({ children }: { children: React.ReactNode }) {
  const { lat, lng } = useGeolocation();
  const team = useLocalTeam(lat, lng);

  return (
    <LocalTeamContext.Provider value={team}>
      {children}
    </LocalTeamContext.Provider>
  );
}
