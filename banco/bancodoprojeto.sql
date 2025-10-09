-- Este é um script SQL completo para criar o banco de dados no Supabase
-- baseado no código fornecido. Ele inclui a criação de tabelas, índices, tudo de forma completa e coerentee fazendo ligação ao codigo e o banco.
-- ele é o banco atual e estee arquivo serve para leitura e compreensão para não reptir nenhum comando no banco e evitar erro.


CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('cliente', 'empresa')),
  agenda_aberta BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela EMPRESAS (Home.tsx + EmpresaDetalhes.tsx)
-- Dados públicos para listagem e busca
CREATE TABLE empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  avaliacao DECIMAL(3, 2) DEFAULT 5.0 CHECK (avaliacao >= 0 AND avaliacao <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela SERVICOS (EmpresaDetalhes.tsx + EmpresaDashboard.tsx)
-- Serviços oferecidos pelas empresas
CREATE TABLE servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  preco DECIMAL(10, 2) NOT NULL CHECK (preco >= 0),
  duracao INTEGER NOT NULL CHECK (duracao > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela AGENDAMENTOS (EmpresaDetalhes.tsx + Dashboards)
-- Sistema completo de agendamentos
CREATE TABLE agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  servico_id UUID NOT NULL REFERENCES servicos(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  horario TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'finalizado', 'cancelado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela AVALIACOES (interface Avaliacao)
-- Sistema de avaliações das empresas
CREATE TABLE avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. ÍNDICES PARA PERFORMANCE (BASEADO NAS CONSULTAS)
-- =====================================================

-- Índices baseados nas consultas do código
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_tipo ON usuarios(tipo);
CREATE INDEX idx_empresas_nome ON empresas(nome);
CREATE INDEX idx_empresas_categoria ON empresas(categoria);
CREATE INDEX idx_empresas_avaliacao ON empresas(avaliacao DESC);
CREATE INDEX idx_servicos_empresa_id ON servicos(empresa_id);
CREATE INDEX idx_servicos_nome ON servicos(nome);
CREATE INDEX idx_agendamentos_usuario_id ON agendamentos(usuario_id);
CREATE INDEX idx_agendamentos_empresa_id ON agendamentos(empresa_id);
CREATE INDEX idx_agendamentos_data ON agendamentos(data);
CREATE INDEX idx_agendamentos_status ON agendamentos(status);
CREATE INDEX idx_agendamentos_created_at ON agendamentos(created_at DESC);
CREATE INDEX idx_avaliacoes_empresa_id ON avaliacoes(empresa_id);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. POLÍTICAS DE SEGURANÇA (BASEADO NO AUTHCONTEXT)
-- =====================================================

-- USUARIOS: Acesso aos próprios dados
CREATE POLICY "usuarios_select_own" ON usuarios
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "usuarios_insert_own" ON usuarios
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "usuarios_update_own" ON usuarios
  FOR UPDATE USING (auth.uid() = id);

-- EMPRESAS: Dados públicos (Home.tsx, Empresas.tsx)
CREATE POLICY "empresas_public_read" ON empresas
  FOR SELECT TO authenticated, anon USING (true);

-- SERVICOS: Públicos para leitura, empresas gerenciam os próprios
CREATE POLICY "servicos_public_read" ON servicos
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "servicos_empresa_manage" ON servicos
  FOR ALL USING (auth.uid() = empresa_id);

-- AGENDAMENTOS: Usuários veem próprios agendamentos
CREATE POLICY "agendamentos_user_access" ON agendamentos
  FOR SELECT USING (auth.uid() = usuario_id OR auth.uid() = empresa_id);

CREATE POLICY "agendamentos_client_create" ON agendamentos
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "agendamentos_user_update" ON agendamentos
  FOR UPDATE USING (auth.uid() = usuario_id OR auth.uid() = empresa_id);

-- AVALIACOES: Públicas para leitura, clientes podem criar
CREATE POLICY "avaliacoes_public_read" ON avaliacoes
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "avaliacoes_client_create" ON avaliacoes
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- =====================================================
-- 6. DADOS DE DEMONSTRAÇÃO (BASEADO NO LOGIN.TSX)
-- =====================================================

-- Usuários demo (Login.tsx mostra essas credenciais)
INSERT INTO usuarios (id, nome, email, tipo) VALUES
  ('b661d4f0-5ec7-4a69-ab56-7fc79d41ee47', 'João Silva', 'cliente@demo.com', 'cliente'),
  ('bdf716b6-aa31-43fd-88cd-9d04ee5e8605', 'Barbearia do João', 'empresa@demo.com', 'empresa');

-- Empresas demo (baseado em Home.tsx e código de geolocalização)
INSERT INTO empresas (id, nome, descricao, categoria, latitude, longitude, avaliacao) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Barbearia do João', 'Barbearia tradicional com mais de 20 anos de experiência. Cortes modernos e clássicos, barba e bigode. Ambiente acolhedor e profissionais qualificados.', 'Barbearia', -23.5505, -46.6333, 4.8),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Salão Beleza Pura', 'Salão de beleza completo para cuidados femininos e masculinos. Cortes, coloração, tratamentos capilares e muito mais.', 'Salão de Beleza', -23.5489, -46.6388, 4.6),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Estética Renovar', 'Centro de estética avançada com tratamentos faciais e corporais. Limpeza de pele, massagens relaxantes e procedimentos estéticos.', 'Estética', -23.5520, -46.6311, 4.9),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Spa Relaxar', 'Spa completo para relaxamento e bem-estar. Massagens terapêuticas, aromaterapia e tratamentos holísticos para corpo e mente.', 'Spa', -23.5478, -46.6401, 4.7),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Clínica Sorrir', 'Clínica odontológica moderna com atendimento humanizado. Tratamentos preventivos, estéticos e especializados para toda família.', 'Odontologia', -23.5534, -46.6298, 4.5),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Academia Força Total', 'Academia completa com equipamentos modernos e personal trainers qualificados. Musculação, cardio e aulas em grupo.', 'Academia', -23.5467, -46.6422, 4.4);

