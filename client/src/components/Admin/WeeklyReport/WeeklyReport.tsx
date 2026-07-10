import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { createApiError, privateFetch } from "@/lib/api";
import type {
  ApiWeeklyReport,
  WeeklyReport as WeeklyReportType,
} from "@/types/weeklyReport";
import WeeklyReportDetails from "./WeeklyReportDetails";
import WeeklyReportTable from "./WeeklyReportTable";
import {
  exportReportToPdf,
  formatDate,
  formatLabel,
  getStatusClasses,
  mapWeeklyReport,
  sortByNewest,
} from "./weeklyReportUtils";

const ITEMS_PER_PAGE = 10;

export default function WeeklyReport() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<WeeklyReportType | null>(
    null
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    data: reports = [],
    isLoading,
    isError,
  } = useQuery<WeeklyReportType[]>({
    queryKey: ["admin-weekly-reports"],
    queryFn: async () => {
      const response = await privateFetch(
        "https://ilabcict-backend.onrender.com/api/reports/"
      );
      const data = await response.json();

      if (!response.ok) {
        throw createApiError(
          response.status,
          data.message || "Failed to fetch weekly reports."
        );
      }

      return (data as ApiWeeklyReport[]).map(mapWeeklyReport);
    },
  });

  const filteredReports = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return reports
      .filter((report) => {
        const searchableText = [
          report.reportCode,
          report.title,
          report.technicianName,
          report.summary,
          formatLabel(report.status),
          formatDate(report.createdAt),
        ]
          .join(" ")
          .toLowerCase();

        return (
          normalizedQuery === "" || searchableText.includes(normalizedQuery)
        );
      })
      .sort(sortByNewest);
  }, [reports, searchQuery]);

  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
  const maxPage = Math.max(totalPages, 1);
  const currentPage = Math.min(page, maxPage);

  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const clearSearch = () => {
    setSearchQuery("");
    setPage(1);
    searchInputRef.current?.focus();
  };

  const goToPage = (nextPage: number) => {
    setPage(Math.min(Math.max(nextPage, 1), maxPage));
  };

  const handleReportClick = (report: WeeklyReportType) => {
    setSelectedReport(report);
    setSheetOpen(true);
  };

  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open);

    if (!open) {
      setSelectedReport(null);
    }
  };

  return (
    <>
      <div className="mt-5 flex w-full flex-col gap-4 p-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm secondary-text-color">
            {filteredReports.length} report
            {filteredReports.length === 1 ? "" : "s"} found
          </p>

          <div className="relative w-full md:w-[320px]">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search Weekly Reports..."
              className="primary-border-color w-full rounded-xl border bg-white py-2 pl-10 pr-10 outline-none focus:border-black!"
            />

            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={clearSearch}
                className="secondary-text-color absolute right-3 top-1/2 -translate-y-1/2 hover:text-black"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {isMobile ? (
          <div className="flex flex-col gap-3">
            {isLoading && (
              <p className="py-8 text-center secondary-text-color">
                Loading weekly reports...
              </p>
            )}

            {isError && (
              <p className="py-8 text-center text-red-500">
                Failed to load weekly reports.
              </p>
            )}

            {!isLoading && !isError && paginatedReports.length === 0 && (
              <p className="py-8 text-center secondary-text-color">
                No weekly reports found.
              </p>
            )}

            {!isLoading &&
              !isError &&
              paginatedReports.map((report) => (
                <button
                  key={report.id}
                  type="button"
                  onClick={() => handleReportClick(report)}
                  className="rounded-xl border border-primary-color bg-white p-4 text-left"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{report.reportCode}</p>
                      <h3 className="mt-1 font-semibold">{report.title}</h3>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                        report.status
                      )}`}
                    >
                      {formatLabel(report.status)}
                    </span>
                  </div>
                  <p className="secondary-text-color line-clamp-3">
                    {report.summary}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-sm secondary-text-color">
                    <span>{report.technicianName}</span>
                    <span>{formatDate(report.createdAt)}</span>
                  </div>
                </button>
              ))}
          </div>
        ) : (
          <WeeklyReportTable
            reports={paginatedReports}
            isLoading={isLoading}
            isError={isError}
            onViewReport={handleReportClick}
            onExportReport={exportReportToPdf}
          />
        )}

        {totalPages > 1 && (
          <Pagination
            className={`flex ${isMobile ? "justify-center" : "justify-end"}`}
          >
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => goToPage(currentPage - 1)}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, index) => (
                <PaginationItem key={index + 1}>
                  <PaginationLink
                    isActive={currentPage === index + 1}
                    onClick={() => goToPage(index + 1)}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext onClick={() => goToPage(currentPage + 1)} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className={isMobile ? "h-[90vh]" : "w-[560px]!"}
        >
          {selectedReport && (
            <WeeklyReportDetails
              report={selectedReport}
              onExport={exportReportToPdf}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
