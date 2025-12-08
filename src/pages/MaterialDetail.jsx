import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMaterial } from '../firebase/firestore';
import RequestForm from '../components/student/RequestForm';
import { Package, ArrowLeft } from 'lucide-react';

export default function MaterialDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        setLoading(true);
        const data = await getMaterial(id);
        if (!data) {
          setError('Material no encontrado');
        } else {
          setMaterial(data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterial();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando material...</p>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <p>{error || 'Material no encontrado'}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 grid md:grid-cols-2 gap-6">
        <div className="rounded-xl overflow-hidden bg-gray-100 h-64 flex items-center justify-center">
          {material.imageUrl ? (
            <img src={material.imageUrl} alt={material.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center text-gray-400">
              <Package className="h-12 w-12 mb-2" />
              <span className="text-sm">Sin imagen</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase text-indigo-600 font-semibold">Material</p>
            <h1 className="text-3xl font-bold text-gray-900">{material.name}</h1>
          </div>
          <p className="text-gray-600">{material.description}</p>

          <div className="flex flex-wrap gap-3 text-sm">
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {material.category}
            </span>
            <span className={`px-3 py-1 rounded-full border ${
              material.available > 0
                ? 'bg-green-50 text-green-700 border-green-100'
                : 'bg-red-50 text-red-700 border-red-100'
            }`}>
              {material.available > 0 ? `${material.available} disponibles` : 'Sin stock'}
            </span>
            {material.available < 3 && material.available > 0 && (
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                Stock bajo
              </span>
            )}
          </div>

          <div className="text-sm text-gray-700">
            <p><span className="font-semibold">Ubicación:</span> {material.location || 'Laboratorio'}</p>
            {material.createdAt && <p><span className="font-semibold">Creado:</span> {material.createdAt.toLocaleString?.() || ''}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowForm(true)}
              disabled={material.available <= 0}
              className={`px-5 py-3 rounded-lg font-semibold text-white transition-colors ${
                material.available <= 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              Solicitar préstamo
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <RequestForm
          material={material}
          onClose={() => setShowForm(false)}
          onSuccess={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
