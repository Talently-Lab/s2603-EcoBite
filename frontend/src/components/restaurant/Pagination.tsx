import Button from "../ui/Button";
import { Arrow } from "../ui/ArrowButton";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav
      aria-label="Paginación de restaurantes"
      className="mt-12 grid grid-cols-1 justify-items-center gap-4 border-t border-gray-100 pt-8 sm:flex sm:items-center sm:justify-center sm:gap-6"
    >
      <button
        type="button"
        className="inline-flex items-center gap-1 text-sm font-bold text-eco-dark hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Página anterior"
      >
        <Arrow direction="left" />
        Anterior
      </button>
      <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
        {pages.map((page) =>
          page === currentPage ? (
            <Button
              key={page}
              variant="light"
              className="inline-flex w-full justify-center sm:w-auto sm:min-w-10"
              aria-current="page"
              aria-label={`Página ${page}`}
            >
              {page}
            </Button>
          ) : (
            <button
              key={page}
              type="button"
              className="w-full text-center text-sm font-medium text-eco-dark underline underline-offset-2 hover:text-eco-dark/70 sm:w-auto sm:min-w-6"
              onClick={() => onPageChange(page)}
              aria-label={`Página ${page}`}
            >
              {page}
            </button>
          ),
        )}
      </div>
      <button
        type="button"
        className="inline-flex items-center gap-1 text-sm font-bold text-eco-dark hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Página siguiente"
      >
        Siguiente
        <Arrow direction="right" />
      </button>
    </nav>
  );
}
