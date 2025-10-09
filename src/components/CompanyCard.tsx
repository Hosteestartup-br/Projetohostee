/**
 * Componente Card de Empresa Moderno
 * Estilo inspirado no Booksy
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Star } from 'lucide-react';
import { Empresa } from '../lib/supabase';

interface CompanyCardProps {
  empresa: Empresa;
  distancia?: number;
  onClick: () => void;
}

export default function CompanyCard({ empresa, distancia, onClick }: CompanyCardProps) {
  const { t } = useTranslation();

  // Função para obter a imagem da empresa
  const getCompanyImage = (nomeEmpresa: string) => {
    // Mapeamento direto de cada empresa para sua imagem
    const empresaImages: { [key: string]: string } = {
      'Barbearia do João': '/images/empresas/barbearia-do-joao.jpg',
      'Salão Beleza Pura': '/images/empresas/salao-beleza-pura.jpg',
      'Estética Renovar': '/images/empresas/estetica-renovar.jpg',
      'Spa Relaxar': '/images/empresas/spa-relaxar.jpg',
      'Clínica Sorrir': '/images/empresas/clinica-sorrir.jpg',
      'Academia Força Total': '/images/empresas/academia-forca-total.jpg'
    };

    // Retorna a imagem específica da empresa ou a padrão
    return empresaImages[nomeEmpresa] || '/images/empresas/default.jpg';
  };

  // Gerar endereço fictício baseado na localização
  const generateAddress = (lat: number, lng: number) => {
    const streets = ['Rua das Flores', 'Av. Paulista', 'Rua Augusta', 'Rua Oscar Freire', 'Av. Faria Lima'];
    const neighborhoods = ['Vila Madalena', 'Pinheiros', 'Jardins', 'Moema', 'Itaim Bibi'];
    
    const streetIndex = Math.abs(Math.floor(lat * 1000)) % streets.length;
    const neighborhoodIndex = Math.abs(Math.floor(lng * 1000)) % neighborhoods.length;
    const number = Math.abs(Math.floor((lat + lng) * 1000)) % 9999 + 1;
    
    return `${streets[streetIndex]}, ${number} - ${neighborhoods[neighborhoodIndex]}, São Paulo - SP`;
  };

  const address = generateAddress(empresa.latitude, empresa.longitude);

  return (
    <div className="company-card-modern" onClick={onClick}>
      <div className="company-image">
        <img 
          src={getCompanyImage(empresa.nome)}
          alt={empresa.nome}
          loading="lazy"
          onError={(e) => {
            // Se a imagem específica falhar, usar a padrão
            const target = e.target as HTMLImageElement;
            if (target.src !== '/images/empresas/default.jpg') {
              target.src = '/images/empresas/default.jpg';
            }
          }}
        />
        <div className="company-rating-badge">
          <Star size={14} fill="currentColor" />
          <span>{empresa.avaliacao.toFixed(1)}</span>
        </div>
      </div>
      
      <div className="company-info">
        <h3 className="company-name">{empresa.nome}</h3>
        <p className="company-category">{empresa.categoria}</p>
        
        <div className="company-address">
          <MapPin size={14} />
          <span>{address}</span>
        </div>
        
        {distancia && (
          <p className="company-distance">
            {t('home.distance', { distance: distancia.toFixed(1) })}
          </p>
        )}
        
        <p className="company-description">{empresa.descricao}</p>
        
        <button className="company-view-btn">
          {t('home.viewDetails')}
        </button>
      </div>
    </div>
  );
}