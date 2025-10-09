/**
 * Página de Login
 * Formulário de autenticação para clientes e empresas
 */
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import ReCAPTCHA from 'react-google-recaptcha'

export default function Login() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!recaptchaToken) {
      setError(t('login.recaptchaRequired') || 'Por favor, complete a verificação reCAPTCHA')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error } = await signIn(email, password)
      if (error) {
        setError(t('login.invalidCredentials'))
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(t('login.loginError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-container">
          <div className="auth-card">
            <h1>{t('login.title')}</h1>
            <p>{t('login.subtitle')}</p>

            {/* Credenciais de demonstração */}
            <div className="demo-credentials">
              <h3>{t('login.demoCredentials')}</h3>
              <div className="demo-accounts">
                <div className="demo-account">
                  <strong>{t('login.clientAccount')}</strong><br />
                  {t('login.email')}: cliente@demo.com<br />
                  {t('login.password')}: 123456
                </div>
                <div className="demo-account">
                  <strong>{t('login.companyAccount')}</strong><br />
                  {t('login.email')}: empresa@demo.com<br />
                  {t('login.password')}: 123456
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-group">
                <label htmlFor="email">{t('login.email')}</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">{t('login.password')}</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={t('login.password')}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                <ReCAPTCHA
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                  onChange={handleRecaptchaChange}
                  theme="light"
                />
              </div>

              <button
                type="submit"
                className="btn-primary btn-full"
                disabled={loading || !recaptchaToken}
              >
                {loading ? t('login.loggingIn') : t('login.loginButton')}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                {t('login.noAccount')} 
                <Link to="/cadastro" className="auth-link"> {t('login.registerHere')}</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}