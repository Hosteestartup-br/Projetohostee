import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Interfaces TypeScript para o banco de dados
export interface Usuario {
  id: string
  nome: string
  email: string
  tipo: 'cliente' | 'empresa'
  created_at?: string
}

export interface Empresa {
  id: string
  nome: string
  descricao: string
  categoria: string
  latitude: number
  longitude: number
  avaliacao: number
  slug: string
  created_at?: string
}

export interface Servico {
  id: string
  empresa_id: string
  nome: string
  preco: number
  duracao: number
  created_at?: string
}

export interface Agendamento {
  id: string
  usuario_id: string
  empresa_id: string
  servico_id: string
  data: string
  horario: string
  status: 'pendente' | 'confirmado' | 'finalizado' | 'cancelado'
  created_at?: string
}

export interface Avaliacao {
  id: string
  usuario_id: string
  empresa_id: string
  nota: number
  comentario?: string
  created_at?: string
}

// Função para calcular distância entre duas coordenadas
export function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const d = R * c // Distância em km
  return Math.round(d * 10) / 10 // Arredondar para 1 casa decimal
}

// Função para obter localização do usuário
export function obterLocalizacao(): Promise<{latitude: number, longitude: number}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalização não suportada'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      },
      (error) => {
        // Se não conseguir obter localização, usar coordenadas padrão (São Paulo)
        resolve({
          latitude: -23.5505,
          longitude: -46.6333
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  })
}