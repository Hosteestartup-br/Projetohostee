/**
 * Componente Footer
 * Rodapé com links e informações da empresa
 */
import React from 'react'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Seção Sobre */}
          <div className="footer-section">
            <h3>Host.ee</h3>
            <p>{t('footer.about')}</p>
          </div>

          {/* Links úteis */}
          <div className="footer-section">
            <h4>{t('footer.usefulLinks')}</h4>
            <ul>
              <li><a href="/privacidade">{t('footer.privacyPolicy')}</a></li>
              <li><a href="/suporte">{t('footer.support')}</a></li>
            </ul>
          </div>

          {/* Redes sociais */}
          <div className="footer-section">
            <h4>{t('footer.socialMedia')}</h4>
            <div className="social-links">
              <a href="https://instagram.com/host.ee" target="_blank" rel="noopener noreferrer">{t('footer.instagram')}</a>
            </div>
          </div>

          {/* Selos de segurança */}
          <div className="footer-section">
            <h4>{t('footer.security')}</h4>
            <div className="security-badges">
              <div className="badge">🔒 {t('footer.sslCertified')}</div>
              <div className="badge">🔒 {t('footer.dataProtected')}</div>
              <div className="badge">🔒 {t('footer.verifiedSite')}</div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>{t('footer.copyright')}</p>
          <p>{t('footer.developedAs')}</p>
        </div>
      </div>
    </footer>
  )
}