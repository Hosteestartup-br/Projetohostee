# Correção do Sistema de Agenda

## Problema Identificado

O banco de dados atual não possui a coluna `agenda_aberta` na tabela `usuarios`, que é necessária para:
1. Controlar se a empresa está aceitando agendamentos
2. As funções de disponibilidade verificarem se a agenda está aberta
3. O dashboard da empresa poder abrir/fechar a agenda

## Solução

### PASSO 1: Execute o SQL no seu banco de dados

Abra o arquivo `banco/adicionar_coluna_agenda_aberta.sql` e execute todo o conteúdo no seu banco de dados.

Este arquivo contém:
- Adiciona a coluna `agenda_aberta` (tipo BOOLEAN, padrão true)
- Atualiza todas as empresas existentes para ter agenda aberta
- Cria um índice para otimizar consultas

### PASSO 2: Verifique se funcionou

Após executar o SQL:
1. Faça login como empresa (empresa@demo.com)
2. Vá para o Dashboard
3. Tente clicar em "Fechar Agenda" - agora deve funcionar sem erros
4. Faça login como cliente (cliente@demo.com)
5. Acesse a página de uma empresa
6. Selecione um serviço e uma data - os horários devem carregar corretamente

## O que foi corrigido no código

1. **EmpresaDashboard.tsx**:
   - Verifica se a coluna existe antes de tentar alterar o status
   - Mostra mensagem clara caso o SQL ainda não tenha sido executado

2. **EmpresaDetalhes.tsx**:
   - Corrigido o loop infinito ao carregar horários disponíveis
   - Remove empresaId das dependências do useEffect

3. **banco/bancodoprojeto.sql**:
   - Atualizada a documentação para incluir a coluna agenda_aberta

## Arquivos Criados/Modificados

### Novo arquivo:
- `banco/adicionar_coluna_agenda_aberta.sql` - SQL para adicionar a coluna

### Arquivos modificados:
- `src/pages/EmpresaDashboard.tsx` - Corrigido carregamento e alteração de status
- `src/pages/EmpresaDetalhes.tsx` - Corrigido loop infinito de horários
- `banco/bancodoprojeto.sql` - Documentação atualizada

## Importante

- As funções `verificar_disponibilidade_horario` e `listar_horarios_disponiveis` já existem
- Elas dependem da coluna `agenda_aberta` para funcionar corretamente
- Após executar o SQL, tudo funcionará automaticamente
