import { presentationLabel } from '@/lib/presentation-labels';
import React from 'react';

interface ConversaoTemperaturaItem {
  temperature: 'Frio' | 'Morno' | 'Quente';
  icone: string;
  conversions: number;
  total: number;
  percentage: number;
  color: string;
}

interface CardConversaoTemperaturaProps {
  title: string;
  data: ConversaoTemperaturaItem[];
}

const CardConversaoTemperatura: React.FC<CardConversaoTemperaturaProps> = ({ title, data }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-sm font-medium text-gray-600 mb-6">{title}</h3>

      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">{item.icone}</span>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {presentationLabel(item.temperature)}
                </div>
                <div className="text-xs text-gray-500">
                  {item.conversions} de {item.total} contatos interessados
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{item.percentage}%</div>
              </div>

              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${item.color}`}
                  style={{ width: `${item.percentage}%` }}
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
            {data.reduce((acc, item) => acc + item.conversions, 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CardConversaoTemperatura;