-- Serviços da Barbearia do João (EmpresaDetalhes.tsx mostra apenas esta empresa com serviços)
INSERT INTO servicos (empresa_id, nome, preco, duracao) VALUES
  ('bdf716b6-aa31-43fd-88cd-9d04ee5e8605', 'Corte Masculino', 25.00, 30),
  ('bdf716b6-aa31-43fd-88cd-9d04ee5e8605', 'Barba', 15.00, 20),
  ('bdf716b6-aa31-43fd-88cd-9d04ee5e8605', 'Corte + Barba', 35.00, 45),
  ('bdf716b6-aa31-43fd-88cd-9d04ee5e8605', 'Sobrancelha', 10.00, 15),
  ('bdf716b6-aa31-43fd-88cd-9d04ee5e8605', 'Lavagem + Corte', 30.00, 40);

-- Agendamentos de exemplo (para testar dashboards)
INSERT INTO agendamentos (usuario_id, empresa_id, servico_id, data, horario, status) VALUES
  ('b661d4f0-5ec7-4a69-ab56-7fc79d41ee47', 'bdf716b6-aa31-43fd-88cd-9d04ee5e8605', 
   (SELECT id FROM servicos WHERE nome = 'Corte Masculino' AND empresa_id = 'bdf716b6-aa31-43fd-88cd-9d04ee5e8605' LIMIT 1), 
   CURRENT_DATE + INTERVAL '1 day', '10:00', 'pendente'),
  ('b661d4f0-5ec7-4a69-ab56-7fc79d41ee47', 'bdf716b6-aa31-43fd-88cd-9d04ee5e8605', 
   (SELECT id FROM servicos WHERE nome = 'Corte + Barba' AND empresa_id = 'bdf716b6-aa31-43fd-88cd-9d04ee5e8605' LIMIT 1), 
   CURRENT_DATE + INTERVAL '3 days', '14:30', 'confirmado'),
  ('b661d4f0-5ec7-4a69-ab56-7fc79d41ee47', 'bdf716b6-aa31-43fd-88cd-9d04ee5e8605', 
   (SELECT id FROM servicos WHERE nome = 'Barba' AND empresa_id = 'bdf716b6-aa31-43fd-88cd-9d04ee5e8605' LIMIT 1), 
   CURRENT_DATE - INTERVAL '2 days', '16:00', 'finalizado');

