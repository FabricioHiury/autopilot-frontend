'use client'
import { useState, useRef } from 'react';

interface TermsModalProps {
  onAccept: () => void;
  onClose: () => void;
}

export default function TermsModal({ onAccept, onClose }: TermsModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;

      if (isAtBottom && !hasScrolledToBottom) {
        setHasScrolledToBottom(true);
      }
    }
  };

  const handleAccept = () => {
    onAccept();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 flex-shrink-0">
          <h1 className="text-2xl font-bold text-[#1B263A]">Termo de Uso e Política de Privacidade</h1>
          <button
            onClick={onClose}
            className="text-[#485B80] hover:text-[#D33632] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        >
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[#1B263A] mb-4">1. Sobre o AUTOPILOT:</h2>
              <div className="text-[#485B80] space-y-4 text-sm">
                <p className="mb-4">
                  <strong>1.1.</strong> Este site/aplicativo é de propriedade, mantido e operado por AUTOPILOT I.S., com sede na Rua 32, número 580, Bloco 01, Apartamento 504 – Bairro JK Setor Oeste – Município de Anápolis (GO), inscrito no CNPJ sob o nº 53.535.764/0001-48.
                </p>
                <p className="mb-4">
                  <strong>1.2.</strong> O sistema consiste em uma plataforma de gestão integrada, voltada para lojas de venda e revenda de veículos novos e seminovos. Suas funcionalidades abrangem o controle de estoque, finanças, anúncios e atendimentos. A proposta da ferramenta é centralizar, em um único ambiente, as diversas etapas do funil de vendas. Ao anunciar veículos em "vitrines virtuais", como Instagram, OLX e Facebook, o usuário poderá receber e responder mensagens originadas nesses canais, além de conduzir as negociações diretamente dentro da própria plataforma AUTOPILOT.
                </p>
                <p className="mb-4">
                  <strong>1.3.</strong> Ao utilizar os serviços oferecidos pela AUTOPILOT, o usuário/cliente concordará integralmente com os presentes Termos e Condições de Uso & Política de Privacidade e Segurança de Dados. Caso não concorde com qualquer disposição deste documento, deverá interromper imediatamente o uso da plataforma.
                </p>
                <p className="mb-4">
                  <strong>1.4.</strong> Este Termo poderá ser alterado a qualquer momento, seja por motivos legais ou por decisões estratégicas da AUTOPILOT. O cliente/usuário reconhece, desde já, que é de sua inteira responsabilidade verificar periodicamente o conteúdo atualizado deste Termo, disponível no endereço eletrônico: https://app.autopilot.com.br/terms-of-use.
                </p>
                <p className="mb-4">
                  <strong>1.5.</strong> A AUTOPILOT informará, com destaque, quaisquer alterações relacionadas à finalidade específica do tratamento de dados pessoais, à forma e duração do tratamento, à identificação do controlador e/ou às informações sobre o compartilhamento de dados e suas respectivas finalidades. Quando for exigido o consentimento, o cliente/usuário poderá revogá-lo caso discorde das alterações. Para as demais modificações, a AUTOPILOT poderá, a seu exclusivo critério, comunicá-las por meio de aviso na página principal da plataforma. No entanto, essa comunicação não exime o cliente/usuário do dever de acompanhar regularmente este Termo.
                </p>
                <p className="mb-4">
                  <strong>1.6.</strong> As alterações realizadas neste Termo não terão aplicação retroativa, entrando em vigor a partir da data de sua publicação. Modificações decorrentes de mudanças na legislação nacional ou da implementação de novas funcionalidades da plataforma AUTOPILOT seguirão a mesma regra, dispensando qualquer aviso prévio.
                </p>
                <p className="mb-4">
                  <strong>1.7.</strong> Caso sejam realizadas alterações neste Termo e o cliente/usuário não solicite o cancelamento de seu cadastro, entender-se-á, automaticamente, que as modificações foram aceitas integralmente, salvo nos casos em que a legislação exigir consentimento expresso.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[#1B263A] mb-4">2. Diretrizes gerais de acesso e Uso do AUTOPILOT:</h2>
              <div className="text-[#485B80] space-y-4 text-sm">
                <p className="mb-4">
                  <strong>2.1.</strong> Para assegurar seus direitos legais, especialmente no que se refere à privacidade e à segurança de suas informações, o presente Termo tem como finalidade informar o usuário sobre a forma de tratamento de seus dados pessoais, bem como dos registros de sua navegação na plataforma.
                </p>
                <p className="mb-4">
                  <strong>2.2.</strong> Este Termo poderá ser modificado, total ou parcialmente, a qualquer tempo, em razão de alterações legislativas, da implementação de novas funcionalidades ou ferramentas tecnológicas, ou ainda, sempre que a AUTOPILOT entender necessário, a seu exclusivo critério. É responsabilidade do cliente/usuário consultar os Termos atualizados antes de acessar ou utilizar a plataforma.
                </p>
                <p className="mb-4">
                  <strong>2.3.</strong> O cliente/usuário compromete-se a não fazer uso indevido dos serviços, nem a tentar acessá-los por meios diversos dos disponibilizados oficialmente. A utilização da plataforma deverá ocorrer em conformidade com a legislação vigente no Brasil. A AUTOPILOT poderá suspender ou encerrar a prestação dos serviços caso identifique descumprimento destes Termos, de suas políticas internas ou no caso de investigação de conduta suspeita, fraudulenta ou criminosa.
                </p>
                <p className="mb-4">
                  <strong>2.4.</strong> A utilização dos serviços oferecidos pela AUTOPILOT não confere ao cliente/usuário qualquer direito sobre a propriedade intelectual ou sobre os conteúdos acessados. É vedado ao cliente/usuário utilizar os conteúdos da plataforma sem a devida autorização ou salvo nos casos expressamente permitidos por lei. Estes Termos não concedem ao cliente/usuário o direito de utilizar marcas, logotipos ou qualquer outro elemento distintivo associado à AUTOPILOT. É igualmente proibido remover, ocultar ou alterar avisos legais exibidos na plataforma.
                </p>
                <p className="mb-4">
                  <strong>2.5.</strong> A AUTOPILOT poderá enviar ao cliente/usuário anúncios de serviços, comunicações administrativas, bem como informações de cunho publicitário e promocional, respeitadas as disposições legais aplicáveis, especialmente as previstas na Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[#1B263A] mb-4">3. Conta AUTOPILOT:</h2>
              <div className="text-[#485B80] space-y-4 text-sm">
                <p className="mb-4">
                  <strong>3.1.</strong> Para receber seus dados de acesso para a sua Conta AUTOPILOT, o cliente/usuário poderá ser solicitado a apresentar seu nome completo, endereço de e-mail, telefone, número de inscrição junto ao CADASTRO DE PESSOAS FÍSICAS (CPF) ou CADASTRO NACIONAL DE PESSOAS JURÍDICAS (CNPJ). Além disso, será possível vincular – mediante login e senha genuínos – a sincronização com outras plataformas digitais de vendas como: OLX, FACEBOOK (MARKETPLACE), WHASTAPP e INSTAGRAM. Indicados estes que serão coletados e tratados nos termos da Política de Privacidade e Segurança de Dados adiante (ou somente "Política").
                </p>
                <p className="mb-4">
                  <strong>3.2.</strong> Para proteger sua Conta AUTOPILOT, o cliente/usuário deve manter a senha em sigilo. A atividade realizada pelo cliente/usuário ou por seu intermédio é de sua total responsabilidade. Não recomendamos que a senha da Conta AUTOPILOT seja reutilizada em aplicativos de terceiros. Caso tome conhecimento de uso não autorizado da sua senha, o cliente/usuário deverá acessar a plataforma e realizar a troca da senha (inserir aqui o passo a passo de como redefinir a senha do usuário).
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[#1B263A] mb-4">4. Uso da Plataforma AUTOPILOT:</h2>
              <div className="text-[#485B80] space-y-4 text-sm">
                <p className="mb-4">
                  <strong>4.1.</strong> A AUTOPILOT não se responsabiliza por transações realizadas entre o cliente/usuário e o consumidor final. A plataforma tem como finalidade oferecer uma gestão integrada, com funcionalidades voltadas ao controle de estoque, finanças, anúncios e atendimentos.
                </p>
                <p className="mb-4">
                  <strong>4.2.</strong> Ao realizar uma venda, é de responsabilidade exclusiva do cliente/usuário consultar, junto à instituição financeira envolvida, a confirmação do recebimento dos valores conforme os termos acordados entre as partes. A finalização da negociação, bem como a entrega ou transferência do veículo, somente deverá ocorrer após a comprovação do referido recebimento.
                </p>
                <p className="mb-4">
                  <strong>4.3.</strong> As decisões e escolhas efetuadas pelo cliente/usuário durante sua jornada na plataforma são de sua exclusiva responsabilidade. A AUTOPILOT atua como ferramenta de apoio à gestão do negócio, não podendo ser responsabilizada pelas decisões comerciais adotadas, as quais são de responsabilidade integral do cliente/usuário.
                </p>
                <p className="mb-4">
                  <strong>4.4.</strong> A AUTOPILOT não se responsabiliza pelo mau funcionamento da plataforma em dispositivos ou navegadores que não estejam devidamente atualizados.
                </p>
                <p className="mb-4">
                  <strong>4.5.</strong> A AUTOPILOT não garante o funcionamento adequado da plataforma em casos de instabilidade, falhas ou interrupções de conexão com a internet, sendo essas de responsabilidade do provedor de acesso utilizado pelo cliente/usuário.
                </p>
                <p className="mb-4">
                  <strong>4.6.</strong> Problemas de acesso à plataforma deverão ser reportados por meio do seguinte procedimento:<br />
                  (Inserir aqui o passo a passo que deve ser seguido pelo cliente/usuário para relatar erros de acesso).<br />
                  As solicitações serão respondidas em até 48 (quarenta e oito) horas úteis, contadas a partir da confirmação de recebimento da comunicação pela AUTOPILOT.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[#1B263A] mb-4">5. Como modificar, cancelar e desistir dos nossos Serviços</h2>
              <div className="text-[#485B80] space-y-4 text-sm">
                <p className="mb-4">
                  <strong>5.1.</strong> Os serviços prestados pela AUTOPILOT estão em constantes mudanças, com o intuito de melhorar a experiência do cliente/usuário. Por tal razão, a AUTOPILOT poderá incluir ou remover funcionalidades do seu site/aplicativo, a seu critério, bem como suspender ou encerrar serviços por completo, em hipóteses de utilização indevida e/ou ilegal da plataforma.
                </p>
                <p className="mb-4">
                  <strong>5.2.</strong> O cliente/usuário pode deixar de usar nossos serviços a qualquer momento, e poderá solicitar a mudança ou cancelamento de sua conta por um dos meios de comunicação: (INSERIR O PASSO A PASSO DE COMO REALIZAR O CANCELAMENTO).
                </p>
                <p className="mb-4">
                  <strong>5.3.</strong> Caso o cliente/usuário adquira algum PRODUTO no AUTOPILOT e posteriormente queira cancelar a contratação, deverá requerer tal cancelamento diretamente ao comercial responsável por sua loja, nos termos da lei e dos Termos de Adesão do produto/serviço.
                </p>
                <p className="mb-4">
                  <strong>5.4.</strong> Como proprietário de seus dados, o cliente/usuário terá preservado seu acesso aos mesmos. Se algum serviço da AUTOPILOT for descontinuado, o usuário será informado com antecedência suficiente para que possa retirar suas informações cadastrais do site.
                </p>
                <p className="mb-4">
                  <strong>5.5.</strong> A plataforma oferece duas formas de contratação, mediante plano mensal e plano anual. Ao cancelar o plano mensal, não há reembolso ou cobrança de multa. O cancelamento impede a renovação automática do período seguinte. Neste caso, feito o cancelamento, o cliente/usuário gozará da plataforma pelo período adquirido.
                </p>
                <p className="mb-4">
                  <strong>5.6.</strong> Quanto ao plano anual, caso haja o cancelamento antes do término da vigência dá direito ao reembolso proporcional ao período restante, com aplicação de multa rescisória de 20% (vinte por cento) sobre o valor proporcional remanescente. O reembolso se dará mediante pelo mesmo meio de pagamento utilizado para contratação.
                </p>
                <p className="mb-4">
                  <strong>5.7.</strong> A AUTOPILOT poderá cancelar o plano, INDEPENDENTE DE AVISO PRÉVIO, em caso de inadimplementos superiores à 15 (quinze) dias. Com prévio aviso, em casos de descumprimento contratual e utilização indevida dos serviços, especialmente em desacordo com a finalidade contratada ou para fins ilícitos.
                </p>
                <p className="mb-4">
                  <strong>5.8 –</strong> O cliente/usuário, poderá solicitar demonstrativo detalhado dos valores calculados no cancelamento.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[#1B263A] mb-4">6. Responsabilidade pelos nossos Serviços:</h2>
              <div className="text-[#485B80] space-y-4 text-sm">
                <p className="mb-4">
                  <strong>6.1.</strong> A AUTOPILOT e seus parceiros não se responsabilizam pela forma como a plataforma é utilizada pelos clientes/usuários. A contratação dos serviços, a execução das atividades e a maneira de interação com o sistema são de inteira e exclusiva responsabilidade do cliente/usuário.
                </p>
                <p className="mb-4">
                  <strong>6.2.</strong> Em qualquer hipótese, a AUTOPILOT e seus parceiros comerciais não serão responsabilizados por perdas, danos ou prejuízos decorrentes da má utilização da plataforma, do uso contrário à legislação vigente ou de situações que não sejam razoavelmente previsíveis.
                </p>
              </div>
            </section>

            {/* Informações de Contato */}
            <section className="mb-8 bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-[#1B263A] mb-4">Informações de Contato</h2>
              <div className="text-[#485B80] space-y-2 text-sm">
                <p><strong>Empresa:</strong> AUTOPILOT I.S.</p>
                <p><strong>CNPJ:</strong> 53.535.764/0001-48</p>
                <p><strong>Endereço:</strong> Rua 32, número 580, Bloco 01, Apartamento 504</p>
                <p><strong>Bairro:</strong> JK Setor Oeste</p>
                <p><strong>Cidade:</strong> Anápolis (GO)</p>
                <p><strong>Website:</strong> https://app.autopilot.com.br</p>
              </div>
            </section>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-[#485B80] text-sm text-center">
                © {new Date().getFullYear()} AutoPilot CRM. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>

        {/* Indicador de scroll obrigatório */}
        {!hasScrolledToBottom && (
          <div className="mx-6 mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex-shrink-0">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm text-yellow-800">
                Role até o final para aceitar os termos de uso
              </p>
            </div>
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex justify-end gap-3 px-6 pb-6 pt-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 text-[#485B80] border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleAccept}
            disabled={!hasScrolledToBottom}
            className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${hasScrolledToBottom
              ? 'bg-[#1B263A] text-white hover:bg-[#2a3441]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            {hasScrolledToBottom ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Li e aceito os termos
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Role até o final
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}