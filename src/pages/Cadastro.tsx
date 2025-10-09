/**
 * Página de Cadastro
 * Formulário de registro para novos usuários
 */
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import ReCAPTCHA from 'react-google-recaptcha'

export default function Cadastro() {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    confirmPassword: '',
    tipo: 'cliente' as 'cliente' | 'empresa'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token)
    setError('')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!recaptchaToken) {
      setError(t('register.recaptchaRequired') || 'Por favor, complete a verificação reCAPTCHA')
      return
    }

    setLoading(true)
    setError('')

    // Validações
    if (formData.password !== formData.confirmPassword) {
      setError(t('register.passwordMismatch'))
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError(t('register.passwordTooShort'))
      setLoading(false)
      return
    }

    try {
      const { error } = await signUp(
        formData.email, 
        formData.password, 
        formData.nome, 
        formData.tipo
      )
      
      if (error) {
        setError(t('register.createError') + ': ' + error.message)
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(t('register.createError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-container">
          <div className="auth-card">
            <h1>{t('register.title')}</h1>
            <p>{t('register.subtitle')}</p>

            <form onSubmit={handleSubmit} className="auth-form">
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-group">
                <label htmlFor="tipo">{t('register.accountType')}</label>
                <select
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  required
                >
                  <option value="cliente">{t('register.clientOption')}</option>
                  <option value="empresa">{t('register.companyOption')}</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="nome">
                  {formData.tipo === 'empresa' ? t('register.companyName') : t('register.fullName')}
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  placeholder={formData.tipo === 'empresa' ? t('register.companyNamePlaceholder') : t('register.fullNamePlaceholder')}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">{t('login.email')}</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="seu@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">{t('login.password')}</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder={t('register.minCharacters')}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">{t('register.confirmPassword')}</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder={t('register.confirmPasswordPlaceholder')}
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
                {loading ? t('register.creatingAccount') : t('register.createAccount')}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                {t('register.hasAccount')} 
                <Link to="/login" className="auth-link"> {t('register.loginHere')}</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}