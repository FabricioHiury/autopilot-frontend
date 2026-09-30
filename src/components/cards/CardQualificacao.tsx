import React, { useState } from 'react';
import ChevronRight from '@/components/icons/chevron-right';
import ChevronLeft from '../icons/chevron-left';

interface ItemQualificacao {
  label: string;
  porcentagem: number | undefined;
  total?: number;
  conversao?: number;
  valor?: number;
  valorLabel?: string;
  cor?: string;
  subvalorLabel?: string;
  subvalor?: number;
}

interface CardQualificacaoBaseProps {
  titulo: string;
  subtitulo: string;
}

interface CardQualificacaoUnitarioProps extends CardQualificacaoBaseProps {
  tipo: 'unitario';
  porcentagem: number | string | undefined;
  conversoes: number;
  vendedores?: number;
  cor?: string;
  className?: string;
}

interface CardQualificacaoMultiploProps extends CardQualificacaoBaseProps {
  tipo: 'multiplo';
  itens: ItemQualificacao[];
}


type CardQualificacaoProps =
  | CardQualificacaoUnitarioProps
  | CardQualificacaoMultiploProps
  | CardQualificacaoCarrosselProps
  | CardQualificacaoCarrosselMultiploProps;

interface GraficoMeiaLuaProps {
  porcentagem: number | string | undefined;  
  cor: string;
  tamanho?: 'pequeno' | 'medio' | 'grande';
}

function GraficoMeiaLua({ porcentagem, cor, tamanho = 'grande' }: GraficoMeiaLuaProps) {
  const tamanhos = {
    pequeno: { width: 120, height: 70, radius: 45, strokeWidth: 16, fontSize: 'text-sm' },
    medio: { width: 140, height: 80, radius: 55, strokeWidth: 20, fontSize: 'text-lg' },
    grande: { width: 160, height: 90, radius: 65, strokeWidth: 24, fontSize: 'text-2xl' }
  };

  const config = tamanhos[tamanho];
  const centerX = config.width / 2;
  const centerY = config.height - 10;


  const angle = (Number(porcentagem) || 0) / 100 * 180;
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

        {porcentagem !== undefined && Number(porcentagem) > 0 && (
          <path
            d={`M ${startX} ${startY} A ${config.radius} ${config.radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`}
            stroke={cor}
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
          transform: 'translate(-50%, -50%)'
        }}
      >
        <span className={`font-bold text-gray-900 ${config.fontSize}`}>{porcentagem}%</span>
      </div>
    </div>
  );
}

interface ItemComLabelProps {
  item: ItemQualificacao;
  tamanho?: 'pequeno' | 'medio' | 'grande';
}

