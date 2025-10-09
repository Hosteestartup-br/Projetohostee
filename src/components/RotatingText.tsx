/**
 * Componente de Texto Rotativo
 * Exibe frases inspiradoras com efeito de máquina de escrever
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function RotatingText() {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const texts = t('home.heroTexts', { returnObjects: true }) as string[];
  const currentText = texts[currentIndex] || '';

  useEffect(() => {
    let typingTimer: NodeJS.Timeout;
    let pauseTimer: NodeJS.Timeout;
    
    if (isTyping) {
      // Efeito de digitação
      if (displayedText.length < currentText.length) {
        typingTimer = setTimeout(() => {
          setDisplayedText(currentText.slice(0, displayedText.length + 1));
        }, 80); // Velocidade de digitação
      } else {
        // Texto completo digitado, pausar antes de apagar
        setIsTyping(false);
        pauseTimer = setTimeout(() => {
          setIsTyping(true);
          setDisplayedText('');
          setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length);
        }, 2500); // Pausa após completar o texto
      }
    }

    return () => {
      clearTimeout(typingTimer);
      clearTimeout(pauseTimer);
    };
  }, [displayedText, currentText, isTyping, texts.length]);

  return (
    <h1 className="typewriter-text">
      {displayedText}
      <span className="cursor">.</span>
    </h1>
  );
}