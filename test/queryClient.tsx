import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// No retries (failures should show up immediately) and no garbage collection
// timers left running after a test
// https://tanstack.com/query/latest/docs/framework/react/guides/testing
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });

export const createQueryWrapper = (client = createTestQueryClient()) =>
  function QueryWrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
