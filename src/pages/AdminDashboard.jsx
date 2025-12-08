import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getPendingRequests, getMaterials, updateRequestStatus, deleteMaterial, getRequestsByStatus } from '../firebase/firestore';
import { Package, Clock, CheckCircle, XCircle, Truck, CheckSquare, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const { userData } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeRequests, setActiveRequests] = useState([]); // aprobadas o entregadas
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [searchMaterial, setSearchMaterial] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const refreshData = async () => {
    try {
      const [requestsData, materialsData, approvedData, deliveredData] = await Promise.all([
        getPendingRequests(),
        getMaterials(),
        getRequestsByStatus('approved'),
        getRequestsByStatus('entregado')
      ]);
      setPendingRequests(requestsData);
      setMaterials(materialsData);
      const mergedActive = [...approvedData, ...deliveredData].sort((a, b) => {
        const aDate = a.createdAt?.getTime?.() || 0;
        const bDate = b.createdAt?.getTime?.() || 0;
        return bDate - aDate;
      });
      setActiveRequests(mergedActive);
    } catch (error) {
      addToast({ title: 'Error al recargar datos', description: error.message, type: 'error' });
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await refreshData();
      setLoading(false);
    };
    load();
  }, []);

  const handleApprove = async (requestId) => {
    try {
      await updateRequestStatus(requestId, 'approved');
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      refreshData();
      addToast({ title: 'Solicitud aprobada', type: 'success' });
    } catch (error) {
      addToast({ title: 'Error al aprobar', description: error.message, type: 'error' });
    }
  };

  const handleReject = async (requestId) => {
    if (!rejectionReason.trim()) {
      addToast({ title: 'Falta motivo', description: 'Ingresa un motivo de rechazo', type: 'error' });
      return;
    }

    try {
      await updateRequestStatus(requestId, 'rechazado', rejectionReason);
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      setSelectedRequest(null);
      setRejectionReason('');
      refreshData();
      addToast({ title: 'Solicitud rechazada', type: 'info' });
    } catch (error) {
      addToast({ title: 'Error al rechazar', description: error.message, type: 'error' });
    }
  };

  const handleMarkDelivered = async (requestId) => {
    try {
      await updateRequestStatus(requestId, 'entregado');
      refreshData();
      addToast({ title: 'Marcado como entregado', type: 'success' });
    } catch (error) {
      addToast({ title: 'Error al marcar entregado', description: error.message, type: 'error' });
    }
  };

  const handleMarkReturned = async (requestId) => {
    try {
      await updateRequestStatus(requestId, 'devuelto');
      refreshData();
      addToast({ title: 'Marcado como devuelto', type: 'success' });
    } catch (error) {
      addToast({ title: 'Error al marcar devuelto', description: error.message, type: 'error' });
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    const confirmDelete = window.confirm('¿Eliminar este material? Esta acción no se puede deshacer.');
    if (!confirmDelete) return;
    try {
      await deleteMaterial(materialId);
      addToast({ title: 'Material eliminado', type: 'success' });
      refreshData();
    } catch (error) {
      addToast({ title: 'Error al eliminar material', description: error.message, type: 'error' });
    }
  };

  const goToMaterialForm = (materialId = null) => {
    if (materialId) navigate(`/admin/material/${materialId}`);
    else navigate('/admin/material/new');
  };

  const filteredMaterials = materials.filter(material => {
    const matchesCategory = filterCategory === 'all' || material.category === filterCategory;
    const matchesSearch = material.name.toLowerCase().includes(searchMaterial.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchMaterial.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toDateValue = (value) => {
    if (!value) return null;
    if (typeof value.toDate === 'function') return value.toDate();
    if (value instanceof Date) return value;
    return null;
  };

  const categories = ['all', ...new Set(materials.map(m => m.category))];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando panel de administración...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Panel de Administración</h1>
          <p className="text-gray-600">
            Bienvenido, <span className="font-medium text-blue-600">{userData?.name || 'Administrador'}</span>
          </p>
        </div>
        <div className="text-sm text-gray-500 mt-3 sm:mt-0">
          Gestiona solicitudes pendientes y revisa inventario.
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Solicitudes pendientes</h2>
          <span className="text-xs text-gray-500">{pendingRequests.length} en espera</span>
        </div>
        
        {pendingRequests.length === 0 ? (
          <div className="text-center py-6 text-sm text-gray-500">
            No hay solicitudes pendientes
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">Solicitante</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">Material</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">Fechas</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">Propósito</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pendingRequests.map(request => (
                  <tr key={request.id} className="odd:bg-white even:bg-gray-50">
                    <td className="px-3 py-2">
                      <div className="text-gray-900">
                        {request.userEmail || `Usuario: ${request.userId?.substring(0, 8)}...`}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {toDateValue(request.createdAt)
                          ? format(toDateValue(request.createdAt), 'dd/MM/yyyy HH:mm')
                          : 'Fecha desconocida'}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-gray-900">
                      {request.materialName || 'Material no especificado'}
                    </td>
                    <td className="px-3 py-2 text-gray-900">
                      {toDateValue(request.startDate)
                        ? format(toDateValue(request.startDate), 'dd/MM/yy')
                        : 'N/A'}
                      {' - '}
                      {toDateValue(request.endDate)
                        ? format(toDateValue(request.endDate), 'dd/MM/yy')
                        : 'N/A'}
                    </td>
                    <td className="px-3 py-2 text-gray-900 max-w-xs truncate">
                      {request.purpose || 'No especificado'}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => handleApprove(request.id)}
                          className="px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Aprobar
                        </button>
                        <button 
                          onClick={() => setSelectedRequest(request)}
                          className="px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Rechazar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Solicitudes aprobadas / en entrega */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Solicitudes en curso</h2>
          <span className="text-xs text-gray-500">{activeRequests.length} en seguimiento</span>
        </div>

        {activeRequests.length === 0 ? (
          <div className="text-center py-6 text-sm text-gray-500">
            No hay solicitudes aprobadas o entregadas
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">Solicitante</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">Material</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">Fechas</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">Estado</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {activeRequests.map(request => (
                  <tr key={request.id} className="odd:bg-white even:bg-gray-50">
                    <td className="px-3 py-2">
                      <div className="text-gray-900">
                        {request.userEmail || `Usuario: ${request.userId?.substring(0, 8)}...`}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {toDateValue(request.createdAt)
                          ? format(toDateValue(request.createdAt), 'dd/MM/yyyy HH:mm')
                          : 'Fecha desconocida'}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-gray-900">
                      {request.materialName || 'Material no especificado'}
                    </td>
                    <td className="px-3 py-2 text-gray-900">
                      {toDateValue(request.startDate)
                        ? format(toDateValue(request.startDate), 'dd/MM/yy')
                        : 'N/A'}
                      {' - '}
                      {toDateValue(request.endDate)
                        ? format(toDateValue(request.endDate), 'dd/MM/yy')
                        : 'N/A'}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        request.status === 'approved'
                          ? 'bg-blue-50 text-blue-700 border-blue-100'
                          : request.status === 'entregado'
                          ? 'bg-purple-50 text-purple-700 border-purple-100'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {request.status === 'approved' ? 'Aprobado' : request.status === 'entregado' ? 'Entregado' : request.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        {request.status === 'approved' && (
                          <button 
                            onClick={() => handleMarkDelivered(request.id)}
                            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            Entregado
                          </button>
                        )}
                        {request.status === 'entregado' && (
                          <button 
                            onClick={() => handleMarkReturned(request.id)}
                            className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                          >
                            Devuelto
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Rechazar Solicitud</h3>
            <p className="text-gray-600 mb-2">
              Material: <span className="font-medium">{selectedRequest.materialName}</span>
            </p>
            <p className="text-gray-600 mb-4">
              Solicitante: <span className="font-medium">{selectedRequest.userEmail || selectedRequest.userId}</span>
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo del rechazo
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Ej: Material no disponible, período muy largo, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows="3"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleReject(selectedRequest.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 md:mb-0">Inventario de Materiales</h2>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar material..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchMaterial}
                onChange={(e) => setSearchMaterial(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'Todas las categorías' : cat}
                  </option>
                ))}
              </select>
            </div>
            
            <button 
              onClick={() => goToMaterialForm()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 whitespace-nowrap inline-flex items-center gap-2"
            >
              <Package className="h-4 w-4" />
              Agregar Material
            </button>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-gray-500">
          Para marcar entregado o devuelto, usa la tabla de solicitudes.
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Material
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Disponible
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMaterials.map(material => (
                <tr key={material.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-gray-100 rounded mr-3 flex items-center justify-center overflow-hidden">
                        {material.imageUrl ? (
                          <img 
                            src={material.imageUrl} 
                            alt={material.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{material.name}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {material.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                      {material.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-800 font-medium">{material.quantity}</td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${material.available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {material.available}
                    </span>
                    {material.available < 3 && material.available > 0 && (
                      <div className="text-xs text-yellow-600">Stock bajo</div>
                    )}
                    {material.available <= 0 && (
                      <div className="text-xs text-red-600">Sin stock</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{material.location}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => goToMaterialForm(material.id)}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 inline-flex items-center gap-1"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteMaterial(material.id)}
                        className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 inline-flex items-center gap-1"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 text-sm text-gray-500">
          Mostrando {filteredMaterials.length} de {materials.length} materiales
        </div>
      </div>
    </div>
  );
}
