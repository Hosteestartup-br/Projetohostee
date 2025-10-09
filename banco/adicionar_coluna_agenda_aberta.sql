-- Adicionar coluna agenda_aberta à tabela usuarios
-- Execute este SQL no seu banco de dados atual

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS agenda_aberta BOOLEAN DEFAULT true;

-- Atualizar empresas existentes para ter agenda aberta
UPDATE usuarios SET agenda_aberta = true WHERE tipo = 'empresa';

-- Criar índice para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_usuarios_agenda_aberta ON usuarios(agenda_aberta) WHERE tipo = 'empresa';
