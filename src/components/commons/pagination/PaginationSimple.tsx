import React from 'react';

interface PaginationSimpleProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const PaginationSimple: React.FC<PaginationSimpleProps> = ({ 
  totalPages, 
  currentPage, 
  onPageChange 
}) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-1 mx-1 rounded-md ${
            currentPage === i
              ? 'bg-[#1B263A] text-white'
              : 'text-[#485B80] hover:bg-[#F2F4F7]'
          }`}
        >
          {i}
        </button>
      );
    }
    
    return pageNumbers;
  };

  return (
    <div className="flex items-center justify-center">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="border border-[#DDE6F2] w-8 h-10 rounded-lg flex items-center justify-center rotate-180 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <img src="/icons/arrow_2.svg" alt="Anterior" />
      </button>
      
      <div className="flex mx-2">
        {renderPageNumbers()}
      </div>
      
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="border border-[#DDE6F2] w-8 h-10 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <img src="/icons/arrow_2.svg" alt="Próximo" />
      </button>
    </div>
  );
};

export default PaginationSimple; 