-- Avaliações de exemplo
INSERT INTO avaliacoes (usuario_id, empresa_id, nota, comentario) VALUES
  ('b661d4f0-5ec7-4a69-ab56-7fc79d41ee47', 'bdf716b6-aa31-43fd-88cd-9d04ee5e8605', 5, 'Excelente atendimento! Muito profissional e ambiente agradável.'),
  ('b661d4f0-5ec7-4a69-ab56-7fc79d41ee47', 'bdf716b6-aa31-43fd-88cd-9d04ee5e8605', 4, 'Bom serviço, preço justo. Recomendo a todos!');

-- =====================================================
-- 7. VERIFICAÇÕES E TESTES
-- =====================================================

-- Verificar criação das tabelas
SELECT 
  'TABELAS CRIADAS' as status,
  COUNT(*) as total 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('usuarios', 'empresas', 'servicos', 'agendamentos', 'avaliacoes');

-- Verificar dados inseridos
SELECT 'DADOS INSERIDOS:' as info, '' as tabela, '' as total
UNION ALL
SELECT '', 'usuarios', COUNT(*)::text FROM usuarios
UNION ALL
SELECT '', 'empresas', COUNT(*)::text FROM empresas
UNION ALL
SELECT '', 'servicos', COUNT(*)::text FROM servicos
UNION ALL
SELECT '', 'agendamentos', COUNT(*)::text FROM agendamentos
UNION ALL
SELECT '', 'avaliacoes', COUNT(*)::text FROM avaliacoes;

-- Verificar RLS ativo
SELECT 
  'RLS STATUS:' as info,
  tablename as tabela,
  CASE WHEN rowsecurity THEN 'ATIVO' ELSE 'INATIVO' END as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('usuarios', 'empresas', 'servicos', 'agendamentos', 'avaliacoes')
ORDER BY tablename;

-- Verificar relacionamentos
SELECT 
  'RELACIONAMENTOS:' as info,
  tc.table_name as tabela,
  kcu.column_name as coluna,
  ccu.table_name as referencia
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- Teste específico: Verificar se a Barbearia do João tem serviços
SELECT 
  'TESTE BARBEARIA:' as info,
  u.nome as empresa,
  COUNT(s.id) as total_servicos
FROM usuarios u
LEFT JOIN servicos s ON u.id = s.empresa_id
WHERE u.email = 'empresa@demo.com'
GROUP BY u.nome;

-- Verificar políticas criadas
SELECT 
  'POLÍTICAS RLS:' as info,
  schemaname,
  tablename,
  policyname
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- 8. MENSAGENS FINAIS
-- =====================================================

SELECT '🎉 BANCO HOST.EE RECRIADO COM SUCESSO!' as status;
SELECT '✅ Todas as tabelas criadas baseadas no código atual' as tabelas;
SELECT '🔐 RLS configurado com políticas de segurança' as seguranca;
SELECT '📊 Dados demo inseridos (cliente@demo.com / empresa@demo.com)' as dados;
SELECT '🚀 Pronto para usar com o código atual!' as pronto;

-- Instruções finais
SELECT '📋 PRÓXIMOS PASSOS:' as instrucoes;
SELECT '1. Execute este script no SQL Editor do Supabase' as passo1;
SELECT '2. Verifique se todas as verificações passaram' as passo2;
SELECT '3. Teste login com cliente@demo.com / 123456' as passo3;
SELECT '4. Teste login com empresa@demo.com / 123456' as passo4;
SELECT '5. Verifique se a Barbearia do João tem 5 serviços' as passo5;

-- Adicionais que coloquei com o tempo:

/*
  # Sistema de Notificações

  1. Nova Tabela
    - `notificacoes` - notificações para usuários (clientes e empresas)

  2. Segurança
    - RLS habilitado
    - Usuários veem apenas suas próprias notificações

  3. Triggers Automáticos
    - Criar notificações quando agendamentos são criados
    - Criar notificações quando status de agendamentos muda
*/

