import React from 'react';

const Pagination = ({ currentPage, pageSize, totalItems, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / pageSize);

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

    const getPageNumbers = () => {
        let startPage = Math.max(currentPage - 3, 1);
        let endPage = Math.min(startPage + 6, totalPages);
        if (endPage - startPage < 6) {
            startPage = Math.max(endPage - 6, 1);
        }
        return [...Array((endPage + 1) - startPage).keys()].map(i => i + startPage);
    };

    return (
        <div className="schedule__pagination">
            <button onClick={handlePrevious} disabled={currentPage === 1}>
                <i className="fa fa-chevron-left" aria-hidden="true"></i>
            </button>
            {getPageNumbers().map(pageNumber => (
                <button
                    key={pageNumber}
                    onClick={() => onPageChange(pageNumber)}
                    disabled={pageNumber === currentPage}
                >
                    {pageNumber}
                </button>
            ))}
            <button onClick={handleNext} disabled={currentPage === totalPages}>
                <i className="fa fa-chevron-right" aria-hidden="true"></i>
            </button>
        </div>
    );
};

export default Pagination;