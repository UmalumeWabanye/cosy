import { useQuery } from '@tanstack/react-query';
import { getProperties } from '../services/propertyService';

export function useProperties(filters = {}) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => getProperties(filters),
  });
}
