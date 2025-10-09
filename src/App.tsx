/**
 * Componente principal da aplicação Host.ee
 * Gerencia roteamento e estrutura geral
 */
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import './styles/global.css'

// Importações lazy para melhor performance
const Header = React.lazy(() => import('./components/Header'))
const Footer = React.lazy(() => import('./components/Footer'))
const Home = React.lazy(() => import('./pages/Home'))
const Login = React.lazy(() => import('./pages/Login'))
const Cadastro = React.lazy(() => import('./pages/Cadastro'))
const EmpresaDetalhes = React.lazy(() => import('./pages/EmpresaDetalhes'))
const ClienteDashboard = React.lazy(() => import('./pages/ClienteDashboard'))
const EmpresaDashboard = React.lazy(() => import('./pages/EmpresaDashboard'))
const Empresas = React.lazy(() => import('./pages/Empresas'))
const PoliticaPrivacidade = React.lazy(() => import('./pages/PoliticaPrivacidade'))
const Suporte = React.lazy(() => import('./pages/Suporte'))
const Sobre = React.lazy(() => import('./pages/Sobre'))

// Componente para proteger rotas que precisam de autenticação
function ProtectedRoute({ children, requiredType }: { children: React.ReactNode, requiredType?: 'cliente' | 'empresa' }) {
  const { user, usuario, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (requiredType && usuario?.tipo !== requiredType) {
    return <Navigate to="/" />
  }

  return <>{children}</>
}

function AppContent() {
  return (
    <Router>
      <div className="app">
        <React.Suspense fallback={
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Carregando...</p>
          </div>
        }>
          <Header />
          <main className="main-content">
            <Routes>
              {/* Rotas públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/empresa/:id" element={<EmpresaDetalhes />} />
              <Route path="/empresas" element={<Empresas />} />
              <Route path="/privacidade" element={<PoliticaPrivacidade />} />
              <Route path="/suporte" element={<Suporte />} />
              <Route path="/sobre" element={<Sobre />} />
              
              {/* Rotas protegidas para clientes */}
              <Route 
                path="/cliente/dashboard" 
                element={
                  <ProtectedRoute requiredType="cliente">
                    <ClienteDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Rotas protegidas para empresas */}
              <Route 
                path="/empresa/dashboard" 
                element={
                  <ProtectedRoute requiredType="empresa">
                    <EmpresaDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Rota 404 */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </React.Suspense>
      </div>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App