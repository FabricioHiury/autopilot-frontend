import React from 'react';

interface ConversaoTemperaturaItem {
  temperatura: 'Frio' | 'Morno' | 'Quente';
  icone: string;
  conversoes: number;
  total: number;
  porcentagem: number;
  cor: string;
}

interface CardConversaoTemperaturaProps {
  titulo: string;
  dados: ConversaoTemperaturaItem[];
}

const CardConversaoTemperatura: React.FC<CardConversaoTemperaturaProps> = ({
  titulo,
  dados
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-sm font-medium text-gray-600 mb-6">{titulo}</h3>
      
      <div className="space-y-4">
        {dados.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">{item.icone}</span>
              <div>
                <div className="text-sm font-medium text-gray-900">{item.temperatura}</div>
                <div className="text-xs text-gray-500">
                  {item.conversoes} de {item.total} leads
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{item.porcentagem}%</div>
              </div>
              
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${item.cor}`}
                  style={{ width: `${item.porcentagem}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total de conversões</span>
          <span className="text-lg font-bold text-gray-900">
            {dados.reduce((acc, item) => acc + item.conversoes, 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CardConversaoTemperatura;