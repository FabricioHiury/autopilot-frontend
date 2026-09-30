import React, { useState } from 'react';
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  Elements
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Shield, Lock } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentFormProps {
  planoId: string | string;
  onSuccess?: (paymentMethodId: string) => void;
  onError?: (error: string) => void;
}

const PaymentFormContent: React.FC<PaymentFormProps> = ({ planoId, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    const cardNumberElement = elements.getElement(CardNumberElement);

    if (!cardNumberElement) {
      setError('Elemento do cartão não encontrado');
      setLoading(false);
      return;
    }

    try {
      // Criar Payment Method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardNumberElement,
      });

      if (paymentMethodError) {
        setError(paymentMethodError.message || 'Erro ao processar cartão');
        setLoading(false);
        return;
      }

      if (!paymentMethod) {
        setError('Falha ao criar método de pagamento');
        setLoading(false);
        return;
      }

      // Chamar callback de sucesso com o Payment Method ID
      onSuccess?.(paymentMethod.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const elementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1f2937',
        fontFamily: 'system-ui, sans-serif',
        '::placeholder': {
          color: '#9ca3af',
        },
      },
      invalid: {
        color: '#dc2626',
      },
    },
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <CreditCard className="h-6 w-6 text-blue-600" />
          Informações de Pagamento
        </CardTitle>
        <p className="text-gray-600 text-sm">
          Insira os dados do seu cartão para finalizar
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campos do Cartão */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-4 w-4 text-gray-600" />
              <label className="text-base font-semibold text-gray-900">
                Dados do Cartão
              </label>
            </div>
            
            {/* Número do Cartão */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número do Cartão
              </label>
              <div className="p-3 border-2 border-gray-200 rounded-lg bg-white hover:border-blue-300 transition-colors duration-200 focus-within:border-blue-500">
                <CardNumberElement options={elementOptions} />
              </div>
            </div>

            {/* Vencimento e CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vencimento
                </label>
                <div className="p-3 border-2 border-gray-200 rounded-lg bg-white hover:border-blue-300 transition-colors duration-200 focus-within:border-blue-500">
                  <CardExpiryElement options={elementOptions} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV
                </label>
                <div className="p-3 border-2 border-gray-200 rounded-lg bg-white hover:border-blue-300 transition-colors duration-200 focus-within:border-blue-500">
                  <CardCvcElement options={elementOptions} />
                </div>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <Shield className="h-3 w-3" />
              Dados protegidos com criptografia SSL
            </div>
          </div>

          {/* Seção de Segurança Compacta */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900 text-sm">
                  Pagamento Seguro via Stripe
                </h3>
                <p className="text-xs text-blue-800">
                  Certificação PCI DSS • Dados criptografados
                </p>
              </div>
            </div>
          </div>
          
          {/* Mensagem de Erro */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0">
                  <div className="h-5 w-5 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 text-xs font-bold">!</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-red-800 text-sm">
                    Erro no Pagamento
                  </h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Botão de Confirmação */}
          <div className="pt-2">
            <Button 
              type="submit" 
              disabled={!stripe || loading}
              className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 transition-colors duration-200"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Confirmar Pagamento
                </div>
              )}
            </Button>
            
            <p className="text-center text-xs text-gray-500 mt-3">
              Ao confirmar, você concorda com nossos termos
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const PaymentForm: React.FC<PaymentFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent {...props} />
    </Elements>
  );
};

export default PaymentForm;