/**
 * Página Sobre
 * Informações sobre a plataforma Host.ee
 */
import React from 'react'
import { useTranslation } from 'react-i18next'

export default function Sobre() {
  const { t } = useTranslation()

  return (
    <div className="sobre-page">
      <div className="container">
        <div className="sobre-content">
          <h1>{t('about.title')}</h1>
          
          <section className="sobre-section">
            <h2>{t('about.mission')}</h2>
            <p>
              {t('about.missionText')}
            </p>
          </section>

          <section className="sobre-section">
            <h2>{t('about.howItWorks')}</h2>
            <div className="funcionamento-grid">
              <div className="funcionamento-item">
                <h3>{t('about.forClients')}</h3>
                <ul>
                  {(t('about.clientFeatures', { returnObjects: true }) as string[]).map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              
              <div className="funcionamento-item">
                <h3>{t('about.forCompanies')}</h3>
                <ul>
                  {(t('about.companyFeatures', { returnObjects: true }) as string[]).map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="sobre-section">
            <h2>{t('about.values')}</h2>
            <div className="valores-grid">
              <div className="valor-item">
                <h3>🎯 {t('about.simplicity')}</h3>
                <p>{t('about.simplicityText')}</p>
              </div>
              
              <div className="valor-item">
                <h3>🔒 {t('about.securityValue')}</h3>
                <p>{t('about.securityText')}</p>
              </div>
              
              <div className="valor-item">
                <h3>⚡ {t('about.agility')}</h3>
                <p>{t('about.agilityText')}</p>
              </div>
              
              <div className="valor-item">
                <h3>🤝 {t('about.reliability')}</h3>
                <p>{t('about.reliabilityText')}</p>
              </div>
            </div>
          </section>

          <section className="sobre-section">
            <h2>{t('about.statistics')}</h2>
            <div className="stats-sobre">
              <div className="stat-item">
                <h3>6</h3>
                <p>{t('about.companiesRegistered')}</p>
              </div>
              <div className="stat-item">
                <h3>100</h3>
                <p>{t('about.bookingsMade')}</p>
              </div>
              <div className="stat-item">
                <h3>3</h3>
                <p>{t('about.serviceCategories')}</p>
              </div>
              <div className="stat-item">
                <h3>4.8⭐</h3>
                <p>{t('about.averageRating')}</p>
              </div>
            </div>
          </section>

          <section className="sobre-section">
            <h2>{t('about.developedAsTCC')}</h2>
            <p>
              {t('about.tccText')}
            </p>
          </section>

          <section className="sobre-section">
            <h2>{t('about.contact')}</h2>
            <div className="contato-info">
              <p>{t('about.email')}</p>
              <p>{t('about.whatsapp')}</p>
              <p>{t('about.address')}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}