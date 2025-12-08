import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Calendar, AlertCircle, X } from 'lucide-react';
import { createRequest } from '../../firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { format, addDays, isBefore } from 'date-fns';

export default function RequestForm({ material, onClose, onSuccess }) {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const today = format(new Date(), 'yyyy-MM-dd');
  const maxDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      setError('Por favor selecciona las fechas de préstamo');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isBefore(end, start)) {
      setError('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    if (isBefore(start, new Date())) {
      setError('No puedes solicitar préstamos para fechas pasadas');
      return;
    }

    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (daysDiff > 14) {
      setError('El préstamo máximo es de 14 días');
      return;
    }

    if (material.available <= 0) {
      setError('Este material no está disponible actualmente');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const requestData = {
        userId: currentUser.uid,
        materialId: material.id,
        materialName: material.name,
        startDate: start,
        endDate: end,
        purpose: purpose.trim() || 'Uso académico',
        status: 'pending',
        requestedAt: new Date()
      };

      await createRequest(requestData);
      addToast({ title: 'Solicitud enviada', description: 'Revisa el estado en Mis solicitudes', type: 'success' });

      if (onSuccess) onSuccess();
      if (onClose) onClose();
      navigate('/requests');
    } catch (err) {
      setError(err.message || 'Error al crear la solicitud');
      addToast({ title: 'Error al crear la solicitud', description: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!material) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 z-[9998] bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-[9999] bg-white rounded-2xl shadow-2xl w-full max-w-md border border-indigo-50 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-teal-50 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs uppercase text-indigo-600 font-semibold">Solicitud</p>
              <h2 className="text-2xl font-bold text-gray-900">Solicitar préstamo</h2>
              <p className="text-gray-600 mt-1">{material.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h3 className="font-medium text-gray-700 mb-2">Material</h3>
            <div className="flex items-center space-x-3">
              {material.imageUrl && (
                <img
                  src={material.imageUrl}
                  alt={material.name}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div>
                <p className="font-semibold text-gray-800">{material.name}</p>
                <p className="text-sm text-gray-500">{material.category}</p>
                <p className="text-sm">
                  Disponible: <span className="font-medium">{material.available} unidades</span>
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Fecha de inicio</span>
              </div>
            </label>
            <input
              type="date"
              required
              min={today}
              max={maxDate}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Fecha de devolución</span>
              </div>
            </label>
            <input
              type="date"
              required
              min={startDate || today}
              max={maxDate}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Propósito del préstamo
            </label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Ej: Para proyecto de circuitos electrónicos..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-28 resize-none transition-colors"
              maxLength={500}
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || material.available <= 0}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold shadow"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Enviando...
                </span>
              ) : (
                'Enviar Solicitud'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
