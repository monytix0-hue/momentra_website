import {
  dedupeFetch,
  diskCacheLoad,
  diskCacheRemove,
  diskCacheSave,
} from "@/lib/cache/cacheStore";
import { getPersonalSessionBootstrap } from "@/lib/api/client";
import type {
  PersonalMemoryResponse,
  PersonalMomentsHomeResponse,
  PersonalPulseResponse,
  PersonalLifeResponse,
  TemplateMemoryResponse,
  TemplateMomentsResponse,
} from "@/lib/api/personal";
import type { PersonalMomentTypeCode } from "@/lib/personal/personalMomentSession";
import { FRESH_TTL_MS, STALE_TTL_MS } from "@/lib/cache/personalCacheTtl";
import {
  memoryHasTypePayload,
  momentsHasTypePayload,
  pulseHasTypePayload,
} from "@/components/personal/shared/personalMomentRouting";
import {
  parsePersonalMemoryResponse,
  parsePersonalMomentsHomeResponse,
  parsePersonalPulseResponse,
  parseTemplateMemoryResponse,
  parseTemplateMomentsResponse,
  parseTemplatePulseResponse,
} from "@/lib/personal/personalApiMappers";

export { FRESH_TTL_MS, STALE_TTL_MS };

const LIFE_DISK_KEY = "personal_life:v1";

function typeSlug(code: PersonalMomentTypeCode): string {
  return code.toLowerCase();
}

export function pulseDiskKey(code: PersonalMomentTypeCode): string {
  return `personal_pulse:${typeSlug(code)}`;
}

export function momentsDiskKey(code: PersonalMomentTypeCode): string {
  return `personal_moments:${typeSlug(code)}`;
}

export function memoryDiskKey(code: PersonalMomentTypeCode): string {
  return `personal_memory:${typeSlug(code)}:v2`;
}

export function templateMomentsDiskKey(code: PersonalMomentTypeCode): string {
  return `personal_template_moments:${typeSlug(code)}`;
}

export function templateMemoryDiskKey(code: PersonalMomentTypeCode): string {
  return `personal_template_memory:${typeSlug(code)}`;
}

export function templatePulseDiskKey(code: PersonalMomentTypeCode): string {
  return `personal_template_pulse:${typeSlug(code)}`;
}

export function loadPulseFromDisk(code: PersonalMomentTypeCode): PersonalPulseResponse | null {
  const raw = diskCacheLoad<unknown>(pulseDiskKey(code), STALE_TTL_MS);
  return raw ? parsePersonalPulseResponse(raw) : null;
}

export function loadMomentsFromDisk(
  code: PersonalMomentTypeCode,
): PersonalMomentsHomeResponse | null {
  const raw = diskCacheLoad<unknown>(momentsDiskKey(code), STALE_TTL_MS);
  return raw ? parsePersonalMomentsHomeResponse(raw) : null;
}

export function loadMemoryFromDisk(code: PersonalMomentTypeCode): PersonalMemoryResponse | null {
  const raw = diskCacheLoad<unknown>(memoryDiskKey(code), STALE_TTL_MS);
  return raw ? parsePersonalMemoryResponse(raw) : null;
}

export function loadLifeFromDisk(): PersonalLifeResponse | null {
  return diskCacheLoad<PersonalLifeResponse>(LIFE_DISK_KEY, STALE_TTL_MS);
}

export function loadTemplateMomentsFromDisk(
  code: PersonalMomentTypeCode,
): TemplateMomentsResponse | null {
  const raw = diskCacheLoad<unknown>(templateMomentsDiskKey(code), STALE_TTL_MS);
  return raw ? parseTemplateMomentsResponse(raw) : null;
}

export function loadTemplateMemoryFromDisk(
  code: PersonalMomentTypeCode,
): TemplateMemoryResponse | null {
  const raw = diskCacheLoad<unknown>(templateMemoryDiskKey(code), STALE_TTL_MS);
  return raw ? parseTemplateMemoryResponse(raw) : null;
}

export function loadTemplatePulseFromDisk(
  code: PersonalMomentTypeCode,
): Record<string, unknown> | null {
  const raw = diskCacheLoad<unknown>(templatePulseDiskKey(code), STALE_TTL_MS);
  return raw ? parseTemplatePulseResponse(raw) : null;
}

export function persistPulse(code: PersonalMomentTypeCode, data: PersonalPulseResponse): void {
  diskCacheSave(pulseDiskKey(code), data);
}

export function persistMoments(
  code: PersonalMomentTypeCode,
  data: PersonalMomentsHomeResponse,
): void {
  diskCacheSave(momentsDiskKey(code), data);
}

export function persistMemory(code: PersonalMomentTypeCode, data: PersonalMemoryResponse): void {
  diskCacheSave(memoryDiskKey(code), data);
}

export function persistLife(data: PersonalLifeResponse): void {
  diskCacheSave(LIFE_DISK_KEY, data);
}

