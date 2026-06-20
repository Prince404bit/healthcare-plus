"use client";

import { useState, useMemo } from "react";

export function usePagination<T>(data: T[], defaultPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

  const paginated = useMemo(
    () => data.slice((page - 1) * pageSize, page * pageSize),
    [data, page, pageSize]
  );

  function goTo(p: number) {
    setPage(Math.min(Math.max(1, p), totalPages));
  }

  function changePageSize(size: number) {
    setPageSize(size);
    setPage(1);
  }

  return {
    page,
    pageSize,
    totalPages,
    total: data.length,
    paginated,
    goTo,
    next: () => goTo(page + 1),
    prev: () => goTo(page - 1),
    first: () => goTo(1),
    last: () => goTo(totalPages),
    changePageSize,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
