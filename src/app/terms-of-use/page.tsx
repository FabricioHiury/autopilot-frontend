'use client'

import { useRouter } from 'next/navigation';

export default function TermsOfUsePage() {
  const router = useRouter();

  return (
    <div className="bg-gray-50 py-8 overflow-y-auto max-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="mb-4 text-[#1B263A] hover:text-[#D33632] transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>
            <h1 className="text-3xl font-bold text-[#1B263A] mb-2">Termo de Uso e Política de Privacidade</h1>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#1B263A] mb-4">1. Sobre o AUTOPILOT CRM:</h2>
              <div className="text-[#485B80] space-y-4">
                <p className="mb-4">
                  <strong>1.1.</strong> Este site/aplicativo é de propriedade, mantido e operado por AUTOPILOT CRM, com sede na Rua 32, número 580, Bloco 01, Apartamento 504 – Bairro JK Setor Oeste – Município de Anápolis (GO), inscrito no CNPJ sob o nº 53.535.764/0001-48.
                </p>
                <p className="mb-4">
                  <strong>1.2.</strong> O sistema consiste em uma plataforma de gestão integrada, voltada para lojas de venda e revenda de veículos novos e seminovos. Suas funcionalidades abrangem o controle de estoque, finanças, anúncios e atendimentos. A proposta da ferramenta é centralizar, em um único ambiente, as diversas etapas do funil de vendas. Ao anunciar veículos em "vitrines virtuais", como Instagram, OLX e Facebook, o usuário poderá receber e responder mensagens originadas nesses canais, além de conduzir as negociações diretamente dentro da própria plataforma AUTOPILOT CRM.
                </p>
                <p className="mb-4">
                  <strong>1.3.</strong> Ao utilizar os serviços oferecidos pela AUTOPILOT CRM, o usuário/cliente concordará integralmente com os presentes Termos e Condições de Uso & Política de Privacidade e Segurança de Dados. Caso não concorde com qualquer disposição deste documento, deverá interromper imediatamente o uso da plataforma.
                </p>
                <p className="mb-4">
                  <strong>1.4.</strong> Este Termo poderá ser alterado a qualquer momento, seja por motivos legais ou por decisões estratégicas da AUTOPILOT CRM. O cliente/usuário reconhece, desde já, que é de sua inteira responsabilidade verificar periodicamente o conteúdo atualizado deste Termo, disponível no endereço eletrônico: https://app.autopilotcrm.com/termos-de-uso.
                </p>
                <p className="mb-4">
                  <strong>1.5.</strong> A AUTOPILOT CRM informará, com destaque, quaisquer alterações relacionadas à finalidade específica do tratamento de dados pessoais, à forma e duração do tratamento, à identificação do controlador e/ou às informações sobre o compartilhamento de dados e suas respectivas finalidades. Quando for exigido o consentimento, o cliente/usuário poderá revogá-lo caso discorde das alterações. Para as demais modificações, a AUTOPILOT CRM poderá, a seu exclusivo critério, comunicá-las por meio de aviso na página principal da plataforma. No entanto, essa comunicação não exime o cliente/usuário do dever de acompanhar regularmente este Termo.
                </p>
                <p className="mb-4">
                  <strong>1.6.</strong> As alterações realizadas neste Termo não terão aplicação retroativa, entrando em vigor a partir da data de sua publicação. Modificações decorrentes de mudanças na legislação nacional ou da implementação de novas funcionalidades da plataforma AUTOPILOT CRM seguirão a mesma regra, dispensando qualquer aviso prévio.
                </p>
                <p className="mb-4">
                  <strong>1.7.</strong> Caso sejam realizadas alterações neste Termo e o cliente/usuário não solicite o cancelamento de seu cadastro, entender-se-á, automaticamente, que as modificações foram aceitas integralmente, salvo nos casos em que a legislação exigir consentimento expresso.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#1B263A] mb-4">2. Diretrizes gerais de acesso e Uso do AUTOPILOT CRM:</h2>
              <div className="text-[#485B80] space-y-4">
                <p className="mb-4">
                  <strong>2.1.</strong> Para assegurar seus direitos legais, especialmente no que se refere à privacidade e à segurança de suas informações, o presente Termo tem como finalidade informar o usuário sobre a forma de tratamento de seus dados pessoais, bem como dos registros de sua navegação na plataforma.
                </p>
                <p className="mb-4">
                  <strong>2.2.</strong> Este Termo poderá ser modificado, total ou parcialmente, a qualquer tempo, em razão de alterações legislativas, da implementação de novas funcionalidades ou ferramentas tecnológicas, ou ainda, sempre que a AUTOPILOT CRM entender necessário, a seu exclusivo critério. É responsabilidade do cliente/usuário consultar os Termos atualizados antes de acessar ou utilizar a plataforma.
                </p>
                <p className="mb-4">
                  <strong>2.3.</strong> O cliente/usuário compromete-se a não fazer uso indevido dos serviços, nem a tentar acessá-los por meios diversos dos disponibilizados oficialmente. A utilização da plataforma deverá ocorrer em conformidade com a legislação vigente no Brasil. A AUTOPILOT CRM poderá suspender ou encerrar a prestação dos serviços caso identifique descumprimento destes Termos, de suas políticas internas ou no caso de investigação de conduta suspeita, fraudulenta ou criminosa.
                </p>
                <p className="mb-4">
                  <strong>2.4.</strong> A utilização dos serviços oferecidos pela AUTOPILOT CRM não confere ao cliente/usuário qualquer direito sobre a propriedade intelectual ou sobre os conteúdos acessados. É vedado ao cliente/usuário utilizar os conteúdos da plataforma sem a devida autorização ou salvo nos casos expressamente permitidos por lei. Estes Termos não concedem ao cliente/usuário o direito de utilizar marcas, logotipos ou qualquer outro elemento distintivo associado à AUTOPILOT CRM. É igualmente proibido remover, ocultar ou alterar avisos legais exibidos na plataforma.
                </p>
                <p className="mb-4">
                  <strong>2.5.</strong> A AUTOPILOT CRM poderá enviar ao cliente/usuário anúncios de serviços, comunicações administrativas, bem como informações de cunho publicitário e promocional, respeitadas as disposições legais aplicáveis, especialmente as previstas na Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#1B263A] mb-4">3. Conta AUTOPILOT CRM:</h2>
              <div className="text-[#485B80] space-y-4">
                <p className="mb-4">
                  <strong>3.1.</strong> Para receber seus dados de acesso para a sua Conta AUTOPILOT CRM, o cliente/usuário poderá ser solicitado a apresentar seu nome completo, endereço de e-mail, telefone, número de inscrição junto ao CADASTRO DE PESSOAS FÍSICAS (CPF) ou CADASTRO NACIONAL DE PESSOAS JURÍDICAS (CNPJ). Além disso, será possível vincular – mediante login e senha genuínos – a sincronização com outras plataformas digitais de vendas como: OLX, FACEBOOK (MARKETPLACE), WHASTAPP e INSTAGRAM. Indicados estes que serão coletados e tratados nos termos da Política de Privacidade e Segurança de Dados adiante (ou somente "Política").
                </p>
                <p className="mb-4">
                  <strong>3.2.</strong> Para proteger sua Conta AUTOPILOT CRM, o cliente/usuário deve manter a senha em sigilo. A atividade realizada pelo cliente/usuário ou por seu intermédio é de sua total responsabilidade. Não recomendamos que a senha da Conta AUTOPILOT CRM seja reutilizada em aplicativos de terceiros. Caso tome conhecimento de uso não autorizado da sua senha, o cliente/usuário deverá acessar a plataforma e realizar a troca da senha (inserir aqui o passo a passo de como redefinir a senha do usuário).
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#1B263A] mb-4">4. Uso da Plataforma AUTOPILOT CRM:</h2>
              <div className="text-[#485B80] space-y-4">
                <p className="mb-4">
                  <strong>4.1.</strong> A AUTOPILOT CRM não se responsabiliza por transações realizadas entre o cliente/usuário e o consumidor final. A plataforma tem como finalidade oferecer uma gestão integrada, com funcionalidades voltadas ao controle de estoque, finanças, anúncios e atendimentos.
                </p>
                <p className="mb-4">
                  <strong>4.2.</strong> Ao realizar uma venda, é de responsabilidade exclusiva do cliente/usuário consultar, junto à instituição financeira envolvida, a confirmação do recebimento dos valores conforme os termos acordados entre as partes. A finalização da negociação, bem como a entrega ou transferência do veículo, somente deverá ocorrer após a comprovação do referido recebimento.
                </p>
                <p className="mb-4">
                  <strong>4.3.</strong> As decisões e escolhas efetuadas pelo cliente/usuário durante sua jornada na plataforma são de sua exclusiva responsabilidade. A AUTOPILOT CRM atua como ferramenta de apoio à gestão do negócio, não podendo ser responsabilizada pelas decisões comerciais adotadas, as quais são de responsabilidade integral do cliente/usuário.
                </p>
                <p className="mb-4">
                  <strong>4.4.</strong> A AUTOPILOT CRM não se responsabiliza pelo mau funcionamento da plataforma em dispositivos ou navegadores que não estejam devidamente atualizados.
                </p>
                <p className="mb-4">
                  <strong>4.5.</strong> A AUTOPILOT CRM não garante o funcionamento adequado da plataforma em casos de instabilidade, falhas ou interrupções de conexão com a internet, sendo essas de responsabilidade do provedor de acesso utilizado pelo cliente/usuário.
                </p>
                <p className="mb-4">
                  <strong>4.6.</strong> Problemas de acesso à plataforma deverão ser reportados por meio do seguinte procedimento:<br />
                  (Inserir aqui o passo a passo que deve ser seguido pelo cliente/usuário para relatar erros de acesso).<br />
                  As solicitações serão respondidas em até 48 (quarenta e oito) horas úteis, contadas a partir da confirmação de recebimento da comunicação pela AUTOPILOT CRM.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#1B263A] mb-4">5. Como modificar, cancelar e desistir dos nossos Serviços</h2>
              <div className="text-[#485B80] space-y-4">
                <p className="mb-4">
                  <strong>5.1.</strong> Os serviços prestados pela AUTOPILOT CRM estão em constantes mudanças, com o intuito de melhorar a experiência do cliente/usuário. Por tal razão, a AUTOPILOT CRM poderá incluir ou remover funcionalidades do seu site/aplicativo, a seu critério, bem como suspender ou encerrar serviços por completo, em hipóteses de utilização indevida e/ou ilegal da plataforma.
                </p>
                <p className="mb-4">
                  <strong>5.2.</strong> O cliente/usuário pode deixar de usar nossos serviços a qualquer momento, e poderá solicitar a mudança ou cancelamento de sua conta por um dos meios de comunicação: (INSERIR O PASSO A PASSO DE COMO REALIZAR O CANCELAMENTO).
                </p>
                <p className="mb-4">
                  <strong>5.3.</strong> Caso o cliente/usuário adquira algum PRODUTO no AUTOPILOT CRM e posteriormente queira cancelar a contratação, deverá requerer tal cancelamento diretamente ao comercial responsável por sua loja, nos termos da lei e dos Termos de Adesão do produto/serviço.
                </p>
                <p className="mb-4">
                  <strong>5.4.</strong> Como proprietário de seus dados, o cliente/usuário terá preservado seu acesso aos mesmos. Se algum serviço da AUTOPILOT CRM for descontinuado, o usuário será informado com antecedência suficiente para que possa retirar suas informações cadastrais do site.
                </p>
                <p className="mb-4">
                  <strong>5.5.</strong> A plataforma oferece duas formas de contratação, mediante plano mensal e plano anual. Ao cancelar o plano mensal, não há reembolso ou cobrança de multa. O cancelamento impede a renovação automática do período seguinte. Neste caso, feito o cancelamento, o cliente/usuário gozará da plataforma pelo período adquirido.
                </p>
                <p className="mb-4">
                  <strong>5.6.</strong> Quanto ao plano anual, caso haja o cancelamento antes do término da vigência dá direito ao reembolso proporcional ao período restante, com aplicação de multa rescisória de 20% (vinte por cento) sobre o valor proporcional remanescente. O reembolso se dará mediante pelo mesmo meio de pagamento utilizado para contratação.
                </p>
                <p className="mb-4">
                  <strong>5.7.</strong> A AUTOPILOT CRM poderá cancelar o plano, INDEPENDENTE DE AVISO PRÉVIO, em caso de inadimplementos superiores à 15 (quinze) dias. Com prévio aviso, em casos de descumprimento contratual e utilização indevida dos serviços, especialmente em desacordo com a finalidade contratada ou para fins ilícitos.
                </p>
                <p className="mb-4">
                  <strong>5.8 –</strong> O cliente/usuário, poderá solicitar demonstrativo detalhado dos valores calculados no cancelamento.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#1B263A] mb-4">6. Responsabilidade pelos nossos Serviços:</h2>
              <div className="text-[#485B80] space-y-4">
                <p className="mb-4">
                  <strong>6.1.</strong> A AUTOPILOT CRM e seus parceiros não se responsabilizam pela forma como a plataforma é utilizada pelos clientes/usuários. A contratação dos serviços, a execução das atividades e a maneira de interação com o sistema são de inteira e exclusiva responsabilidade do cliente/usuário.
                </p>
                <p className="mb-4">
                  <strong>6.2.</strong> Em qualquer hipótese, a AUTOPILOT CRM e seus parceiros comerciais não serão responsabilizados por perdas, danos ou prejuízos decorrentes da má utilização da plataforma, do uso contrário à legislação vigente ou de situações que não sejam razoavelmente previsíveis.
                </p>
              </div>
            </section>

            {/* Informações de Contato */}
            <section className="mb-8 bg-gray-50 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold text-[#1B263A] mb-4">Informações de Contato</h2>
              <div className="text-[#485B80] space-y-2">
                <p><strong>Empresa:</strong> AUTOPILOT CRM</p>
                <p><strong>CNPJ:</strong> 53.535.764/0001-48</p>
                <p><strong>Endereço:</strong> Rua 32, número 580, Bloco 01, Apartamento 504</p>
                <p><strong>Bairro:</strong> JK Setor Oeste</p>
                <p><strong>Cidade:</strong> Anápolis (GO)</p>
                <p><strong>Website:</strong> https://app.autopilotcrm.com</p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-[#485B80] text-sm">
                © {new Date().getFullYear()} AutoPilot CRM. Todos os direitos reservados.
              </p>
              <button
                onClick={() => router.back()}
                className="bg-[#1B263A] text-white px-6 py-2 rounded-lg hover:bg-[#2a3441] transition-colors"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
