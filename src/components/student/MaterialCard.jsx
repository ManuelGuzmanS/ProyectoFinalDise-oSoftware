import { useState } from 'react';
import { Package } from 'lucide-react';

export default function MaterialCard({ material, onRequestClick }) {
  const [imageError, setImageError] = useState(false);
  const isOutOfStock = material.available <= 0;

  return (
    <div className="bg-white rounded-lg shadow-none overflow-hidden hover:shadow-sm transition border border-gray-200 flex flex-col h-full">
      {/* Imagen */}
      <div className="bg-gray-100 flex items-center justify-center relative overflow-hidden h-24 md:h-28">
        {!imageError && material.imageUrl ? (
          <img
            src={material.imageUrl}
            alt={material.name}
            className="w-full h-full object-contain p-2"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex flex-col items-center text-gray-400">
            <Package className="h-10 w-10 mb-2" />
            <span className="text-sm">Sin imagen</span>
          </div>
        )}

      </div>

      {/* Contenido */}
      <div className="p-5 flex-grow space-y-3">
        <h3 className="font-bold text-gray-900 text-lg">{material.name}</h3>

        <p className="text-gray-600 text-sm line-clamp-2">{material.description}</p>

        <div className="text-sm text-gray-600 flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-blue-500" />
          <span className="font-medium">Ubicación:</span> {material.location || 'Laboratorio'}
        </div>
        <div className="text-xs text-gray-500 space-y-0.5">
          <p>{material.category}</p>
          <p>{isOutOfStock ? 'Sin stock' : `${material.available} disponibles`}</p>
        </div>
      </div>

      {/* Botón */}
      <div className="p-4 border-t border-gray-200 flex justify-end">
        <button
          onClick={() => {
            if (onRequestClick) onRequestClick(material);
          }}
          disabled={isOutOfStock}
          className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors ${
            isOutOfStock ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isOutOfStock ? 'Sin stock' : 'Solicitar préstamo'}
        </button>
      </div>
    </div>
  );
}
