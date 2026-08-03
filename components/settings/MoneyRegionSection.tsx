"use client";

import { useEffect, useMemo, useState } from "react";
import { patchAppPreferences } from "@/lib/api/client";
import type { BootstrapPreferences } from "@/lib/api/bootstrapTypes";
import { MoneyInput } from "@/components/shared/MoneyInput";
import { getReferenceData } from "@/lib/reference_data/referenceDataStore";
import { invalidateBootstrapAfterMutation } from "@/stores/bootstrapStore";
import type { CurrencyReference } from "@/lib/reference_data/types";
import { useThemeTokens } from "@/components/theme/AppContextProvider";
import {
  SettingsPrimaryButton,
  SettingsSectionShell,
  settingsFieldStyle,
} from "@/components/settings/settingsUi";

type MoneyRegionSectionProps = {
  preferences: BootstrapPreferences;
  onPreferencesUpdated: (prefs: BootstrapPreferences) => void;
  onBack: () => void;
};

const SUPPORTED = new Set(["INR", "USD", "EUR", "GBP", "AED", "SGD", "JPY"]);

export function MoneyRegionSection({
  preferences,
  onPreferencesUpdated,
  onBack,
}: MoneyRegionSectionProps) {
  const tokens = useThemeTokens();
  const { colors, radius } = tokens;
  const field = settingsFieldStyle(colors, radius);
  const referenceData = getReferenceData();
  const currencies = (referenceData?.currencies ?? []) as CurrencyReference[];
  const currencyOptions = useMemo(
    () => currencies.filter((c) => SUPPORTED.has(c.code)),
    [currencies],
  );
  const countries = referenceData?.countries ?? [];
  const locales = referenceData?.locales ?? [];
  const timezones = referenceData?.timezones ?? [];

  const [currencyCode, setCurrencyCode] = useState(preferences.default_currency_code);
  const [locale, setLocale] = useState(preferences.locale);
  const [countryCode, setCountryCode] = useState(preferences.country_code);
  const [timezone, setTimezone] = useState(preferences.timezone);
  const [previewMinor, setPreviewMinor] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setCurrencyCode(preferences.default_currency_code);
    setLocale(preferences.locale);
    setCountryCode(preferences.country_code);
    setTimezone(preferences.timezone);
  }, [preferences]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await patchAppPreferences({
        default_currency_code: currencyCode,
        locale,
        country_code: countryCode,
        timezone,
      });
      invalidateBootstrapAfterMutation();
      onPreferencesUpdated(updated);
      setSuccess("Money & region preferences saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save preferences");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SettingsSectionShell
      title="Money & region"
      subtitle="Currency, locale, country, and timezone for your account"
      onBack={onBack}
    >
      {currencyOptions.length === 0 ? (
        <p className="text-sm" style={{ color: colors.textSubtle }}>
          Reference data is still loading…
        </p>
      ) : (
        <>
          <div className="space-y-2">
            <label className="text-sm" style={{ color: colors.textSecondary }}>
              Default currency
            </label>
            <select
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value)}
              style={field}
            >
              {currencyOptions.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm" style={{ color: colors.textSecondary }}>
              Locale
            </label>
            {locales.length > 0 ? (
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                style={field}
              >
                {!locales.some((l) => l.code === locale) ? (
                  <option value={locale}>{locale}</option>
                ) : null}
                {locales.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label || l.code}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                style={field}
                placeholder="en-IN"
              />
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm" style={{ color: colors.textSecondary }}>
              Country
            </label>
            {countries.length > 0 ? (
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                style={field}
              >
                {!countries.some((c) => c.code === countryCode) ? (
                  <option value={countryCode}>{countryCode}</option>
                ) : null}
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label || c.code}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                style={field}
                placeholder="IN"
              />
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm" style={{ color: colors.textSecondary }}>
              Timezone
            </label>
            {timezones.length > 0 ? (
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                style={field}
              >
                {!timezones.some((t) => t.code === timezone) ? (
                  <option value={timezone}>{timezone}</option>
                ) : null}
                {timezones.map((t) => (
                  <option key={t.code} value={t.code}>
                    {t.label || t.code}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                style={field}
                placeholder="Asia/Kolkata"
              />
            )}
          </div>

          <MoneyInput
            label="Preview amount"
            currencies={currencyOptions}
            defaultCurrencyCode={currencyCode}
            locale={locale}
            value={{ amount_minor: previewMinor, currency_code: currencyCode }}
            onChange={(v) => {
              setPreviewMinor(v.amount_minor);
              setCurrencyCode(v.currency_code);
            }}
          />

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

          <SettingsPrimaryButton disabled={saving} onClick={() => void handleSave()}>
            {saving ? "Saving…" : "Save"}
          </SettingsPrimaryButton>
        </>
      )}
    </SettingsSectionShell>
  );
}
