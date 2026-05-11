import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader } from './Loader';

interface AdminRouteProps {
  children: ReactNode;
  allowSecurity?: boolean;
}

export function AdminRoute({ children, allowSecurity = false }: AdminRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader label="Loading…" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const allowed = user.role === 'admin' || (allowSecurity && user.role === 'security');
  if (!allowed) {
    return (
      <div className="container">
        <div className="error-banner">
          Access denied. {allowSecurity ? 'Admin or security' : 'Admin'} privileges required.
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
