"use client";

import { useCallback, useEffect, useState } from "react";
import { dedupeFetch } from "@/lib/cache/cacheStore";
import { PersonalRepository } from "@/repositories/PersonalRepository";
import type { PersonalMemoryResponse } from "@/lib/api/personal";
import { usePersonalMomentSession } from "@/hooks/usePersonalMomentSession";
import type { PersonalMomentTypeCode } from "@/lib/personal/personalMomentSession";
import { FRESH_TTL_MS, STALE_TTL_MS } from "@/lib/cache/personalCacheTtl";
import {
  persistMemory,
} from "@/stores/personalSessionStore";

const TTL_MS = FRESH_TTL_MS;

type CacheEntry = { data: PersonalMemoryResponse; at: number };
const cache = new Map<PersonalMomentTypeCode, CacheEntry>();

export function invalidatePersonalMemoryCache(typeCode?: PersonalMomentTypeCode) {
  if (typeCode) {
    cache.delete(typeCode);
    return;
  }
  cache.clear();
}

export function seedPersonalMemoryCache(
  typeCode: PersonalMomentTypeCode,
  data: PersonalMemoryResponse,
) {
  cache.set(typeCode, { data, at: Date.now() });
}

export function getPersonalMemoryCache(
  typeCode: PersonalMomentTypeCode,
): PersonalMemoryResponse | null {
  return cache.get(typeCode)?.data ?? null;
}

export function usePersonalMemory(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  const momentTypeCode = usePersonalMomentSession();
  const cached = cache.get(momentTypeCode);
  const [memory, setMemory] = useState<PersonalMemoryResponse | null>(cached?.data ?? null);
  const [loading, setLoading] = useState(!cached);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (force = false) => {
      const entry = cache.get(momentTypeCode);
      const age = entry ? Date.now() - entry.at : Infinity;
      const fresh = !force && entry && age < TTL_MS;
      const staleUsable = !force && entry && age < STALE_TTL_MS;
      if (fresh && entry) {
        setMemory(entry.data);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      if (staleUsable && entry) {
        setMemory(entry.data);
        setRefreshing(true);
        setLoading(false);
      } else if (entry && !force) {
        setMemory(entry.data);
        setLoading(false);
        setRefreshing(false);
      } else {
        setLoading(true);
        setRefreshing(false);
      }
      setError(null);
      try {
        const data = await dedupeFetch(`personal:memory:${momentTypeCode}`, () =>
          PersonalRepository.getMemory({
            momentTypeCode,
            forceRefresh: force,
          }),
        );
        cache.set(momentTypeCode, { data, at: Date.now() });
        persistMemory(momentTypeCode, data);
        setMemory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load memory");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [momentTypeCode],
  );

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    const entry = cache.get(momentTypeCode);
    setMemory(entry?.data ?? null);
    setLoading(!entry);
    void load(false);
  }, [momentTypeCode, load, enabled]);

  const refreshAfterSetup = useCallback(() => {
    invalidatePersonalMemoryCache(momentTypeCode);
    return load(true);
  }, [load, momentTypeCode]);

  return {
    memory,
    loading,
    refreshing,
    error,
    momentTypeCode,
    reload: () => load(true),
    refreshAfterSetup,
  };
}
