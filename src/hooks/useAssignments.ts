import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { assignmentService } from "../services/assignment.service";

export const ASSIGNMENTS_KEY = ["assignments"];

export function useMyAssignments(userId: string) {
  return useQuery({
    queryKey: [...ASSIGNMENTS_KEY, "my", userId],
    queryFn: () => assignmentService.getMyAssignments(userId),
    enabled: !!userId,
  });
}

export function useAssignToSlot() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { slot_id: string; user_id: string; assigned_by: string }) =>
      assignmentService.assignToSlot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSIGNMENTS_KEY });
    },
  });
}

export function useUnassignFromSlot() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => assignmentService.unassignFromSlot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSIGNMENTS_KEY });
    },
  });
}
