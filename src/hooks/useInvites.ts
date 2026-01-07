import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inviteService } from "../services/invite.service";

export const INVITES_KEY = ["invites"];

export function useMyInvites(email: string) {
  return useQuery({
    queryKey: [...INVITES_KEY, "my", email],
    queryFn: () => inviteService.getMyInvites(email),
    enabled: !!email,
  });
}

export function useInvitesBySlot(slotId: string) {
  return useQuery({
    queryKey: [...INVITES_KEY, "slot", slotId],
    queryFn: () => inviteService.getInvitesBySlot(slotId),
    enabled: !!slotId,
  });
}

export function useCreateInvite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { slot_id: string; email: string }) =>
      inviteService.createInvite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVITES_KEY });
    },
  });
}

export function useAcceptInvite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      inviteService.acceptInvite(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVITES_KEY });
    },
  });
}

export function useDeclineInvite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => inviteService.declineInvite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVITES_KEY });
    },
  });
}

export function useDeleteInvite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => inviteService.deleteInvite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVITES_KEY });
    },
  });
}
