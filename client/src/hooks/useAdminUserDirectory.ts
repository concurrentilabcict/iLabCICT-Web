import { useQuery } from "@tanstack/react-query";
import { fetchDashboardUsers } from "@/components/Admin/Dashboard/dashboardData";
import type { User } from "@/types/manageUser";

export const ADMIN_USER_DIRECTORY_QUERY_KEY = ["admin-dashboard-users"] as const;

export const useAdminUserDirectory = () => {
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ADMIN_USER_DIRECTORY_QUERY_KEY,
    queryFn: fetchDashboardUsers,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  return (userId: number | null | undefined) =>
    users.find((user) => user.id === userId)?.profileImage || null;
};