export function persistTemplateMoments(
  code: PersonalMomentTypeCode,
  data: TemplateMomentsResponse,
): void {
  diskCacheSave(templateMomentsDiskKey(code), data);
}

export function persistTemplateMemory(
  code: PersonalMomentTypeCode,
  data: TemplateMemoryResponse,
): void {
  diskCacheSave(templateMemoryDiskKey(code), data);
}

export function persistTemplatePulse(
  code: PersonalMomentTypeCode,
  data: Record<string, unknown>,
): void {
  diskCacheSave(templatePulseDiskKey(code), data);
}

export function warmUpPersonalSessionFromDisk(code: PersonalMomentTypeCode): {
  pulse: PersonalPulseResponse | null;
  moments: PersonalMomentsHomeResponse | null;
  memory: PersonalMemoryResponse | null;
  life: PersonalLifeResponse | null;
  templateMoments: TemplateMomentsResponse | null;
  templateMemory: TemplateMemoryResponse | null;
  templatePulse: Record<string, unknown> | null;
} {
  return {
    pulse: loadPulseFromDisk(code),
    moments: loadMomentsFromDisk(code),
    memory: loadMemoryFromDisk(code),
    life: loadLifeFromDisk(),
    templateMoments: loadTemplateMomentsFromDisk(code),
    templateMemory: loadTemplateMemoryFromDisk(code),
    templatePulse: loadTemplatePulseFromDisk(code),
  };
}

export async function ensurePersonalSessionBootstrap(
  code: PersonalMomentTypeCode,
  force = false,
): Promise<{
  pulse: PersonalPulseResponse;
  moments_home: PersonalMomentsHomeResponse;
}> {
  const bootstrap = await dedupeFetch(`personal:session_bootstrap:${code}`, () =>
    getPersonalSessionBootstrap({ momentTypeCode: code, forceRefresh: force }),
  );
  const pulse = parsePersonalPulseResponse(bootstrap.pulse);
  const moments_home = parsePersonalMomentsHomeResponse(bootstrap.moments_home);
  persistPulse(code, pulse);
  persistMoments(code, moments_home);
  const [pulseMod, momentsMod] = await Promise.all([
    import("@/hooks/usePersonalPulse"),
    import("@/hooks/usePersonalMoments"),
  ]);
  pulseMod.seedPersonalPulseCache(code, pulse);
  momentsMod.seedPersonalMomentsCache(code, moments_home);
  return { pulse, moments_home };
}

export async function warmStartPersonalSession(
  code: PersonalMomentTypeCode,
  force = false,
): Promise<void> {
  await ensurePersonalSessionBootstrap(code, force);
}

export function clearPersonalSessionDisk(code?: PersonalMomentTypeCode): void {
  if (code) {
    diskCacheRemove(pulseDiskKey(code));
    diskCacheRemove(momentsDiskKey(code));
    diskCacheRemove(memoryDiskKey(code));
    diskCacheRemove(templateMomentsDiskKey(code));
    diskCacheRemove(templateMemoryDiskKey(code));
    diskCacheRemove(templatePulseDiskKey(code));
    return;
  }
  diskCacheRemove(LIFE_DISK_KEY);
}

export function clearAllPersonalSessionOnLogout(): void {
  void Promise.all([
    import("@/hooks/usePersonalPulse"),
    import("@/hooks/usePersonalMoments"),
    import("@/hooks/usePersonalMemory"),
    import("@/hooks/usePersonalLife"),
    import("@/hooks/useTemplateProjection"),
  ]).then(([pulse, moments, memory, life, template]) => {
    pulse.invalidatePersonalPulseCache();
    moments.invalidatePersonalMomentsCache();
    memory.invalidatePersonalMemoryCache();
    life.invalidatePersonalLifeCache();
    template.invalidateTemplateProjectionCaches();
  });
  const types: PersonalMomentTypeCode[] = [
    "LIFE_OPERATIONS",
    "FUTURE_BUILDING",
    "LIFESTYLE",
    "RELATIONSHIPS",
  ];
  types.forEach((code) => clearPersonalSessionDisk(code));
  clearPersonalSessionDisk();
}

export function hasCachedActiveSessionHint(code: PersonalMomentTypeCode): boolean {
  const pulse = loadPulseFromDisk(code);
  const moments = loadMomentsFromDisk(code);
  const memory = loadMemoryFromDisk(code);
  const templateMoments = loadTemplateMomentsFromDisk(code);
  const templateMemory = loadTemplateMemoryFromDisk(code);
  return (
    Boolean(pulse && pulseHasTypePayload(pulse, code)) ||
    Boolean(moments && momentsHasTypePayload(moments, code)) ||
    Boolean(memory && memoryHasTypePayload(memory, code)) ||
    Boolean(templateMoments?.moment_projection) ||
    Boolean(templateMemory?.memory_projection)
  );
}
