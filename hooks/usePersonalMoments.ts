"use client";

import { useCallback, useEffect, useState } from "react";
import { dedupeFetch, isInflight } from "@/lib/cache/cacheStore";
import { PersonalRepository } from "@/repositories/PersonalRepository";
import type { PersonalMomentsHomeResponse } from "@/lib/api/personal";
import { usePersonalMomentSession } from "@/hooks/usePersonalMomentSession";
import type { PersonalMomentTypeCode } from "@/lib/personal/personalMomentSession";
import { FRESH_TTL_MS, STALE_TTL_MS } from "@/lib/cache/personalCacheTtl";
import {
  persistMoments,
  ensurePersonalSessionBootstrap,
} from "@/stores/personalSessionStore";

const TTL_MS = FRESH_TTL_MS;

type CacheEntry = { data: PersonalMomentsHomeResponse; at: number };
const cache = new Map<PersonalMomentTypeCode, CacheEntry>();

export function invalidatePersonalMomentsCache(typeCode?: PersonalMomentTypeCode) {
  if (typeCode) {
    cache.delete(typeCode);
    return;
  }
  cache.clear();
}

export function seedPersonalMomentsCache(
  typeCode: PersonalMomentTypeCode,
  data: PersonalMomentsHomeResponse,
) {
  cache.set(typeCode, { data, at: Date.now() });
}

export function getPersonalMomentsCache(
  typeCode: PersonalMomentTypeCode,
): PersonalMomentsHomeResponse | null {
  return cache.get(typeCode)?.data ?? null;
}

export function usePersonalMoments(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  const momentTypeCode = usePersonalMomentSession();
  const cached = cache.get(momentTypeCode);
  const [moments, setMoments] = useState<PersonalMomentsHomeResponse | null>(cached?.data ?? null);
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
        setMoments(entry.data);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      if (staleUsable && entry) {
        setMoments(entry.data);
        setRefreshing(true);
        setLoading(false);
      } else if (entry && !force) {
        setMoments(entry.data);
        setLoading(false);
        setRefreshing(false);
      } else {
        setLoading(true);
        setRefreshing(false);
      }
      setError(null);
      try {
        const bootstrapKey = `personal:session_bootstrap:${momentTypeCode}`;
        const shouldTryBootstrap =
          !force &&
          !entry &&
          (isInflight(bootstrapKey) || !isInflight(`personal:moments:${momentTypeCode}`));
        let data: PersonalMomentsHomeResponse;
        if (shouldTryBootstrap) {
          const bootstrap = await ensurePersonalSessionBootstrap(momentTypeCode, force);
          data = bootstrap.moments_home;
        } else {
          data = await dedupeFetch(`personal:moments:${momentTypeCode}`, () =>
            PersonalRepository.getMomentsHome({
              momentTypeCode,
              forceRefresh: force,
            }),
          );
        }
        cache.set(momentTypeCode, { data, at: Date.now() });
        persistMoments(momentTypeCode, data);
        setMoments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load moments");
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
    setMoments(entry?.data ?? null);
    setLoading(!entry);
    void load(false);
  }, [momentTypeCode, load, enabled]);

  const refreshAfterSetup = useCallback(() => {
    invalidatePersonalMomentsCache(momentTypeCode);
    return load(true);
  }, [load, momentTypeCode]);

  return {
    moments,
    loading,
    refreshing,
    error,
    momentTypeCode,
    reload: () => load(true),
    refreshAfterSetup,
  };
}
