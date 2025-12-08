import { Home, Package, User, LogOut, Settings } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function Navbar() {
  const { currentUser, userData, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const linkClass = (path) =>
    `inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
      location.pathname === path
        ? 'bg-indigo-600 text-white shadow'
        : 'text-gray-600 hover:text-indigo-700 hover:bg-gray-100'
    }`;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-600 text-white grid place-items-center shadow-sm">
              <Package className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-lg font-bold text-gray-900">LabTrack</p>
              <p className="text-xs text-gray-500">Préstamos de laboratorio</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {currentUser ? (
              <>
                <Link to="/home" className={linkClass('/home')}>
                  <Home className="h-4 w-4" />
                  <span>Inicio</span>
                </Link>
                <Link to="/catalog" className={linkClass('/catalog')}>
                  <Package className="h-4 w-4" />
                  <span>Catálogo</span>
                </Link>
                <Link to="/requests" className={linkClass('/requests')}>
                  Mis solicitudes
                </Link>
                {userData?.role === 'admin' && (
                  <Link to="/admin" className={linkClass('/admin')}>
                    <Settings className="h-4 w-4" />
                    Admin
                  </Link>
                )}

                <div className="flex items-center gap-3 pl-3 ml-2 border-l border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-indigo-50 text-indigo-700 rounded-full flex items-center justify-center font-semibold border border-indigo-100">
                      {userData?.name?.[0]?.toUpperCase() || currentUser.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-800 font-medium leading-none">
                        {userData?.name || currentUser.email}
                      </p>
                      <p className="text-xs text-gray-500">{userData?.role || 'Usuario'}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-red-600 inline-flex items-center gap-1 text-sm font-medium transition"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Salir</span>
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}
