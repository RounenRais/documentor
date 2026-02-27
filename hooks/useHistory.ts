"use client";

import { useCallback, useRef, useState } from "react";

export function useHistory(initial: string) {
  const stack = useRef<string[]>([initial]);
  const idx = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<string | null>(null);
  const [, bump] = useState(0);

  function flushPending() {
    if (pending.current !== null && timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
      const v = pending.current;
      pending.current = null;
      if (stack.current[idx.current] !== v) {
        stack.current = [...stack.current.slice(0, idx.current + 1), v];
        idx.current = stack.current.length - 1;
      }
    }
  }

  const push = useCallback((value: string) => {
    pending.current = value;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const v = pending.current;
      if (v === null) return;
      pending.current = null;
      timer.current = null;
      if (stack.current[idx.current] !== v) {
        stack.current = [...stack.current.slice(0, idx.current + 1), v];
        idx.current = stack.current.length - 1;
      }
    }, 300);
  }, []);

  const pushImmediate = useCallback((value: string) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    pending.current = null;
    if (stack.current[idx.current] !== value) {
      stack.current = [...stack.current.slice(0, idx.current + 1), value];
      idx.current = stack.current.length - 1;
    }
  }, []);

  const undo = useCallback((): string | null => {
    flushPending();
    if (idx.current <= 0) return null;
    idx.current--;
    bump((n) => n + 1);
    return stack.current[idx.current];
  }, []);

  const redo = useCallback((): string | null => {
    flushPending();
    if (idx.current >= stack.current.length - 1) return null;
    idx.current++;
    bump((n) => n + 1);
    return stack.current[idx.current];
  }, []);

  return {
    push,
    pushImmediate,
    undo,
    redo,
    canUndo: idx.current > 0,
    canRedo: idx.current < stack.current.length - 1,
  };
}
