"use client";

import { useEffect, useState } from "react";
import {
  getMePreferences,
  patchMePreferences,
} from "@/lib/api/client";
import type {
  BootstrapPersonalPreferences,
  PersonalPreferencesResponse,
} from "@/lib/api/bootstrapTypes";
import { invalidateBootstrapAfterMutation } from "@/stores/bootstrapStore";
import { useThemeTokens } from "@/components/theme/AppContextProvider";
import {
  SettingsPrimaryButton,
  SettingsSectionShell,
  SettingsToggleRow,
  settingsFieldStyle,
} from "@/components/settings/settingsUi";

type Props = {
  initial?: BootstrapPersonalPreferences | null;
  onUpdated?: (prefs: PersonalPreferencesResponse) => void;
  onBack: () => void;
  mode: "personal" | "notifications";
};

export function PersonalPrefsSection({
  initial,
  onUpdated,
  onBack,
  mode,
}: Props) {
  const { colors, radius } = useThemeTokens();
  const field = settingsFieldStyle(colors, radius);

  const [weekStart, setWeekStart] = useState(initial?.week_start_day ?? "MONDAY");
  const [privacy, setPrivacy] = useState(initial?.privacy_mode_enabled ?? false);
  const [notifications, setNotifications] = useState(
    initial?.notification_enabled ?? true,
  );
  const [quickAdd, setQuickAdd] = useState(
    initial?.quick_add_reminder_enabled ?? false,
  );
  const [dailySummary, setDailySummary] = useState(
    initial?.daily_summary_enabled ?? false,
  );
  const [summaryTime, setSummaryTime] = useState(
    initial?.preferred_summary_time?.slice(0, 5) ?? "09:00",
  );
  const [loading, setLoading] = useState(!initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (initial) return;
    let cancelled = false;
    void (async () => {
      try {
        const prefs = await getMePreferences();
        if (cancelled) return;
        setWeekStart(prefs.week_start_day ?? "MONDAY");
        setPrivacy(prefs.privacy_mode_enabled);
        setNotifications(prefs.notification_enabled);
        setQuickAdd(prefs.quick_add_reminder_enabled);
        setDailySummary(prefs.daily_summary_enabled);
        setSummaryTime(prefs.preferred_summary_time?.slice(0, 5) ?? "09:00");
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initial]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const body =
        mode === "personal"
          ? {
              week_start_day: weekStart,
              privacy_mode_enabled: privacy,
            }
          : {
              notification_enabled: notifications,
              quick_add_reminder_enabled: quickAdd,
              daily_summary_enabled: dailySummary,
              preferred_summary_time: dailySummary
                ? `${summaryTime}:00`
                : null,
            };
      const updated = await patchMePreferences(body);
      invalidateBootstrapAfterMutation();
      onUpdated?.(updated);
      setSuccess("Saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  const title = mode === "personal" ? "Personal preferences" : "Notifications";
  const subtitle =
    mode === "personal"
      ? "Week start and privacy for your money views"
      : "Push and reminder preferences";

  return (
    <SettingsSectionShell title={title} subtitle={subtitle} onBack={onBack}>
      {loading ? (
        <p className="text-sm" style={{ color: colors.textSubtle }}>
          Loading…
        </p>
      ) : mode === "personal" ? (
        <>
          <div className="space-y-2">
            <label className="text-sm" style={{ color: colors.textSecondary }}>
              Week starts on
            </label>
            <select
              value={weekStart}
              onChange={(e) => setWeekStart(e.target.value)}
              style={field}
            >
              <option value="MONDAY">Monday</option>
              <option value="SUNDAY">Sunday</option>
            </select>
          </div>
          <SettingsToggleRow
            label="Privacy mode"
            description="Hide amounts across personal views"
            checked={privacy}
            onChange={setPrivacy}
          />
        </>
      ) : (
        <>
          <SettingsToggleRow
            label="Notifications"
            description="Master switch for push notifications"
            checked={notifications}
            onChange={setNotifications}
          />
          <SettingsToggleRow
            label="Quick-add reminders"
            description="Nudge you to log today's activity"
            checked={quickAdd}
            disabled={!notifications}
            onChange={setQuickAdd}
          />
          <SettingsToggleRow
            label="Daily summary"
            description="End-of-day spending summary"
            checked={dailySummary}
            disabled={!notifications}
            onChange={setDailySummary}
          />
          {dailySummary ? (
            <div className="space-y-2">
              <label className="text-sm" style={{ color: colors.textSecondary }}>
                Preferred summary time
              </label>
              <input
                type="time"
                value={summaryTime}
                onChange={(e) => setSummaryTime(e.target.value)}
                style={field}
                disabled={!notifications}
              />
            </div>
          ) : null}
        </>
      )}

      {error ? (
        <p className="text-sm" style={{ color: colors.error }}>
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="text-sm" style={{ color: colors.success }}>
          {success}
        </p>
      ) : null}

      {!loading ? (
        <SettingsPrimaryButton disabled={saving} onClick={() => void handleSave()}>
          {saving ? "Saving…" : "Save"}
        </SettingsPrimaryButton>
      ) : null}
    </SettingsSectionShell>
  );
}
