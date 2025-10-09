import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Notificacao {
  id: string
  tipo: string
  titulo: string
  mensagem: string
  lida: boolean
  data_leitura: string | null
  created_at: string
  agendamento_id: string | null
}

export default function NotificationCenter() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [loading, setLoading] = useState(false)
  const [showPanel, setShowPanel] = useState(false)
  const [naoLidas, setNaoLidas] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      carregarNotificacoes()

      const subscription = supabase
        .channel('notificacoes_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'notificacoes',
          filter: `usuario_id=eq.${user.id}`
        }, () => {
          carregarNotificacoes()
        })
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setShowPanel(false)
      }
    }

    if (showPanel) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPanel])

  const carregarNotificacoes = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      setNotificacoes(data || [])
      setNaoLidas(data?.filter(n => !n.lida).length || 0)
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    } finally {
      setLoading(false)
    }
  }

  const marcarComoLida = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .update({
          lida: true,
          data_leitura: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      setNotificacoes(prev =>
        prev.map(n => n.id === id ? { ...n, lida: true, data_leitura: new Date().toISOString() } : n)
      )
      setNaoLidas(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
    }
  }

  const marcarTodasComoLidas = async () => {
    if (!user) return

    try {
      const idsNaoLidas = notificacoes.filter(n => !n.lida).map(n => n.id)

      if (idsNaoLidas.length === 0) return

      const { error } = await supabase
        .from('notificacoes')
        .update({
          lida: true,
          data_leitura: new Date().toISOString()
        })
        .in('id', idsNaoLidas)

      if (error) throw error

      setNotificacoes(prev =>
        prev.map(n => ({ ...n, lida: true, data_leitura: new Date().toISOString() }))
      )
      setNaoLidas(0)
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
    }
  }

  const formatarData = (data: string) => {
    const dataNotificacao = new Date(data)
    const agora = new Date()
    const diffMs = agora.getTime() - dataNotificacao.getTime()
    const diffMinutos = Math.floor(diffMs / 60000)
    const diffHoras = Math.floor(diffMs / 3600000)
    const diffDias = Math.floor(diffMs / 86400000)

    if (diffMinutos < 1) return t('notification.now')
    if (diffMinutos < 60) return t('notification.minutesAgo', { count: diffMinutos })
    if (diffHoras < 24) return t('notification.hoursAgo', { count: diffHoras })
    if (diffDias < 7) return t('notification.daysAgo', { count: diffDias })

    return dataNotificacao.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getIconePorTipo = (tipo: string) => {
    switch (tipo) {
      case 'agendamento_criado':
      case 'novo_agendamento':
        return '📅'
      case 'agendamento_confirmado':
        return '✅'
      case 'agendamento_finalizado':
        return '🎉'
      case 'agendamento_cancelado':
        return '❌'
      case 'avaliacao_recebida':
        return '⭐'
      default:
        return '📢'
    }
  }

  const togglePanel = () => {
    setShowPanel(!showPanel)
  }

  if (!user) {
    return (
      <div className="notification-center">
        <button
          className="notification-button"
          onClick={togglePanel}
          aria-label={t('notification.notifications')}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>

        {showPanel && (
          <div className="notification-panel" ref={panelRef}>
            <div className="notification-header">
              <h3>{t('notification.notifications')}</h3>
            </div>
            <div className="notification-empty">
              <span className="empty-icon">🔔</span>
              <p>{t('notification.noNotifications')}</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="notification-center">
      <button
        className="notification-button"
        onClick={togglePanel}
        aria-label={`${naoLidas} notificações não lidas`}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {naoLidas > 0 && (
          <span className="notification-badge">{naoLidas > 9 ? '9+' : naoLidas}</span>
        )}
      </button>

      {showPanel && (
        <div className="notification-panel" ref={panelRef}>
          <div className="notification-header">
            <h3>{t('notification.notifications')}</h3>
            {naoLidas > 0 && (
              <button
                className="mark-all-read"
                onClick={marcarTodasComoLidas}
              >
                {t('notification.markAllAsRead')}
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">
                <div className="loading-spinner"></div>
              </div>
            ) : notificacoes.length === 0 ? (
              <div className="notification-empty">
                <span className="empty-icon">🔔</span>
                <p>{t('notification.noNotifications')}</p>
              </div>
            ) : (
              notificacoes.map((notificacao) => (
                <div
                  key={notificacao.id}
                  className={`notification-item ${!notificacao.lida ? 'unread' : ''}`}
                  onClick={() => !notificacao.lida && marcarComoLida(notificacao.id)}
                >
                  <div className="notification-icon">
                    {getIconePorTipo(notificacao.tipo)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notificacao.titulo}</div>
                    <div className="notification-message">{notificacao.mensagem}</div>
                    <div className="notification-time">{formatarData(notificacao.created_at)}</div>
                  </div>
                  {!notificacao.lida && (
                    <div className="unread-indicator"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
