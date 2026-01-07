import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { slotService } from "../services/slot.service";
import type { Slot } from "../types";

export const SLOTS_KEY = ["slots"];

export function useSlotsBySchedule(scheduleId: string) {
  return useQuery({
    queryKey: [...SLOTS_KEY, "schedule", scheduleId],
    queryFn: () => slotService.getSlotsBySchedule(scheduleId),
    enabled: !!scheduleId,
  });
}

export function useCreateSlot() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Slot, "id" | "created_at" | "updated_at">) =>
      slotService.createSlot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SLOTS_KEY });
    },
  });
}

export function useUpdateSlot() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Slot> }) =>
      slotService.updateSlot(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SLOTS_KEY });
    },
  });
}

export function useDeleteSlot() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => slotService.deleteSlot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SLOTS_KEY });
    },
  });
}
