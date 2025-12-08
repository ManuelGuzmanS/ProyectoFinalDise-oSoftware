import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { auth } from "./config";

// Registrar usuario
export const registerUser = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Iniciar sesión
export const loginUser = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Cerrar sesión
export const logoutUser = () => {
  return signOut(auth);
};

// Escuchar cambios de autenticación
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Obtener usuario actual
export const getCurrentUser = () => {
  return auth.currentUser;
};