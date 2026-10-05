import React, { useState, useMemo } from 'react';

export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  title?: string;
  className?: string;
  headerClassName?: string;
  rowClassName?: string | ((record: T, index: number) => string);
  loading?: boolean;
  emptyText?: string;
  onRowClick?: (record: T, index: number) => void;
  placeholderFiltro?: string;
}

export function Table<T = any>({
  columns,
  data,
  title,
  className = '',
  headerClassName = '',
  rowClassName = '',
  loading = false,
  emptyText = 'Nenhum dado encontrado',
  onRowClick,
  placeholderFiltro = '',
}: TableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');

  const getRowClassName = (record: T, index: number): string => {
    if (typeof rowClassName === 'function') {
      return rowClassName(record, index);
    }
    return rowClassName;
  };

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowerSearch = searchTerm.toLowerCase();
    return data.filter((record) => {
      return columns.some((col) => {
        const val = (record as any)[col.dataIndex];
        return String(val).toLowerCase().includes(lowerSearch);
      });
    });
  }, [data, searchTerm, columns]);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
        {title && (
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        )}
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} flex flex-col gap-5`}>
      {title && (
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <input
            type="text"
            placeholder={placeholderFiltro}
            className="w-full md:max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className={`bg-gray-200 rounded-md ${headerClassName}`}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.align === 'center'
                      ? 'text-center'
                      : column.align === 'right'
                        ? 'text-right'
                        : 'text-left'
                  } ${column.className || ''}`}
                  style={{ width: column.width }}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                  {emptyText}
                </td>
              </tr>
            ) : (
              filteredData.map((record, index) => (
                <tr
                  key={index}
                  className={`group hover:bg-gray-50 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${getRowClassName(record, index)}`}
                  onClick={() => onRowClick?.(record, index)}
                >
                  {columns.map((column) => {
                    const value = (record as any)[column.dataIndex];
                    const content = column.render ? column.render(value, record, index) : value;

                    return (
                      <td
                        key={column.key}
                        className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                          column.align === 'center'
                            ? 'text-center'
                            : column.align === 'right'
                              ? 'text-right'
                              : 'text-left'
                        }`}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden">
        {filteredData.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">{emptyText}</div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredData.map((record, index) => (
              <div
                key={index}
                className={`bg-white border rounded-lg shadow-sm p-4 ${onRowClick ? 'cursor-pointer' : ''} ${getRowClassName(record, index)}`}
                onClick={() => onRowClick?.(record, index)}
              >
                <div className="flex flex-col gap-2">
                  {columns.map((column) => {
                    const value = (record as any)[column.dataIndex];
                    const content = column.render ? column.render(value, record, index) : value;
                    return (
                      <div key={column.key} className="flex flex-col">
                        <span className="text-xs font-medium text-gray-500">{column.title}</span>
                        <div className="text-sm text-gray-900">{content}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
