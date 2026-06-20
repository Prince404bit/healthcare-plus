"use client";

import { useState, useMemo, useCallback } from "react";

type UseSearchFilterOptions<T> = {
  data: T[];
  searchKeys?: (keyof T)[];
  initialFilters?: Partial<Record<keyof T, string>>;
};

export function useSearchFilter<T>({ data, searchKeys = [], initialFilters = {} }: UseSearchFilterOptions<T>) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Partial<Record<keyof T, string>>>(initialFilters);

  const setFilter = useCallback((key: keyof T, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setSearch("");
    setFilters({});
  }, []);

  const filtered = useMemo(() => {
    let result = data;

    if (search.trim() && searchKeys.length > 0) {
      const q = search.toLowerCase();
      result = result.filter((item) =>
        searchKeys.some((k) => String(item[k] ?? "").toLowerCase().includes(q))
      );
    }

    for (const [key, value] of Object.entries(filters)) {
      if (!value) continue;
      result = result.filter((item) =>
        String((item as Record<string, unknown>)[key] ?? "") === value
      );
    }

    return result;
  }, [data, search, searchKeys, filters]);

  return { search, setSearch, filters, setFilter, clearFilters, filtered };
}
