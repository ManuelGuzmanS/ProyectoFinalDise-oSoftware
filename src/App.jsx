import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import CatalogPage from './pages/CatalogPage';
import MyRequestsPage from './pages/MyRequestsPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminMaterialForm from './pages/AdminMaterialForm';
import MaterialDetail from './pages/MaterialDetail';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/home" element={<Home />} />
            
            {/* Rutas protegidas para usuarios autenticados */}
            <Route path="/catalog" element={
              <ProtectedRoute>
                <CatalogPage />
              </ProtectedRoute>
            } />
            <Route path="/material/:id" element={
              <ProtectedRoute>
                <MaterialDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/requests" element={
              <ProtectedRoute>
                <MyRequestsPage />
              </ProtectedRoute>
            } />
            
            {/* Ruta protegida solo para administradores */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/material/new" element={
              <ProtectedRoute requireAdmin>
                <AdminMaterialForm />
              </ProtectedRoute>
            } />
            <Route path="/admin/material/:id" element={
              <ProtectedRoute requireAdmin>
                <AdminMaterialForm />
              </ProtectedRoute>
            } />
            
            {/* Ruta 404 - Página no encontrada */}
            <Route path="*" element={
              <div className="text-center py-20">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">404</h2>
                <p className="text-gray-600 mb-8">Página no encontrada</p>
                <a 
                  href="/" 
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                  Ir al login
                </a>
              </div>
            } />
          </Routes>
        </main>

        <footer className="bg-gray-800 text-white py-6 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm">
              Proyecto Final - Diseño de Software | 13007A-O25
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Sistema de préstamo de material de laboratorio
            </p>
            <div className="mt-4 flex justify-center space-x-6 text-xs text-gray-400">
              <span className="opacity-70 select-none">
                Términos de uso
              </span>
              <span className="opacity-70 select-none">
                Política de privacidad
              </span>
              <span className="opacity-70 select-none">
                Contacto
              </span>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
