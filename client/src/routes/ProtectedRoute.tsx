import { Navigate } from "react-router-dom";
import { type ReactNode } from "react";
import { useAuth } from "../auth/useAuth";

export type AppRole = "admin" | "technician" | "faculty";

type ProtectedRouteProps = {
    children: ReactNode;
    allowedRoles: readonly AppRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, role } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.some((allowedRole) => allowedRole === role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}

export function PublicRoute({ children }: { children: ReactNode }) {
    const { isAuthenticated, role } = useAuth();

    if (isAuthenticated) {
        if(role === "technician") {
            return <Navigate to="/manage-ticket" replace />;
        }

        if(role === "admin") {
            return <Navigate to="/manage-ticket" replace />;
        }

        if(role === "faculty") {
            return <Navigate to="/manage-ticket" replace />;
        }
    }

    return children;
}
