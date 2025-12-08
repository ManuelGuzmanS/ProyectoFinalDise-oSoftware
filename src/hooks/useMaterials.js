import { useState, useEffect } from 'react';
import { getMaterials } from '../firebase/firestore';

export function useMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        const data = await getMaterials();
        setMaterials(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching materials:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  return { materials, loading, error };
}