import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createOrUpdateMaterial, getMaterial } from '../firebase/firestore';
import { storage } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '../contexts/ToastContext';
import { Upload, ArrowLeft, Package } from 'lucide-react';

export default function AdminMaterialForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    quantity: 0,
    available: 0,
    location: '',
    imageUrl: '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMaterial, setLoadingMaterial] = useState(!!id);

  useEffect(() => {
    if (!id) return;
    const fetchMaterial = async () => {
      try {
        setLoadingMaterial(true);
        const data = await getMaterial(id);
        if (data) {
          setForm({
            name: data.name || '',
            category: data.category || '',
            description: data.description || '',
            quantity: data.quantity || 0,
            available: data.available || 0,
            location: data.location || '',
            imageUrl: data.imageUrl || '',
          });
        } else {
          addToast({ title: 'Material no encontrado', type: 'error' });
          navigate('/admin');
        }
      } catch (error) {
        addToast({ title: 'Error al cargar material', description: error.message, type: 'error' });
      } finally {
        setLoadingMaterial(false);
      }
    };
    fetchMaterial();
  }, [id, addToast, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category) {
      addToast({ title: 'Faltan datos', description: 'Nombre y categoría son obligatorios', type: 'error' });
      return;
    }

    const quantityNum = Number(form.quantity);
    const availableNum = Number(form.available);
    if (!Number.isInteger(quantityNum) || !Number.isInteger(availableNum)) {
      addToast({ title: 'Datos inválidos', description: 'Total y Disponible deben ser enteros', type: 'error' });
      return;
    }
    if (availableNum > quantityNum) {
      addToast({ title: 'Disponibilidad inválida', description: 'Disponible no puede ser mayor que Total', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      let imageUrl = form.imageUrl || '';

      if (file) {
        const storageRef = ref(storage, `materials/${id || Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        imageUrl = await getDownloadURL(storageRef);
      }

      await createOrUpdateMaterial(id, {
        name: form.name,
        category: form.category,
        description: form.description,
        quantity: quantityNum,
        available: availableNum,
        location: form.location,
        imageUrl,
      });

      addToast({ title: id ? 'Material actualizado' : 'Material creado', type: 'success' });
      navigate('/admin');
    } catch (error) {
      addToast({ title: 'Error al guardar material', description: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>

      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="mb-5">
          <p className="text-xs text-gray-500">Material</p>
          <h1 className="text-xl font-bold text-gray-900">{id ? 'Editar material' : 'Nuevo material'}</h1>
          <p className="text-sm text-gray-600 mt-1">Completa los campos requeridos.</p>
        </div>

        {loadingMaterial ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-3 text-gray-600">Cargando material...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <input
                  type="text"
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                rows="3"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
                <input
                  type="number"
                  step="1"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min="0"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  onInvalid={(e) => e.target.setCustomValidity('Deben ser valores enteros')}
                  onInput={(e) => e.target.setCustomValidity('')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Disponible</label>
                <input
                  type="number"
                  step="1"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min="0"
                  value={form.available}
                  onChange={(e) => setForm({ ...form, available: e.target.value })}
                  onInvalid={(e) => e.target.setCustomValidity('Deben ser valores enteros')}
                  onInput={(e) => e.target.setCustomValidity('')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
              <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                <Upload className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-600">{file ? file.name : 'Selecciona una imagen'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0] || null)}
                />
              </label>
              {form.imageUrl && !file && (
                <p className="text-xs text-gray-500 mt-1">Se conservará la imagen actual</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm"
              >
                {loading ? 'Guardando...' : id ? 'Guardar cambios' : 'Crear material'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
