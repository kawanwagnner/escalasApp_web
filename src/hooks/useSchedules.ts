import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { scheduleService } from "../services/schedule.service";
import type { Schedule } from "../types";

export const SCHEDULES_KEY = ["schedules"];

export function useSchedules() {
  return useQuery({
    queryKey: SCHEDULES_KEY,
    queryFn: () => scheduleService.getAllSchedules(),
  });
}

export function useSchedule(id: string) {
  return useQuery({
    queryKey: [...SCHEDULES_KEY, id],
    queryFn: () => scheduleService.getScheduleById(id),
    enabled: !!id,
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Schedule, "id" | "created_at" | "updated_at">) =>
      scheduleService.createSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHEDULES_KEY });
    },
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Schedule> }) =>
      scheduleService.updateSchedule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHEDULES_KEY });
    },
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => scheduleService.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHEDULES_KEY });
    },
  });
}
