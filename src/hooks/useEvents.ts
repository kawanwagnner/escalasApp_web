import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publicEventService } from '../services/publicEvent.service';
import type { PublicEvent } from '../types';

export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  detail: (id: string) => [...eventKeys.all, 'detail', id] as const,
};

export function useEvents() {
  return useQuery({
    queryKey: eventKeys.lists(),
    queryFn: () => publicEventService.getAllPublicEvents(),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<PublicEvent, 'id' | 'created_at' | 'updated_at'>) =>
      publicEventService.createPublicEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PublicEvent> }) =>
      publicEventService.updatePublicEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => publicEventService.deletePublicEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}
