// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.jsx';
import { ThemeProvider } from './hooks/useTheme.jsx';
import { Layout } from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Páginas
import Login from './pages/Login.jsx';
import Cadastro from './pages/Cadastro.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NovaTransacao from './pages/NovaTransacao.jsx';
import Relatorios from './pages/Relatorios.jsx';
import Metas from './pages/Metas.jsx';
import Missoes from './pages/Missoes.jsx';
import Configuracoes from './pages/Configuracoes.jsx';

import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              
              {/* Rotas Protegidas */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/nova-transacao" element={
                <ProtectedRoute>
                  <NovaTransacao />
                </ProtectedRoute>
              } />
              
              <Route path="/relatorios" element={
                <ProtectedRoute>
                  <Relatorios />
                </ProtectedRoute>
              } />
              
              <Route path="/metas" element={
                <ProtectedRoute>
                  <Metas />
                </ProtectedRoute>
              } />
              
              <Route path="/missoes" element={
                <ProtectedRoute>
                  <Missoes />
                </ProtectedRoute>
              } />
              
              <Route path="/configuracoes" element={
                <ProtectedRoute>
                  <Configuracoes />
                </ProtectedRoute>
              } />
              
              {/* Redirecionamento padrão */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

