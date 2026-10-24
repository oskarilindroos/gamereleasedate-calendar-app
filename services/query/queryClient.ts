import { useEffect } from "react";
import { AppState } from "react-native";
import { focusManager, QueryClient } from "@tanstack/react-query";

// React Native has no window focus events: treat the app coming to the
// foreground as "focus" so stale queries refetch.
// https://tanstack.com/query/latest/docs/framework/react/react-native
export const useAppStateFocus = () =>
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (status) =>
      focusManager.setFocused(status === "active")
    );
    return () => subscription.remove();
  }, []);

export const queryKeys = {
  games: (searchPhrase?: string) => ["games", searchPhrase ?? null] as const,
  calendarEntries: ["calendarEntries"] as const,
};

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Release dates rarely change; avoid refetching when going back and forth
        staleTime: 5 * 60 * 1000,
      },
    },
  });
