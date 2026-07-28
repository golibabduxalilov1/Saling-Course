import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 bg-canvas" role="status">
        <Loader2 size={20} className="motion-spin text-ink-3" aria-hidden="true" />
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-3">Yuklanmoqda</p>
      </div>
    );
  }
  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
}
