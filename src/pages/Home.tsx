/**
 * Página Inicial
 * Exibe empresas próximas e campo de busca
 */
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase, Empresa } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import RotatingText from '../components/RotatingText'
import CompanyCard from '../components/CompanyCard'

export default function Home() {
  const { t } = useTranslation()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [empresasFiltradas, setEmpresasFiltradas] = useState<Empresa[]>([])
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(true)
  const [localizacaoUsuario, setLocalizacaoUsuario] = useState<{lat: number, lon: number} | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    carregarEmpresas()
    obterLocalizacao()
  }, [])

  useEffect(() => {
    filtrarEmpresas()
  }, [busca, empresas])

  // Carregar todas as empresas do banco
  const carregarEmpresas = async () => {
    try {
      console.log('Carregando empresas...')
      const { data, error } = await supabase
        .from('empresas')
        .select('*')
        .order('nome')

      if (error) {
        console.error('Erro ao carregar empresas:', error)
        // Não lançar erro, apenas definir array vazio
        setEmpresas([])
        return
      }
      
      console.log('Empresas carregadas:', data?.length || 0)
      setEmpresas(data || [])
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
      setEmpresas([])
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
        },
        (error) => {
          console.log('Erro ao obter localização:', error)
          // Usar localização padrão (São Paulo)
          setLocalizacaoUsuario({
            lat: -23.5505,
            lon: -46.6333
          })
        }
      )
    } else {
      // Usar localização padrão se geolocalização não estiver disponível
      setLocalizacaoUsuario({
        lat: -23.5505,
        lon: -46.6333
      })
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

  // Filtrar empresas por busca
  const filtrarEmpresas = () => {
    let resultado = empresas

    if (busca.trim()) {
      resultado = empresas.filter(empresa => 
        empresa.nome.toLowerCase().includes(busca.toLowerCase()) ||
        empresa.categoria.toLowerCase().includes(busca.toLowerCase()) ||
        empresa.descricao.toLowerCase().includes(busca.toLowerCase())
      )
    }

    // Ordenar por distância se tiver localização
    if (localizacaoUsuario) {
      resultado = resultado.sort((a, b) => {
        const distA = calcularDistancia(localizacaoUsuario.lat, localizacaoUsuario.lon, a.latitude, a.longitude)
        const distB = calcularDistancia(localizacaoUsuario.lat, localizacaoUsuario.lon, b.latitude, b.longitude)
        return distA - distB
      })
    }

    setEmpresasFiltradas(resultado)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t('home.loading')}</p>
      </div>
    )
  }

  return (
    <div className="home-page">
      <div className="container">
        {/* Hero Section */}
        <section className="hero">
          <RotatingText />
          <p>{t('home.subtitle')}</p>
          
          {/* Campo de busca */}
          <div className="search-container">
            <input
              type="text"
              placeholder={t('home.searchPlaceholder')}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="search-input"
            />
            <button className="search-button">🔦</button>
          </div>
        </section>

        {/* Lista de empresas */}
        <section className="empresas-section">
          <h2>{t('home.availableCompanies')}</h2>
          
          {empresasFiltradas.length === 0 ? (
            <div className="no-results">
              {empresas.length === 0 ? (
                <p>{t('home.loading')}</p>
              ) : (
                <p>{t('home.noResults')}</p>
              )}
            </div>
          ) : (
            <div className="empresas-grid">
              {empresasFiltradas.map((empresa) => {
                const distancia = localizacaoUsuario 
                  ? calcularDistancia(localizacaoUsuario.lat, localizacaoUsuario.lon, empresa.latitude, empresa.longitude)
                  : null

                return (
                  <CompanyCard
                    key={empresa.id}
                    empresa={empresa}
                    distancia={distancia || undefined}
                    onClick={() => navigate(`/empresa/${empresa.slug}`)}
                  />
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}