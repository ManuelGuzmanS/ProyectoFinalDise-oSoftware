import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  getCurrentUser,
  onAuthChange,
  loginUser,
  registerUser,
  logoutUser 
} from '../firebase/auth';
import { createUserDocument, getUserDocument } from '../firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const signup = async (email, password, userData) => {
    try {
      const userCredential = await registerUser(email, password);
      const user = userCredential.user;
      const isAdminEmail = email.toLowerCase().startsWith('admin');
      
      await createUserDocument(user.uid, {
        email: user.email,
        name: userData.name,
        role: isAdminEmail ? 'admin' : 'student',
        phone: userData.phone || '',
      });
      
      return user;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const isAdminEmail = email.toLowerCase().startsWith('admin');
      
      const userCredential = await loginUser(email, password);
      const user = userCredential.user;
      
      if (isAdminEmail) {
        await createUserDocument(user.uid, {
          email: user.email,
          name: 'Administrador',
          role: 'admin'
        });
      }
      
      return user;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    return logoutUser();
  };

  const loadUserData = async (userId) => {
    try {
      const userDoc = await getUserDocument(userId);
      if (userDoc) {
        setUserData(userDoc);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await loadUserData(user.uid);
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    login,
    signup,
    logout,
    loading,
    isAdmin: userData?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
