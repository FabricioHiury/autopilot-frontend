import React, { useState } from 'react';
import ChevronRight from '@/components/icons/chevron-right';
import ChevronLeft from '../icons/chevron-left';

interface ItemQualificacao {
  label: string;
  percentage: number | undefined;
  total?: number;
  conversao?: number;
  value?: number;
  valorLabel?: string;
  color?: string;
  subvalorLabel?: string;
  subvalor?: number;
}

interface CardQualificacaoBaseProps {
  title: string;
  subtitulo: string;
}

interface CardQualificacaoUnitarioProps extends CardQualificacaoBaseProps {
  type: 'unitario';
  percentage: number | string | undefined;
  conversions: number;
  salespeople?: number;
  color?: string;
  className?: string;
}

interface CardQualificacaoMultiploProps extends CardQualificacaoBaseProps {
  type: 'multiplo';
  itens: ItemQualificacao[];
}

type CardQualificacaoProps =
  | CardQualificacaoUnitarioProps
  | CardQualificacaoMultiploProps
  | CardQualificacaoCarrosselProps
  | CardQualificacaoCarrosselMultiploProps;

interface GraficoMeiaLuaProps {
  percentage: number | string | undefined;
  color: string;
  size?: 'pequeno' | 'medio' | 'grande';
}

