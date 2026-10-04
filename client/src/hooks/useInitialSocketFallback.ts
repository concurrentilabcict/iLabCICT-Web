import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";

type Options<T> = {
  ready: boolean;
  queryKey: QueryKey;
  readyQueryKey: QueryKey;
  fetchData: (signal: AbortSignal) => Promise<T[]>;
  onReady: () => void;
};

export function useInitialSocketFallback<T>({
  ready,
  queryKey,
  readyQueryKey,
  fetchData,
  onReady,
}: Options<T>) {
  const queryClient = useQueryClient();
  const fetchRef = useRef(fetchData);
  const onReadyRef = useRef(onReady);
  const requestRef = useRef<AbortController | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    fetchRef.current = fetchData;
    onReadyRef.current = onReady;
  }, [fetchData, onReady]);

  const retry = useCallback(async () => {
    if (requestRef.current || queryClient.getQueryData(readyQueryKey) === true) return;

    const controller = new AbortController();
    requestRef.current = controller;
    setIsRetrying(true);
    let timeoutId: number | undefined;

    try {
      const timeout = new Promise<T[]>((_, reject) => {
        timeoutId = window.setTimeout(() => {
          controller.abort();
          reject(new Error("The request timed out."));
        }, 12_000);
      });
      const data = await Promise.race([fetchRef.current(controller.signal), timeout]);
      if (requestRef.current !== controller) return;

      // The socket may have supplied a newer snapshot while the request was in flight.
      if (queryClient.getQueryData(readyQueryKey) !== true) {
        queryClient.setQueryData<T[]>(queryKey, data);
        queryClient.setQueryData(readyQueryKey, true);
        onReadyRef.current();
      }
    } catch {
      if (requestRef.current === controller && queryClient.getQueryData(readyQueryKey) !== true) {
        setHasError(true);
      }
    } finally {
      window.clearTimeout(timeoutId);
      if (requestRef.current === controller) {
        requestRef.current = null;
        setIsRetrying(false);
      }
    }
  }, [queryClient, queryKey, readyQueryKey]);

  useEffect(() => {
    if (ready) {
      return;
    }
    const timer = window.setTimeout(() => { void retry(); }, 2_500);
    return () => {
      window.clearTimeout(timer);
      requestRef.current?.abort();
      requestRef.current = null;
    };
  }, [ready, retry]);

  return { hasError: !ready && hasError, isRetrying, retry };
}
