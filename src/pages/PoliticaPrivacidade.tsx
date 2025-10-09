/**
 * Página de Política de Privacidade
 * Informações sobre tratamento de dados pessoais
 */
import React from 'react'
import { useTranslation } from 'react-i18next'

export default function PoliticaPrivacidade() {
  const { t } = useTranslation()

  return (
    <div className="politica-page">
      <div className="container">
        <div className="politica-content">
          <h1>{t('privacy.title')}</h1>
          <p className="ultima-atualizacao">{t('privacy.lastUpdated')}</p>
          
          <section className="politica-section">
            <h2>1. {t('privacy.generalInfo')}</h2>
            <p>
              A Host.ee está comprometida em proteger a privacidade e os dados pessoais de nossos usuários. 
              Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas 
              informações quando você utiliza nossa plataforma de agendamento de serviços.
            </p>
          </section>

          <section className="politica-section">
            <h2>2. {t('privacy.dataCollection')}</h2>
            <h3>2.1 Informações Fornecidas por Você</h3>
            <ul>
              <li>Nome completo ou nome da empresa</li>
              <li>Endereço de e-mail</li>
              <li>Senha (armazenada de forma criptografada)</li>
              <li>Tipo de conta (cliente ou empresa)</li>
              <li>Informações de localização (quando autorizado)</li>
              <li>Dados de agendamentos e serviços</li>
            </ul>

            <h3>2.2 Informações Coletadas Automaticamente</h3>
            <ul>
              <li>Endereço IP</li>
              <li>Tipo de navegador e dispositivo</li>
              <li>Páginas visitadas e tempo de permanência</li>
              <li>Data e hora de acesso</li>
              <li>Localização geográfica (quando autorizada)</li>
            </ul>
          </section>

          <section className="politica-section">
            <h2>3. {t('privacy.dataUsage')}</h2>
            <ul>
              <li>Fornecer e manter nossos serviços</li>
              <li>Processar agendamentos e transações</li>
              <li>Comunicar sobre seus agendamentos</li>
              <li>Melhorar nossa plataforma e experiência do usuário</li>
              <li>Enviar notificações importantes sobre o serviço</li>
              <li>Prevenir fraudes e garantir segurança</li>
              <li>Cumprir obrigações legais</li>
            </ul>
          </section>

          <section className="politica-section">
            <h2>4. {t('privacy.dataSharing')}</h2>
            <p>
              Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, 
              exceto nas seguintes situações:
            </p>
            <ul>
              <li>Com seu consentimento explícito</li>
              <li>Para processar agendamentos entre clientes e empresas</li>
              <li>Para cumprir obrigações legais</li>
              <li>Para proteger nossos direitos e segurança</li>
              <li>Com provedores de serviços que nos auxiliam (sob acordos de confidencialidade)</li>
            </ul>
          </section>

          <section className="politica-section">
            <h2>5. {t('privacy.dataSecurity')}</h2>
            <p>
              Implementamos medidas de segurança técnicas e organizacionais para proteger 
              suas informações pessoais:
            </p>
            <ul>
              <li>Criptografia de dados em trânsito e em repouso</li>
              <li>Autenticação segura com tokens JWT</li>
              <li>Controle de acesso baseado em funções</li>
              <li>Monitoramento contínuo de segurança</li>
              <li>Backups regulares e seguros</li>
              <li>Servidores protegidos e atualizados</li>
            </ul>
          </section>

          <section className="politica-section">
            <h2>6. {t('privacy.yourRights')}</h2>
            <p>Você tem os seguintes direitos em relação aos seus dados pessoais:</p>
            <ul>
              <li><strong>Acesso:</strong> Solicitar cópia dos seus dados pessoais</li>
              <li><strong>Retificação:</strong> Corrigir dados incorretos ou incompletos</li>
              <li><strong>Exclusão:</strong> Solicitar a remoção dos seus dados</li>
              <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
              <li><strong>Oposição:</strong> Opor-se ao processamento dos seus dados</li>
              <li><strong>Limitação:</strong> Solicitar limitação do processamento</li>
            </ul>
          </section>

          <section className="politica-section">
            <h2>7. {t('privacy.cookies')}</h2>
            <p>
              Utilizamos cookies e tecnologias similares para melhorar sua experiência:
            </p>
            <ul>
              <li>Cookies essenciais para funcionamento da plataforma</li>
              <li>Cookies de autenticação para manter você logado</li>
              <li>Cookies de preferências para lembrar suas configurações</li>
              <li>Cookies analíticos para entender o uso da plataforma</li>
            </ul>
          </section>

          <section className="politica-section">
            <h2>8. {t('privacy.dataRetention')}</h2>
            <p>
              Mantemos seus dados pessoais apenas pelo tempo necessário para:
            </p>
            <ul>
              <li>Fornecer nossos serviços</li>
              <li>Cumprir obrigações legais</li>
              <li>Resolver disputas</li>
              <li>Fazer cumprir nossos acordos</li>
            </ul>
            <p>
              Dados de agendamentos são mantidos por 5 anos após a conclusão do serviço. 
              Dados de conta são mantidos enquanto a conta estiver ativa.
            </p>
          </section>

          <section className="politica-section">
            <h2>9. {t('privacy.internationalTransfer')}</h2>
            <p>
              Seus dados podem ser processados em servidores localizados fora do Brasil. 
              Garantimos que todas as transferências são realizadas com adequadas salvaguardas 
              de segurança e em conformidade com a LGPD.
            </p>
          </section>

          <section className="politica-section">
            <h2>10. {t('privacy.minors')}</h2>
            <p>
              Nossa plataforma não é destinada a menores de 18 anos. Não coletamos 
              intencionalmente informações pessoais de menores. Se tomarmos conhecimento 
              de que coletamos dados de um menor, tomaremos medidas para excluí-los.
            </p>
          </section>

          <section className="politica-section">
            <h2>11. {t('privacy.policyChanges')}</h2>
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos 
              sobre mudanças significativas através de:
            </p>
            <ul>
              <li>E-mail para usuários registrados</li>
              <li>Aviso em nossa plataforma</li>
              <li>Atualização da data de "última atualização"</li>
            </ul>
          </section>

          <section className="politica-section">
            <h2>12. {t('privacy.contact')}</h2>
            <p>
              Para questões sobre esta Política de Privacidade ou seus dados pessoais, 
              entre em contato conosco:
            </p>
            <div className="contato-info">
              <p><strong>E-mail:</strong> contato@hosteestartup.com.br</p>
              <p><strong>Telefone:</strong> (11) 98722-3521</p>
              <p><strong>Endereço:</strong> Av. Dr. Ussiel Cirilo, 111 - 213, SP - Brasil</p>
            </div>
          </section>

          <section className="politica-section">
            <h2>13. {t('privacy.legalBasis')}</h2>
            <p>
              O processamento dos seus dados pessoais é baseado nas seguintes bases legais 
              da Lei Geral de Proteção de Dados (LGPD):
            </p>
            <ul>
              <li>Execução de contrato (agendamentos e serviços)</li>
              <li>Consentimento (marketing e comunicações opcionais)</li>
              <li>Legítimo interesse (segurança e melhoria dos serviços)</li>
              <li>Cumprimento de obrigação legal</li>
            </ul>
          </section>

          <div className="politica-footer">
            <p>
              Esta Política de Privacidade foi elaborada em conformidade com a 
              Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018) e demais 
              regulamentações aplicáveis.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}