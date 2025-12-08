import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMaterials } from '../hooks/useMaterials';
import { Package, Search, Filter } from 'lucide-react';
import MaterialCard from '../components/student/MaterialCard';

export default function CatalogPage() {
  const { materials, loading, error } = useMaterials();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filteredMaterials = materials.filter(material => {
    const matchesCategory = filter === 'all' || material.category === filter;
    const matchesSearch = material.name.toLowerCase().includes(search.toLowerCase()) ||
                         material.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['all', ...new Set(materials.map(m => m.category))];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando catálogo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <p>Error al cargar materiales: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="grid md:grid-cols-[2fr_1fr] gap-3 items-center mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar material..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'Todas las categorías' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredMaterials.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No se encontraron materiales
          </h3>
          <p className="text-gray-500">
            {materials.length === 0 
              ? 'No hay materiales en el catálogo aún.' 
              : 'No hay materiales que coincidan con tu búsqueda.'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMaterials.map(material => (
            <MaterialCard
              key={material.id}
              material={material}
              onRequestClick={(material) => navigate(`/material/${material.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
