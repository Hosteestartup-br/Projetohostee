/**
 * Página de Suporte
 * Informações de contato, feedback e links úteis
 */
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Mail, MessageSquare, ExternalLink } from 'lucide-react'

export default function Suporte() {
  const { t } = useTranslation()

  return (
    <div className="politica-page">
      <div className="container">
        <div className="politica-content">
          <h1>{t('support.title')}</h1>
          <p className="ultima-atualizacao">{t('support.subtitle')}</p>

          <section className="politica-section">
            <h2>{t('support.contactTitle')}</h2>
            <p>{t('support.contactDescription')}</p>

            <div className="contato-info" style={{ marginTop: '2rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Mail size={20} />
                  {t('support.email')}
                </h3>
                <p><strong>{t('support.emailAddress')}</strong></p>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>{t('support.emailDescription')}</p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <MessageSquare size={20} />
                  {t('support.whatsapp')}
                </h3>
                <p><strong>{t('support.whatsappNumber')}</strong></p>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>{t('support.whatsappDescription')}</p>
              </div>
            </div>
          </section>

          <section className="politica-section">
            <h2>{t('support.feedbackTitle')}</h2>
            <p>{t('support.feedbackDescription')}</p>
            <p style={{ marginTop: '1rem' }}>
              <strong>{t('support.email')}:</strong> {t('support.emailAddress')}
            </p>
          </section>

          <section className="politica-section">
            <h2>{t('support.usefulLinksTitle')}</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '1rem' }}>
                <a
                  href={t('support.faqUrl')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb', textDecoration: 'none' }}
                >
                  <ExternalLink size={16} />
                  {t('support.faq')}
                </a>
              </li>
              <li style={{ marginBottom: '1rem' }}>
                <Link
                  to="/privacidade"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb', textDecoration: 'none' }}
                >
                  <ExternalLink size={16} />
                  {t('support.privacyPolicy')}
                </Link>
              </li>
              <li style={{ marginBottom: '1rem' }}>
                <Link
                  to="/sobre"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb', textDecoration: 'none' }}
                >
                  <ExternalLink size={16} />
                  {t('support.aboutUs')}
                </Link>
              </li>
              <li style={{ marginBottom: '1rem' }}>
                <Link
                  to="/empresas"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb', textDecoration: 'none' }}
                >
                  <ExternalLink size={16} />
                  {t('support.companies')}
                </Link>
              </li>
            </ul>
          </section>

          <section className="politica-section">
            <h2>{t('support.socialMediaTitle')}</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '1rem' }}>
                <a
                  href={t('support.instagramUrl')}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb', textDecoration: 'none' }}
                >
                  <ExternalLink size={16} />
                  {t('support.instagram')}
                </a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
