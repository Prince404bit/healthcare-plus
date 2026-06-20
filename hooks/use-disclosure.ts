"use client";

import { useState, useCallback } from "react";

export function useDisclosure(initial = false) {
  const [isOpen, setIsOpen] = useState(initial);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  return { isOpen, open, close, toggle };
}

export function useDisclosureWithData<T>(initial?: T) {
  const [state, setState] = useState<{ isOpen: boolean; data?: T }>({
    isOpen: false,
    data: initial,
  });

  const open = useCallback((data?: T) => setState({ isOpen: true, data }), []);
  const close = useCallback(() => setState((s) => ({ ...s, isOpen: false })), []);

  return { isOpen: state.isOpen, data: state.data, open, close };
}
