import { 
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { db } from "./config";

// Referencias a colecciones
export const usersCollection = collection(db, "users");
export const materialsCollection = collection(db, "materials");
export const requestsCollection = collection(db, "requests");

// Maneja creación y actualización de usuarios
export const createOrUpdateUserDocument = async (userId, userData) => {
  const userDoc = doc(db, "users", userId);
  const userSnapshot = await getDoc(userDoc);
  
  const userDataWithTimestamps = {
    ...userData,
    updatedAt: serverTimestamp()
  };
  
  if (!userSnapshot.exists()) {
    // Crear documento nuevo
    userDataWithTimestamps.createdAt = serverTimestamp();
    await setDoc(userDoc, userDataWithTimestamps);
  } else {
    // Actualizar documento existente
    await updateDoc(userDoc, userDataWithTimestamps);
  }
  
  return await getDoc(userDoc);
};

// Función alias para mantener compatibilidad
export const createUserDocument = createOrUpdateUserDocument;

// Obtener documento de usuario
export const getUserDocument = async (userId) => {
  const userDoc = doc(db, "users", userId);
  const snapshot = await getDoc(userDoc);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

// createRequest con manejo de errores y disponibilidad
export const createRequest = async (requestData) => {
  try {
    console.log(' Creando solicitud con datos:', requestData);
    
    if (!requestData.userId || !requestData.materialId) {
      throw new Error('Faltan datos requeridos: userId o materialId');
    }

    // Convertir fechas a Timestamp de Firestore
    const startDate = requestData.startDate instanceof Date 
      ? Timestamp.fromDate(requestData.startDate)
      : Timestamp.fromDate(new Date(requestData.startDate));
    
    const endDate = requestData.endDate instanceof Date
      ? Timestamp.fromDate(requestData.endDate)
      : Timestamp.fromDate(new Date(requestData.endDate));

    // Verificar disponibilidad del material
    const materialDoc = doc(db, "materials", requestData.materialId);
    const materialSnapshot = await getDoc(materialDoc);
    
    if (!materialSnapshot.exists()) {
      throw new Error('Material no encontrado');
    }
    
    const materialData = materialSnapshot.data();
    
    if (materialData.available <= 0) {
      throw new Error('Material no disponible');
    }

    // Crear la solicitud
    const requestToSave = {
      userId: requestData.userId,
      materialId: requestData.materialId,
      materialName: requestData.materialName || materialData.name,
      materialImage: materialData.imageUrl || null,
      studentName: requestData.studentName || '',
      studentEmail: requestData.studentEmail || '',
      startDate: startDate,
      endDate: endDate,
      purpose: requestData.purpose || 'Uso académico',
      status: "pending",
      quantity: requestData.quantity || 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const requestRef = await addDoc(requestsCollection, requestToSave);
    console.log('✅ Solicitud creada con ID:', requestRef.id);

    return { id: requestRef.id, ...requestToSave };
    
  } catch (error) {
    console.error(' Error en createRequest:', error.message);
    throw error;
  }
};

// Obtener todos los materiales
export const getMaterials = async () => {
  const snapshot = await getDocs(materialsCollection);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    // Convertir Timestamps a fechas legibles
    createdAt: doc.data().createdAt?.toDate?.() || null,
    updatedAt: doc.data().updatedAt?.toDate?.() || null
  }));
};

// Obtener un material específico
export const getMaterial = async (materialId) => {
  const materialDoc = doc(db, "materials", materialId);
  const snapshot = await getDoc(materialDoc);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  const data = snapshot.data();
  return { 
    id: snapshot.id, 
    ...data,
    createdAt: data.createdAt?.toDate?.() || null,
    updatedAt: data.updatedAt?.toDate?.() || null
  };
};

// getUserRequests con manejo de índices
export const getUserRequests = async (userId) => {
  try {
    const q = query(
      requestsCollection, 
      where("userId", "==", userId), 
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        // Convertir Timestamps a fechas JavaScript
        startDate: data.startDate?.toDate?.() || null,
        endDate: data.endDate?.toDate?.() || null,
        createdAt: data.createdAt?.toDate?.() || null,
        updatedAt: data.updatedAt?.toDate?.() || null
      };
    });
    
  } catch (error) {
    console.log("⚠️ Índice no disponible para getUserRequests, usando método alternativo...");
    
    // Método alternativo
    const snapshot = await getDocs(requestsCollection);
    const allRequests = snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        startDate: data.startDate?.toDate?.() || null,
        endDate: data.endDate?.toDate?.() || null,
        createdAt: data.createdAt?.toDate?.() || null,
        updatedAt: data.updatedAt?.toDate?.() || null
      };
    });
    
    // Filtrar por userId 
    const userRequests = allRequests.filter(req => req.userId === userId);
    return userRequests.sort((a, b) => {
      const dateA = a.createdAt || new Date(0);
      const dateB = b.createdAt || new Date(0);
      return dateB - dateA; 
    });
  }
};

