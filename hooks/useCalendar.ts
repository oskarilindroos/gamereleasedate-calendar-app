import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner-native";
import { addGameToCalendar } from "../services/calendar/calendarService";
import { queryKeys } from "../services/query/queryClient";

const useCalendar = () => {
  const queryClient = useQueryClient();

  const { mutate: addEvent } = useMutation({
    mutationFn: addGameToCalendar,
    onSuccess: (result) => {
      if (result === "added") {
        toast.success("Event added to calendar");
        queryClient.invalidateQueries({ queryKey: queryKeys.calendarEntries });
      } else if (result === "already-exists") {
        toast("Event already exists");
      } else {
        toast.error("Calendar permission is required to add events");
      }
    },
    onError: (error) => {
      console.warn("Adding calendar event failed", error);
      toast.error("Error adding event");
    },
  });

  return { addEvent };
};

export default useCalendar;
