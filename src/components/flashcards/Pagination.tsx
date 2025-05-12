import {
  Pagination as PaginationUI,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { PaginationDTO } from "@/types";

interface PaginationProps {
  pagination: PaginationDTO;
  onChange: (page: number) => void;
}

export default function Pagination({ pagination, onChange }: PaginationProps) {
  const { page, limit, total } = pagination;
  const totalPages = Math.ceil(total / limit);

  // Don't render pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  // Calculate what pages to show
  const getPageNumbers = () => {
    const pageNumbers: (number | "ellipsis")[] = [];

    if (totalPages <= 7) {
      // If we have 7 or fewer pages, show all
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);

      // Logic for showing pages around current page
      if (page <= 3) {
        // If we're on pages 1-3, show 1-5, then ellipsis, then last
        pageNumbers.push(2, 3, 4, 5, "ellipsis", totalPages);
      } else if (page >= totalPages - 2) {
        // If we're on last 3 pages, show first, ellipsis, then last 5
        pageNumbers.push("ellipsis", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // Otherwise show first, ellipsis, current-1, current, current+1, ellipsis, last
        pageNumbers.push("ellipsis", page - 1, page, page + 1, "ellipsis", totalPages);
      }
    }

    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <PaginationUI>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => page > 1 && onChange(page - 1)}
            className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>

        {pageNumbers.map((pageNum, idx) => (
          <PaginationItem key={`${pageNum}-${idx}`}>
            {pageNum === "ellipsis" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                isActive={pageNum === page}
                onClick={() => pageNum !== page && onChange(pageNum)}
                className={pageNum !== page ? "cursor-pointer" : undefined}
              >
                {pageNum}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            onClick={() => page < totalPages && onChange(page + 1)}
            className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </PaginationUI>
  );
}
