"use client";

type Props = {
  show: number;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (n: number) => void;
};

export default function Pagination({ show, currentPage, totalPages, setCurrentPage }: Props) {
  if (show === -1) return null;

  const maxPagesToShow = 5; 

  let startPage = 1;
  let endPage = totalPages;

  if (totalPages > maxPagesToShow) {
    const half = Math.floor(maxPagesToShow / 2);

    if (currentPage <= half + 1) {
      startPage = 1;
      endPage = maxPagesToShow;
    } else if (currentPage >= totalPages - half) {
      startPage = totalPages - maxPagesToShow + 1;
      endPage = totalPages;
    } else {
      startPage = currentPage - half;
      endPage = currentPage + half;
    }
  }

  const visibleCount = Math.max(endPage - startPage + 1, 0);

  return (
    <div className="flex justify-center mt-4 gap-1 flex-wrap text-xs">
      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
        className={`px-3 py-1.5 rounded-full ${
          currentPage === 1 ? "bg-gray-400 cursor-not-allowed" : "bg-gray-600 hover:bg-gray-700 text-white"
        }`}
      >
        Previous
      </button>

      {Array.from({ length: visibleCount }, (_, i) => {
        const pageNumber = startPage + i;

        return (
          <button
            key={pageNumber}
            className={`px-3 py-1.5 rounded-full ${
              currentPage === pageNumber
                ? "bg-blue-600 text-white"
                : "bg-gray-600 text-white hover:bg-gray-700"
            }`}
            onClick={() => setCurrentPage(pageNumber)}
          >
            {pageNumber}
          </button>
        );
      })}

      <button
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
        className={`px-3 py-1.5 rounded-full ${
          currentPage === totalPages ? "bg-gray-400 cursor-not-allowed" : "bg-gray-600 hover:bg-gray-700 text-white"
        }`}
      >
        Next
      </button>
    </div>
  );
}
