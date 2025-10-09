/**
 * Context de Autenticação
 * Gerencia o estado de login/logout do usuário
 */
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, Usuario } from '../lib/supabase'
import { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  usuario: Usuario | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, nome: string, tipo: 'cliente' | 'empresa') => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se há usuário logado
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        buscarDadosUsuario(session.user.id)
      }
      setLoading(false)
    })

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        (async () => {
          setUser(session?.user ?? null)
          if (session?.user) {
            await buscarDadosUsuario(session.user.id)
          } else {
            setUsuario(null)
          }
          setLoading(false)
        })()
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Buscar dados completos do usuário na tabela usuarios
  const buscarDadosUsuario = async (userId: string) => {
    try {
      console.log('Buscando dados do usuário:', userId)
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('Erro ao buscar dados do usuário:', error)
        return
      }

      if (data) {
        console.log('Dados do usuário encontrados:', data.nome, data.tipo)
        setUsuario(data)
      } else {
        console.warn('Usuário não encontrado na tabela usuarios')
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error)
    }
  }

  // Função de login
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  // Função de cadastro
  const signUp = async (email: string, password: string, nome: string, tipo: 'cliente' | 'empresa') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) return { error }

      // Inserir dados na tabela usuarios
      if (data.user) {
        const { error: insertError } = await supabase
          .from('usuarios')
          .insert([
            {
              id: data.user.id,
              nome,
              email,
              tipo
            }
          ])

        if (insertError) {
          console.error('Erro ao inserir usuário:', insertError)
          return { error: insertError }
        }
      }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  // Função de logout
  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUsuario(null)
  }

  const value = {
    user,
    usuario,
    loading,
    signIn,
    signUp,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}