function ItemComLabel({ item, tamanho = 'grande' }: ItemComLabelProps) {
  const cor = item.cor || '#3B82F6';

  return (
    <div className="flex flex-col items-center gap-2">
      <GraficoMeiaLua
        porcentagem={item.porcentagem}
        cor={cor}
        tamanho={tamanho}
      />
      <div className="text-center">
        <div className="mb-1">
          <span className="text-xs text-gray-600">{item.label}</span>
        </div>
        {item.conversao !== undefined && item.total !== undefined ? (
          <>
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className='flex items-center gap-1'>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cor }}></div>
                <span className="text-xs text-gray-600">Convertidos</span>
              </div>
              <span className="text-sm text-gray-600">{item.conversao}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className='flex items-center gap-1'>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#9CA3AF' }}></div>
                <span className="text-xs text-gray-600">Atendimentos Totais</span>
              </div>
              <span className="text-sm text-gray-600">{item.total}</span>
            </div>
          </>
        ) : (
          item.subvalor !== undefined && item.subvalorLabel ? (
            (() => {
              const subIsConverted = (item.subvalorLabel || "").toLowerCase().includes("convertido") || (item.subvalorLabel || "").toLowerCase().includes("sucesso");
              return (
                <>
                  {subIsConverted ? (
                    <>
                      <div className="flex items-center justify-center gap-2">
                        <div className='flex items-center gap-1'>
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cor }}></div>
                          <span className="text-xs text-gray-600">Convertidos</span>
                        </div>
                        <span className="text-sm text-gray-600">{item.subvalor}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <div className='flex items-center gap-1'>
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#9CA3AF" }}></div>
                          <span className="text-xs text-gray-600">{item.label}</span>
                        </div>
                        <span className="text-sm text-gray-600">{item.valor}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center gap-2">
                        <div className='flex items-center gap-1'>
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cor }}></div>
                          <span className="text-xs text-gray-600">Convertidos</span>
                        </div>
                        <span className="text-sm text-gray-600">{item.valor}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <div className='flex items-center gap-1'>
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#9CA3AF" }}></div>
                          <span className="text-xs text-gray-600">{item.subvalorLabel}</span>
                        </div>
                        <span className="text-sm text-gray-600">{item.subvalor}</span>
                      </div>
                    </>
                  )}
                </>
              )
            })()
          ) : (
            <div className="flex items-center justify-center gap-2">
              <div className='flex items-center gap-1'>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#9CA3AF" }}></div>
                <span className="text-xs text-gray-600">{item.valorLabel ?? item.label}</span>
              </div>
              <span className="text-sm text-gray-600">{item.valor}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}

interface CarrosselSlide {
  titulo: string;
  subtitulo: string;
  itens: ItemQualificacao[];
}

interface CardQualificacaoCarrosselProps {
  tipo: 'carrossel';
  slides: CarrosselSlide[];
}

interface CardQualificacaoCarrosselMultiploProps extends CardQualificacaoBaseProps {
  tipo: 'carrossel-multiplo';
  itens: ItemQualificacao[];
}

