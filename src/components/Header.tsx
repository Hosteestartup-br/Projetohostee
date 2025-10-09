/**
 * Componente Header
 * Barra de navegação superior com logo e menu
 */
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import LanguageSelector from './LanguageSelector'
import NotificationCenter from './NotificationCenter'

export default function Header() {
  const { t } = useTranslation()
  const { user, usuario, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : ''
  }

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <div className="logo" onClick={() => navigate('/')}>
            <img src="/Logo Host.ee estendida branca2.png" alt="Host.ee" />
          </div>

          {/* Menu de navegação */}
          <nav className="nav">
            <button 
              className={`nav-link ${isActive('/')}`}
              onClick={() => navigate('/')}
            >
              {t('header.home')}
            </button>
            <button 
              className={`nav-link ${isActive('/empresas')}`}
              onClick={() => navigate('/empresas')}
            >
              {t('header.companies')}
            </button>
            <button 
              className={`nav-link ${isActive('/sobre')}`}
              onClick={() => navigate('/sobre')}
            >
              {t('header.about')}
            </button>
          </nav>

          {/* Ações do header */}
          <div className="header-actions">
            <NotificationCenter />
            <LanguageSelector />
          </div>

          {/* Área do usuário */}
          <div className="user-area">
            {user ? (
              <div className="user-menu">
                <span className="user-name">{t('header.welcome', { name: usuario?.nome })}</span>
                <button 
                  className="btn-dashboard"
                  onClick={() => navigate(usuario?.tipo === 'empresa' ? '/empresa/dashboard' : '/cliente/dashboard')}
                >
                  {usuario?.tipo === 'empresa' ? t('header.companyPanel') : t('header.clientArea')}
                </button>
                <button className="btn-logout" onClick={handleLogout}>
                  {t('header.logout')}
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <button 
                  className="btn-login"
                  onClick={() => navigate('/login')}
                >
                  {t('header.login')}
                </button>
                <button 
                  className="btn-register"
                  onClick={() => navigate('/cadastro')}
                >
                  {t('header.register')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}