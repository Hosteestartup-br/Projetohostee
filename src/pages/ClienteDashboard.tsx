/**
 * Dashboard do Cliente
 * Área pessoal com agendamentos e perfil
 */
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase, Agendamento } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

interface Empresa {
  id: string
  nome: string
  descricao: string
  categoria: string
  latitude: number
  longitude: number
  avaliacao: number
  created_at?: string
}

interface Servico {
  id: string
  nome: string
  preco: number
  duracao: number
}

interface AgendamentoCompleto extends Agendamento {
  empresa: Empresa
  servico: Servico
}

export default function ClienteDashboard() {
  const { t } = useTranslation()
  const [agendamentos, setAgendamentos] = useState<AgendamentoCompleto[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'agendamentos' | 'perfil'>('agendamentos')
  const { usuario } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (usuario) {
      carregarAgendamentos()
    }
  }, [usuario])

  const carregarAgendamentos = async () => {
    if (!usuario) return

    try {
      setLoading(true)
      
      console.log('🔄 Carregando agendamentos do cliente:', usuario.id)
      
      // Buscar agendamentos do cliente com dados relacionados
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          servicos(id, nome, preco, duracao),
          empresa_usuario:usuarios!agendamentos_empresa_id_fkey(nome)
        `)
        .eq('usuario_id', usuario.id)
        .order('data', { ascending: false })

      if (error) {
        console.error('Erro ao carregar agendamentos:', error)
        setAgendamentos([])
        return
      }

      console.log('Agendamentos carregados:', data?.length || 0)
      if (data && data.length > 0) {
        console.log('Primeiro agendamento:', data[0])
      }
      
      setAgendamentos(data || [])
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
      setAgendamentos([])
    } finally {
      setLoading(false)
    }
  }

  const cancelarAgendamento = async (agendamentoId: string) => {
    if (!confirm(t('common.confirm') + '?')) return

    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({ status: 'cancelado' })
        .eq('id', agendamentoId)
        .eq('usuario_id', usuario?.id) // Segurança adicional

      if (error) {
        console.error('Erro ao cancelar agendamento:', error)
        alert(t('common.error'))
        return
      }
      
      alert(t('common.success'))
      carregarAgendamentos() // Recarregar lista
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error)
      alert(t('common.error'))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return '#ffa500'
      case 'confirmado': return '#00ff00'
      case 'finalizado': return '#0066cc'
      case 'cancelado': return '#ff0000'
      default: return '#666'
    }
  }

  const getStatusText = (status: string) => {
    return t(`status.${status}`, status)
  }

  // Calcular estatísticas
  const calcularEstatisticas = () => {
    const total = agendamentos.length
    const pendentes = agendamentos.filter(a => a.status === 'pendente').length
    const confirmados = agendamentos.filter(a => a.status === 'confirmado').length
    const finalizados = agendamentos.filter(a => a.status === 'finalizado').length
    
    const totalGasto = agendamentos
      .filter(a => a.status === 'finalizado')
      .reduce((total, a) => total + (a.servicos?.preco || 0), 0)

    return { total, pendentes, confirmados, finalizados, totalGasto }
  }

  const stats = calcularEstatisticas()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t('common.loading')}</p>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>{t('dashboard.myArea')}</h1>
          <p>{t('dashboard.welcome', { name: usuario?.nome })}</p>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{t('clientDashboard.totalBookings')}</h3>
            <p className="stat-number">{stats.total}</p>
          </div>
          <div className="stat-card">
            <h3>{t('clientDashboard.pendingBookings')}</h3>
            <p className="stat-number">{stats.pendentes}</p>
          </div>
          <div className="stat-card">
            <h3>{t('clientDashboard.confirmedBookings')}</h3>
            <p className="stat-number">{stats.confirmados}</p>
          </div>
          <div className="stat-card">
            <h3>{t('clientDashboard.totalSpent')}</h3>
            <p className="stat-number">R$ {stats.totalGasto.toFixed(2)}</p>
          </div>
        </div>

        <div className="dashboard-tabs">
          <button 
            className={`tab ${activeTab === 'agendamentos' ? 'active' : ''}`}
            onClick={() => setActiveTab('agendamentos')}
          >
            {t('dashboard.appointments')}
          </button>
          <button 
            className={`tab ${activeTab === 'perfil' ? 'active' : ''}`}
            onClick={() => setActiveTab('perfil')}
          >
            {t('dashboard.profile')}
          </button>
        </div>

        <div className="dashboard-content">
          {activeTab === 'agendamentos' && (
            <div className="agendamentos-section">
              <div className="section-header">
                <h2>{t('clientDashboard.totalBookings')}</h2>
                <button 
                  className="btn-primary"
                  onClick={() => navigate('/')}
                >
                  {t('clientDashboard.newBooking')}
                </button>
              </div>
              
              {agendamentos.length === 0 ? (
                <div className="empty-state">
                  <p>{t('clientDashboard.noBookings')}</p>
                  <button 
                    className="btn-primary"
                    onClick={() => navigate('/')}
                  >
                    {t('clientDashboard.firstBooking')}
                  </button>
                </div>
              ) : (
                <div className="agendamentos-list">
                  {agendamentos.map((agendamento) => (
                    <div key={agendamento.id} className="agendamento-card">
                      <div className="agendamento-info">
                        <h3>{agendamento.empresa_usuario?.nome || 'Barbearia do João'}</h3>
                        <p className="servico">
                          <strong>{t('clientDashboard.service')}:</strong> {agendamento.servicos?.nome || 'Serviço'}
                        </p>
                        <p><strong>{t('clientDashboard.date')}:</strong> {new Date(agendamento.data).toLocaleDateString('pt-BR')}</p>
                        <p><strong>{t('clientDashboard.time')}:</strong> {agendamento.horario}</p>
                        <p><strong>{t('clientDashboard.price')}:</strong> R$ {(agendamento.servicos?.preco || 0).toFixed(2)}</p>
                        <p><strong>{t('clientDashboard.duration')}:</strong> {agendamento.servicos?.duracao || 0} {t('clientDashboard.minutes')}</p>
                      </div>
                      
                      <div className="agendamento-actions">
                        <span 
                          className="status-badge"
                          style={{ 
                            backgroundColor: getStatusColor(agendamento.status),
                            color: agendamento.status === 'confirmado' ? '#000' : '#fff'
                          }}
                        >
                          {getStatusText(agendamento.status)}
                        </span>
                        
                        {agendamento.status === 'pendente' && (
                          <button
                            className="btn-danger btn-small"
                            onClick={() => cancelarAgendamento(agendamento.id)}
                          >
                            {t('common.cancel')}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'perfil' && (
            <div className="perfil-section">
              <h2>{t('clientDashboard.accountType')}</h2>
              
              <div className="perfil-info">
                <div className="info-group">
                  <label>{t('register.fullName')}:</label>
                  <p>{usuario?.nome}</p>
                </div>

                <div className="info-group">
                  <label>{t('login.email')}:</label>
                  <p>{usuario?.email}</p>
                </div>

                <div className="info-group">
                  <label>{t('clientDashboard.accountType')}:</label>
                  <p>{t('clientDashboard.client')}</p>
                </div>

                <div className="info-group">
                  <label>{t('clientDashboard.memberSince')}:</label>
                  <p>{usuario?.created_at ? new Date(usuario.created_at).toLocaleDateString('pt-BR') : t('clientDashboard.dateNotAvailable')}</p>
                </div>

                <div className="info-group">
                  <label>{t('clientDashboard.statistics')}:</label>
                  <p>
                    {stats.total} {t('clientDashboard.bookingsCompleted')}<br/>
                    {stats.finalizados} {t('clientDashboard.servicesCompleted')}<br/>
                    R$ {stats.totalGasto.toFixed(2)} {t('clientDashboard.spentOnServices')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}