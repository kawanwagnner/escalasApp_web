import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileService } from "../services/profile.service";
import type { Profile } from "../types";

export const PROFILES_KEY = ["profiles"];

export function useProfiles() {
  return useQuery({
    queryKey: PROFILES_KEY,
    queryFn: () => profileService.getAllProfiles(),
  });
}

export function useProfile(id: string) {
  return useQuery({
    queryKey: [...PROFILES_KEY, id],
    queryFn: () => profileService.getProfileById(id),
    enabled: !!id,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Profile> }) =>
      profileService.updateProfile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILES_KEY });
    },
  });
}
