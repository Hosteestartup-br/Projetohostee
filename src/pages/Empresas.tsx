/**
 * Página de Empresas
 * Lista todas as empresas disponíveis sem campo de busca
 */
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase, Empresa } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function Empresas() {
  const { t } = useTranslation()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [localizacaoUsuario, setLocalizacaoUsuario] = useState<{lat: number, lon: number} | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    carregarEmpresas()
    obterLocalizacao()
  }, [])

  // Carregar todas as empresas do banco
  const carregarEmpresas = async () => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('nome')

      if (error) throw error
      
      // Ordenar por distância se tiver localização
      let empresasOrdenadas = data || []
      if (localizacaoUsuario) {
        empresasOrdenadas = empresasOrdenadas.sort((a, b) => {
          const distA = calcularDistancia(localizacaoUsuario.lat, localizacaoUsuario.lon, a.latitude, a.longitude)
          const distB = calcularDistancia(localizacaoUsuario.lat, localizacaoUsuario.lon, b.latitude, b.longitude)
          return distA - distB
        })
      }
      
      setEmpresas(empresasOrdenadas)
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
    } finally {
      setLoading(false)
    }
  }

  // Obter localização do usuário
  const obterLocalizacao = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocalizacaoUsuario({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
          // Recarregar empresas com nova localização
          carregarEmpresas()
        },
        (error) => {
          console.log('Erro ao obter localização:', error)
        }
      )
    }
  }

  // Calcular distância entre dois pontos (fórmula de Haversine)
  const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t('empresas.loading')}</p>
      </div>
    )
  }

  return (
    <div className="empresas-page">
      <div className="container">
        {/* Cabeçalho da página */}
        <section className="page-header">
          <h1>{t('empresas.title')}</h1>
          <p>{t('empresas.subtitle')}</p>
        </section>

        {/* Lista de empresas */}
        <section className="empresas-section">
          {empresas.length === 0 ? (
            <div className="no-results">
              <p>{t('empresas.noResults')}</p>
            </div>
          ) : (
            <div className="empresas-grid">
              {empresas.map((empresa) => {
                const distancia = localizacaoUsuario 
                  ? calcularDistancia(localizacaoUsuario.lat, localizacaoUsuario.lon, empresa.latitude, empresa.longitude)
                  : null

                return (
                  <div key={empresa.id} className="empresa-card">
                    <div className="empresa-header">
                      <h3>{empresa.nome}</h3>
                      <div className="empresa-rating">
                        ⭐ {empresa.avaliacao.toFixed(1)}
                      </div>
                    </div>
                    
                    <p className="empresa-categoria">{empresa.categoria}</p>
                    <p className="empresa-descricao">{empresa.descricao}</p>
                    
                    {distancia && (
                      <p className="empresa-distancia">
                        📍 {distancia.toFixed(1)} km de distância
                      </p>
                    )}
                    
                    <div className="empresa-actions">
                      <button
                        className="btn-primary"
                        onClick={() => navigate(`/empresa/${empresa.slug}`)}
                      >
                        {t('empresas.viewDetails')}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}