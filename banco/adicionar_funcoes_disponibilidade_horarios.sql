/*
  # Funções para Controle de Disponibilidade de Horários

  ## 1. Função verificar_disponibilidade_horario
    - Verifica se a agenda da empresa está aberta
    - Verifica conflitos de horário com agendamentos existentes
    - Considera a duração do serviço para evitar sobreposição
    - Retorna true se o horário está disponível, false caso contrário

  ## 2. Função listar_horarios_disponiveis
    - Lista todos os horários do dia com status de disponibilidade
    - Considera a duração do serviço solicitado
    - Retorna tabela com horário e status (disponível/indisponível)

  ## 3. Notas Importantes
    - Horários de funcionamento: 08:00-12:00 e 14:00-18:00
    - Intervalos de 30 minutos entre agendamentos
    - Sistema previne conflitos automaticamente
*/

-- Função para verificar disponibilidade de horário
CREATE OR REPLACE FUNCTION verificar_disponibilidade_horario(
  p_empresa_id UUID,
  p_data DATE,
  p_horario TIME,
  p_duracao INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_agenda_aberta BOOLEAN;
  v_conflitos INTEGER;
  v_horario_fim TIME;
BEGIN
  -- Verificar se a agenda da empresa está aberta
  SELECT agenda_aberta INTO v_agenda_aberta
  FROM usuarios
  WHERE id = p_empresa_id AND tipo = 'empresa';
  
  IF NOT FOUND OR NOT v_agenda_aberta THEN
    RETURN false;
  END IF;
  
  -- Calcular horário de término do serviço
  v_horario_fim := p_horario + (p_duracao || ' minutes')::INTERVAL;
  
  -- Verificar conflitos de horário (agendamentos confirmados ou pendentes)
  SELECT COUNT(*) INTO v_conflitos
  FROM agendamentos a
  INNER JOIN servicos s ON a.servico_id = s.id
  WHERE a.empresa_id = p_empresa_id
    AND a.data = p_data
    AND a.status IN ('pendente', 'confirmado')
    AND (
      -- Novo agendamento começa durante um agendamento existente
      (p_horario >= a.horario AND p_horario < (a.horario + (s.duracao || ' minutes')::INTERVAL))
      OR
      -- Novo agendamento termina durante um agendamento existente
      (v_horario_fim > a.horario AND v_horario_fim <= (a.horario + (s.duracao || ' minutes')::INTERVAL))
      OR
      -- Novo agendamento engloba completamente um agendamento existente
      (p_horario <= a.horario AND v_horario_fim >= (a.horario + (s.duracao || ' minutes')::INTERVAL))
    );
  
  RETURN v_conflitos = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para listar horários disponíveis de uma empresa em uma data
CREATE OR REPLACE FUNCTION listar_horarios_disponiveis(
  p_empresa_id UUID,
  p_data DATE,
  p_duracao INTEGER DEFAULT 30
)
RETURNS TABLE(horario TIME, disponivel BOOLEAN) AS $$
DECLARE
  v_horarios TIME[] := ARRAY['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
                              '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30']::TIME[];
  v_horario TIME;
BEGIN
  FOREACH v_horario IN ARRAY v_horarios
  LOOP
    RETURN QUERY SELECT 
      v_horario,
      verificar_disponibilidade_horario(p_empresa_id, p_data, v_horario, p_duracao);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários nas funções
COMMENT ON FUNCTION verificar_disponibilidade_horario IS 'Verifica se um horário está disponível considerando agenda aberta e conflitos';
COMMENT ON FUNCTION listar_horarios_disponiveis IS 'Lista todos os horários do dia com status de disponibilidade';