CREATE TABLE IF NOT EXISTS notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('agendamento_criado', 'agendamento_confirmado', 'agendamento_em_andamento', 'agendamento_finalizado', 'agendamento_cancelado', 'avaliacao_recebida', 'novo_agendamento')),
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT false,
  data_leitura TIMESTAMPTZ,
  agendamento_id UUID REFERENCES agendamentos(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_id ON notificacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_created_at ON notificacoes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_lida ON notificacoes(usuario_id, lida);

ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'notificacoes'
    AND policyname = 'notificacoes_user_read'
  ) THEN
    CREATE POLICY "notificacoes_user_read" ON notificacoes
      FOR SELECT
      TO authenticated
      USING (auth.uid() = usuario_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'notificacoes'
    AND policyname = 'notificacoes_system_insert'
  ) THEN
    CREATE POLICY "notificacoes_system_insert" ON notificacoes
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'notificacoes'
    AND policyname = 'notificacoes_user_update'
  ) THEN
    CREATE POLICY "notificacoes_user_update" ON notificacoes
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = usuario_id)
      WITH CHECK (auth.uid() = usuario_id);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION criar_notificacao_agendamento()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notificacoes (usuario_id, tipo, titulo, mensagem, agendamento_id)
  VALUES (
    NEW.usuario_id,
    'agendamento_criado',
    'Agendamento Criado',
    'Seu agendamento foi criado com sucesso e está aguardando confirmação.',
    NEW.id
  );

  INSERT INTO notificacoes (usuario_id, tipo, titulo, mensagem, agendamento_id)
  VALUES (
    NEW.empresa_id,
    'novo_agendamento',
    'Novo Agendamento',
    'Você recebeu um novo agendamento. Verifique os detalhes e confirme.',
    NEW.id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_criar_notificacao_agendamento ON agendamentos;
CREATE TRIGGER trigger_criar_notificacao_agendamento
  AFTER INSERT ON agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION criar_notificacao_agendamento();

CREATE OR REPLACE FUNCTION notificar_mudanca_status()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    INSERT INTO notificacoes (usuario_id, tipo, titulo, mensagem, agendamento_id)
    VALUES (
      NEW.usuario_id,
      CASE NEW.status
        WHEN 'confirmado' THEN 'agendamento_confirmado'
        WHEN 'finalizado' THEN 'agendamento_finalizado'
        WHEN 'cancelado' THEN 'agendamento_cancelado'
        ELSE 'agendamento_em_andamento'
      END,
      CASE NEW.status
        WHEN 'confirmado' THEN 'Agendamento Confirmado'
        WHEN 'finalizado' THEN 'Agendamento Finalizado'
        WHEN 'cancelado' THEN 'Agendamento Cancelado'
        ELSE 'Status Atualizado'
      END,
      CASE NEW.status
        WHEN 'confirmado' THEN 'Seu agendamento foi confirmado pela empresa!'
        WHEN 'finalizado' THEN 'Seu agendamento foi finalizado. Avalie o serviço!'
        WHEN 'cancelado' THEN 'Seu agendamento foi cancelado.'
        ELSE 'O status do seu agendamento foi atualizado.'
      END,
      NEW.id
    );

    IF NEW.status = 'cancelado' THEN
      INSERT INTO notificacoes (usuario_id, tipo, titulo, mensagem, agendamento_id)
      VALUES (
        NEW.empresa_id,
        'agendamento_cancelado',
        'Agendamento Cancelado',
        'Um cliente cancelou um agendamento.',
        NEW.id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notificar_mudanca_status ON agendamentos;
CREATE TRIGGER trigger_notificar_mudanca_status
  AFTER UPDATE ON agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION notificar_mudanca_status();

  /*
  # Adicionar campo slug na tabela empresas

  1. Alterações
    - Adicionar coluna `slug` na tabela `empresas`
    - Criar índice único para `slug`
    - Popular slugs existentes baseado nos nomes

  2. Detalhes
    - Slug será usado para URLs amigáveis (ex: /empresa/barbearia-do-joao)
    - Índice único garante que não haverá slugs duplicados
*/

ALTER TABLE empresas ADD COLUMN IF NOT EXISTS slug TEXT;

UPDATE empresas 
SET slug = LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(nome, 'ã', 'a'), 'á', 'a'), 'é', 'e'), 'ú', 'u'), ' ', '-'))
WHERE slug IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_empresas_slug ON empresas(slug);

ALTER TABLE empresas ALTER COLUMN slug SET NOT NULL;