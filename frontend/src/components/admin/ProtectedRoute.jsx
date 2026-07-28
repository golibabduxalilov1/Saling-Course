import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();

  if (loading) return <div className="p-8 text-gray-400">Yuklanmoqda...</div>;
  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
}
