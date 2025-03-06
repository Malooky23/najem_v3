import { useQuery } from "@tanstack/react-query";
import { EnrichedStockMovementView } from "@/types/stockMovement";
import { getMovementById } from "@/server/actions/getMovementById";

export function useGetMovementById(movementId: string | null) {
  return useQuery({
    queryKey: ['movement', movementId],
    queryFn: async () => {
      if (!movementId) return null;
      
      const result = await getMovementById(movementId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch movement');
      }
      return result.data;
    },
    enabled: !!movementId,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
