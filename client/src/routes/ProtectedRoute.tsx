import { Navigate } from "react-router-dom";
import { type ReactNode } from "react";
import { useAuth } from "../auth/useAuth";

type ProtectedRouteProps = {
    children: ReactNode;
    allowedRole: string;
}

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
    const { isAuthenticated, role } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRole !== role) {
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
            return <Navigate to="/admin" replace />;
        }
    }

    return children;
}