// getPendingRequests
export const getPendingRequests = async () => {
  try {
    // Intenta la query optimizada
    const q = query(
      requestsCollection, 
      where("status", "==", "pending"), 
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        startDate: data.startDate?.toDate?.() || null,
        endDate: data.endDate?.toDate?.() || null,
        createdAt: data.createdAt?.toDate?.() || null,
        updatedAt: data.updatedAt?.toDate?.() || null
      };
    });
    
  } catch (error) {
    console.log("⚠️ Índice no disponible para getPendingRequests, usando método alternativo...");
    
    const snapshot = await getDocs(requestsCollection);
    const allRequests = snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        startDate: data.startDate?.toDate?.() || null,
        endDate: data.endDate?.toDate?.() || null,
        createdAt: data.createdAt?.toDate?.() || null,
        updatedAt: data.updatedAt?.toDate?.() || null
      };
    });
    
    // Filtrar por status y ordenar
    const pendingRequests = allRequests.filter(req => req.status === "pending");
    return pendingRequests.sort((a, b) => {
      const dateA = a.createdAt || new Date(0);
      const dateB = b.createdAt || new Date(0);
      return dateB - dateA;
    });
  }
};

// Actualizar estado de solicitud
export const updateRequestStatus = async (requestId, status, notes = "") => {
  const requestDoc = doc(db, "requests", requestId);
  const updateData = { 
    status, 
    updatedAt: serverTimestamp()
  };
  
  if (notes) {
    updateData.adminNotes = notes;
  }
  
    if (status === "devuelto" || status === "returned") {
    const requestSnapshot = await getDoc(requestDoc);
    if (requestSnapshot.exists()) {
      const requestData = requestSnapshot.data();
      const materialId = requestData.materialId;
      
      if (materialId) {
        const materialDoc = doc(db, "materials", materialId);
        const materialSnapshot = await getDoc(materialDoc);
        
        if (materialSnapshot.exists()) {
          const materialData = materialSnapshot.data();
          const newAvailable = Math.min(materialData.stock || materialData.quantity, materialData.available + 1);
          await updateDoc(materialDoc, {
            available: newAvailable,
            updatedAt: serverTimestamp()
          });
        }
      }
    }
  }
  
  await updateDoc(requestDoc, updateData);
  return await getDoc(requestDoc);
};

// Obtener todas las solicitudes (para admin)
export const getAllRequests = async () => {
  const snapshot = await getDocs(requestsCollection);
  const requests = snapshot.docs.map(doc => {
    const data = doc.data();
    return { 
      id: doc.id, 
      ...data,
      startDate: data.startDate?.toDate?.() || null,
      endDate: data.endDate?.toDate?.() || null,
      createdAt: data.createdAt?.toDate?.() || null,
      updatedAt: data.updatedAt?.toDate?.() || null
    };
  });
  
  return requests.sort((a, b) => {
    const dateA = a.createdAt || new Date(0);
    const dateB = b.createdAt || new Date(0);
    return dateB - dateA;
  });
};

// Obtener solicitudes por estado
export const getRequestsByStatus = async (status) => {
  try {
    const q = query(
      requestsCollection, 
      where("status", "==", status), 
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        startDate: data.startDate?.toDate?.() || null,
        endDate: data.endDate?.toDate?.() || null,
        createdAt: data.createdAt?.toDate?.() || null,
        updatedAt: data.updatedAt?.toDate?.() || null
      };
    });
    
  } catch (error) {
    // Fallback si no hay índice
    const snapshot = await getDocs(requestsCollection);
    const allRequests = snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        startDate: data.startDate?.toDate?.() || null,
        endDate: data.endDate?.toDate?.() || null,
        createdAt: data.createdAt?.toDate?.() || null,
        updatedAt: data.updatedAt?.toDate?.() || null
      };
    });
    
    return allRequests
      .filter(req => req.status === status)
      .sort((a, b) => {
        const dateA = a.createdAt || new Date(0);
        const dateB = b.createdAt || new Date(0);
        return dateB - dateA;
      });
  }
};

// Obtener solicitud por ID
export const getRequestById = async (requestId) => {
  const requestDoc = doc(db, "requests", requestId);
  const snapshot = await getDoc(requestDoc);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  const data = snapshot.data();
  return { 
    id: snapshot.id, 
    ...data,
    startDate: data.startDate?.toDate?.() || null,
    endDate: data.endDate?.toDate?.() || null,
    createdAt: data.createdAt?.toDate?.() || null,
    updatedAt: data.updatedAt?.toDate?.() || null
  };
};

// Eliminar solicitud (solo admin)
export const deleteRequest = async (requestId) => {
  const requestDoc = doc(db, "requests", requestId);
  await deleteDoc(requestDoc);
  return true;
};

//Crear o actualizar material
export const createOrUpdateMaterial = async (materialId, materialData) => {
  const quantityNum = Number(materialData.quantity);
  const availableNum = Number(materialData.available);
  if (!Number.isInteger(quantityNum) || !Number.isInteger(availableNum)) {
    throw new Error('Total y Disponible deben ser enteros');
  }
  if (availableNum > quantityNum) {
    throw new Error('Disponible no puede ser mayor que Total');
  }

  if (materialId) {
    const materialDoc = doc(db, "materials", materialId);
    await updateDoc(materialDoc, {
      ...materialData,
      updatedAt: serverTimestamp()
    });
    return materialId;
  } else {
    // Crear nuevo material
    const materialWithTimestamps = {
      ...materialData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    const newMaterial = await addDoc(materialsCollection, materialWithTimestamps);
    return newMaterial.id;
  }
};

export const deleteMaterial = async (materialId) => {
  const materialDoc = doc(db, "materials", materialId);
  await deleteDoc(materialDoc);
  return true;
};
