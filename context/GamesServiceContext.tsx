import { createContext, ReactNode, useContext } from "react";
import { GamesService } from "../services/GamesService";

const GamesServiceContext = createContext<GamesService | null>(null);

export function GamesServiceProvider({
  service,
  children,
}: {
  service: GamesService;
  children: ReactNode;
}) {
  return (
    <GamesServiceContext.Provider value={service}>
      {children}
    </GamesServiceContext.Provider>
  );
}

export const useGamesService = (): GamesService => {
  const service = useContext(GamesServiceContext);
  if (!service) {
    throw new Error("useGamesService must be used within GamesServiceProvider");
  }
  return service;
};
