"use client";

import { useCallback, useEffect, useState } from "react";
import { dedupeFetch } from "@/lib/cache/cacheStore";
import { PersonalRepository } from "@/repositories/PersonalRepository";
import {
  getTemplateLife,
} from "@/lib/api/client";
import type {
  TemplateLifeResponse,
  TemplateMemoryResponse,
  TemplateMomentsResponse,
} from "@/lib/api/personal";
import type { PersonalMomentTypeCode } from "@/lib/personal/personalMomentSession";
import { FRESH_TTL_MS, STALE_TTL_MS } from "@/lib/cache/personalCacheTtl";
import {
  persistTemplateMemory,
  persistTemplateMoments,
  persistTemplatePulse,
} from "@/stores/personalSessionStore";

const TTL_MS = FRESH_TTL_MS;

type CacheEntry<T> = { data: T; at: number; projectionVersion?: number };

const momentsCache = new Map<PersonalMomentTypeCode, CacheEntry<TemplateMomentsResponse>>();
const pulseCache = new Map<PersonalMomentTypeCode, CacheEntry<Record<string, unknown>>>();
const lifeCache = new Map<PersonalMomentTypeCode, CacheEntry<TemplateLifeResponse>>();
const memoryCache = new Map<PersonalMomentTypeCode, CacheEntry<TemplateMemoryResponse>>();

export function invalidateTemplateMomentsCache(typeCode?: PersonalMomentTypeCode) {
  if (typeCode) momentsCache.delete(typeCode);
  else momentsCache.clear();
}

export function invalidateTemplateLifeCache(typeCode?: PersonalMomentTypeCode) {
  if (typeCode) lifeCache.delete(typeCode);
  else lifeCache.clear();
}

export function invalidateTemplateMemoryCache(typeCode?: PersonalMomentTypeCode) {
  if (typeCode) memoryCache.delete(typeCode);
  else memoryCache.clear();
}

export function invalidateTemplatePulseCache(typeCode?: PersonalMomentTypeCode) {
  if (typeCode) pulseCache.delete(typeCode);
  else pulseCache.clear();
}

export function invalidateTemplateProjectionCaches(typeCode?: PersonalMomentTypeCode) {
  invalidateTemplateMomentsCache(typeCode);
  invalidateTemplatePulseCache(typeCode);
  invalidateTemplateLifeCache(typeCode);
  invalidateTemplateMemoryCache(typeCode);
}

export function seedTemplateMomentsCache(
  typeCode: PersonalMomentTypeCode,
  data: TemplateMomentsResponse,
) {
  momentsCache.set(typeCode, {
    data,
    at: Date.now(),
    projectionVersion: data.projection_version,
  });
}

export function seedTemplateMemoryCache(
  typeCode: PersonalMomentTypeCode,
  data: TemplateMemoryResponse,
) {
  memoryCache.set(typeCode, {
    data,
    at: Date.now(),
    projectionVersion: data.projection_version,
  });
}

export function seedTemplatePulseCache(
  typeCode: PersonalMomentTypeCode,
  data: Record<string, unknown>,
) {
  pulseCache.set(typeCode, {
    data,
    at: Date.now(),
    projectionVersion: data.projection_version as number | undefined,
  });
}

export function getTemplateMomentsCache(
  typeCode: PersonalMomentTypeCode,
): TemplateMomentsResponse | null {
  return momentsCache.get(typeCode)?.data ?? null;
}

export function getTemplateMemoryCache(
  typeCode: PersonalMomentTypeCode,
): TemplateMemoryResponse | null {
  return memoryCache.get(typeCode)?.data ?? null;
}

export function getTemplatePulseCache(
  typeCode: PersonalMomentTypeCode,
): Record<string, unknown> | null {
  return pulseCache.get(typeCode)?.data ?? null;
}

function dedupeKey(resource: string, momentTypeCode: PersonalMomentTypeCode): string {
  return `personal:template_${resource}:${momentTypeCode}`;
}

function useTemplateCache<T extends { projection_version?: number }>(
  resource: string,
  cache: Map<PersonalMomentTypeCode, CacheEntry<T>>,
  fetcher: (code: PersonalMomentTypeCode) => Promise<T>,
  momentTypeCode: PersonalMomentTypeCode,
  enabled: boolean,
  onPersist?: (code: PersonalMomentTypeCode, data: T) => void,
) {
  const cached = cache.get(momentTypeCode);
  const [data, setData] = useState<T | null>(cached?.data ?? null);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (force = false) => {
      const entry = cache.get(momentTypeCode);
      const age = entry ? Date.now() - entry.at : Infinity;
      const fresh = !force && entry && age < TTL_MS;
      const staleUsable = !force && entry && age < STALE_TTL_MS;
      if (fresh && entry) {
        setData(entry.data);
        setLoading(false);
        return;
      }
      if (staleUsable && entry) {
        setData(entry.data);
      } else if (entry && !force) {
        setData(entry.data);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const result = await dedupeFetch(dedupeKey(resource, momentTypeCode), () =>
          fetcher(momentTypeCode),
        );
        const prev = cache.get(momentTypeCode);
        const nextVersion = result.projection_version;
        if (
          !force &&
          prev &&
          nextVersion !== undefined &&
          prev.projectionVersion === nextVersion
        ) {
          cache.set(momentTypeCode, {
            data: prev.data,
            at: Date.now(),
            projectionVersion: nextVersion,
          });
          setData(prev.data);
          return;
        }
        cache.set(momentTypeCode, {
          data: result,
          at: Date.now(),
          projectionVersion: nextVersion,
        });
        onPersist?.(momentTypeCode, result);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    },
    [cache, fetcher, momentTypeCode, onPersist, resource],
  );

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    const entry = cache.get(momentTypeCode);
    setData(entry?.data ?? null);
    setLoading(!entry);
    void load(false);
  }, [momentTypeCode, load, enabled]);

  const refreshAfterSetup = useCallback(() => {
    cache.delete(momentTypeCode);
    return load(true);
  }, [cache, load, momentTypeCode]);

  return { data, loading, error, reload: () => load(true), refreshAfterSetup };
}

export function useTemplatePulse(
  momentTypeCode: PersonalMomentTypeCode,
  options?: { enabled?: boolean },
) {
  return useTemplateCache(
    "pulse",
    pulseCache,
    (code) => PersonalRepository.getTemplatePulse(code),
    momentTypeCode,
    options?.enabled ?? true,
    (code, data) => persistTemplatePulse(code, data as Record<string, unknown>),
  );
}

export function useTemplateMoments(
  momentTypeCode: PersonalMomentTypeCode,
  options?: { enabled?: boolean },
) {
  return useTemplateCache(
    "moments",
    momentsCache,
    (code) => PersonalRepository.getTemplateMoments(code),
    momentTypeCode,
    options?.enabled ?? true,
    persistTemplateMoments,
  );
}

export function useTemplateLife(
  momentTypeCode: PersonalMomentTypeCode,
  options?: { enabled?: boolean },
) {
  return useTemplateCache("life", lifeCache, getTemplateLife, momentTypeCode, options?.enabled ?? true);
}

export function useTemplateMemory(
  momentTypeCode: PersonalMomentTypeCode,
  options?: { enabled?: boolean },
) {
  return useTemplateCache(
    "memory",
    memoryCache,
    (code) => PersonalRepository.getTemplateMemory(code),
    momentTypeCode,
    options?.enabled ?? true,
    persistTemplateMemory,
  );
}
