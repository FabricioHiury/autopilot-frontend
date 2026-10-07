import { presentationLabel } from '@/lib/presentation-labels';
import React from 'react';

interface ConversaoTemperaturaSimples {
  temperature: 'Frio' | 'Morno' | 'Quente';
  icone: string;
  percentage: number;
  color: string;
  limit: number;
}

interface CardConversaoTemperaturaSimplesProps {
  title: string;
  data: ConversaoTemperaturaSimples[];
}

const CardConversaoTemperaturaSimples: React.FC<CardConversaoTemperaturaSimplesProps> = ({
  title,
  data,
}) => {
  const totalConversions = data.reduce((acc, item) => acc + item.limit, 0);
  const melhorPerformance = data.reduce((max, item) =>
    item.percentage > max.percentage ? item : max,
  );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex flex-col gap-2 mb-6">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className="text-xs text-gray-500">Total: {totalConversions} conversões</div>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-base">{item.icone}</span>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {presentationLabel(item.temperature)}
                </div>
                <div className="text-xs text-gray-500">{item.limit} conversões</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{item.percentage}%</div>
              </div>

              <div className="w-12 bg-gray-200 rounded-full h-2">
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
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500">Melhor performance</div>
            <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
              <span>{melhorPerformance.icone}</span>
              {presentationLabel(melhorPerformance.temperature)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Taxa de conversão</div>
            <div className="text-lg font-bold text-green-600">{melhorPerformance.percentage}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardConversaoTemperaturaSimples;
