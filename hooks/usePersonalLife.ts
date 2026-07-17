"use client";

import { useCallback, useEffect, useState } from "react";
import { dedupeFetch } from "@/lib/cache/cacheStore";
import { getPersonalLife } from "@/lib/api/client";
import type { PersonalLifeResponse } from "@/lib/api/personal";
import { FRESH_TTL_MS, STALE_TTL_MS } from "@/lib/cache/personalCacheTtl";
import { persistLife } from "@/stores/personalSessionStore";

let cachedLife: PersonalLifeResponse | null = null;
let cachedAt = 0;
let cachedProjectionVersion: number | undefined;
const TTL_MS = FRESH_TTL_MS;

export function invalidatePersonalLifeCache() {
  cachedLife = null;
  cachedAt = 0;
  cachedProjectionVersion = undefined;
}

export function seedPersonalLifeCache(data: PersonalLifeResponse) {
  cachedLife = data;
  cachedAt = Date.now();
  cachedProjectionVersion = data.projection_version;
}

export function getPersonalLifeCache(): PersonalLifeResponse | null {
  return cachedLife;
}

export function usePersonalLife(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  const [life, setLife] = useState<PersonalLifeResponse | null>(cachedLife);
  const [loading, setLoading] = useState(!cachedLife);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (force = false) => {
    const age = cachedLife ? Date.now() - cachedAt : Infinity;
    const fresh = !force && cachedLife && age < TTL_MS;
    const staleUsable = !force && cachedLife && age < STALE_TTL_MS;
    if (fresh && cachedLife) {
      setLife(cachedLife);
      setLoading(false);
      return;
    }
    if (staleUsable && cachedLife) {
      setLife(cachedLife);
    } else if (cachedLife && !force) {
      setLife(cachedLife);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await dedupeFetch("personal:life", () =>
        getPersonalLife({ forceRefresh: force }),
      );
      const nextVersion = data.projection_version;
      if (
        !force &&
        cachedLife &&
        nextVersion !== undefined &&
        cachedProjectionVersion === nextVersion
      ) {
        cachedAt = Date.now();
        setLife(cachedLife);
        return;
      }
      cachedLife = data;
      cachedAt = Date.now();
      cachedProjectionVersion = nextVersion;
      persistLife(data);
      setLife(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load life";
      setError(
        message.includes("timed out") || message.includes("CORS") || message.includes("Failed to fetch")
          ? `${message} — check that the API (ngrok) is up and restarted after recent backend changes.`
          : message,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    void load(false);
  }, [load, enabled]);

  const refreshAfterSetup = useCallback(() => {
    invalidatePersonalLifeCache();
    return load(true);
  }, [load]);

  return { life, loading, error, reload: () => load(false), refreshAfterSetup };
}
