"use client";

import { useCallback, useEffect, useState } from "react";
import { PersonalRepository } from "@/repositories/PersonalRepository";
import type { PersonalPulseResponse } from "@/lib/api/personal";
import { usePersonalMomentSession } from "@/hooks/usePersonalMomentSession";
import type { PersonalMomentTypeCode } from "@/lib/personal/personalMomentSession";
import {
  applyOptimisticPatch,
  reconcilePatch,
  rollbackPatch,
  subscribeOptimisticPulse,
} from "@/lib/telemetry/optimisticPulse";
import { endLoginToPulseSpan } from "@/lib/telemetry/performanceTelemetry";

import { dedupeFetch, isInflight } from "@/lib/cache/cacheStore";
import { FRESH_TTL_MS, STALE_TTL_MS } from "@/lib/cache/personalCacheTtl";
import { persistPulse } from "@/stores/personalSessionStore";
import { ensurePersonalSessionBootstrap } from "@/stores/personalSessionStore";

const TTL_MS = FRESH_TTL_MS;

type CacheEntry = { data: PersonalPulseResponse; at: number };
const cache = new Map<PersonalMomentTypeCode, CacheEntry>();

export function invalidatePersonalPulseCache(typeCode?: PersonalMomentTypeCode) {
  if (typeCode) {
    cache.delete(typeCode);
    return;
  }
  cache.clear();
}

export function seedPersonalPulseCache(
  typeCode: PersonalMomentTypeCode,
  data: PersonalPulseResponse,
) {
  cache.set(typeCode, { data, at: Date.now() });
}

export function getPersonalPulseCache(
  typeCode: PersonalMomentTypeCode,
): PersonalPulseResponse | null {
  return cache.get(typeCode)?.data ?? null;
}

export function usePersonalPulse(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  const momentTypeCode = usePersonalMomentSession();
  const cached = cache.get(momentTypeCode);
  const [pulse, setPulse] = useState<PersonalPulseResponse | null>(cached?.data ?? null);
  const [loading, setLoading] = useState(!cached);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return subscribeOptimisticPulse((typeCode, nextPulse) => {
      if (typeCode !== momentTypeCode) return;
      setPulse(nextPulse);
      if (nextPulse) {
        cache.set(momentTypeCode, { data: nextPulse, at: Date.now() });
      }
    });
  }, [momentTypeCode]);

  const load = useCallback(
    async (force = false) => {
      const entry = cache.get(momentTypeCode);
      const age = entry ? Date.now() - entry.at : Infinity;
      const fresh = !force && entry && age < TTL_MS;
      const staleUsable = !force && entry && age < STALE_TTL_MS;
      if (fresh && entry) {
        setPulse(entry.data);
        setLoading(false);
        setRefreshing(false);
        return;
      }
      if (staleUsable && entry) {
        setPulse(entry.data);
        setRefreshing(true);
        setLoading(false);
      } else if (entry) {
        setPulse(entry.data);
        setLoading(true);
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
          (isInflight(bootstrapKey) || !isInflight(`personal:pulse:${momentTypeCode}`));
        let data: PersonalPulseResponse;
        if (shouldTryBootstrap) {
          const bootstrap = await ensurePersonalSessionBootstrap(momentTypeCode, force);
          data = bootstrap.pulse;
        } else {
          data = await dedupeFetch(`personal:pulse:${momentTypeCode}`, () =>
            PersonalRepository.getPulse({
              momentTypeCode,
              forceRefresh: force,
            }),
          );
        }
        cache.set(momentTypeCode, { data, at: Date.now() });
        persistPulse(momentTypeCode, data);
        setPulse(data);
        endLoginToPulseSpan();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load pulse");
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
    setPulse(entry?.data ?? null);
    setLoading(!entry);
    setRefreshing(false);
    void load(false);
  }, [momentTypeCode, load, enabled]);

  const refreshAfterSetup = useCallback(() => {
    invalidatePersonalPulseCache(momentTypeCode);
    return load(true);
  }, [load, momentTypeCode]);

  const applyOptimistic = useCallback(
    (clientRequestId: string, patch: Partial<PersonalPulseResponse>) => {
      const current = cache.get(momentTypeCode)?.data ?? pulse;
      const merged = applyOptimisticPatch(momentTypeCode, clientRequestId, current, patch);
      if (merged) {
        setPulse(merged);
        cache.set(momentTypeCode, { data: merged, at: Date.now() });
      }
      return merged;
    },
    [momentTypeCode, pulse],
  );

  const reconcile = useCallback(
    (clientRequestId: string, serverPulse: PersonalPulseResponse) => {
      const next = reconcilePatch(clientRequestId, serverPulse);
      setPulse(next);
      cache.set(momentTypeCode, { data: next, at: Date.now() });
      return next;
    },
    [momentTypeCode],
  );

  const rollback = useCallback(
    (clientRequestId: string) => {
      const previous = rollbackPatch(clientRequestId);
      setPulse(previous);
      if (previous) {
        cache.set(momentTypeCode, { data: previous, at: Date.now() });
      } else {
        cache.delete(momentTypeCode);
      }
      return previous;
    },
    [momentTypeCode],
  );

  return {
    pulse,
    loading,
    refreshing,
    error,
    momentTypeCode,
    reload: () => load(true),
    refreshAfterSetup,
    applyOptimisticPatch: applyOptimistic,
    reconcilePatch: reconcile,
    rollbackPatch: rollback,
  };
}
