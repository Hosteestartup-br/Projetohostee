/**
 * Componente Seletor de Idioma
 * Permite alternar entre Português e Inglês
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'pt' ? 'en' : 'pt';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="language-selector"
      title={i18n.language === 'pt' ? 'Switch to English' : 'Mudar para Português'}
    >
      <Globe size={18} />
      <span>{i18n.language === 'pt' ? 'EN' : 'PT'}</span>
    </button>
  );
}