import { useQuery } from '@tanstack/react-query';
import { getClasses } from '../api/school-settings';
import { useAuthStore } from '../stores/auth-store';

const schoolId = useAuthStore.getState().currentSchoolId;


export function useClasses() {
    return useQuery({
        queryKey: ['classes', schoolId ?? ''],
        queryFn: async () => {
           const res = await  getClasses(schoolId!)
           return res.data ?? [];
        },
        enabled: !!schoolId,
    });
}