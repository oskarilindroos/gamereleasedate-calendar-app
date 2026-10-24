import { useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";

// Refetches when the screen comes back into focus (but not on the first focus,
// when the query is fetched anyway).
// https://tanstack.com/query/latest/docs/framework/react/react-native#refresh-on-screen-focus
export const useRefreshOnFocus = (refetch: () => unknown) => {
  const firstTimeRef = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (firstTimeRef.current) {
        firstTimeRef.current = false;
        return;
      }
      refetch();
    }, [refetch])
  );
};
