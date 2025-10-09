/**
 * Dashboard da Empresa
 * Painel administrativo para gerenciar serviços e agendamentos
 */
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase, Servico, Agendamento } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface AgendamentoCompleto extends Agendamento {
  usuarios: { nome: string; email: string }
  servicos: { nome: string; preco: number }
}

export default function EmpresaDashboard() {
  const { t } = useTranslation()
  const [servicos, setServicos] = useState<Servico[]>([])
  const [agendamentos, setAgendamentos] = useState<AgendamentoCompleto[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'servicos' | 'agendamentos'>('dashboard')
  const [showServicoForm, setShowServicoForm] = useState(false)
  const [editandoServico, setEditandoServico] = useState<Servico | null>(null)
  const [formServico, setFormServico] = useState({
    nome: '',
    preco: '',
    duracao: ''
  })
  const [agendaAberta, setAgendaAberta] = useState(true)
  const [alterandoAgenda, setAlterandoAgenda] = useState(false)
  const { usuario } = useAuth()

  useEffect(() => {
    if (usuario) {
      carregarServicos()
      carregarAgendamentos()
      carregarStatusAgenda()
    }
  }, [usuario])

  useEffect(() => {
    // Garantir que o loading seja definido como false após carregar os dados
    if (usuario) {
      setLoading(false)
    }
  }, [usuario, servicos, agendamentos])

  const carregarServicos = async () => {
    if (!usuario) return

    try {
      const { data, error } = await supabase
        .from('servicos')
        .select('*')
        .eq('empresa_id', usuario.id)
        .order('nome')

      if (error) throw error
      setServicos(data || [])
    } catch (error) {
      console.error('Erro ao carregar serviços:', error)
    }
  }

  const carregarAgendamentos = async () => {
    if (!usuario) return

    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          usuarios!agendamentos_usuario_id_fkey(nome, email),
          servicos!inner(nome, preco)
        `)
        .eq('empresa_id', usuario.id)
        .order('data', { ascending: true })

      if (error) throw error

      console.log('Agendamentos da empresa carregados:', data?.length || 0)
      console.log('Dados dos agendamentos da empresa:', data)

      setAgendamentos(data || [])
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const carregarStatusAgenda = async () => {
    if (!usuario) return

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', usuario.id)
        .maybeSingle()

      if (error) throw error

      // Verificar se a coluna agenda_aberta existe
      if (data && 'agenda_aberta' in data) {
        setAgendaAberta(data.agenda_aberta ?? true)
      } else {
        // Se a coluna não existir, assumir agenda aberta por padrão
        setAgendaAberta(true)
      }
    } catch (error) {
      console.error('Erro ao carregar status da agenda:', error)
      setAgendaAberta(true)
    }
  }

  const alterarStatusAgenda = async () => {
    if (!usuario) return

    try {
      setAlterandoAgenda(true)
      const novoStatus = !agendaAberta

      // Verificar se a coluna existe primeiro
      const { data: checkData } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', usuario.id)
        .maybeSingle()

      if (!checkData || !('agenda_aberta' in checkData)) {
        alert('ATENÇÃO: Execute primeiro o arquivo SQL "banco/adicionar_coluna_agenda_aberta.sql" no seu banco de dados para habilitar esta funcionalidade.')
        setAlterandoAgenda(false)
        return
      }

      const { error } = await supabase
        .from('usuarios')
        .update({ agenda_aberta: novoStatus })
        .eq('id', usuario.id)

      if (error) throw error

      setAgendaAberta(novoStatus)
      alert(novoStatus ? 'Agenda aberta! Novos agendamentos serão aceitos.' : 'Agenda fechada! Novos agendamentos serão bloqueados.')
    } catch (error) {
      console.error('Erro ao alterar status da agenda:', error)
      alert(t('common.error'))
    } finally {
      setAlterandoAgenda(false)
    }
  }

  const salvarServico = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formServico.nome || !formServico.preco || !formServico.duracao) {
      alert(t('booking.fillFields'))
      return
    }

    try {
      const dadosServico = {
        nome: formServico.nome,
        preco: parseFloat(formServico.preco),
        duracao: parseInt(formServico.duracao),
        empresa_id: usuario?.id
      }

      if (editandoServico) {
        // Atualizar serviço existente
        const { error } = await supabase
          .from('servicos')
          .update(dadosServico)
          .eq('id', editandoServico.id)

        if (error) throw error
        alert(t('common.success'))
      } else {
        // Criar novo serviço
        const { error } = await supabase
          .from('servicos')
          .insert([dadosServico])

        if (error) throw error
        alert(t('common.success'))
      }

      // Limpar formulário e recarregar lista
      setFormServico({ nome: '', preco: '', duracao: '' })
      setShowServicoForm(false)
      setEditandoServico(null)
      carregarServicos()
    } catch (error) {
      console.error('Erro ao salvar serviço:', error)
      alert(t('common.error'))
    }
  }

  const editarServico = (servico: Servico) => {
    setEditandoServico(servico)
    setFormServico({
      nome: servico.nome,
      preco: servico.preco.toString(),
      duracao: servico.duracao.toString()
    })
    setShowServicoForm(true)
  }

  const excluirServico = async (servicoId: string) => {
    if (!confirm(t('common.confirm') + '?')) return

    try {
      const { error } = await supabase
        .from('servicos')
        .delete()
        .eq('id', servicoId)

      if (error) throw error
      
      alert(t('common.success'))
      carregarServicos()
    } catch (error) {
      console.error('Erro ao excluir serviço:', error)
      alert(t('common.error'))
    }
  }

  const atualizarStatusAgendamento = async (agendamentoId: string, novoStatus: string) => {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({ status: novoStatus })
        .eq('id', agendamentoId)

      if (error) throw error
      
      carregarAgendamentos()
      alert(t('common.success'))
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      alert(t('common.error'))
    }
  }

  // Calcular estatísticas do dashboard
  const calcularEstatisticas = () => {
    const hoje = new Date()
    hoje.setHours(23, 59, 59, 999)
    const trintaDiasAtras = new Date(hoje.getTime() - (30 * 24 * 60 * 60 * 1000))

    const agendamentosRecentes = agendamentos.filter(a =>
      new Date(a.created_at || '') >= trintaDiasAtras
    )

    const agendamentosPendentes = agendamentos.filter(a => a.status === 'pendente')
    const agendamentosFinalizados = agendamentos.filter(a => a.status === 'finalizado')

    const totalVendas = agendamentosFinalizados.reduce((total, a) =>
      total + (a.servicos?.preco || 0), 0
    )

    // Calcular lucro semanal (últimos 7 dias) - baseado na data do agendamento que foi realizado
    const seteDiasAtras = new Date()
    seteDiasAtras.setDate(hoje.getDate() - 7)
    seteDiasAtras.setHours(0, 0, 0, 0)

    const lucroSemanal = agendamentos
      .filter(a => {
        if (a.status !== 'finalizado') return false
        const dataAgendamento = new Date(a.data)
        return dataAgendamento >= seteDiasAtras && dataAgendamento <= hoje
      })
      .reduce((total, a) => total + (a.servicos?.preco || 0), 0)

    // Calcular lucro mensal (mês atual) - baseado na data do agendamento que foi realizado
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    inicioMes.setHours(0, 0, 0, 0)

    const lucroMensal = agendamentos
      .filter(a => {
        if (a.status !== 'finalizado') return false
        const dataAgendamento = new Date(a.data)
        return dataAgendamento >= inicioMes && dataAgendamento <= hoje
      })
      .reduce((total, a) => total + (a.servicos?.preco || 0), 0)

    return {
      agendamentosRecentes: agendamentosRecentes.length,
      agendamentosPendentes: agendamentosPendentes.length,
      agendamentosFinalizados: agendamentosFinalizados.length,
      totalVendas,
      lucroSemanal,
      lucroMensal
    }
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
          <h1>{t('dashboard.companyPanel')}</h1>
          <p>{t('dashboard.welcome', { name: usuario?.nome })}</p>
        </div>

        {/* Navegação por abas */}
        <div className="dashboard-tabs">
          <button
            className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            {t('dashboard.dashboard')}
          </button>
          <button
            className={`tab ${activeTab === 'servicos' ? 'active' : ''}`}
            onClick={() => setActiveTab('servicos')}
          >
            {t('dashboard.services')}
          </button>
          <button
            className={`tab ${activeTab === 'agendamentos' ? 'active' : ''}`}
            onClick={() => setActiveTab('agendamentos')}
          >
            {t('dashboard.agendamentos')}
          </button>
        </div>

        {/* Conteúdo das abas */}
        <div className="dashboard-content">
          {activeTab === 'dashboard' && (
            <div className="stats-section">
              <h2>{t('companyDashboard.generalSummary')}</h2>

              <div className="agenda-control">
                <div className="agenda-status">
                  <h3>Status da Agenda</h3>
                  <p className={agendaAberta ? 'status-open' : 'status-closed'}>
                    {agendaAberta ? '🟢 Agenda Aberta' : '🔴 Agenda Fechada'}
                  </p>
                  <p className="status-description">
                    {agendaAberta
                      ? 'Sua agenda está aberta e aceitando novos agendamentos.'
                      : 'Sua agenda está fechada. Nenhum novo agendamento será aceito até você reabrir.'}
                  </p>
                </div>
                <button
                  className={`btn-toggle ${agendaAberta ? 'btn-danger' : 'btn-success'}`}
                  onClick={alterarStatusAgenda}
                  disabled={alterandoAgenda}
                >
                  {alterandoAgenda
                    ? 'Atualizando...'
                    : agendaAberta
                      ? '🔒 Fechar Agenda'
                      : '🔓 Abrir Agenda'}
                </button>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <h3>{t('companyDashboard.newBookings')}</h3>
                  <p className="stat-number">{stats.agendamentosRecentes}</p>
                </div>

                <div className="stat-card">
                  <h3>{t('companyDashboard.pendingBookings')}</h3>
                  <p className="stat-number">{stats.agendamentosPendentes}</p>
                </div>

                <div className="stat-card">
                  <h3>{t('companyDashboard.completedBookings')}</h3>
                  <p className="stat-number">{stats.agendamentosFinalizados}</p>
                </div>

                <div className="stat-card">
                  <h3>{t('companyDashboard.totalSales')}</h3>
                  <p className="stat-number">R$ {stats.totalVendas.toFixed(2)}</p>
                </div>
              </div>

              <div className="stats-grid" style={{ marginTop: '20px' }}>
                <div className="stat-card highlight-weekly">
                  <h3>Lucro Semanal</h3>
                  <p className="stat-number">R$ {stats.lucroSemanal.toFixed(2)}</p>
                  <p className="stat-description">Últimos 7 dias</p>
                </div>

                <div className="stat-card highlight-monthly">
                  <h3>Lucro Mensal</h3>
                  <p className="stat-number">R$ {stats.lucroMensal.toFixed(2)}</p>
                  <p className="stat-description">Mês atual</p>
                </div>
              </div>

              <div className="quick-stats">
                <h3>{t('companyDashboard.generalSummary')}</h3>
                <p>{t('companyDashboard.totalServices')}: <strong>{servicos.length}</strong></p>
                <p>{t('companyDashboard.totalBookings')}: <strong>{agendamentos.length}</strong></p>
              </div>
            </div>
          )}

          {activeTab === 'servicos' && (
            <div className="servicos-section">
              <div className="section-header">
                <h2>{t('companyDashboard.totalServices')}</h2>
                <button 
                  className="btn-primary"
                  onClick={() => {
                    setShowServicoForm(true)
                    setEditandoServico(null)
                    setFormServico({ nome: '', preco: '', duracao: '' })
                  }}
                >
                  {t('companyDashboard.addService')}
                </button>
              </div>

              {servicos.length === 0 ? (
                <div className="empty-state">
                  <p>{t('companyDashboard.noServices')}</p>
                </div>
              ) : (
                <div className="servicos-list">
                  {servicos.map((servico) => (
                    <div key={servico.id} className="servico-item">
                      <div className="servico-info">
                        <h3>{servico.nome}</h3>
                        <p>{t('companyDashboard.price')}: R$ {servico.preco.toFixed(2)}</p>
                        <p>{t('companyDashboard.duration')}: {servico.duracao} {t('clientDashboard.minutes')}</p>
                      </div>
                      
                      <div className="servico-actions">
                        <button 
                          className="btn-secondary"
                          onClick={() => editarServico(servico)}
                        >
                          {t('companyDashboard.editService')}
                        </button>
                        <button 
                          className="btn-danger"
                          onClick={() => excluirServico(servico.id)}
                        >
                          {t('common.delete')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Modal de formulário de serviço */}
              {showServicoForm && (
                <div className="modal-overlay">
                  <div className="modal">
                    <h3>{editandoServico ? t('companyDashboard.editService') : t('companyDashboard.newService')}</h3>
                    
                    <form onSubmit={salvarServico}>
                      <div className="form-group">
                        <label htmlFor="nome">{t('companyDashboard.serviceName')}</label>
                        <input
                          type="text"
                          id="nome"
                          value={formServico.nome}
                          onChange={(e) => setFormServico({...formServico, nome: e.target.value})}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="preco">{t('companyDashboard.price')}</label>
                        <input
                          type="number"
                          id="preco"
                          step="0.01"
                          value={formServico.preco}
                          onChange={(e) => setFormServico({...formServico, preco: e.target.value})}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="duracao">{t('companyDashboard.duration')}</label>
                        <input
                          type="number"
                          id="duracao"
                          value={formServico.duracao}
                          onChange={(e) => setFormServico({...formServico, duracao: e.target.value})}
                          required
                        />
                      </div>

                      <div className="modal-actions">
                        <button type="submit" className="btn-primary">
                          {editandoServico ? t('companyDashboard.updateService') : t('companyDashboard.createService')}
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => setShowServicoForm(false)}
                        >
                          {t('common.cancel')}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'agendamentos' && (
            <div className="agendamentos-section">
              <h2>{t('companyDashboard.receivedBookings')}</h2>
              
              {agendamentos.length === 0 ? (
                <div className="empty-state">
                  <p>{t('companyDashboard.noBookings')}</p>
                </div>
              ) : (
                <div className="agendamentos-list">
                  {agendamentos.map((agendamento) => (
                    <div key={agendamento.id} className="agendamento-item">
                      <div className="agendamento-info">
                        <h3>{agendamento.usuarios?.nome}</h3>
                        <p>{t('companyDashboard.clientEmail')}: {agendamento.usuarios?.email || 'cliente@demo.com'}</p>
                        <p>{t('companyDashboard.serviceBooked')}: {agendamento.servicos?.nome}</p>
                        <p>{t('companyDashboard.bookingDate')}: {new Date(agendamento.data).toLocaleDateString('pt-BR')}</p>
                        <p>{t('companyDashboard.bookingTime')}: {agendamento.horario}</p>
                        <p>{t('companyDashboard.bookingValue')}: R$ {(agendamento.servicos?.preco || 0).toFixed(2)}</p>
                      </div>
                      
                      <div className="agendamento-status">
                        <p>{t('companyDashboard.bookingStatus')}: <strong>{agendamento.status}</strong></p>
                        
                        <div className="status-actions">
                          {agendamento.status === 'pendente' && (
                            <>
                              <button 
                                className="btn-success btn-small"
                                onClick={() => atualizarStatusAgendamento(agendamento.id, 'confirmado')}
                              >
                                {t('companyDashboard.confirmBooking')}
                              </button>
                              <button
                                className="btn-danger btn-small"
                                onClick={() => atualizarStatusAgendamento(agendamento.id, 'cancelado')}
                              >
                                {t('common.cancel')}
                              </button>
                            </>
                          )}
                          
                          {agendamento.status === 'confirmado' && (
                            <button 
                              className="btn-primary btn-small"
                              onClick={() => atualizarStatusAgendamento(agendamento.id, 'finalizado')}
                            >
                              {t('companyDashboard.finishBooking')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}