export default function CardQualificacao(props: CardQualificacaoProps & { className?: string }) {
  const { className = "", ...rest } = props;
  const [indiceAtual, setIndiceAtual] = useState(0);

  if (props.tipo === 'unitario') {
    const cor = props.cor || '#3B82F6';

    return (
      <div className={`bg-white rounded-2xl p-6 flex-1 shadow-md border border-gray-100 ${className ?? ""}`}>
        <div className="mb-4">
          <p className="text-lg font-semibold text-gray-900">{props.titulo}</p>
          <p className="text-sm text-gray-600">{props.subtitulo}</p>
        </div>

        <div className="flex items-center justify-center mb-4">
          <GraficoMeiaLua porcentagem={props.porcentagem} cor={cor} />
        </div>

        <div className="flex flex-col justify-center items-center">
          <div className="flex items-center gap-2 justify-between w-2/3">
            <div className='flex items-center gap-1'>
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: cor }}
              ></div>
              <span className="text-sm text-gray-600">Conversões</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{props.conversoes}</span>
          </div>
          {props.vendedores && (
            <div className="flex items-center gap-2 justify-between w-2/3">
              <div className='flex items-center gap-1'>
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cor }}
                ></div>
                <span className="text-sm text-gray-600">Leads</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{props.vendedores}</span>
            </div>
          )}
        </div>
      </div>
    );
  }


  if (props.tipo === 'multiplo') {
    const itensLimitados = props.itens.slice(0, 3);

    return (
      <div className="bg-white rounded-2xl p-6 flex-1 shadow-md border border-gray-100">
        <div className="mb-6">
          <p className="text-lg font-semibold text-gray-900">{props.titulo}</p>
          <p className="text-sm text-gray-600">{props.subtitulo}</p>
        </div>

        <div className={`flex items-center justify-center gap-6 ${itensLimitados.length === 1 ? '' : itensLimitados.length === 2 ? 'gap-8' : 'gap-4'}`}>
          {itensLimitados.map((item, index) => (
            <ItemComLabel
              key={index}
              item={item}
              tamanho={itensLimitados.length === 1 ? 'grande' : itensLimitados.length === 2 ? 'medio' : 'pequeno'}
            />
          ))}
        </div>
      </div>
    );
  }


  if (props.tipo === 'carrossel') {
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
          <p className="text-sm font-semibold text-gray-900">{slideAtual.titulo}</p>
          <p className="text-sm text-gray-600">{slideAtual.subtitulo}</p>
        </div>

        <div className="flex items-center justify-center mb-4 gap-6">
          {slideAtual.itens.map((item, idx) => (
            <ItemComLabel
              key={idx}
              item={item}
              tamanho={slideAtual.itens.length === 1 ? 'grande' : slideAtual.itens.length === 2 ? 'medio' : 'pequeno'}
            />
          ))}
        </div>

        {/* Navegação */}
        <div className="flex items-center justify-between absolute top-[100px] left-6 right-6">
          <button
            onClick={itemAnterior}
            disabled={!temAnterior}
            className={`p-2 rounded-full transition-colors ${temAnterior
              ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              : 'text-gray-300 cursor-not-allowed'
              }`}
          >
            <ChevronLeft />
          </button>

          <button
            onClick={proximoItem}
            disabled={!temProximo}
            className={`p-2 rounded-full transition-colors ${temProximo
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
              className={`w-2 h-2 rounded-full transition-colors ${index === indiceAtual ? 'bg-blue-500' : 'bg-gray-300'
                }`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (props.tipo === 'carrossel-multiplo') {
    const itensPorPagina = 2;
    const totalPaginas = Math.ceil(props.itens.length / itensPorPagina);
    const paginaAtual = indiceAtual;
    const indiceInicio = paginaAtual * itensPorPagina;
    const itensDaPagina = props.itens.slice(indiceInicio, indiceInicio + itensPorPagina);
    
    const temProximaPagina = paginaAtual < totalPaginas - 1;
    const temPaginaAnterior = paginaAtual > 0;

    const proximaPagina = () => {
      if (temProximaPagina) {
        setIndiceAtual(paginaAtual + 1);
      }
    };

    const paginaAnterior = () => {
      if (temPaginaAnterior) {
        setIndiceAtual(paginaAtual - 1);
      }
    };

    return (
      <div className="bg-white rounded-2xl p-4 sm:p-6 flex-1 relative shadow-md border border-gray-100">
        <div className="mb-4 sm:mb-6">
          <p className="text-lg font-semibold text-gray-900">{props.titulo}</p>
          <p className="text-sm text-gray-600">{props.subtitulo}</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-4 sm:mb-6">
          {itensDaPagina.map((item, index) => (
            <ItemComLabel
              key={indiceInicio + index}
              item={item}
              tamanho={itensDaPagina.length === 1 ? 'grande' : 'medio'}
            />
          ))}
        </div>

        {/* Navegação */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between sm:absolute sm:top-[120px] sm:left-6 sm:right-6 px-2 sm:px-0 mt-2 sm:mt-0">
            <button
              onClick={paginaAnterior}
              disabled={!temPaginaAnterior}
              className={`p-1 sm:p-2 rounded-full transition-colors ${temPaginaAnterior
                ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                : 'text-gray-300 cursor-not-allowed'
                }`}
            >
              <ChevronLeft />
            </button>

            <button
              onClick={proximaPagina}
              disabled={!temProximaPagina}
              className={`p-1 sm:p-2 rounded-full transition-colors ${temProximaPagina
                ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                : 'text-gray-300 cursor-not-allowed'
                }`}
            >
              <ChevronRight />
            </button>
          </div>
        )}

        {/* Indicadores de posição */}
        {totalPaginas > 1 && (
          <div className="flex justify-center gap-1 mt-2 sm:mt-4">
            {Array.from({ length: totalPaginas }, (_, index) => (
              <button
                key={index}
                onClick={() => setIndiceAtual(index)}
                className={`w-2 h-2 rounded-full transition-colors ${index === paginaAtual ? 'bg-blue-500' : 'bg-gray-300'
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