function GraficoMeiaLua({ percentage, color, size = 'grande' }: GraficoMeiaLuaProps) {
  const tamanhos = {
    pequeno: { width: 120, height: 70, radius: 45, strokeWidth: 16, fontSize: 'text-sm' },
    medio: { width: 140, height: 80, radius: 55, strokeWidth: 20, fontSize: 'text-lg' },
    grande: { width: 160, height: 90, radius: 65, strokeWidth: 24, fontSize: 'text-2xl' },
  };

  const config = tamanhos[size];
  const centerX = config.width / 2;
  const centerY = config.height - 10;

  const angle = ((Number(percentage) || 0) / 100) * 180;
  const angleRad = (angle * Math.PI) / 180;

  const startX = centerX - config.radius;
  const startY = centerY;
  const endX = centerX + Math.cos(Math.PI - angleRad) * config.radius;
  const endY = centerY - Math.sin(Math.PI - angleRad) * config.radius;

  const largeArcFlag = angle > 180 ? 1 : 0;

  return (
    <div className="relative" style={{ width: config.width, height: config.height }}>
      <svg
        width={config.width}
        height={config.height}
        viewBox={`0 0 ${config.width} ${config.height}`}
      >
        <path
          d={`M ${startX} ${startY} A ${config.radius} ${config.radius} 0 0 1 ${centerX + config.radius} ${centerY}`}
          stroke="#E5E7EB"
          strokeWidth={config.strokeWidth}
          fill="none"
        >
          <title>Número de atendimento</title>
        </path>

        {percentage !== undefined && Number(percentage) > 0 && (
          <path
            d={`M ${startX} ${startY} A ${config.radius} ${config.radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`}
            stroke={color}
            strokeWidth={config.strokeWidth}
            fill="none"
          >
            <title>Conversão</title>
          </path>
        )}
      </svg>

      {/* Texto da porcentagem centralizado */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          left: '50%',
          top: '60%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <span className={`font-bold text-gray-900 ${config.fontSize}`}>{percentage}%</span>
      </div>
    </div>
  );
}

interface ItemComLabelProps {
  item: ItemQualificacao;
  size?: 'pequeno' | 'medio' | 'grande';
}

function ItemComLabel({ item, size = 'grande' }: ItemComLabelProps) {
  const color = item.color || '#3B82F6';

  return (
    <div className="flex flex-col items-center gap-2">
      <GraficoMeiaLua percentage={item.percentage} color={color} size={size} />
      <div className="text-center">
        <div className="mb-1">
          <span className="text-xs text-gray-600">{item.label}</span>
        </div>
        {item.conversao !== undefined && item.total !== undefined ? (
          <>
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
                <span className="text-xs text-gray-600">Convertidos</span>
              </div>
              <span className="text-sm text-gray-600">{item.conversao}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#9CA3AF' }}></div>
                <span className="text-xs text-gray-600">Atendimentos Totais</span>
              </div>
              <span className="text-sm text-gray-600">{item.total}</span>
            </div>
          </>
        ) : item.subvalor !== undefined && item.subvalorLabel ? (
          (() => {
            const subIsConverted =
              (item.subvalorLabel || '').toLowerCase().includes('convertido') ||
              (item.subvalorLabel || '').toLowerCase().includes('success');
            return (
              <>
                {subIsConverted ? (
                  <>
                    <div className="flex items-center justify-center gap-2">
                      <div className="flex items-center gap-1">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: color }}
                        ></div>
                        <span className="text-xs text-gray-600">Convertidos</span>
                      </div>
                      <span className="text-sm text-gray-600">{item.subvalor}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: '#9CA3AF' }}
                        ></div>
                        <span className="text-xs text-gray-600">{item.label}</span>
                      </div>
                      <span className="text-sm text-gray-600">{item.value}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-2">
                      <div className="flex items-center gap-1">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: color }}
                        ></div>
                        <span className="text-xs text-gray-600">Convertidos</span>
                      </div>
                      <span className="text-sm text-gray-600">{item.value}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: '#9CA3AF' }}
                        ></div>
                        <span className="text-xs text-gray-600">{item.subvalorLabel}</span>
                      </div>
                      <span className="text-sm text-gray-600">{item.subvalor}</span>
                    </div>
                  </>
                )}
              </>
            );
          })()
        ) : (
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#9CA3AF' }}></div>
              <span className="text-xs text-gray-600">{item.valorLabel ?? item.label}</span>
            </div>
            <span className="text-sm text-gray-600">{item.value}</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface CarrosselSlide {
  title: string;
  subtitulo: string;
  itens: ItemQualificacao[];
}

interface CardQualificacaoCarrosselProps {
  type: 'carrossel';
  slides: CarrosselSlide[];
}

interface CardQualificacaoCarrosselMultiploProps extends CardQualificacaoBaseProps {
  type: 'carrossel-multiplo';
  itens: ItemQualificacao[];
}

export default function CardQualificacao(props: CardQualificacaoProps & { className?: string }) {
  const { className = '', ...rest } = props;
  const [indiceAtual, setIndiceAtual] = useState(0);

  if (props.type === 'unitario') {
    const color = props.color || '#3B82F6';

    return (
      <div
        className={`bg-white rounded-2xl p-6 flex-1 shadow-md border border-gray-100 ${className ?? ''}`}
      >
        <div className="mb-4">
          <p className="text-lg font-semibold text-gray-900">{props.title}</p>
          <p className="text-sm text-gray-600">{props.subtitulo}</p>
        </div>

        <div className="flex items-center justify-center mb-4">
          <GraficoMeiaLua percentage={props.percentage} color={color} />
        </div>

        <div className="flex flex-col justify-center items-center">
          <div className="flex items-center gap-2 justify-between w-2/3">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
              <span className="text-sm text-gray-600">Conversões</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{props.conversions}</span>
          </div>
          {props.salespeople && (
            <div className="flex items-center gap-2 justify-between w-2/3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
                <span className="text-sm text-gray-600">Leads</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{props.salespeople}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (props.type === 'multiplo') {
    const itensLimitados = props.itens.slice(0, 3);

    return (
      <div className="bg-white rounded-2xl p-6 flex-1 shadow-md border border-gray-100">
        <div className="mb-6">
          <p className="text-lg font-semibold text-gray-900">{props.title}</p>
          <p className="text-sm text-gray-600">{props.subtitulo}</p>
        </div>

        <div
          className={`flex items-center justify-center gap-6 ${itensLimitados.length === 1 ? '' : itensLimitados.length === 2 ? 'gap-8' : 'gap-4'}`}
        >
          {itensLimitados.map((item, index) => (
            <ItemComLabel
              key={index}
              item={item}
              size={
                itensLimitados.length === 1
                  ? 'grande'
                  : itensLimitados.length === 2
                    ? 'medio'
                    : 'pequeno'
              }
            />
          ))}
        </div>
      </div>
    );
  }

  if (props.type === 'carrossel') {
    const slideAtual = props.slides[indiceAtual];
    const temProximo = indiceAtual < props.slides.length - 1;
    const temAnterior = indiceAtual > 0;

    const proximoItem = () => {
      if (temProximo) {
        setIndiceAtual(indiceAtual + 1);
      }
    };

    const itemAnterior = () => {
      if (temAnterior) {
        setIndiceAtual(indiceAtual - 1);
      }
    };

    return (
      <div className="bg-white rounded-2xl p-6 flex-1 relative">
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-900">{slideAtual.title}</p>
          <p className="text-sm text-gray-600">{slideAtual.subtitulo}</p>
        </div>

        <div className="flex items-center justify-center mb-4 gap-6">
          {slideAtual.itens.map((item, idx) => (
            <ItemComLabel
              key={idx}
              item={item}
              size={
                slideAtual.itens.length === 1
                  ? 'grande'
                  : slideAtual.itens.length === 2
                    ? 'medio'
                    : 'pequeno'
              }
            />
          ))}
        </div>

        {/* Navegação */}
        <div className="flex items-center justify-between absolute top-[100px] left-6 right-6">
          <button
            onClick={itemAnterior}
            disabled={!temAnterior}
            className={`p-2 rounded-full transition-colors ${
              temAnterior
                ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            <ChevronLeft />
          </button>

          <button
            onClick={proximoItem}
            disabled={!temProximo}
            className={`p-2 rounded-full transition-colors ${
              temProximo
                ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            <ChevronRight />
          </button>
        </div>

        {/* Indicadores de posição */}
        <div className="flex justify-center gap-1 mt-4">
          {props.slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setIndiceAtual(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === indiceAtual ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (props.type === 'carrossel-multiplo') {
    const itemsPerPage = 2;
    const totalPages = Math.ceil(props.itens.length / itemsPerPage);
    const currentPage = indiceAtual;
    const indiceInicio = currentPage * itemsPerPage;
    const itensDaPagina = props.itens.slice(indiceInicio, indiceInicio + itemsPerPage);

    const temProximaPagina = currentPage < totalPages - 1;
    const temPaginaAnterior = currentPage > 0;

    const proximaPagina = () => {
      if (temProximaPagina) {
        setIndiceAtual(currentPage + 1);
      }
    };

    const paginaAnterior = () => {
      if (temPaginaAnterior) {
        setIndiceAtual(currentPage - 1);
      }
    };

    return (
      <div className="bg-white rounded-2xl p-4 sm:p-6 flex-1 relative shadow-md border border-gray-100">
        <div className="mb-4 sm:mb-6">
          <p className="text-lg font-semibold text-gray-900">{props.title}</p>
          <p className="text-sm text-gray-600">{props.subtitulo}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-4 sm:mb-6">
          {itensDaPagina.map((item, index) => (
            <ItemComLabel
              key={indiceInicio + index}
              item={item}
              size={itensDaPagina.length === 1 ? 'grande' : 'medio'}
            />
          ))}
        </div>

        {/* Navegação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between sm:absolute sm:top-[120px] sm:left-6 sm:right-6 px-2 sm:px-0 mt-2 sm:mt-0">
            <button
              onClick={paginaAnterior}
              disabled={!temPaginaAnterior}
              className={`p-1 sm:p-2 rounded-full transition-colors ${
                temPaginaAnterior
                  ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <ChevronLeft />
            </button>

            <button
              onClick={proximaPagina}
              disabled={!temProximaPagina}
              className={`p-1 sm:p-2 rounded-full transition-colors ${
                temProximaPagina
                  ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <ChevronRight />
            </button>
          </div>
        )}

        {/* Indicadores de posição */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-1 mt-2 sm:mt-4">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => setIndiceAtual(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentPage ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}
