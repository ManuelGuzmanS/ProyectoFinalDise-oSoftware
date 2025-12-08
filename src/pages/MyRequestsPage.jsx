import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getUserRequests } from '../firebase/firestore';
import { Clock, CheckCircle, XCircle, Package, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function MyRequestsPage() {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const data = await getUserRequests(currentUser.uid);
        setRequests(data);
      } catch (err) {
        setError(err.message);
        addToast({ title: 'Error al cargar solicitudes', description: err.message, type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [currentUser, addToast]);

  // Ícono según estado
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rechazado': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'entregado': return <Package className="h-5 w-5 text-blue-500" />;
      case 'devuelto': return <CheckCircle className="h-5 w-5 text-purple-500" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  // Color según estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rechazado': return 'bg-red-100 text-red-800';
      case 'entregado': return 'bg-blue-100 text-blue-800';
      case 'devuelto': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Traducir estado
  const translateStatus = (status) => {
    const translations = {
      pending: 'Pendiente',
      approved: 'Aprobado',
      rechazada: 'Rechazada',
      rechazado: 'Rechazado',
      entregado: 'Entregado',
      devuelto: 'Devuelto'
    };
    return translations[status] || status;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando tus solicitudes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <p>Error al cargar solicitudes: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Mis Solicitudes</h1>
        <p className="text-gray-600">Historial y estado de tus préstamos</p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No tienes solicitudes
          </h3>
          <p className="text-gray-500 mb-6">
            Aún no has solicitado ningún material.
          </p>
          <a 
            href="/catalog" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Explorar Catálogo
          </a>
        </div>
      ) : (
        <>
          {/* Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Total solicitudes</p>
              <p className="text-2xl font-bold text-gray-800">{requests.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">
                {requests.filter(r => r.status === 'pending').length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Aprobadas</p>
              <p className="text-2xl font-bold text-green-600">
                {requests.filter(r => r.status === 'approved').length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Activas</p>
              <p className="text-2xl font-bold text-blue-600">
                {requests.filter(r => r.status === 'entregado').length}
              </p>
            </div>
          </div>

          {/* Lista de solicitudes */}
          <div className="space-y-4">
            {requests.map(request => (
              <div key={request.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg mb-1">
                      {request.materialName || `Material ${request.materialId}`}
                    </h3>
                  </div>
                  
                  <div className="mt-3 md:mt-0 flex items-center space-x-3">
                    <div className="flex items-center">
                      {getStatusIcon(request.status)}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                      {translateStatus(request.status)}
                    </span>
                  </div>
                </div>
                
                {request.purpose && (
                  <p className="text-gray-600 mb-4">{request.purpose}</p>
                )}
                
                {request.adminNotes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-1">Notas del administrador:</p>
                    <p className="text-sm text-gray-600">{request.adminNotes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
